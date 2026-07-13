-- Миграция 008: Координатор и ответственный DOBRO как ссылки на team_members
-- Безопасная версия: не дропаем таблицы, а добавляем новые колонки.
-- Старые колонки (surname, name, patronymic, contact_info, social_media_links) остаются
-- для обратной совместимости. Новые поля team_member_id добавляются.

-- === project_coordinators ===
-- DO $$ BEGIN
--     ALTER TABLE "project_coordinators" ADD COLUMN "team_member_id" INTEGER;
-- EXCEPTION
--     WHEN duplicate_column THEN NULL;
-- END $$;

-- DO $$ BEGIN
--     ALTER TABLE "project_coordinators" ADD CONSTRAINT "fk_coordinators_team_member"
--         FOREIGN KEY ("team_member_id") REFERENCES "team_members"("id")
--         ON DELETE CASCADE ON UPDATE CASCADE;
-- EXCEPTION
--     WHEN duplicate_object THEN NULL;
-- END $$;

-- CREATE INDEX IF NOT EXISTS "idx_coordinators_team_member"
--     ON "project_coordinators" ("team_member_id");

-- -- === dobro_responsible ===
-- DO $$ BEGIN
--     ALTER TABLE "dobro_responsible" ADD COLUMN "team_member_id" INTEGER;
-- EXCEPTION
--     WHEN duplicate_column THEN NULL;
-- END $$;

-- DO $$ BEGIN
--     ALTER TABLE "dobro_responsible" ADD CONSTRAINT "fk_dobro_team_member"
--         FOREIGN KEY ("team_member_id") REFERENCES "team_members"("id")
--         ON DELETE CASCADE ON UPDATE CASCADE;
-- EXCEPTION
--     WHEN duplicate_object THEN NULL;
-- END $$;

-- CREATE INDEX IF NOT EXISTS "idx_dobro_team_member"
--     ON "dobro_responsible" ("team_member_id");
