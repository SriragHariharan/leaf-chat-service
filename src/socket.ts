import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

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

        socket.on("sendMessage", ({ room, message }: { room: string; message: string }) => {
            console.log(`Message in room ${room}: ${message}`);
            io.to(room).emit("receiveMessage", message);
        });

        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });

    return io;
};
