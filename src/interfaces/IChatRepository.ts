import { Message } from "./message.interface"

export interface IChatRepository {
    getConversationID(userOneID: string, userTwoID: string): Promise<string | null>
    createConversation(userOneID: string, userTwoID: string): Promise<string>
    getCompanionDetails(userID: string): Promise<{userID: string, username: string, profilePic: string | null}>
    getMessages(chatID: string): Promise<Message[]>
    getBasicProfile(userID: string): Promise<{username: string, profilePic: string | null, userID: string}>
    getConversations(userID: string): Promise<any>
}