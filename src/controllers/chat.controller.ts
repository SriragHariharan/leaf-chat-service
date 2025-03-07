import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { IChatService } from "../interfaces/IChatService";
import logger from "../helpers/logger";

class ChatController {
    private chatService: IChatService;

    constructor(chatService: IChatService) {
        this.chatService = chatService;
    }

    /* Get or create a conversation ID for two users. */
    async getConversationID(req: Request, res: Response, next: NextFunction) {
        logger.debug(`Entering getConversationID method. Params: userOneID=${req.user?.aud}, userTwoID=${req.params?.userID}`, { method: "getConversationID", layer: "controller" });
        try {
            const userOneID = req.user?.aud;
            const userTwoID = req.params?.userID;

            if (!userOneID || !userTwoID) {
                logger.error(`User ID not provided. UserOneID: ${userOneID}, UserTwoID: ${userTwoID}`, { layer: "controller" });
                throw createHttpError(400, "User ID not provided");
            }

            logger.info(`Fetching or creating conversation ID. UserOneID: ${userOneID}, UserTwoID: ${userTwoID}`, { layer: "controller" });
            const conversationID = await this.chatService.getConversationID(userOneID, userTwoID);

            logger.info(`Successfully fetched or created conversation ID. ConversationID: ${conversationID}`, { layer: "controller" });
            return res.status(201).json({ success: true, message: "Conversation ID fetched", data: { conversationID } });
        } catch (error) {
            logger.error(`Error in getConversationID: ${error}`, { error, layer: "controller" });
            next(error);
        } finally {
            logger.debug(`Exiting getConversationID method. Params: userOneID=${req.user?.aud}, userTwoID=${req.params?.userID}`, { method: "getConversationID", layer: "controller" });
        }
    }

    /* Get all messages for a specific chatID. */
    async getMessages(req: Request, res: Response, next: NextFunction) {
        logger.debug(`Entering getMessages method. Param: chatID=${req.params?.chatID}`, { method: "getMessages", layer: "controller" });
        try {
            const chatID = req.params?.chatID;

            if (!chatID) {
                logger.error(`Chat ID not provided. ChatID: ${chatID}`, { layer: "controller" });
                throw createHttpError(400, "Chat ID not provided");
            }

            logger.info(`Fetching messages for chat. ChatID: ${chatID}`, { layer: "controller" });
            const messages = await this.chatService.getMessages(chatID);

            logger.info(`Successfully fetched messages for chat. ChatID: ${chatID}`, { layer: "controller" });
            return res.status(201).json({ success: true, message: "Messages fetched", data: { messages } });
        } catch (error) {
            logger.error(`Error in getMessages: ${error}`, { error, layer: "controller" });
            next(error);
        } finally {
            logger.debug(`Exiting getMessages method. Param: chatID=${req.params?.chatID}`, { method: "getMessages", layer: "controller" });
        }
    }

    /* Get the basic profile of a user. */
    async getBasicProfile(req: Request, res: Response, next: NextFunction) {
        logger.debug(`Entering getBasicProfile method. Param: userID=${req.params?.userID}`, { method: "getBasicProfile", layer: "controller" });
        try {
            const userID = req.params?.userID;

            if (!userID) {
                logger.error(`User ID not provided. UserID: ${userID}`, { layer: "controller" });
                throw createHttpError(400, "User ID not provided");
            }

            logger.info(`Fetching basic profile for user. UserID: ${userID}`, { layer: "controller" });
            const basicProfile = await this.chatService.getBasicProfile(userID);

            logger.info(`Successfully fetched basic profile for user. UserID: ${userID}`, { layer: "controller" });
            return res.status(201).json({ success: true, message: "Basic profile fetched", data: { profile: basicProfile } });
        } catch (error) {
            logger.error(`Error in getBasicProfile: ${error}`, { error, layer: "controller" });
            next(error);
        } finally {
            logger.debug(`Exiting getBasicProfile method. Param: userID=${req.params?.userID}`, { method: "getBasicProfile", layer: "controller" });
        }
    }

    /* Get all conversations for a user. */
    async getConversations(req: Request, res: Response, next: NextFunction) {
        logger.debug(`Entering getConversations method. Param: userID=${req.user?.aud}`, { method: "getConversations", layer: "controller" });
        try {
            const userID = req.user?.aud;

            if (!userID) {
                logger.error(`User ID not provided. UserID: ${userID}`, { layer: "controller" });
                throw createHttpError(400, "User ID not provided");
            }

            logger.info(`Fetching conversations for user. UserID: ${userID}`, { layer: "controller" });
            const conversations = await this.chatService.getConversations(userID);

            logger.info(`Successfully fetched conversations for user. UserID: ${userID}`, { layer: "controller" });
            return res.status(201).json({ success: true, message: "Conversations fetched", data: { conversations } });
        } catch (error) {
            logger.error(`Error in getConversations: ${error}`, { error, layer: "controller" });
            next(error);
        } finally {
            logger.debug(`Exiting getConversations method. Param: userID=${req.user?.aud}`, { method: "getConversations", layer: "controller" });
        }
    }
}

export default ChatController;