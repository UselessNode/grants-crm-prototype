-- ========================================
-- Seed: Тестовые данные для grants_crm
-- Пароли для всех пользователей: 123456
-- Хеш: $2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m
-- ========================================

-- 0. Справочники (Tenders, Directions, Statuses)
-- ========================================

-- Тендеры
INSERT INTO tenders (id, name, description) VALUES
(1, 'Грант 2026', 'Основной грантовый конкурс 2026'),
(2, 'Молодёжные инициативы', 'Программа поддержки молодёжных проектов'),
(3, 'Волонтёрство 2026', 'Конкурс волонтёрских проектов')
ON CONFLICT (id) DO NOTHING;

SELECT setval('tenders_id_seq', COALESCE((SELECT MAX(id) FROM tenders), 0) + 1);

-- Направления
INSERT INTO directions (id, name, description, tender_id) VALUES
(1, 'Образование', 'Образовательные и просветительские проекты', 1),
(2, 'Культура', 'Культурные и творческие инициативы', 2),
(3, 'Экология', 'Экологические проекты', 3),
(4, 'Спорт', 'Спортивные и оздоровительные проекты', 2),
(5, 'Наука', 'Научные и исследовательские проекты', 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('directions_id_seq', COALESCE((SELECT MAX(id) FROM directions), 0) + 1);

-- Статусы заявок
-- is_editable: можно ли редактировать заявку в этом статусе
-- is_deletable: можно ли удалить заявку в этом статусе
INSERT INTO application_statuses (id, name, description, is_editable, is_deletable) VALUES
(1, 'Черновик', 'Заявка в черновике', true, true),
(2, 'Подана', 'Заявка подана на рассмотрение', false, false),
(3, 'На рассмотрении', 'Заявка на рассмотрении', false, false),
(4, 'Одобрена', 'Заявка одобрена', false, false),
(5, 'Отклонена', 'Заявка отклонена', true, true)
ON CONFLICT (id) DO UPDATE SET
  is_editable = EXCLUDED.is_editable,
  is_deletable = EXCLUDED.is_deletable;

SELECT setval('application_statuses_id_seq', COALESCE((SELECT MAX(id) FROM application_statuses), 0) + 1);

-- 1. Роли (если ещё не созданы миграциями)
-- ========================================
INSERT INTO roles (id, name, description) VALUES
(1, 'user', 'Обычный пользователь'),
(2, 'admin', 'Администратор')
ON CONFLICT (id) DO NOTHING;

SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 0) + 1);

-- 2. Пользователи. Для теста у всех пароль одинаковый: 123456
-- ========================================

-- Администратор (доступ ко всем записям)
INSERT INTO users (email, password_hash, surname, name, patronymic, role_id) VALUES
('admin@crm.test', '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m', 'admin', '', '', 2)
ON CONFLICT (email) DO UPDATE SET password_hash = '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m';

-- Пользователь 1: Анна Петрова (видит только свои заявки)
INSERT INTO users (email, password_hash, surname, name, patronymic, role_id) VALUES
('anna@mail.com', '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m', 'Петрова', 'Анна', 'Сергеевна', 1)
ON CONFLICT (email) DO UPDATE SET password_hash = '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m';

-- Пользователь 2: Иван Сидоров (видит только свои заявки)
INSERT INTO users (email, password_hash, surname, name, patronymic, role_id) VALUES
('ivan@mail.com', '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m', 'Сидоров', 'Иван', 'Дмитриевич', 1)
ON CONFLICT (email) DO UPDATE SET password_hash = '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m';

-- Пользователь 3: Ульяна Смирнова (удалённая архивная запись)
INSERT INTO users (email, password_hash, surname, name, patronymic, role_id) VALUES
('ulyana@mail.com', '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m', 'Смирнова', 'Ульяна', 'Александровна', 1)
ON CONFLICT (email) DO UPDATE SET password_hash = '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m';

-- Сброс последовательности users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. Заявки (Applications)
-- ========================================

-- Заявки Анны (owner_id = 2)
INSERT INTO applications (
    owner_id, title, tender_id, direction_id, status_id,
    idea_description, importance_to_team, project_goal, project_tasks
) VALUES
(
    2, -- Анна
    'Эко-тропа в городском парке',
    3, -- Волонтёрство 2026
    3, -- Экология
    4, -- Одобрена
    'Создание экологической тропы с информационными стендами о местной флоре и фауне',
    'Команда хочет повысить экологическую грамотность жителей и привлечь волонтёров',
    'Реализовать пилотный участок экотропы длиной 500м к летнему сезону',
    '1. Согласование с администрацией парка\n2. Разработка дизайна стендов\n3. Закупка материалов'
),
(
    2, -- Анна
    'Мастер-классы для школьников',
    1, -- Грант 2026
    1, -- Образование
    2, -- Подана
    'Серия бесплатных мастер-классов по программированию и робототехнике для детей 10-14 лет',
    'Развитие технических навыков у детей из малообеспеченных семей',
    'Провести 10 мастер-классов с охватом 200+ детей',
    '1. Подготовка программы\n2. Поиск площадки\n3. Рекрутинг преподавателей'
),
(
    2, -- Анна
    'Арт-терапия для пожилых',
    2, -- Молодёжные инициативы
    2, -- Культура
    1, -- Черновик
    'Занятия по рисованию и лепке для людей старшего возраста в центре соцобслуживания',
    'Улучшение психоэмоционального состояния подопечных через творчество',
    'Запустить еженедельные группы по 8-10 человек',
    '1. Согласование с центром\n2. Закупка материалов'
);

