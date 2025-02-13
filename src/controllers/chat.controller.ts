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
}

export default ChatController;