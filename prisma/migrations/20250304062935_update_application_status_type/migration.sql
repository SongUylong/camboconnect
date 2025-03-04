/*
  Warnings:

  - You are about to drop the column `description` on the `ApplicationStatusType` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ApplicationStatusType` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ApplicationStatusType_name_key";

-- AlterTable
ALTER TABLE "ApplicationStatusType" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "isApplied" BOOLEAN NOT NULL DEFAULT false;