-- Заявки Ивана (owner_id = 3)
INSERT INTO applications (
    owner_id, title, tender_id, direction_id, status_id,
    idea_description, importance_to_team, project_goal, project_tasks
) VALUES
(
    3, -- Иван
    'Спортивный фестиваль "Дворовая лига"',
    2, -- Молодёжные инициативы
    4, -- Спорт
    3, -- На рассмотрении
    'Организация районного турнира по футболу и волейболу среди дворовых команд',
    'Популяризация ЗОЖ и создание сообщества активных жителей',
    'Провести турнир с участием 16 команд и призовым фондом',
    '1. Разработка регламента\n2. Поиск спонсоров\n3. Аренда площадки'
),
(
    3, -- Иван
    'Научный квест для студентов',
    1, -- Грант 2026
    5, -- Наука
    5, -- Отклонена
    'Интерактивный квест по лабораториям вуза с элементами химических и физических опытов',
    'Повышение интереса абитуриентов к естественно-научным направлениям',
    'Привлечь 300+ участников за день мероприятия',
    '1. Сценарий квеста\n2. Безопасность опытов'
);

-- Сброс последовательности applications
SELECT setval('applications_id_seq', (SELECT MAX(id) FROM applications));

-- 4. Связанные данные (для демонстрации целостности)
-- ========================================

-- Члены команды (для заявки Анны "Эко-тропа", id=1)
INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info) VALUES
(1, 'Козлова', 'Мария', 'Алексеевна', 'Координация волонтёров, работа с парком', 'maria.k@example.com'),
(1, 'Новиков', 'Дмитрий', 'Олегович', 'Дизайн стендов, вёрстка материалов', 'd.novikov@example.com');

-- Бюджет (для заявки Анны "Эко-тропа", id=1)
INSERT INTO project_budget (application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment) VALUES
(1, 'Информационные стенды', 3500.00, 10, 35000.00, 5000.00, 30000.00, 'Антивандальные, двухсторонние'),
(1, 'Монтажные работы', 1500.00, 10, 15000.00, 0.00, 15000.00, 'Установка и крепление'),
(1, 'Полиграфия (брошюры)', 150.00, 200, 30000.00, 10000.00, 20000.00, 'Для раздачи посетителям');

-- План проекта (для заявки Ивана "Спортивный фестиваль", id=4)
INSERT INTO project_plans (application_id, task, event_name, event_description, deadline, results, fixation_form) VALUES
(4, 'Подготовка', 'Старт регистрации команд', 'Открытие приёма заявок на сайте и в соцсетях', '2026-04-01', '50+ зарегистрированных команд', 'Скриншоты формы, реестр'),
(4, 'Проведение', 'Финальный матч', 'Торжественное закрытие и награждение', '2026-06-15', 'Определение победителей, фотоотчёт', 'Протокол, фото, видео');

-- Дополнительные материалы (для заявки Анны "Мастер-классы", id=2)
INSERT INTO additional_materials (application_id, file_path, file_name, file_type, file_size, comment) VALUES
(2, '/uploads/programs/robotics_curriculum.pdf', 'Программа_курса_робототехники.pdf', 'application/pdf', 2458621, 'Детальный план занятий'),
(2, '/uploads/letters/support_letter_school42.pdf', 'Письмо_поддержки_школа42.pdf', 'application/pdf', 156432, 'Официальное письмо от директора школы');

-- Журнал изменений (демонстрация логирования)
-- Анна создала заявку "Эко-тропа"
INSERT INTO change_logs (application_id, user_id, action, old_value, new_value) VALUES
(1, 2, 'create', NULL, '{"title": "Эко-тропа в городском парке", "status": "Черновик"}'),
-- Анна подала заявку на рассмотрение
(1, 2, 'update_status', '{"status_id": 1}', '{"status_id": 2, "submitted_at": "2026-03-01 14:30:00"}'),
-- Админ одобрил заявку
(1, 1, 'update_status', '{"status_id": 2}', '{"status_id": 4, "approved_by": "admin"}');

-- ========================================
-- Проверка данных (опционально, для отладки)
-- ========================================
-- \echo 'Заявки Анны (должна видеть только свои):'
-- SELECT id, title, status_id FROM applications WHERE owner_id = (SELECT id FROM users WHERE email = 'anna@crm.test');

-- \echo 'Вывод всего для админа'
-- SELECT a.id, a.title, u.email as owner FROM applications a LEFT JOIN users u ON a.owner_id = u.id;
