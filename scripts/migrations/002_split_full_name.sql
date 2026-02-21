-- Миграция: Разделение ФИО на отдельные поля
-- Дата: 2026-02-21

-- team_members
ALTER TABLE team_members
    ADD COLUMN IF NOT EXISTS surname VARCHAR(100),
    ADD COLUMN IF NOT EXISTS name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS patronymic VARCHAR(100);

-- project_coordinators
ALTER TABLE project_coordinators
    ADD COLUMN IF NOT EXISTS surname VARCHAR(100),
    ADD COLUMN IF NOT EXISTS name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS patronymic VARCHAR(100);

-- dobro_responsible
ALTER TABLE dobro_responsible
    ADD COLUMN IF NOT EXISTS surname VARCHAR(100),
    ADD COLUMN IF NOT EXISTS name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS patronymic VARCHAR(100);

-- users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS surname VARCHAR(100),
    ADD COLUMN IF NOT EXISTS name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS patronymic VARCHAR(100);

-- Миграция вниз (откат)
-- ALTER TABLE team_members DROP COLUMN IF EXISTS surname, DROP COLUMN IF EXISTS name, DROP COLUMN IF EXISTS patronymic;
-- ALTER TABLE project_coordinators DROP COLUMN IF EXISTS surname, DROP COLUMN IF EXISTS name, DROP COLUMN IF EXISTS patronymic;
-- ALTER TABLE dobro_responsible DROP COLUMN IF EXISTS surname, DROP COLUMN IF EXISTS name, DROP COLUMN IF EXISTS patronymic;
-- ALTER TABLE users DROP COLUMN IF EXISTS surname, DROP COLUMN IF EXISTS name, DROP COLUMN IF EXISTS patronymic;
