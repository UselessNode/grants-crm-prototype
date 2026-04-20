-- Миграция 008: Координатор и ответственный DOBRO как ссылки на team_members
-- Убираем дублирование ФИО, контакты. Всё берётся из team_members.

-- === project_coordinators ===
-- Было: surname, name, patronymic, relation_to_team, contact_info, social_media_links, education, work_experience
-- Стало: team_member_id (FK), relation_to_team, education, work_experience

DROP TABLE IF EXISTS "project_coordinators" CASCADE;

CREATE TABLE "project_coordinators" (
  "id" SERIAL PRIMARY KEY,
  "application_id" INTEGER NOT NULL REFERENCES "applications"("id") ON DELETE CASCADE,
  "team_member_id" INTEGER NOT NULL REFERENCES "team_members"("id") ON DELETE CASCADE,
  "relation_to_team" VARCHAR(255),
  "education" TEXT,
  "work_experience" TEXT,
  UNIQUE("application_id", "team_member_id")
);

CREATE INDEX "idx_coordinators_application" ON "project_coordinators" ("application_id");
CREATE INDEX "idx_coordinators_team_member" ON "project_coordinators" ("team_member_id");

-- === dobro_responsible ===
-- Было: surname, name, patronymic, relation_to_team, contact_info, social_media_links, dobro_link
-- Стало: team_member_id (FK), relation_to_team, dobro_link

DROP TABLE IF EXISTS "dobro_responsible" CASCADE;

CREATE TABLE "dobro_responsible" (
  "id" SERIAL PRIMARY KEY,
  "application_id" INTEGER NOT NULL REFERENCES "applications"("id") ON DELETE CASCADE,
  "team_member_id" INTEGER NOT NULL REFERENCES "team_members"("id") ON DELETE CASCADE,
  "relation_to_team" VARCHAR(255),
  "dobro_link" VARCHAR(500),
  UNIQUE("application_id", "team_member_id")
);

CREATE INDEX "idx_dobro_application" ON "dobro_responsible" ("application_id");
CREATE INDEX "idx_dobro_team_member" ON "dobro_responsible" ("team_member_id");
