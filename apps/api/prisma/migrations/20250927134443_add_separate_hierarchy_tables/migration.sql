-- CreateTable
CREATE TABLE "question_bank_hierarchy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "question_bank_hierarchy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "question_bank_hierarchy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "previous_papers_hierarchy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "previous_papers_hierarchy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "previous_papers_hierarchy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "humanId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "explanation" TEXT,
    "references" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "points" INTEGER NOT NULL DEFAULT 1,
    "timeLimit" INTEGER,
    "tags" TEXT,
    "sourceTags" TEXT,
    "examTags" TEXT,
    "hierarchyItemId" TEXT,
    "questionBankHierarchyId" TEXT,
    "previousPapersHierarchyId" TEXT,
    "assertion" TEXT,
    "reasoning" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "questions_hierarchyItemId_fkey" FOREIGN KEY ("hierarchyItemId") REFERENCES "hierarchy_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "questions_questionBankHierarchyId_fkey" FOREIGN KEY ("questionBankHierarchyId") REFERENCES "question_bank_hierarchy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "questions_previousPapersHierarchyId_fkey" FOREIGN KEY ("previousPapersHierarchyId") REFERENCES "previous_papers_hierarchy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_questions" ("assertion", "createdAt", "createdBy", "difficulty", "examTags", "explanation", "hierarchyItemId", "humanId", "id", "isActive", "points", "question", "reasoning", "references", "sourceTags", "tags", "timeLimit", "type", "updatedAt") SELECT "assertion", "createdAt", "createdBy", "difficulty", "examTags", "explanation", "hierarchyItemId", "humanId", "id", "isActive", "points", "question", "reasoning", "references", "sourceTags", "tags", "timeLimit", "type", "updatedAt" FROM "questions";
DROP TABLE "questions";
ALTER TABLE "new_questions" RENAME TO "questions";
CREATE UNIQUE INDEX "questions_humanId_key" ON "questions"("humanId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
