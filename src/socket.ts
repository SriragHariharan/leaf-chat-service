import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "./helpers/jwt.helper";
import { saveMessage, updateMessageToRead } from "./helpers/message.helper";
import redisHelper from "./helpers/redis.helper";

// Type guard to check if decoded token is JwtPayload
function isJwtPayload(token: string | JwtPayload): token is JwtPayload {
    return (token as JwtPayload).aud !== undefined;
}

export const initializeSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE"],
            // credentials: true
        },
        path: "/socket.io"
    });
    io.on("connection", (socket: Socket) => {
        console.log(`⚡ New client connected: ${socket.id}`);

        /* Make a user join a room */
        socket.on("joinRoom", async (room: string, token: string, friendID: string) => {
            const decoded = verifyToken(token);
            if (decoded === null || !isJwtPayload(decoded)) {
                console.error("Invalid token: decoded token is not a JwtPayload");
                return;
            }

            const userID = decoded.aud as string;
            socket.join(room);

            // Store user data inside `socket.data`
            socket.data.room = room;
            socket.data.userID = userID;

            // Add user ID to Redis set
            await redisHelper.sadd(`chat:${room}`, userID);
            console.log(`✅ User ${userID} joined room: ${room}`);

            // Update all messages in the chat to "read"
            updateMessageToRead(room, userID);

            // Notify the friend that messages are read
            io.to(room).emit("friendReadMessages", { userID });
        });

        socket.on("sendMessage", async ({ room, message, token, friendID }: { room: string; message: string; token: string; friendID: string }) => {
            try {
                const decoded = verifyToken(token);
                if (decoded === null || !isJwtPayload(decoded)) {
                    console.error("Invalid token: decoded token is not a JwtPayload");
                    return;
                }

                const senderID = decoded.aud as string;

                // Check if the friend is in the chat by checking Redis set
                const isFriendInChat = await redisHelper.sismember(`chat:${room}`, friendID);
                // If friend is in chat, mark as read while sending
                const isInChat = Boolean(isFriendInChat);

                const newMessage = await saveMessage(room, message, senderID, isInChat);

                console.log(`📩 Message from ${senderID} in room ${room}: ${message}`);
                io.to(room).emit("receiveMessage", newMessage);
            } catch (error) {
                console.error("❌ Error handling message:", error);
            }
        });

        socket.on("typing", ({ room, token }) => {
            const decoded = verifyToken(token);
            if (decoded === null || !isJwtPayload(decoded)) {
                console.error("Invalid token: decoded token is not a JwtPayload");
                return;
            }

            const userID = decoded.aud as string;
            socket.to(room).emit("userTyping", userID);
        });

        socket.on("stopTyping", ({ room, token }) => {
            const decoded = verifyToken(token);
            if (decoded === null || !isJwtPayload(decoded)) {
                console.error("Invalid token: decoded token is not a JwtPayload");
                return;
            }

            const userID = decoded.aud as string;
            socket.to(room).emit("userStoppedTyping", userID);
        });

        // Handle user disconnection
        socket.on("disconnecting", () => {
            const room = socket.data?.room;
            const userID = socket.data?.userID;

            if (!room || !userID) return;

            // Remove user ID from Redis set (to mark messages as unread)
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