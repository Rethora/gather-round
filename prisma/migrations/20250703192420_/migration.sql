/*
  Warnings:

  - The values [MA] on the enum `RsvpStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RsvpStatus_new" AS ENUM ('PENDING', 'MAYBE', 'YES', 'NO');
ALTER TABLE "Rsvp" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Rsvp" ALTER COLUMN "status" TYPE "RsvpStatus_new" USING ("status"::text::"RsvpStatus_new");
ALTER TYPE "RsvpStatus" RENAME TO "RsvpStatus_old";
ALTER TYPE "RsvpStatus_new" RENAME TO "RsvpStatus";
DROP TYPE "RsvpStatus_old";
ALTER TABLE "Rsvp" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
