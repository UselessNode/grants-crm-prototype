-- ========================================
-- Миграция 007: Добавление полей consent_file и is_minor в team_members
-- ========================================

ALTER TABLE "team_members"
ADD COLUMN IF NOT EXISTS "consent_file" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "is_minor" BOOLEAN DEFAULT false;
