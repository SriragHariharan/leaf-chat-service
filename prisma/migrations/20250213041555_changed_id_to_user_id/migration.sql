/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - Added the required column `userID` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Conversations` DROP FOREIGN KEY `Conversations_userOneID_fkey`;

-- DropForeignKey
ALTER TABLE `Conversations` DROP FOREIGN KEY `Conversations_userTwoID_fkey`;

-- DropForeignKey
ALTER TABLE `Messages` DROP FOREIGN KEY `Messages_senderID_fkey`;

-- DropIndex
DROP INDEX `Conversations_userOneID_fkey` ON `Conversations`;

-- DropIndex
DROP INDEX `Conversations_userTwoID_fkey` ON `Conversations`;

-- DropIndex
DROP INDEX `Messages_senderID_fkey` ON `Messages`;

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `userID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`userID`);

-- AddForeignKey
ALTER TABLE `Conversations` ADD CONSTRAINT `Conversations_userOneID_fkey` FOREIGN KEY (`userOneID`) REFERENCES `User`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversations` ADD CONSTRAINT `Conversations_userTwoID_fkey` FOREIGN KEY (`userTwoID`) REFERENCES `User`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_senderID_fkey` FOREIGN KEY (`senderID`) REFERENCES `User`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;
