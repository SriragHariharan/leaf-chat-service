import logger from "./logger";
import prisma from "./prisma";

/* Save a new message to the database and update the conversation's last message and unread count. */
export const saveMessage = async (chatID: string, content: string, senderID: string, isInChat: boolean) => {
  logger.debug(`Entering saveMessage method. Params: chatID=${chatID}, senderID=${senderID}`, { method: "saveMessage", layer: "helper" });
  try {
    logger.info(`Fetching conversation details. ChatID: ${chatID}`, { layer: "helper" });

    // Fetch the conversation details
    const conversation = await prisma.conversations.findUnique({
      where: { id: chatID },
      select: {
        userOneID: true,
        userTwoID: true,
      },
    });

    if (!conversation) {
      logger.error(`Conversation not found. ChatID: ${chatID}`, { layer: "helper" });
      throw new Error("Conversation not found");
    }

    // Determine the friend ID
    const friendID = senderID === conversation.userOneID ? conversation.userTwoID : conversation.userOneID;

    logger.info(`Saving new message to the database. ChatID: ${chatID}, SenderID: ${senderID}`, { layer: "helper" });

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

    logger.info(`Successfully saved new message. MessageID: ${newMessage.id}`, { layer: "helper" });

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

    logger.info(`Successfully updated conversation. ChatID: ${chatID}`, { layer: "helper" });

    return newMessage;
  } catch (error) {
    logger.error(`Error in saveMessage`, { error, layer: "helper" });
    throw error;
  } finally {
    logger.debug(`Exiting saveMessage method. Params: chatID=${chatID}, senderID=${senderID}`, { method: "saveMessage", layer: "helper" });
  }
};

/* Update all messages in a chat to "read" for a specific user and reset their unread count. */
export const updateMessageToRead = async (chatID: string, userID: string) => {
  logger.debug(`Entering updateMessageToRead method. Params: chatID=${chatID}, userID=${userID}`, { method: "updateMessageToRead", layer: "helper" });
  try {
    logger.info(`Updating messages to "read" for user. ChatID: ${chatID}, UserID: ${userID}`, { layer: "helper" });

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

    logger.info(`Successfully updated messages to "read". ChatID: ${chatID}, UserID: ${userID}`, { layer: "helper" });

    // Fetch the conversation to check which unread count to reset
    const conversation = await prisma.conversations.findUnique({
      where: { id: chatID },
      select: {
        userOneID: true,
        userTwoID: true,
      },
    });

    if (!conversation) {
      logger.error(`Conversation not found. ChatID: ${chatID}`, { layer: "helper" });
      throw new Error("Conversation not found");
    }

    // Determine which unread count to reset
    const updateData =
      userID === conversation.userOneID
        ? { unreadCountForUserOne: 0 }
        : { unreadCountForUserTwo: 0 };

    logger.info(`Resetting unread count for user. ChatID: ${chatID}, UserID: ${userID}`, { layer: "helper" });

    // Reset the unread message count for the user who opened the chat
    await prisma.conversations.update({
      where: { id: chatID },
      data: updateData,
    });

    logger.info(`Successfully reset unread count. ChatID: ${chatID}, UserID: ${userID}`, { layer: "helper" });
  } catch (error) {
    logger.error(`Error in updateMessageToRead`, { error, layer: "helper" });
    throw error;
  } finally {
    logger.debug(`Exiting updateMessageToRead method. Params: chatID=${chatID}, userID=${userID}`, { method: "updateMessageToRead", layer: "helper" });
  }
};