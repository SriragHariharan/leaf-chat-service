import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { IChatService } from "../interfaces/IChatService";

class ChatController {
    private chatService: IChatService;
    constructor(chatService: IChatService){
        this.chatService = chatService;
    }

    async getConversationID(req: Request, res: Response, next: NextFunction) {
        try {
            const userOneID = req.user?.aud;
            const userTwoID = req.params?.userID;
            if(!userOneID || !userTwoID) throw createHttpError(400, "User ID not provided");
            const conversationID = await this.chatService.getConversationID(userOneID, userTwoID);
            console.log(conversationID)
            return res.status(201).json({ success: true, message: "Conversation ID fetched", data: { conversationID }});
        } catch (error) {
            next(error);
        }
    }

    /* get messages for a chatID */
    async getMessages(req: Request, res: Response, next: NextFunction) {
        try {
            const chatID = req.params?.chatID;
            if(!chatID) throw createHttpError(400, "Chat ID not provided");
            const messages = await this.chatService.getMessages(chatID);
            return res.status(201).json({ success: true, message: "Messages fetched", data: { messages }});
        } catch (error) {
            next(error);
        }
    }

    /* get basic profile */
    async getBasicProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = req.params?.userID;
            if(!userID) throw createHttpError(400, "User ID not provided");
            const basicProfile = await this.chatService.getBasicProfile(userID);
            return res.status(201).json({ success: true, message: "Basic profile fetched", data: { profile: basicProfile }});
        } catch (error) {
            next(error);
        }       
    }

    /* get all conversations for a user */
    async getConversations(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = req.user?.aud;
            if(!userID) throw createHttpError(400, "User ID not provided");
            const conversations = await this.chatService.getConversations(userID);
            return res.status(201).json({ success: true, message: "Conversations fetched", data: { conversations }});
        } catch (error) {
            next(error);
        }
    }
}

export default ChatController;