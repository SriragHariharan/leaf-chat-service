-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `profilePic` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversations` (
    `id` VARCHAR(191) NOT NULL,
    `userOneID` VARCHAR(191) NOT NULL,
    `userTwoID` VARCHAR(191) NOT NULL,
    `lastMessageID` VARCHAR(191) NULL,
    `lastMessageContent` VARCHAR(191) NULL,
    `lastMessageTimestamp` DATETIME(3) NULL,
    `unreadCountForUserOne` INTEGER NOT NULL DEFAULT 0,
    `unreadCountForUserTwo` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Conversations_lastMessageID_key`(`lastMessageID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Messages` (
    `id` VARCHAR(191) NOT NULL,
    `chatID` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `messageType` ENUM('text', 'image') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('sent', 'delivered', 'read') NOT NULL,
    `isDeletedForSender` BOOLEAN NOT NULL DEFAULT false,
    `isDeletedForReceiver` BOOLEAN NOT NULL DEFAULT false,
    `senderID` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Conversations` ADD CONSTRAINT `Conversations_lastMessageID_fkey` FOREIGN KEY (`lastMessageID`) REFERENCES `Messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversations` ADD CONSTRAINT `Conversations_userOneID_fkey` FOREIGN KEY (`userOneID`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversations` ADD CONSTRAINT `Conversations_userTwoID_fkey` FOREIGN KEY (`userTwoID`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_chatID_fkey` FOREIGN KEY (`chatID`) REFERENCES `Conversations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_senderID_fkey` FOREIGN KEY (`senderID`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
