-- Миграция создания схемы базы данных Gramotophone
-- Дата: 2026-02-21

-- Направления
CREATE TABLE IF NOT EXISTS directions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tender_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Статусы заявок
CREATE TABLE IF NOT EXISTS application_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Заполнение статусов по умолчанию
INSERT INTO application_statuses (id, name, description) VALUES
    (1, 'Черновик', 'Заявка находится в процессе заполнения'),
    (2, 'Подана', 'Заявка подана на рассмотрение'),
    (3, 'На рассмотрении', 'Заявка на рассмотрении у координаторов'),
    (4, 'Одобрена', 'Заявка одобрена'),
    (5, 'Отклонена', 'Заявка отклонена')
ON CONFLICT (id) DO NOTHING;

-- Тендеры
CREATE TABLE IF NOT EXISTS tenders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Заявки
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    direction_id INTEGER REFERENCES directions(id) ON UPDATE CASCADE ON DELETE SET NULL,
    status_id INTEGER DEFAULT 1 REFERENCES application_statuses(id) ON UPDATE CASCADE ON DELETE SET NULL,
    idea_description TEXT NOT NULL,
    importance_to_team TEXT NOT NULL,
    project_goal TEXT NOT NULL,
    project_tasks TEXT NOT NULL,
    implementation_experience TEXT,
    results_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP
);

-- Индексы для applications
CREATE INDEX IF NOT EXISTS idx_applications_direction ON applications(direction_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status_id);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at);

-- Члены команды
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    tasks_in_project TEXT,
    contact_info VARCHAR(255),
    social_media_links TEXT
);

CREATE INDEX IF NOT EXISTS idx_team_members_application ON team_members(application_id);

-- Координаторы проекта
CREATE TABLE IF NOT EXISTS project_coordinators (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    relation_to_team VARCHAR(255),
    contact_info VARCHAR(255),
    social_media_links TEXT,
    education TEXT,
    work_experience TEXT
);

-- Ответственные за добро
CREATE TABLE IF NOT EXISTS dobro_responsible (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    relation_to_team VARCHAR(255),
    contact_info VARCHAR(255),
    social_media_links TEXT
);

-- Планы проекта
CREATE TABLE IF NOT EXISTS project_plans (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    task TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_description TEXT,
    deadline DATE,
    results TEXT,
    fixation_form TEXT
);

CREATE INDEX IF NOT EXISTS idx_project_plans_application ON project_plans(application_id);

-- Бюджет проекта
CREATE TABLE IF NOT EXISTS project_budget (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    resource_type VARCHAR(255) NOT NULL,
    unit_cost DECIMAL(10,2),
    quantity INTEGER,
    total_cost DECIMAL(10,2),
    own_funds DECIMAL(10,2),
    grant_funds DECIMAL(10,2),
    comment TEXT
);

CREATE INDEX IF NOT EXISTS idx_budget_application ON project_budget(application_id);

-- Дополнительные материалы
CREATE TABLE IF NOT EXISTS additional_materials (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    comment TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_materials_application ON additional_materials(application_id);

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Журнал изменений
CREATE TABLE IF NOT EXISTS change_logs (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Связь направлений с тендерами
ALTER TABLE directions ADD CONSTRAINT fk_directions_tender
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON UPDATE CASCADE ON DELETE SET NULL;
