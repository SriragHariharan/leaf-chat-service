import prisma from "./prisma";

/* this message helper is used to save a new message to the database. */
export const saveMessage = async (chatID: string, content: string, senderID: string, isInChat: boolean) => {
  try {
    // Fetch the conversation details
    const conversation = await prisma.conversations.findUnique({
      where: { id: chatID },
      select: {
        userOneID: true,
        userTwoID: true,
      },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Determine the friend ID
    const friendID = senderID === conversation.userOneID ? conversation.userTwoID : conversation.userOneID;

    // Save message to the database
    const newMessage = await prisma.messages.create({
      data: {
        chatID,
        content,
        messageType: "text",
        status: isInChat ? "read" : "sent",
        senderID,
      },
    });

    // Update conversation with last message & unread count if friend is offline
    await prisma.conversations.update({
      where: { id: chatID },
      data: {
        lastMessageID: newMessage.id,
        lastMessageContent: content,
        lastMessageTimestamp: new Date(),
        ...(isInChat
          ? {}
          : senderID === conversation.userOneID
          ? { unreadCountForUserTwo: { increment: 1 } }
          : { unreadCountForUserOne: { increment: 1 } }),
      },
    });

    return newMessage;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};


/* when a user visits the room, update all the messages to him as read */
/* i.e. update the message status of all messages where senderID not equall to his userID */
export const updateMessageToRead = async (chatID: string, userID: string) => {
  try {
    // Update all unread messages to "read" where senderID is not the current user
    await prisma.messages.updateMany({
      where: {
        chatID,
        senderID: { not: userID },
        status: { not: "read" }, // Only update messages that are not already read
      },
      data: {
        status: "read",
      },
    });

    // Fetch the conversation to check which unread count to reset
    const conversation = await prisma.conversations.findUnique({
      where: { id: chatID },
      select: {
        userOneID: true,
        userTwoID: true,
      },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Determine which unread count to reset
    const updateData =
      userID === conversation.userOneID
        ? { unreadCountForUserOne: 0 }
        : { unreadCountForUserTwo: 0 };

    // Reset the unread message count for the user who opened the chat
    await prisma.conversations.update({
      where: { id: chatID },
      data: updateData,
    });

  } catch (error) {
    console.error("Error updating messages to read:", error);
    throw error;
  }
};

