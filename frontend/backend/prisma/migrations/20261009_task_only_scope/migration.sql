-- Task-only product scope cleanup.
-- This migration removes the retired Team Match / Opportunity schema after the
-- production-safety migration has been applied. It intentionally preserves all
-- Task Marketplace, messaging, profile, ratings, moderation and auth data.

-- Remove the retired Team Match conversation link first.
ALTER TABLE "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_teamPostId_fkey";
DROP INDEX IF EXISTS "Conversation_teamPostId_user1Id_user2Id_key";
DROP INDEX IF EXISTS "Conversation_teamPostId_idx";
ALTER TABLE "Conversation" DROP COLUMN IF EXISTS "teamPostId";

-- Remove retired Team Match data structures.
DROP TABLE IF EXISTS "TeamApplication";
DROP TABLE IF EXISTS "TeamPost";
DROP TYPE IF EXISTS "TeamCategory";

-- Keep only the Task Marketplace feature toggle.
ALTER TABLE "FeatureSetting" DROP COLUMN IF EXISTS "teamMatchEnabled";
