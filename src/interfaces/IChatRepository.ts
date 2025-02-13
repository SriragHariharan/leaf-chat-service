export interface IChatRepository {
    getConversationID(userOneID: string, userTwoID: string): Promise<string | null>
    createConversation(userOneID: string, userTwoID: string): Promise<string>
    getCompanionDetails(userID: string): Promise<{userID: string, username: string, profilePic: string | null}>
}