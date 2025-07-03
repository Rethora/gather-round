/*
  Warnings:

  - A unique constraint covering the columns `[eventId,inviteeId]` on the table `Rsvp` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "RsvpStatus" ADD VALUE 'MA';

-- DropIndex
DROP INDEX "Rsvp_eventId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Rsvp_eventId_inviteeId_key" ON "Rsvp"("eventId", "inviteeId");
