import createHttpError from "http-errors";
import { IChatRepository } from "../interfaces/IChatRepository";
import prisma from "../helpers/prisma";
import { Message } from "../interfaces/message.interface";
import logger from "../helpers/logger";

class ChatRepository implements IChatRepository {
    constructor() {}

    /* Given two user IDs, returns the ID of a conversation between those users, or null if no such conversation exists. */
    async getConversationID(userOneID: string, userTwoID: string): Promise<string | null> {
        logger.debug(`Entering getConversationID method. Params: userOneID=${userOneID}, userTwoID=${userTwoID}`, { method: "getConversationID", layer: "repository" });
        try {
            logger.info(`Fetching conversation ID for users. UserOneID: ${userOneID}, UserTwoID: ${userTwoID}`, { layer: "repository" });

            const existingConversation = await prisma.conversations.findFirst({
                where: {
                    OR: [
                        { userOneID: userOneID, userTwoID: userTwoID },
                        { userOneID: userTwoID, userTwoID: userOneID },
                    ],
                },
            });

            if (existingConversation) {
                logger.info(`Conversation found. ConversationID: ${existingConversation.id}`, { layer: "repository" });
                return existingConversation?.id;
            } else {
                logger.info(`No conversation found for users. UserOneID: ${userOneID}, UserTwoID: ${userTwoID}`, { layer: "repository" });
                return null;
            }
        } catch (error) {
            logger.error(`Error in getConversationID: Unable to find conversation.`, { error, layer: "repository" });
            throw createHttpError(500, "Unable to find conversation");
        } finally {
            logger.debug(`Exiting getConversationID method. Params: userOneID=${userOneID}, userTwoID=${userTwoID}`, { method: "getConversationID", layer: "repository" });
        }
    }

    /* Create a new conversation or return an existing one if it already exists. */
    async createConversation(userOneID: string, userTwoID: string): Promise<string> {
        logger.debug(`Entering createConversation method. Params: userOneID=${userOneID}, userTwoID=${userTwoID}`, { method: "createConversation", layer: "repository" });
        try {
            logger.info(`Checking if conversation already exists. UserOneID: ${userOneID}, UserTwoID: ${userTwoID}`, { layer: "repository" });

            const conversationID = await this.getConversationID(userOneID, userTwoID);
            if (conversationID) {
                logger.info(`Conversation already exists. ConversationID: ${conversationID}`, { layer: "repository" });
                return conversationID;
            } else {
                logger.info(`Creating new conversation. UserOneID: ${userOneID}, UserTwoID: ${userTwoID}`, { layer: "repository" });

                const newConversation = await prisma.conversations.create({
                    data: {
                        userOneID: userOneID,
                        userTwoID: userTwoID,
                    },
                });

                logger.info(`Successfully created new conversation. ConversationID: ${newConversation.id}`, { layer: "repository" });
                return newConversation?.id;
            }
        } catch (error) {
            logger.error(`Error in createConversation: Unable to create conversation.`, { error, layer: "repository" });
            throw createHttpError(500, "Unable to create conversation");
        } finally {
            logger.debug(`Exiting createConversation method. Params: userOneID=${userOneID}, userTwoID=${userTwoID}`, { method: "createConversation", layer: "repository" });
        }
    }

    /* Get the details of the other user in the conversation. */
    async getCompanionDetails(userID: string): Promise<{ userID: string; username: string; profilePic: string | null }> {
        logger.debug(`Entering getCompanionDetails method. Param: userID=${userID}`, { method: "getCompanionDetails", layer: "repository" });
        try {
            logger.info(`Fetching companion details. UserID: ${userID}`, { layer: "repository" });

            const userDetails = await prisma.user.findUnique({
                where: { userID },
                select: { userID: true, username: true, profilePic: true },
            });

            if (!userDetails) {
                logger.error(`User not found. UserID: ${userID}`, { layer: "repository" });
                throw createHttpError(404, "User not found");
            }

            logger.info(`Successfully fetched companion details. UserID: ${userID}`, { layer: "repository" });
            return userDetails;
        } catch (error) {
            if (error instanceof createHttpError.HttpError) {
                logger.error(`HttpError in getCompanionDetails: ${error.message}`, { error, layer: "repository" });
                throw error;
            } else {
                logger.error(`Unexpected error in getCompanionDetails.`, { error, layer: "repository" });
                throw createHttpError(500, "Internal Server Error");
            }
        } finally {
            logger.debug(`Exiting getCompanionDetails method. Param: userID=${userID}`, { method: "getCompanionDetails", layer: "repository" });
        }
    }

