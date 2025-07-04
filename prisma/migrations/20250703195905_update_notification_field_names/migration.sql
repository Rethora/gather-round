/*
  Warnings:

  - You are about to drop the column `relatedCommentId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `relatedEventId` on the `Notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_relatedCommentId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_relatedEventId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "relatedCommentId",
DROP COLUMN "relatedEventId",
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "eventId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
