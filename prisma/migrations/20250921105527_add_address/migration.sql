-- AlterTable
ALTER TABLE `Product` MODIFY `description` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lineOne` VARCHAR(191) NOT NULL,
    `lineTwo` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `coutry` VARCHAR(191) NOT NULL,
    `pincode` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
