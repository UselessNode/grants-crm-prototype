-- Миграция 004: Добавление таблицы экспертов и связей с заявками

-- 1. Таблица экспертов (может уже существовать)
DO $$ BEGIN
	CREATE TABLE "experts" (
		"id" SERIAL,
		"surname" VARCHAR(100) NOT NULL,
		"name" VARCHAR(100) NOT NULL,
		"patronymic" VARCHAR(100),
		"extra_info" TEXT,
		"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY("id")
	);
EXCEPTION
	WHEN duplicate_table THEN NULL;
END $$;

-- Индекс для быстрого поиска по ФИО
DO $$ BEGIN
	CREATE INDEX "idx_experts_name" ON "experts" ("surname", "name");
EXCEPTION
	WHEN duplicate_table THEN NULL;
END $$;

-- 2. Добавляем поля для двух экспертов в заявки (если не существуют)
DO $$ BEGIN
	ALTER TABLE "applications" ADD COLUMN "expert_1" INTEGER;
EXCEPTION
	WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
	ALTER TABLE "applications" ADD COLUMN "expert_2" INTEGER;
EXCEPTION
	WHEN duplicate_column THEN NULL;
END $$;

-- Индексы для быстрого поиска заявок по экспертам
DO $$ BEGIN
	CREATE INDEX "idx_applications_expert_1" ON "applications" ("expert_1");
EXCEPTION
	WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
	CREATE INDEX "idx_applications_expert_2" ON "applications" ("expert_2");
EXCEPTION
	WHEN duplicate_table THEN NULL;
END $$;

-- 3. Добавляем внешние ключи (если не существуют)
DO $$ BEGIN
	ALTER TABLE "applications" ADD FOREIGN KEY("expert_1") REFERENCES "experts"("id")
	ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
	WHEN foreign_key_violation THEN NULL;
END $$;

DO $$ BEGIN
	ALTER TABLE "applications" ADD FOREIGN KEY("expert_2") REFERENCES "experts"("id")
	ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
	WHEN foreign_key_violation THEN NULL;
END $$;

-- 4. Создаём таблицу вердиктов экспертов
CREATE TABLE IF NOT EXISTS "expert_verdicts" (
	"id" SERIAL,
	"application_id" INTEGER NOT NULL,
	"expert_id" INTEGER NOT NULL,
	"verdict" VARCHAR(20) NOT NULL, -- 'approved', 'rejected'
	"comment" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id"),
	UNIQUE("application_id", "expert_id")
);

CREATE INDEX IF NOT EXISTS "idx_verdicts_application" ON "expert_verdicts" ("application_id");
CREATE INDEX IF NOT EXISTS "idx_verdicts_expert" ON "expert_verdicts" ("expert_id");

-- Внешние ключи для вердиктов
DO $$ BEGIN
	ALTER TABLE "expert_verdicts" ADD FOREIGN KEY("application_id") REFERENCES "applications"("id")
	ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION
	WHEN foreign_key_violation THEN NULL;
END $$;

DO $$ BEGIN
	ALTER TABLE "expert_verdicts" ADD FOREIGN KEY("expert_id") REFERENCES "experts"("id")
	ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION
	WHEN foreign_key_violation THEN NULL;
END $$;
