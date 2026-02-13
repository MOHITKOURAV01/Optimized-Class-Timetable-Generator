/*
  Warnings:

  - You are about to drop the column `departmentId` on the `AuthorizedUser` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `AuthorizedUser` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Classroom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Faculty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuthorizedUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AuthorizedUser" ("createdAt", "email", "id", "isActive", "name", "password", "phone", "updatedAt") SELECT "createdAt", "email", "id", "isActive", "name", "password", "phone", "updatedAt" FROM "AuthorizedUser";
DROP TABLE "AuthorizedUser";
ALTER TABLE "new_AuthorizedUser" RENAME TO "AuthorizedUser";
CREATE UNIQUE INDEX "AuthorizedUser_email_key" ON "AuthorizedUser"("email");
CREATE TABLE "new_Classroom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Classroom_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Classroom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthorizedUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Classroom" ("createdAt", "departmentId", "id", "name", "semester", "year") SELECT "createdAt", "departmentId", "id", "name", "semester", "year" FROM "Classroom";
DROP TABLE "Classroom";
ALTER TABLE "new_Classroom" RENAME TO "Classroom";
CREATE TABLE "new_Department" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "headOfDepartment" TEXT,
    "totalFaculty" INTEGER,
    "totalStudents" INTEGER,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Department_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthorizedUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Department" ("code", "createdAt", "headOfDepartment", "id", "name", "totalFaculty", "totalStudents", "updatedAt") SELECT "code", "createdAt", "headOfDepartment", "id", "name", "totalFaculty", "totalStudents", "updatedAt" FROM "Department";
DROP TABLE "Department";
ALTER TABLE "new_Department" RENAME TO "Department";
CREATE TABLE "new_Faculty" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "maxWeeklyLoad" INTEGER NOT NULL,
    "averageLeavesPerMonth" REAL NOT NULL DEFAULT 0,
    "availableDays" TEXT NOT NULL,
    "preferredSlots" TEXT,
    "departmentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Faculty_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthorizedUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Faculty" ("availableDays", "averageLeavesPerMonth", "departmentId", "email", "id", "maxWeeklyLoad", "name", "phone", "preferredSlots") SELECT "availableDays", "averageLeavesPerMonth", "departmentId", "email", "id", "maxWeeklyLoad", "name", "phone", "preferredSlots" FROM "Faculty";
DROP TABLE "Faculty";
ALTER TABLE "new_Faculty" RENAME TO "Faculty";
CREATE TABLE "new_Subject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "credits" INTEGER,
    "lecturesPerWeek" INTEGER,
    "labsPerWeek" INTEGER DEFAULT 0,
    "classesPerWeek" INTEGER,
    "classesPerDay" INTEGER,
    "type" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "durationPerClass" INTEGER,
    "prerequisites" TEXT,
    "allowedRoomTypes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subject_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthorizedUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subject" ("allowedRoomTypes", "classesPerDay", "classesPerWeek", "code", "createdAt", "credits", "departmentId", "durationPerClass", "id", "labsPerWeek", "lecturesPerWeek", "name", "prerequisites", "semester", "type", "updatedAt") SELECT "allowedRoomTypes", "classesPerDay", "classesPerWeek", "code", "createdAt", "credits", "departmentId", "durationPerClass", "id", "labsPerWeek", "lecturesPerWeek", "name", "prerequisites", "semester", "type", "updatedAt" FROM "Subject";
DROP TABLE "Subject";
ALTER TABLE "new_Subject" RENAME TO "Subject";
CREATE TABLE "new_Timetable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "generatedById" INTEGER NOT NULL,
    "departmentId" INTEGER,
    "semester" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scoreJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Timetable_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Timetable_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "AuthorizedUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Timetable" ("createdAt", "generatedById", "id", "name", "scoreJson", "status", "updatedAt") SELECT "createdAt", "generatedById", "id", "name", "scoreJson", "status", "updatedAt" FROM "Timetable";
DROP TABLE "Timetable";
ALTER TABLE "new_Timetable" RENAME TO "Timetable";
CREATE TABLE "new_TimetableSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "timetableId" INTEGER,
    "facultyId" INTEGER NOT NULL,
    "classroomId" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "slotType" TEXT NOT NULL DEFAULT 'LECTURE',
    "isFixed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TimetableSlot_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TimetableSlot_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetable" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TimetableSlot_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TimetableSlot_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TimetableSlot_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TimetableSlot" ("classroomId", "createdAt", "dayOfWeek", "departmentId", "endTime", "facultyId", "id", "isFixed", "semester", "startTime", "subjectId", "timetableId", "updatedAt") SELECT "classroomId", "createdAt", "dayOfWeek", "departmentId", "endTime", "facultyId", "id", "isFixed", "semester", "startTime", "subjectId", "timetableId", "updatedAt" FROM "TimetableSlot";
DROP TABLE "TimetableSlot";
ALTER TABLE "new_TimetableSlot" RENAME TO "TimetableSlot";
CREATE UNIQUE INDEX "TimetableSlot_dayOfWeek_startTime_classroomId_key" ON "TimetableSlot"("dayOfWeek", "startTime", "classroomId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
