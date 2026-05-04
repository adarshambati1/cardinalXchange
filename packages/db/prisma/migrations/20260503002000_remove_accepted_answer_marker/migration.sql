-- Keep the MVP to plain questions and human answers. No accepted-answer primitive yet.

DROP INDEX IF EXISTS "Answer_questionId_accepted_idx";
ALTER TABLE "Answer" DROP COLUMN IF EXISTS "accepted";
