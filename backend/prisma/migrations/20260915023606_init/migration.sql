-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ResumeVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "jobTitle" TEXT,
    "company" TEXT,
    "originalResume" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "tailoredResume" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "matchScoreBefore" REAL NOT NULL,
    "matchScoreAfter" REAL NOT NULL,
    "matchedKeywords" TEXT NOT NULL,
    "missingKeywords" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResumeVersion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
