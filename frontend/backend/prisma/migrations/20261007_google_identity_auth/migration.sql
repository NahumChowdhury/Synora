-- Production identity hardening: existing password hashes remain for migration/admin fallback,
-- while verified Google Workspace identities are linked by immutable Google subject ID.
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "googleSub" TEXT;
ALTER TABLE "User" ADD COLUMN "authProvider" TEXT NOT NULL DEFAULT 'GOOGLE';
CREATE UNIQUE INDEX "User_googleSub_key" ON "User"("googleSub");
