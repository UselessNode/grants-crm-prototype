-- ========================================
-- Миграция 009: Добавление поля consent_files (массив файлов) в team_members
-- ========================================

ALTER TABLE "team_members"
ADD COLUMN IF NOT EXISTS "consent_files" TEXT[] DEFAULT '{}';
