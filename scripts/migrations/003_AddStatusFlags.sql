-- Миграция для добавления флагов редактируемости к статусам заявок
-- Запускается после 001_Init.sql и 002_AddRoles.sql

-- Добавляем колонки is_editable и is_deletable
ALTER TABLE "application_statuses"
ADD COLUMN IF NOT EXISTS "is_editable" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "is_deletable" BOOLEAN DEFAULT true;

-- Обновляем статусы:
-- 1. Черновик - можно редактировать и удалять
-- 2. Подана - нельзя редактировать/удалять (заявка отправлена)
-- 3. На рассмотрении - нельзя редактировать/удалять
-- 4. Одобрена - нельзя редактировать/удалять
-- 5. Отклонена - можно редактировать и удалять (возврат на доработку)

UPDATE "application_statuses"
SET
  "is_editable" = CASE
    WHEN "name" IN ('Черновик', 'Отклонена') THEN true
    ELSE false
  END,
  "is_deletable" = CASE
    WHEN "name" IN ('Черновик', 'Отклонена') THEN true
    ELSE false
  END
WHERE "id" IN (1, 2, 3, 4, 5);
