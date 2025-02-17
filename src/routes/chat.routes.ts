import { Router, Request, Response, NextFunction } from "express"
import ChatRepository from "../repository/chat.repository";
import ChatService from "../services/chat.service";
import ChatController from "../controllers/chat.controller";
import { validateAccessToken } from "../helpers/jwt.helper";

/* DI */
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

const chatRouter = Router();

chatRouter.get("/conversationID/:userID", validateAccessToken, (req: Request, res: Response, next: NextFunction) => {
    chatController.getConversationID(req, res, next);
});

chatRouter.get("/messages/:chatID", validateAccessToken, (req: Request, res: Response, next: NextFunction) => {
    chatController.getMessages(req, res, next);
});

/* get basic profile */
chatRouter.get("/profile/:userID", validateAccessToken, (req: Request, res: Response, next: NextFunction) => {
    chatController.getBasicProfile(req, res, next);
})

chatRouter.get("/conversations", validateAccessToken, (req: Request, res: Response, next: NextFunction) => {
    chatController.getConversations(req, res, next); 
})


export default chatRouter;
