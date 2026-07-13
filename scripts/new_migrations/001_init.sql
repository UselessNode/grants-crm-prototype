-- 1. Роли (справочник)
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
);

-- 1.1 Начальные роли
INSERT INTO roles (id, name, description) VALUES
    (1, 'user',  'Обычный пользователь'),
    (2, 'admin', 'Администратор'),
    (3, 'expert','Эксперт')
ON CONFLICT (id) DO NOTHING;

-- 2. Категории файлов
CREATE TABLE IF NOT EXISTS file_categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
);

-- 2.1 Начальные категории файлов
INSERT INTO file_categories (id, name, description) VALUES
    (1, 'Текст', 'Текстовые документы в формате txt, md, pdf'),
    (2, 'Документ', 'Электронные документы в формате odt, doc, docx, pdf'),
    (3, 'Таблица', 'Электронные таблицы по типу ods, xlsx'),
    (4, 'Презентация', 'Слайдшоу и презентации в формате odp, ppt, pptx, pdf'),
    (5, 'Изображение', 'Изображения в формате jpeg, jpg, png, apng, gif, bmp'),
    (6, 'Видео', 'Видео в формате mp4, avi, mov, mkv, webm'),
    (7, 'Аудио', 'Аудио в формате mp3, wav, ogg'),
    (8, 'Архив', 'Архивные файлы в формате zip, tar, rar')
ON CONFLICT (id) DO NOTHING;

-- 3. Файлы (связь с категориями)
CREATE TABLE IF NOT EXISTS files (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    file_type   VARCHAR(50),
    category_id INTEGER REFERENCES file_categories(id) ON DELETE SET NULL,
    path        VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
);

-- 4. Тендеры (конкурсы)
CREATE TABLE IF NOT EXISTS tenders (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
);

