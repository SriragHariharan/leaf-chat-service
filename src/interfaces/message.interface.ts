export interface Message {
    id: string;
    chatID: string;
    content: string;
    messageType: "text" | "image";
    createdAt: Date;
    status: "sent" | "delivered" | "read";
    isDeletedForSender: boolean;
    isDeletedForReceiver: boolean;
    senderID: string;
}