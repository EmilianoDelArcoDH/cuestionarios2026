-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
