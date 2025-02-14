import prisma from "./prisma";

/* this message helper is used to save a new message to the database. */
export const saveMessage = async (chatID: string, content: string, senderID: string) => {
  try {
    // Save message to the database
    const newMessage = await prisma.messages.create({
      data: {
        chatID,
        content,
        messageType: "text",
        status: "sent",
        senderID,
      },
    });

    // Update conversation with last message
    await prisma.conversations.update({
      where: { id: chatID },
      data: {
        lastMessageID: newMessage.id,
        lastMessageContent: content,
        lastMessageTimestamp: new Date(),
      },
    });

    return newMessage;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};
