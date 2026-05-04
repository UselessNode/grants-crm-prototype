-- Миграция 005: Добавление таблиц для документов и категорий
-- Запускается после 004_AddExperts.sql

-- 1. Таблица категорий документов
DO $$ BEGIN
	CREATE TABLE "document_categories" (
		"id" SERIAL,
		"name" VARCHAR(100) NOT NULL UNIQUE,
		"description" TEXT,
		"sort_order" INTEGER DEFAULT 0,
		"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY("id")
	);
EXCEPTION
	WHEN duplicate_table THEN NULL;
END $$;

-- Индекс для сортировки
DO $$ BEGIN
	CREATE INDEX "idx_document_categories_sort" ON "document_categories" ("sort_order", "name");
EXCEPTION
	WHEN duplicate_table THEN NULL;
END $$;

-- 2. Таблица документов
DO $$ BEGIN
	CREATE TABLE "documents" (
		"id" SERIAL,
		"title" VARCHAR(255) NOT NULL,
		"description" TEXT,
		"category_id" INTEGER,
		"file_data" BYTEA NOT NULL, -- Бинарные данные файла
		"file_path" VARCHAR(255) NOT NULL, -- Путь к файлу
		"file_name" VARCHAR(255) NOT NULL, -- Оригинальное имя файла
		"file_type" VARCHAR(100) NOT NULL, -- MIME тип файла
		"file_size" INTEGER NOT NULL, -- Размер в байтах
		"is_template" BOOLEAN DEFAULT false, -- Является ли образцом/шаблоном
		"template_type" VARCHAR(50), -- Тип шаблона (например, 'consent_adult', 'consent_minor')
		"download_count" INTEGER DEFAULT 0, -- Счётчик скачиваний
		"created_by" INTEGER, -- Кто загрузил
		"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY("id")
	);
EXCEPTION
	WHEN duplicate_table THEN NULL;
END $$;

-- Индексы для быстрого поиска
DO $$ BEGIN
	CREATE INDEX "idx_documents_category" ON "documents" ("category_id");
EXCEPTION
	WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
	CREATE INDEX "idx_documents_template" ON "documents" ("is_template", "template_type");
EXCEPTION
	WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
	CREATE INDEX "idx_documents_created" ON "documents" ("created_at");
EXCEPTION
	WHEN duplicate_table THEN NULL;
END $$;

-- 3. Внешние ключи
DO $$ BEGIN
	ALTER TABLE "documents" ADD FOREIGN KEY("category_id") REFERENCES "document_categories"("id")
	ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
	WHEN foreign_key_violation THEN NULL;
END $$;

DO $$ BEGIN
	ALTER TABLE "documents" ADD FOREIGN KEY("created_by") REFERENCES "users"("id")
	ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
	WHEN foreign_key_violation THEN NULL;
END $$;

-- 4. Добавляем базовые категории документов
INSERT INTO "document_categories" ("id", "name", "description", "sort_order")
VALUES
  (1, 'Положения', 'Положения о грантах и конкурсах', 1),
  (2, 'Методички', 'Методические рекомендации и пособия', 2),
  (3, 'Документы', 'Прочие документы', 3)
ON CONFLICT ("id") DO NOTHING;

-- Сброс счетчика последовательности
SELECT setval('document_categories_id_seq', COALESCE((SELECT MAX(id) FROM document_categories), 0) + 1);
