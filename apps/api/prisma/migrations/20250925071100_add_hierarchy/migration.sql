-- CreateTable
CREATE TABLE "hierarchy_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hierarchy_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "hierarchy_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
