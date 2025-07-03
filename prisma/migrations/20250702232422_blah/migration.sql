/*
  Warnings:

  - The values [CONFIRMED,CANCELLED] on the enum `RsvpStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `inviteeId` to the `Rsvp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RsvpStatus_new" AS ENUM ('PENDING', 'YES', 'NO');
ALTER TABLE "Rsvp" ALTER COLUMN "status" TYPE "RsvpStatus_new" USING ("status"::text::"RsvpStatus_new");
ALTER TYPE "RsvpStatus" RENAME TO "RsvpStatus_old";
ALTER TYPE "RsvpStatus_new" RENAME TO "RsvpStatus";
DROP TYPE "RsvpStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Rsvp" ADD COLUMN     "inviteeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
