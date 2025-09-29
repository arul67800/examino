-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_hierarchy_items" (
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
    CONSTRAINT "hierarchy_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "hierarchy_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_hierarchy_items" ("color", "createdAt", "id", "level", "name", "order", "parentId", "questionCount", "type", "updatedAt") SELECT "color", "createdAt", "id", "level", "name", "order", "parentId", "questionCount", "type", "updatedAt" FROM "hierarchy_items";
DROP TABLE "hierarchy_items";
ALTER TABLE "new_hierarchy_items" RENAME TO "hierarchy_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
