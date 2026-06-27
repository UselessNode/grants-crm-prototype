-- Миграция 011: Добавление поддержки роли эксперта в модель пользователя
-- Эта миграция расширяет таблицу users для поддержки роли expert

-- 1. Убедимся, что роль expert существует
INSERT INTO roles (name, description) VALUES ('expert', 'Эксперт, назначенный на проверку заявок')
ON CONFLICT (name) DO NOTHING;

-- 2. Добавляем поле для связки пользователя с профилем эксперта (если не существует)
DO $$ BEGIN
    ALTER TABLE users ADD COLUMN "expert_id" INTEGER;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 3. Добавляем внешний ключ для expert_id
DO $$ BEGIN
    ALTER TABLE users ADD CONSTRAINT fk_users_expert
        FOREIGN KEY (expert_id) REFERENCES experts(id)
        ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 4. Добавляем индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_expert_id ON users (expert_id);

-- 5. Обновляем существующих экспертов, чтобы связать их с пользователями
-- (Эта часть должна выполняться вручную или через скрипт, если нужно)
-- Пример:
-- UPDATE users u
-- SET expert_id = e.id
-- FROM experts e
-- WHERE e.user_id = u.id;
