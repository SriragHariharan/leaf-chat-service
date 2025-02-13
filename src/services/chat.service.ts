import createHttpError from "http-errors";
import { IChatRepository } from "../interfaces/IChatRepository";
import { IChatService } from "../interfaces/IChatService";

class ChatService implements IChatService{
    
    private chatRepository: IChatRepository;
    constructor(chatRepository: IChatRepository){
        this.chatRepository = chatRepository
    }
    
    /* get conversation ID of a conversation */
    async getConversationID(userOneID: string, userTwoID: string): Promise<string | null> {
        try {
            const conversationID = await this.chatRepository.createConversation(userOneID, userTwoID);
            return conversationID;
        } catch (error) {
            if (error instanceof createHttpError.HttpError) {
                console.error("HTTP Error:", error);
                throw error;
            } else {
                console.error("Unexpected Error:", error);
                throw createHttpError(500, "Internal Server Error");
            }
        }
    }
}
export default ChatService