-- Миграция 010: Добавление роли эксперта и связи экспертов с пользователями

-- 1. Добавляем роль 'expert' в таблицу ролей
INSERT INTO roles (name, description) VALUES ('expert', 'Эксперт, назначенный на проверку заявок')
ON CONFLICT (name) DO NOTHING;

-- 2. Добавляем поля в таблицу experts:
--    - user_id (FK -> users.id) — связь 1:1 с пользователем
--    - status (VARCHAR) — статус верификации эксперта: 'pending', 'approved', 'rejected'
--    - specialization (INTEGER, FK -> directions.id) — направление экспертизы (необязательно)
DO $$ BEGIN
    ALTER TABLE experts ADD COLUMN "user_id" INTEGER;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE experts ADD COLUMN "status" VARCHAR(20) DEFAULT 'approved';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE experts ADD COLUMN "specialization_id" INTEGER;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 3. Добавляем внешние ключи
DO $$ BEGIN
    ALTER TABLE experts ADD CONSTRAINT fk_experts_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE experts ADD CONSTRAINT fk_experts_specialization FOREIGN KEY (specialization_id) REFERENCES directions(id)
        ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 4. Индекс для быстрого поиска эксперта по user_id
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON experts (user_id);