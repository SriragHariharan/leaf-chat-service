export interface IChatService {
    getConversationID(userOneID: string, userTwoID: string): Promise<string | null>
}