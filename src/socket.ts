import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "./helpers/jwt.helper";
import { saveMessage } from "./helpers/message.helper";

export const initializeSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Change this in production
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log(`⚡ New client connected: ${socket.id}`);

        socket.on("joinRoom", (room: string) => {
            socket.join(room);
            console.log(`User joined room: ${room}`);
        });

        socket.on("sendMessage", async ({ room, message, token }: { room: string; message: string; token: string }) => {
            try {
                const decoded = verifyToken(token);
                console.log(decoded, "  decoded token")
                if (!decoded) return;

                const senderID = decoded?.aud;
                const newMessage = await saveMessage(room, message, senderID);

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


        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });

    return io;
};
