import createHttpError from "http-errors";
import { IChatRepository } from "../interfaces/IChatRepository";
import prisma from "../helpers/prisma";
import { Message } from "../interfaces/message.interface";

class ChatRepository implements IChatRepository {
    constructor() {}

    
    /* Given two user IDs, returns the ID of a conversation between those users, or null if no such conversation exists. */
    async getConversationID(userOneID: string, userTwoID: string): Promise<string | null> {
        try {
            const existingConversation = await prisma.conversations.findFirst({
                where: {
                    OR: [
                    { userOneID: userOneID, userTwoID: userTwoID },
                    { userOneID: userTwoID, userTwoID: userOneID },
                    ],
                },
            });
            if(existingConversation){
                return existingConversation?.id;
            }else {
                return null;
            }
        } catch (error) {
            throw createHttpError("Unable to find conversation")
        }
    }


    async createConversation(userOneID: string, userTwoID: string): Promise<string> {
        try {
            /* check if they already chatted i.e conversation happened */
            const conversationID = await this.getConversationID(userOneID, userTwoID);
            console.log('[ChatRepository] conversation ID ::: ',conversationID)
            if(conversationID){
                return conversationID;
            } else {
                /* if no conversation ID exists, they are not chatted yet. create a new conversation. */
                const newConversation = await prisma.conversations.create({
                    data: {
                        userOneID: userOneID,
                        userTwoID: userTwoID,
                    },
                });
                return newConversation?.id;
            }
        } catch (error) {
            console.log(error)
            throw createHttpError("Unable to create conversation")
        }
    }

    /* get the details of the other user in the conversation */
    async getCompanionDetails(userID: string): Promise<{userID: string, username: string, profilePic: string | null}> {
        try {
            const userDetails = await prisma.user.findUnique({
                where: { userID },
                select: { userID: true, username: true, profilePic: true },
            })
            if(!userDetails){
                throw createHttpError(404, "User not found")
            }
            return userDetails;
        } catch (error) {
            if (error instanceof createHttpError.HttpError) {
                console.error("HTTP Error:", error);
                throw error; // Rethrow the error to propagate it
            } else {
                console.error("Unexpected Error:", error);
                throw createHttpError(500, "Internal Server Error");
            }
        }
    }

    /* fetch all messages based on the chatID(conversation table ID) */
    async getMessages(chatID: string): Promise<Message[]> {
        try {
            const messages = await prisma.messages.findMany({
                where: { chatID },
                orderBy: { createdAt: "asc" }
            });
            return messages;
        } catch (error) {
            throw createHttpError(500, "Unable to fetch messages");
        }
    }

    async getBasicProfile(userID: string): Promise<{username: string, profilePic: string | null, userID: string}> {
        try {   
            const userDetails = await prisma.user.findUnique({
                where: { userID },
                select: { userID: true, username: true, profilePic: true },
            })
            if(!userDetails){
                throw createHttpError(404, "User not found")
            }
            return userDetails;
        } catch (error) {   
            throw createHttpError(500, "Unable to fetch basic profile");
        }
    }
}

export default ChatRepository;