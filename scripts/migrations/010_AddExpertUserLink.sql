-- Миграция 010: Связь экспертов с пользователями и роль эксперта
-- Объединяет логику удалённых 010_AddExpertUserLink.sql и 011_AddExpertProfileToUser.sql
-- Без дублирования вставки роли (роль уже есть в object 002_AddRoles.sql)

-- 1. Добавляем поля в таблицу experts (если не существуют)
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

-- 2. Добавляем внешние ключи для experts
DO $$ BEGIN
    ALTER TABLE experts ADD CONSTRAINT fk_experts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE experts ADD CONSTRAINT fk_experts_specialization
        FOREIGN KEY (specialization_id) REFERENCES directions(id)
        ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Добавляем поле expert_id в таблицу users (для обратной связи)
DO $$ BEGIN
    ALTER TABLE users ADD COLUMN "expert_id" INTEGER;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD CONSTRAINT fk_users_expert
        FOREIGN KEY (expert_id) REFERENCES experts(id)
        ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 4. Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON experts (user_id);
CREATE INDEX IF NOT EXISTS idx_users_expert_id ON users (expert_id);