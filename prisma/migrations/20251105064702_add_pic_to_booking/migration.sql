-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookingMeeting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "roomName" TEXT NOT NULL,
    "pic" TEXT NOT NULL DEFAULT '',
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "purpose" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookingMeeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BookingMeeting" ("createdAt", "endTime", "id", "purpose", "roomName", "startTime", "updatedAt", "userId") SELECT "createdAt", "endTime", "id", "purpose", "roomName", "startTime", "updatedAt", "userId" FROM "BookingMeeting";
DROP TABLE "BookingMeeting";
ALTER TABLE "new_BookingMeeting" RENAME TO "BookingMeeting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
