-- Миграция 005: Добавление поля dobro_link для ответственного по работе с порталом DOBRO.RU

-- Добавляем поле для ссылки на профиль DOBRO.RU
DO $$ BEGIN
    ALTER TABLE "dobro_responsible" ADD COLUMN "dobro_link" VARCHAR(500);
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Индекс для быстрого поиска по ссылке (если понадобится)
DO $$ BEGIN
    CREATE INDEX "idx_dobro_responsible_link" ON "dobro_responsible" ("dobro_link");
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;
