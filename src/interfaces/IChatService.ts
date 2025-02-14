import { Message } from "./message.interface"

export interface IChatService {
    getConversationID(userOneID: string, userTwoID: string): Promise<string | null>
    getMessages(chatID: string): Promise<Message[]>
    getBasicProfile(userID: string): Promise<{username: string, profilePic: string | null, userID: string}>
}