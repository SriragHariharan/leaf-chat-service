import express, { NextFunction, Request, Response } from 'express';
import 'dotenv/config';
import createHttpError from 'http-errors';
import bodyParser from 'body-parser';
import chatRouter from './routes/chat.routes';
import { createServer } from 'http';
import { initializeSocket } from './socket';

const app = express();
const httpServer = createServer(app); // Create HTTP server

/* Initialize Socket.IO */
const io = initializeSocket(httpServer);

/* Logger logs handling */
app.use((_req: Request, _res: Response, next: NextFunction) => {
    next();
});

import "./messaging/rabbitmq/user-events.consumer";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", chatRouter);

// Handle 404 errors
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
    next(createHttpError.NotFound("Route not found"));
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).send({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});

// Start both Express and Socket.IO on the same server
httpServer.listen(process.env.PORT, () => console.log(`Server running at ${process.env.PORT}`));
