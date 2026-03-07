CREATE TABLE IF NOT EXISTS "roles" (
	"id" SERIAL,
	"name" VARCHAR(50) NOT NULL UNIQUE,
	"description" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "tenders" (
	"id" SERIAL,
	"name" VARCHAR(255) NOT NULL,
	"description" TEXT,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "directions" (
	"id" SERIAL,
	"name" VARCHAR(255) NOT NULL,
	"description" TEXT,
	"tender_id" INTEGER,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "application_statuses" (
	"id" SERIAL,
	"name" VARCHAR(50) NOT NULL,
	"description" TEXT,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "users" (
	"id" SERIAL,
	"email" VARCHAR(255) NOT NULL UNIQUE,
	"password_hash" VARCHAR(255) NOT NULL,
	"surname" VARCHAR(100),
	"name" VARCHAR(100),
	"patronymic" VARCHAR(100),
	"role_id" INTEGER DEFAULT 1,
	"last_activity" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" TIMESTAMP DEFAULT NULL,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);


CREATE INDEX "idx_users_role"
ON "users" ("role_id");
CREATE INDEX "idx_users_last_activity"
ON "users" ("last_activity");

CREATE TABLE IF NOT EXISTS "applications" (
	"id" SERIAL,
	"owner_id" INTEGER,
	"title" VARCHAR(255) NOT NULL,
	"tender_id" INTEGER,
	"direction_id" INTEGER,
	"status_id" INTEGER DEFAULT 1,
	"idea_description" TEXT NOT NULL,
	"importance_to_team" TEXT NOT NULL,
	"project_goal" TEXT NOT NULL,
	"project_tasks" TEXT NOT NULL,
	"implementation_experience" TEXT,
	"results_description" TEXT,
	"submitted_at" TIMESTAMP,
	"deleted_at" TIMESTAMP DEFAULT NULL,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);


CREATE INDEX "idx_applications_direction"
ON "applications" ("direction_id");
CREATE INDEX "idx_applications_status"
ON "applications" ("status_id");
CREATE INDEX "idx_applications_tender"
ON "applications" ("tender_id");
CREATE INDEX "idx_applications_owner"
ON "applications" ("owner_id");
CREATE INDEX "idx_applications_created"
ON "applications" ("created_at");
CREATE INDEX "idx_applications_status_created"
ON "applications" ("status_id", "created_at");

CREATE TABLE IF NOT EXISTS "team_members" (
	"id" SERIAL,
	"application_id" INTEGER NOT NULL,
	"surname" VARCHAR(100) NOT NULL,
	"name" VARCHAR(100) NOT NULL,
	"patronymic" VARCHAR(100),
	"tasks_in_project" TEXT,
	"contact_info" VARCHAR(255),
	"social_media_links" TEXT,
	PRIMARY KEY("id")
);


CREATE INDEX "idx_team_members_application"
ON "team_members" ("application_id");

CREATE TABLE IF NOT EXISTS "project_coordinators" (
	"id" SERIAL,
	"application_id" INTEGER NOT NULL,
	"surname" VARCHAR(100) NOT NULL,
	"name" VARCHAR(100) NOT NULL,
	"patronymic" VARCHAR(100),
	"relation_to_team" VARCHAR(255),
	"contact_info" VARCHAR(255),
	"social_media_links" TEXT,
	"education" TEXT,
	"work_experience" TEXT,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "dobro_responsible" (
	"id" SERIAL,
	"application_id" INTEGER NOT NULL,
	"surname" VARCHAR(100) NOT NULL,
	"name" VARCHAR(100) NOT NULL,
	"patronymic" VARCHAR(100),
	"relation_to_team" VARCHAR(255),
	"contact_info" VARCHAR(255),
	"social_media_links" TEXT,
	PRIMARY KEY("id")
);




CREATE TABLE IF NOT EXISTS "project_plans" (
	"id" SERIAL,
	"application_id" INTEGER NOT NULL,
	"task" TEXT NOT NULL,
	"event_name" TEXT NOT NULL,
	"event_description" TEXT,
	"deadline" DATE,
	"results" TEXT,
	"fixation_form" TEXT,
	PRIMARY KEY("id")
);


CREATE INDEX "idx_project_plans_application"
ON "project_plans" ("application_id");

CREATE TABLE IF NOT EXISTS "project_budget" (
	"id" SERIAL,
	"application_id" INTEGER NOT NULL,
	"resource_type" VARCHAR(255) NOT NULL,
	"unit_cost" DECIMAL(10,2),
	"quantity" INTEGER,
	"total_cost" DECIMAL(10,2),
	"own_funds" DECIMAL(10,2),
	"grant_funds" DECIMAL(10,2),
	"comment" TEXT,
	PRIMARY KEY("id")
);


CREATE INDEX "idx_budget_application"
ON "project_budget" ("application_id");

CREATE TABLE IF NOT EXISTS "additional_materials" (
	"id" SERIAL,
	"application_id" INTEGER NOT NULL,
	"file_path" VARCHAR(255) NOT NULL,
	"file_name" VARCHAR(255) NOT NULL,
	"file_type" VARCHAR(50),
	"file_size" INTEGER,
	"comment" TEXT,
	"uploaded_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);


CREATE INDEX "idx_materials_application"
ON "additional_materials" ("application_id");

CREATE TABLE IF NOT EXISTS "change_logs" (
	"id" SERIAL,
	"application_id" INTEGER,
	"user_id" INTEGER,
	"action" VARCHAR(50) NOT NULL,
	"old_value" JSONB,
	"new_value" JSONB,
	"created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);



ALTER TABLE "directions"
ADD FOREIGN KEY("tender_id") REFERENCES "tenders"("id")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "users"
ADD FOREIGN KEY("role_id") REFERENCES "roles"("id")
ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE "applications"
ADD FOREIGN KEY("owner_id") REFERENCES "users"("id")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "applications"
ADD FOREIGN KEY("direction_id") REFERENCES "directions"("id")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "applications"
ADD FOREIGN KEY("status_id") REFERENCES "application_statuses"("id")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "applications"
ADD FOREIGN KEY("tender_id") REFERENCES "tenders"("id")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "team_members"
ADD FOREIGN KEY("application_id") REFERENCES "applications"("id")
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "project_coordinators"
ADD FOREIGN KEY("application_id") REFERENCES "applications"("id")
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "dobro_responsible"
ADD FOREIGN KEY("application_id") REFERENCES "applications"("id")
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "project_plans"
ADD FOREIGN KEY("application_id") REFERENCES "applications"("id")
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "project_budget"
ADD FOREIGN KEY("application_id") REFERENCES "applications"("id")
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "additional_materials"
ADD FOREIGN KEY("application_id") REFERENCES "applications"("id")
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "change_logs"
ADD FOREIGN KEY("application_id") REFERENCES "applications"("id")
ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "change_logs"
ADD FOREIGN KEY("user_id") REFERENCES "users"("id")
ON UPDATE CASCADE ON DELETE SET NULL;