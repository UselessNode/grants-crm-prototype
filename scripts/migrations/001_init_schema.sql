-- Миграция создания схемы базы данных `crm_database`
-- Дата: 2026-02-28

-- ========================================
-- 1. Справочники
-- ========================================

-- Тендеры (конкурсы)
CREATE TABLE IF NOT EXISTS tenders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- ========================================
-- 2. Основные таблицы
-- ========================================

-- Заявки
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tender_id INTEGER,
    direction_id INTEGER,
    status_id INTEGER DEFAULT 1,
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

-- Члены команды
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    application_id INTEGER,
    surname VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    patronymic VARCHAR(100),
    tasks_in_project TEXT,
    contact_info VARCHAR(255),
    social_media_links TEXT
);

-- Координаторы проекта
CREATE TABLE IF NOT EXISTS project_coordinators (
    id SERIAL PRIMARY KEY,
    application_id INTEGER,
    surname VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    patronymic VARCHAR(100),
    relation_to_team VARCHAR(255),
    contact_info VARCHAR(255),
    social_media_links TEXT,
    education TEXT,
    work_experience TEXT
);

-- Ответственные за добро
CREATE TABLE IF NOT EXISTS dobro_responsible (
    id SERIAL PRIMARY KEY,
    application_id INTEGER,
    surname VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    patronymic VARCHAR(100),
    relation_to_team VARCHAR(255),
    contact_info VARCHAR(255),
    social_media_links TEXT
);

-- Планы проекта
CREATE TABLE IF NOT EXISTS project_plans (
    id SERIAL PRIMARY KEY,
    application_id INTEGER,
    task TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_description TEXT,
    deadline DATE,
    results TEXT,
    fixation_form TEXT
);

-- Бюджет проекта
CREATE TABLE IF NOT EXISTS project_budget (
    id SERIAL PRIMARY KEY,
    application_id INTEGER,
    resource_type VARCHAR(255) NOT NULL,
    unit_cost DECIMAL(10,2),
    quantity INTEGER,
    total_cost DECIMAL(10,2),
    own_funds DECIMAL(10,2),
    grant_funds DECIMAL(10,2),
    comment TEXT
);

-- Дополнительные материалы
CREATE TABLE IF NOT EXISTS additional_materials (
    id SERIAL PRIMARY KEY,
    application_id INTEGER,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    comment TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    surname VARCHAR(100),
    name VARCHAR(100),
    patronymic VARCHAR(100),
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Журнал изменений
CREATE TABLE IF NOT EXISTS change_logs (
    id SERIAL PRIMARY KEY,
    application_id INTEGER,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 3. Внешние ключи
-- ========================================

-- Связь направлений с тендерами
DO $$ BEGIN
    ALTER TABLE directions ADD CONSTRAINT fk_directions_tender
        FOREIGN KEY (tender_id) REFERENCES tenders(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Связь заявок с направлением
DO $$ BEGIN
    ALTER TABLE applications ADD CONSTRAINT fk_applications_direction
        FOREIGN KEY (direction_id) REFERENCES directions(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Связь заявок со статусом
DO $$ BEGIN
    ALTER TABLE applications ADD CONSTRAINT fk_applications_status
        FOREIGN KEY (status_id) REFERENCES application_statuses(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Связь заявок с тендером
DO $$ BEGIN
    ALTER TABLE applications ADD CONSTRAINT fk_applications_tender
        FOREIGN KEY (tender_id) REFERENCES tenders(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Связь членов команды с заявкой
DO $$ BEGIN
    ALTER TABLE team_members ADD CONSTRAINT fk_team_members_application
        FOREIGN KEY (application_id) REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Связь координаторов с заявкой
DO $$ BEGIN
    ALTER TABLE project_coordinators ADD CONSTRAINT fk_project_coordinators_application
        FOREIGN KEY (application_id) REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Связь ответственных за добро с заявкой
DO $$ BEGIN
    ALTER TABLE dobro_responsible ADD CONSTRAINT fk_dobro_responsible_application
        FOREIGN KEY (application_id) REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Связь планов проекта с заявкой
DO $$ BEGIN
    ALTER TABLE project_plans ADD CONSTRAINT fk_project_plans_application
        FOREIGN KEY (application_id) REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Связь бюджета с заявкой
DO $$ BEGIN
    ALTER TABLE project_budget ADD CONSTRAINT fk_project_budget_application
        FOREIGN KEY (application_id) REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Связь дополнительных материалов с заявкой
DO $$ BEGIN
    ALTER TABLE additional_materials ADD CONSTRAINT fk_additional_materials_application
        FOREIGN KEY (application_id) REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Связь журнала изменений с заявкой
DO $$ BEGIN
    ALTER TABLE change_logs ADD CONSTRAINT fk_change_logs_application
        FOREIGN KEY (application_id) REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Связь журнала изменений с пользователем
DO $$ BEGIN
    ALTER TABLE change_logs ADD CONSTRAINT fk_change_logs_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ========================================
-- 4. Индексы
-- ========================================

CREATE INDEX IF NOT EXISTS idx_applications_direction ON applications(direction_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status_id);
CREATE INDEX IF NOT EXISTS idx_applications_tender ON applications(tender_id);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at);

CREATE INDEX IF NOT EXISTS idx_team_members_application ON team_members(application_id);
CREATE INDEX IF NOT EXISTS idx_project_plans_application ON project_plans(application_id);
CREATE INDEX IF NOT EXISTS idx_budget_application ON project_budget(application_id);
CREATE INDEX IF NOT EXISTS idx_materials_application ON additional_materials(application_id);

-- ========================================
-- 5. Тестовые данные
-- ========================================

-- Статусы заявок (без дубликатов)
INSERT INTO application_statuses (id, name, description) VALUES
    (1, 'Черновик', 'Заявка находится в процессе заполнения'),
    (2, 'Подана', 'Заявка подана на рассмотрение'),
    (3, 'На рассмотрении', 'Заявка на рассмотрении у координаторов'),
    (4, 'Одобрена', 'Заявка одобрена'),
    (5, 'Отклонена', 'Заявка отклонена')
ON CONFLICT (id) DO NOTHING;

-- Тестовые тендеры (без дубликатов)
INSERT INTO tenders (id, name, description) VALUES
    (1, 'Грант 2026', 'Ежегодный грант на социальные проекты 2026'),
    (2, 'Молодёжные инициативы', 'Конкурс для молодёжных проектов'),
    (3, 'Волонтёрство 2026', 'Поддержка волонтёрских движений')
ON CONFLICT (id) DO NOTHING;

-- Тестовые направления (без дубликатов)
INSERT INTO directions (id, name, description, tender_id) VALUES
    (1, 'Образование', 'Проекты в сфере образования и просвещения', 1),
    (2, 'Культура', 'Культурные и творческие проекты', 1),
    (3, 'Экология', 'Экологические инициативы', 1),
    (4, 'Спорт', 'Спортивные мероприятия и ЗОЖ', 2),
    (5, 'Наука', 'Научные исследования и разработки', 2),
    (6, 'Волонтёрство', 'Добровольческая деятельность', 3),
    (7, 'Социальное проектирование', 'Социально значимые проекты', 3)
ON CONFLICT (id) DO NOTHING;

-- Сброс последовательностей (чтобы избежать дубликатов)
SELECT setval('application_statuses_id_seq', (SELECT MAX(id) FROM application_statuses));
SELECT setval('tenders_id_seq', (SELECT MAX(id) FROM tenders));
SELECT setval('directions_id_seq', (SELECT MAX(id) FROM directions));
