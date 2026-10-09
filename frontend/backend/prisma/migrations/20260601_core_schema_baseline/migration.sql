-- Baseline the full Core MVP schema that historically existed via `prisma db push`.
-- This migration is intentionally additive/idempotent so it can run both:
--   1) on a fresh database after the original User-only init migration, and
--   2) on the existing Synora development database where these objects already exist.
-- Do not replace this with a destructive reset or `db push --accept-data-loss`.

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "TaskCategory" AS ENUM ('PPT', 'ASSIGNMENT', 'PRESENTATION', 'THESIS', 'DESIGN', 'CODING', 'RESEARCH', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "TeamCategory" AS ENUM ('ACADEMIC', 'CLUB', 'STARTUP', 'TOUR', 'SKILLS', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'USER';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isBanned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ratingSum" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ratingCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "Profile" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "fullName" TEXT,
  "department" TEXT,
  "batch" TEXT,
  "skills" TEXT,
  "bio" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_userId_key" ON "Profile"("userId");

CREATE TABLE IF NOT EXISTS "Task" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" "TaskCategory" NOT NULL DEFAULT 'OTHER',
  "requirements" TEXT,
  "deadline" TIMESTAMP(3),
  "budget" DOUBLE PRECISION,
  "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
  "requesterId" INTEGER NOT NULL,
  "assignedWorkerId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Task_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Task_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TaskApplication" (
  "id" SERIAL NOT NULL,
  "taskId" INTEGER NOT NULL,
  "applicantId" INTEGER NOT NULL,
  "message" TEXT,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskApplication_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TaskApplication_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TaskApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "TaskApplication_taskId_applicantId_key" ON "TaskApplication"("taskId", "applicantId");

CREATE TABLE IF NOT EXISTS "Rating" (
  "id" SERIAL NOT NULL,
  "taskId" INTEGER NOT NULL,
  "raterId" INTEGER NOT NULL,
  "rateeId" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Rating_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Rating_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Rating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Rating_rateeId_fkey" FOREIGN KEY ("rateeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Rating_taskId_raterId_key" ON "Rating"("taskId", "raterId");

CREATE TABLE IF NOT EXISTS "TeamPost" (
  "id" SERIAL NOT NULL,
  "authorId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "category" "TeamCategory" NOT NULL DEFAULT 'ACADEMIC',
  "subCategory" TEXT,
  "description" TEXT NOT NULL,
  "lookingFor" TEXT,
  "requiredSkills" TEXT,
  "peopleNeeded" INTEGER NOT NULL DEFAULT 1,
  "deadline" TIMESTAMP(3),
  "department" TEXT,
  "preferredBatch" TEXT,
  "location" TEXT,
  "meetingPreference" TEXT,
  "experienceReq" TEXT,
  "contactInfo" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeamPost_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TeamPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TeamApplication" (
  "id" SERIAL NOT NULL,
  "teamPostId" INTEGER NOT NULL,
  "applicantId" INTEGER NOT NULL,
  "message" TEXT,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeamApplication_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TeamApplication_teamPostId_fkey" FOREIGN KEY ("teamPostId") REFERENCES "TeamPost"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeamApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "TeamApplication_teamPostId_applicantId_key" ON "TeamApplication"("teamPostId", "applicantId");

CREATE TABLE IF NOT EXISTS "Conversation" (
  "id" SERIAL NOT NULL,
  "taskId" INTEGER,
  "user1Id" INTEGER NOT NULL,
  "user2Id" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Conversation_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Conversation_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Conversation_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_taskId_key" ON "Conversation"("taskId");

CREATE TABLE IF NOT EXISTS "Message" (
  "id" SERIAL NOT NULL,
  "conversationId" INTEGER NOT NULL,
  "senderId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "FeatureSetting" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "taskBoardEnabled" BOOLEAN NOT NULL DEFAULT true,
  "teamMatchEnabled" BOOLEAN NOT NULL DEFAULT true,
  "ratingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
  CONSTRAINT "FeatureSetting_pkey" PRIMARY KEY ("id")
);
