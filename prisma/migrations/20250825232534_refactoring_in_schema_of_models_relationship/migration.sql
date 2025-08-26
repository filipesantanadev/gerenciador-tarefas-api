/*
  Warnings:

  - You are about to drop the column `userId` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the `_TagToTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_TagToTask" DROP CONSTRAINT "_TagToTask_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TagToTask" DROP CONSTRAINT "_TagToTask_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."tags" DROP CONSTRAINT "tags_userId_fkey";

-- AlterTable
ALTER TABLE "public"."tags" DROP COLUMN "userId";

-- DropTable
DROP TABLE "public"."_TagToTask";

-- CreateTable
CREATE TABLE "public"."_TaskTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskTags_B_index" ON "public"."_TaskTags"("B");

-- AddForeignKey
ALTER TABLE "public"."_TaskTags" ADD CONSTRAINT "_TaskTags_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TaskTags" ADD CONSTRAINT "_TaskTags_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