-- 5. Направления (связь с тендерами)
CREATE TABLE IF NOT EXISTS directions (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    tender_id   INTEGER REFERENCES tenders(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
);

-- 6. Статусы заявок
CREATE TABLE IF NOT EXISTS application_statuses (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(50) NOT NULL,
    is_editable   BOOLEAN DEFAULT TRUE,
    is_deletable  BOOLEAN DEFAULT TRUE,
    description   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);

-- 6.1 Начальные статусы заявок
    -- 1. Черновик - можно редактировать и удалять
    -- 2. Подана - нельзя редактировать/удалять (заявка отправлена)
    -- 3. На рассмотрении - нельзя редактировать/удалять
    -- 4. Одобрена - нельзя редактировать/удалять
    -- 5. Отклонена - можно редактировать и удалять (возврат на доработку)
INSERT INTO application_statuses (name, is_editable, is_deletable, description)
VALUES
    ('Черновик', TRUE, TRUE, 'Заявка только создана'),
    ('Подана', FALSE, FALSE, 'Заявка отправлена'),
    ('На рассмотрении', FALSE, FALSE, 'Заявка в процессе обработки'),
    ('Одобрена', FALSE, FALSE, 'Заявка успешно обработана'),
    ('Отклонена', TRUE, TRUE, 'Заявка отклонена')
ON CONFLICT DO NOTHING;

-- 7. Пользователи
CREATE TABLE IF NOT EXISTS users (
    id               SERIAL PRIMARY KEY,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    surname          VARCHAR(100),
    name             VARCHAR(100),
    patronymic       VARCHAR(100),
    role_id          INTEGER NOT NULL DEFAULT 1 REFERENCES roles(id) ON DELETE SET DEFAULT,
    last_activity    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at       TIMESTAMPTZ
);

-- 8. Заявки
CREATE TABLE IF NOT EXISTS applications (
    id                         SERIAL PRIMARY KEY,
    owner_id                   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title                      VARCHAR(255) NOT NULL,
    tender_id                  INTEGER REFERENCES tenders(id) ON DELETE SET NULL,
    direction_id               INTEGER REFERENCES directions(id) ON DELETE SET NULL,
    status_id                  INTEGER NOT NULL DEFAULT 1 REFERENCES application_statuses(id) ON DELETE SET NULL,
    idea_description           TEXT NOT NULL,
    importance_to_team         TEXT NOT NULL,
    project_goal               TEXT NOT NULL,
    project_tasks              TEXT NOT NULL,
    implementation_experience  TEXT,
    results_description        TEXT,
    submitted_at               TIMESTAMPTZ,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at                 TIMESTAMPTZ
);

-- 9. Члены команды
CREATE TABLE IF NOT EXISTS team_members (
    id                  SERIAL PRIMARY KEY,
    application_id      INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    surname             VARCHAR(100) NOT NULL,
    name                VARCHAR(100) NOT NULL,
    patronymic          VARCHAR(100),
    tasks_in_project    TEXT,
    contact_info        VARCHAR(255),
    social_media_links  TEXT,
    forum_url           VARCHAR(255),               -- ответственный за портал
    is_responsible      BOOLEAN,                    -- ответственный за портал (флаг)
    is_coordinator      BOOLEAN,                    -- координатор проекта
    education           TEXT,
    work_experience     TEXT,
    is_adult            BOOLEAN,                    -- совершеннолетие
    consent_file_path   VARCHAR(500) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);

-- 10. Рецензии экспертов
CREATE TABLE IF NOT EXISTS application_reviews (
    id              SERIAL PRIMARY KEY,
    application_id  INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    expert_id       INTEGER NOT NULL,   -- FK на таблицу experts (пока нет, позже добавим)
    review_status   VARCHAR(50),
    review_text     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE (application_id, expert_id)
);

-- 11. План мероприятий
CREATE TABLE IF NOT EXISTS project_plans (
    id                SERIAL PRIMARY KEY,
    application_id    INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    task              TEXT NOT NULL,
    event_name        TEXT NOT NULL,
    event_description TEXT,
    start_date        DATE,
    end_date          DATE,
    results           TEXT,
    fixation_form     TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ
);

-- 12. Бюджет проекта
CREATE TABLE IF NOT EXISTS project_budget (
    id              SERIAL PRIMARY KEY,
    application_id  INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    resource_type   VARCHAR(255) NOT NULL,
    unit_cost       DECIMAL(10,2),
    quantity        INTEGER,
    own_funds       DECIMAL(10,2),
    grant_funds     DECIMAL(10,2),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

-- 13. Дополнительные материалы
CREATE TABLE IF NOT EXISTS additional_materials (
    id                  SERIAL PRIMARY KEY,
    application_id      INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    file_path           VARCHAR(255) NOT NULL,
    file_name           VARCHAR(255) NOT NULL,
    file_type           VARCHAR(50),
    file_bytes_size     DECIMAL(10,2),
    comment             TEXT,
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);


-- 14. Лог изменений
CREATE TABLE IF NOT EXISTS change_logs (
    id              SERIAL PRIMARY KEY,
    application_id  INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(50) NOT NULL,
    old_value       JSONB,
    new_value       JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);


-- Индексы --

-- Users
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_last_activity ON users(last_activity);
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;

-- Applications
CREATE INDEX idx_applications_owner ON applications(owner_id);
CREATE INDEX idx_applications_direction ON applications(direction_id);
CREATE INDEX idx_applications_status ON applications(status_id);
CREATE INDEX idx_applications_tender ON applications(tender_id);
CREATE INDEX idx_applications_created ON applications(created_at);
CREATE INDEX idx_applications_status_created ON applications(status_id, created_at);
CREATE INDEX idx_applications_submitted ON applications(submitted_at);
CREATE INDEX idx_applications_deleted ON applications(deleted_at) WHERE deleted_at IS NULL;

-- Team members
CREATE INDEX idx_team_members_application ON team_members(application_id);
CREATE INDEX idx_team_members_deleted ON team_members(deleted_at) WHERE deleted_at IS NULL;

-- Application reviews
CREATE INDEX idx_app_reviews_application ON application_reviews(application_id);
CREATE INDEX idx_app_reviews_expert ON application_reviews(expert_id);
CREATE INDEX idx_app_reviews_deleted ON application_reviews(deleted_at) WHERE deleted_at IS NULL;

-- Project plans
CREATE INDEX idx_project_plans_application ON project_plans(application_id);
CREATE INDEX idx_project_plans_deleted ON project_plans(deleted_at) WHERE deleted_at IS NULL;

-- Project budget
CREATE INDEX idx_project_budget_application ON project_budget(application_id);
CREATE INDEX idx_project_budget_deleted ON project_budget(deleted_at) WHERE deleted_at IS NULL;

-- Additional materials
CREATE INDEX idx_additional_materials_application ON additional_materials(application_id);
CREATE INDEX idx_additional_materials_deleted ON additional_materials(deleted_at) WHERE deleted_at IS NULL;

-- Change logs
CREATE INDEX idx_change_logs_application ON change_logs(application_id);
CREATE INDEX idx_change_logs_user ON change_logs(user_id);
CREATE INDEX idx_change_logs_created ON change_logs(created_at);
CREATE INDEX idx_change_logs_deleted ON change_logs(deleted_at) WHERE deleted_at IS NULL;

-- Files
CREATE INDEX idx_files_category ON files(category_id);
CREATE INDEX idx_files_deleted ON files(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_name ON files(name);

-- File categories
CREATE INDEX idx_file_categories_deleted ON file_categories(deleted_at) WHERE deleted_at IS NULL;

-- Tenders, directions, statuses – аналогично (можно добавить при необходимости)
CREATE INDEX idx_tenders_deleted ON tenders(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_directions_tender ON directions(tender_id);
CREATE INDEX idx_directions_deleted ON directions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_application_statuses_deleted ON application_statuses(deleted_at) WHERE deleted_at IS NULL;
