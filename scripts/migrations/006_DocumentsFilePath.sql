-- Миграция 006: Переход от BYTEA к file_path для документов
-- Заменяем хранение бинарных данных на путь к файлу на сервере

-- 1. Добавляем колонку file_path
ALTER TABLE "documents"
ADD COLUMN IF NOT EXISTS "file_path" VARCHAR(255);

-- 2. Заполняем file_path для существующих записей (заглушка)
UPDATE "documents"
SET "file_path" = 'placeholder_' || id || '.pdf'
WHERE "file_path" IS NULL;

-- 3. Удаляем колонку file_data (если существует)
ALTER TABLE "documents"
DROP COLUMN IF EXISTS "file_data";

-- 4. Делаем file_path обязательным
ALTER TABLE "documents"
ALTER COLUMN "file_path" SET NOT NULL;
