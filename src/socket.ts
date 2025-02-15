import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "./helpers/jwt.helper";
import { saveMessage, updateMessageToRead } from "./helpers/message.helper";
import redisHelper from "./helpers/redis.helper";

export const initializeSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Change this in production
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log(`⚡ New client connected: ${socket.id}`);
        
        /* make a user join a room */
        socket.on("joinRoom", async (room: string, token: string, friendID: string) => {
            // Verify user token
            const decoded = verifyToken(token);
            if (!decoded) return;

            const userID = decoded.aud;
            socket.join(room);

            // Store userID in the socket object
            socket.room = room;
            socket.userID = userID;

            // Add user ID to Redis set
            await redisHelper.sadd(`chat:${room}`, userID);
            console.log(`✅ User ${userID} joined room: ${room}`);

            // Update all messages in the chat to "read"
            updateMessageToRead(room, userID);

            // Find the friend's socket
            io.to(room).emit("friendReadMessages", { userID });
        });


        socket.on("sendMessage", async ({ room, message, token, friendID }: { room: string; message: string; token: string, friendID: string }) => {
            try {
                const decoded = verifyToken(token);
                console.log(decoded, "  decoded token")
                if (!decoded) return;

                const senderID = decoded?.aud;

                // Check if the friend is in the chat by checking Redis set
                const isFriendInChat = await redisHelper.sismember(`chat:${room}`, friendID);
                //if friend stays in chat mark as read while sending itself
                const isInChat = Boolean(isFriendInChat);

                const newMessage = await saveMessage(room, message, senderID, isInChat);

                console.log(`Message from ${senderID} in room ${room}: ${message}`);
                io.to(room).emit("receiveMessage", newMessage);
            } catch (error) {
                console.error("Error handling message:", error);
            }
        });

        socket.on("typing", ({ room, token }) => {
            console.log(token)
            const decoded = verifyToken(token);
            console.log(decoded, "  decoded token")
            if (!decoded) return;
            const userID = decoded?.aud;
            socket.to(room).emit("userTyping", userID);
        });

        socket.on("stopTyping", ({ room, token }) => {
            const decoded = verifyToken(token);
            console.log(decoded, "  decoded token")
            if (!decoded) return;
            const userID = decoded?.aud;
            socket.to(room).emit("userStoppedTyping", userID);
        });


        // Handle user disconnection
        socket.on("disconnecting", () => {
            const room = socket.room;
            const userID = socket.userID;

            if (!room || !userID) return;

            // Remove user ID from Redis set(remove user from room to make message unread as he left the room)
            redisHelper.srem(`chat:${room}`, userID).then((count) => {
                console.log(`❌ User ${userID} left room: ${room}. Removed ${count} member.`);
            });

            console.log(`❌ User ${userID} left room: ${room}`);
        });

        // Handle full disconnection
        socket.on("disconnect", () => {
            console.log(`🔴 Client disconnected: ${socket.id}`);
        });
    });

    return io;
};
