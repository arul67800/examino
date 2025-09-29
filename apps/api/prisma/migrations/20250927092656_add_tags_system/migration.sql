-- AlterTable
ALTER TABLE "questions" ADD COLUMN "examTags" TEXT;
ALTER TABLE "questions" ADD COLUMN "references" TEXT;
ALTER TABLE "questions" ADD COLUMN "sourceTags" TEXT;

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT,
    "isPreset" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_category_key" ON "tags"("name", "category");