    /* Fetch all messages based on the chatID (conversation table ID). */
    async getMessages(chatID: string): Promise<Message[]> {
        logger.debug(`Entering getMessages method. Param: chatID=${chatID}`, { method: "getMessages", layer: "repository" });
        try {
            logger.info(`Fetching messages for chat. ChatID: ${chatID}`, { layer: "repository" });

            const messages = await prisma.messages.findMany({
                where: { chatID },
                orderBy: { createdAt: "asc" },
            });

            logger.info(`Successfully fetched messages for chat. ChatID: ${chatID}`, { layer: "repository" });
            return messages;
        } catch (error) {
            logger.error(`Error in getMessages: Unable to fetch messages.`, { error, layer: "repository" });
            throw createHttpError(500, "Unable to fetch messages");
        } finally {
            logger.debug(`Exiting getMessages method. Param: chatID=${chatID}`, { method: "getMessages", layer: "repository" });
        }
    }

    /* Get the basic profile details of a user. */
    async getBasicProfile(userID: string): Promise<{ username: string; profilePic: string | null; userID: string }> {
        logger.debug(`Entering getBasicProfile method. Param: userID=${userID}`, { method: "getBasicProfile", layer: "repository" });
        try {
            logger.info(`Fetching basic profile details. UserID: ${userID}`, { layer: "repository" });

            const userDetails = await prisma.user.findUnique({
                where: { userID },
                select: { userID: true, username: true, profilePic: true },
            });

            if (!userDetails) {
                logger.error(`User not found. UserID: ${userID}`, { layer: "repository" });
                throw createHttpError(404, "User not found");
            }

            logger.info(`Successfully fetched basic profile details. UserID: ${userID}`, { layer: "repository" });
            return userDetails;
        } catch (error) {
            logger.error(`Error in getBasicProfile: Unable to fetch basic profile.`, { error, layer: "repository" });
            throw createHttpError(500, "Unable to fetch basic profile");
        } finally {
            logger.debug(`Exiting getBasicProfile method. Param: userID=${userID}`, { method: "getBasicProfile", layer: "repository" });
        }
    }

    /* Fetch all conversations for a user. */
    async getConversations(userID: string): Promise<any> {
        logger.debug(`Entering getConversations method. Param: userID=${userID}`, { method: "getConversations", layer: "repository" });
        try {
            logger.info(`Fetching conversations for user. UserID: ${userID}`, { layer: "repository" });

            const conversations = await prisma.conversations.findMany({
                where: {
                    OR: [{ userOneID: userID }, { userTwoID: userID }],
                },
                select: {
                    id: true,
                    lastMessageContent: true,
                    lastMessageTimestamp: true,
                    unreadCountForUserOne: true,
                    unreadCountForUserTwo: true,
                    createdAt: true,
                    updatedAt: true,
                    userOneID: true,
                    userTwoID: true,
                    userOne: {
                        select: {
                            userID: true,
                            username: true,
                            profilePic: true,
                        },
                    },
                    userTwo: {
                        select: {
                            userID: true,
                            username: true,
                            profilePic: true,
                        },
                    },
                },
            });

            const formattedConversations = conversations.map((conversation) => {
                const isUserOne = conversation.userOneID === userID;
                const friend = isUserOne ? conversation.userTwo : conversation.userOne;

                return {
                    chatID: conversation.id,
                    friendID: friend.userID,
                    friendUsername: friend.username,
                    friendProfilePic: friend.profilePic,
                    lastMessage: conversation.lastMessageContent,
                    lastMessageTimestamp: conversation.lastMessageTimestamp,
                    unreadCount: isUserOne ? conversation.unreadCountForUserOne : conversation.unreadCountForUserTwo,
                    createdAt: conversation.createdAt,
                    updatedAt: conversation.updatedAt,
                };
            });

            logger.info(`Successfully fetched conversations for user. UserID: ${userID}`, { layer: "repository" });
            return formattedConversations;
        } catch (error) {
            logger.error(`Error in getConversations: Unable to fetch conversations.`, { error, layer: "repository" });
            throw createHttpError(500, "Unable to get conversations");
        } finally {
            logger.debug(`Exiting getConversations method. Param: userID=${userID}`, { method: "getConversations", layer: "repository" });
        }
    }
}

export default ChatRepository;