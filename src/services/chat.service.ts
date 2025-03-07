import createHttpError from "http-errors";
import { IChatRepository } from "../interfaces/IChatRepository";
import { IChatService } from "../interfaces/IChatService";
import { Message } from "../interfaces/message.interface";
import logger from "../helpers/logger";

class ChatService implements IChatService {
    private chatRepository: IChatRepository;

    constructor(chatRepository: IChatRepository) {
        this.chatRepository = chatRepository;
    }

    /* Get the conversation ID of a conversation or create a new one if it doesn't exist. */
    async getConversationID(userOneID: string, userTwoID: string): Promise<string | null> {
        logger.debug(`Entering getConversationID method. Params: userOneID=${userOneID}, userTwoID=${userTwoID}`, { method: "getConversationID", layer: "service" });
        try {
            logger.info(`Fetching or creating conversation ID for users. UserOneID: ${userOneID}, UserTwoID: ${userTwoID}`, { layer: "service" });

            const conversationID = await this.chatRepository.createConversation(userOneID, userTwoID);

            logger.info(`Successfully fetched or created conversation ID. ConversationID: ${conversationID}`, { layer: "service" });
            return conversationID;
        } catch (error) {
            if (error instanceof createHttpError.HttpError) {
                logger.error(`HttpError in getConversationID: ${error.message}`, { error, layer: "service" });
                throw error;
            } else {
                logger.error(`Unexpected error in getConversationID.`, { error, layer: "service" });
                throw createHttpError(500, "Internal Server Error");
            }
        } finally {
            logger.debug(`Exiting getConversationID method. Params: userOneID=${userOneID}, userTwoID=${userTwoID}`, { method: "getConversationID", layer: "service" });
        }
    }

    /* Get all messages for a specific chatID. */
    async getMessages(chatID: string): Promise<Message[]> {
        logger.debug(`Entering getMessages method. Param: chatID=${chatID}`, { method: "getMessages", layer: "service" });
        try {
            logger.info(`Fetching messages for chat. ChatID: ${chatID}`, { layer: "service" });

            const messages = await this.chatRepository.getMessages(chatID);

            logger.info(`Successfully fetched messages for chat. ChatID: ${chatID}`, { layer: "service" });
            return messages;
        } catch (error) {
            if (error instanceof createHttpError.HttpError) {
                logger.error(`HttpError in getMessages: ${error.message}`, { error, layer: "service" });
                throw error;
            } else {
                logger.error(`Unexpected error in getMessages.`, { error, layer: "service" });
                throw createHttpError(500, "Internal Server Error");
            }
        } finally {
            logger.debug(`Exiting getMessages method. Param: chatID=${chatID}`, { method: "getMessages", layer: "service" });
        }
    }

    /* Get the basic profile of a user. */
    async getBasicProfile(userID: string): Promise<{ username: string; profilePic: string | null; userID: string }> {
        logger.debug(`Entering getBasicProfile method. Param: userID=${userID}`, { method: "getBasicProfile", layer: "service" });
        try {
            logger.info(`Fetching basic profile for user. UserID: ${userID}`, { layer: "service" });

            const basicProfile = await this.chatRepository.getBasicProfile(userID);

            logger.info(`Successfully fetched basic profile for user. UserID: ${userID}`, { layer: "service" });
            return basicProfile;
        } catch (error) {
            if (error instanceof createHttpError.HttpError) {
                logger.error(`HttpError in getBasicProfile: ${error.message}`, { error, layer: "service" });
                throw error;
            } else {
                logger.error(`Unexpected error in getBasicProfile.`, { error, layer: "service" });
                throw createHttpError(500, "Internal Server Error");
            }
        } finally {
            logger.debug(`Exiting getBasicProfile method. Param: userID=${userID}`, { method: "getBasicProfile", layer: "service" });
        }
    }

    /* Get all conversations for a user. */
    async getConversations(userID: string): Promise<any> {
        logger.debug(`Entering getConversations method. Param: userID=${userID}`, { method: "getConversations", layer: "service" });
        try {
            logger.info(`Fetching conversations for user. UserID: ${userID}`, { layer: "service" });

            const conversations = await this.chatRepository.getConversations(userID);

            logger.info(`Successfully fetched conversations for user. UserID: ${userID}`, { layer: "service" });
            return conversations;
        } catch (error) {
            if (error instanceof createHttpError.HttpError) {
                logger.error(`HttpError in getConversations: ${error.message}`, { error, layer: "service" });
                throw error;
            } else {
                logger.error(`Unexpected error in getConversations.`, { error, layer: "service" });
                throw createHttpError(500, "Internal Server Error");
            }
        } finally {
            logger.debug(`Exiting getConversations method. Param: userID=${userID}`, { method: "getConversations", layer: "service" });
        }
    }
}

export default ChatService;