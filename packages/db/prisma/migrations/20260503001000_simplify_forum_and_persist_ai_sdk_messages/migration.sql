-- CXC AI chats are independent private chat sessions. Public forum answers are human-authored in this MVP.

ALTER TABLE "AiChatSession" DROP CONSTRAINT IF EXISTS "AiChatSession_questionId_fkey";
DROP INDEX IF EXISTS "AiChatSession_questionId_updatedAt_idx";
ALTER TABLE "AiChatSession" DROP COLUMN IF EXISTS "questionId";

ALTER TABLE "Answer" DROP COLUMN IF EXISTS "source";
DROP TYPE IF EXISTS "AnswerSource";

ALTER TABLE "AiChatMessage" ADD COLUMN IF NOT EXISTS "uiMessageId" VARCHAR(120);
ALTER TABLE "AiChatMessage" ADD COLUMN IF NOT EXISTS "parts" JSONB NOT NULL DEFAULT '[]'::jsonb;
CREATE INDEX IF NOT EXISTS "AiChatMessage_uiMessageId_idx" ON "AiChatMessage"("uiMessageId");
