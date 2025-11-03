-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "threshold" REAL NOT NULL,
    "operator" TEXT NOT NULL,
    "timeOfDay" TEXT,
    CONSTRAINT "UserAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAlert_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "UserLocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserAlert" ("id", "locationId", "operator", "threshold", "timeOfDay", "type", "userId") SELECT "id", "locationId", "operator", "threshold", "timeOfDay", "type", "userId" FROM "UserAlert";
DROP TABLE "UserAlert";
ALTER TABLE "new_UserAlert" RENAME TO "UserAlert";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
