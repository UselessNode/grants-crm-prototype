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

-- 1. Роли
-- ========================================
INSERT INTO roles (id, name, description) VALUES
(1, 'user', 'Обычный пользователь'),
(2, 'admin', 'Администратор')
ON CONFLICT (id) DO NOTHING;

SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 0) + 1);

-- 2. Пользователи
-- ========================================

-- Администратор
INSERT INTO users (email, password_hash, surname, name, patronymic, role_id) VALUES
('admin@crm.test', '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m', 'Админов', 'Админ', 'Системович', 2)
ON CONFLICT (email) DO UPDATE SET password_hash = '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m';

-- Пользователи
INSERT INTO users (email, password_hash, surname, name, patronymic, role_id) VALUES
('anna@mail.com', '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m', 'Петрова', 'Анна', 'Сергеевна', 1),
('ivan@mail.com', '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m', 'Сидоров', 'Иван', 'Дмитриевич', 1),
('maria@mail.com', '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m', 'Козлова', 'Мария', 'Алексеевна', 1),
('dmitry@mail.com', '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m', 'Новиков', 'Дмитрий', 'Олегович', 1),
('elena@mail.com', '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m', 'Васильева', 'Елена', 'Игоревна', 1)
ON CONFLICT (email) DO UPDATE SET password_hash = '$2b$10$HkhSy23ingvxK2hOs7QYuenh1EMw0d.NZVS6V0AC2QQxvg6B/a91m';

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. Заявки (Applications)
-- ========================================

-- Заявки Анны (owner_id = 2)
INSERT INTO applications (
    id, owner_id, title, tender_id, direction_id, status_id,
    idea_description, importance_to_team, project_goal, project_tasks,
    implementation_experience, results_description,
    submitted_at, created_at, updated_at
) VALUES
(
    1, 2, 'Эко-тропа в городском парке',
    3, 3, 4,
    'Создание экологической тропы с информационными стендами о местной флоре и фауне',
    'Команда хочет повысить экологическую грамотность жителей и привлечь волонтёров',
    'Реализовать пилотный участок экотропы длиной 500м к летнему сезону',
    '1. Согласование с администрацией парка\n2. Разработка дизайна стендов\n3. Закупка материалов',
    'Команда уже реализовала 2 экологических проекта в прошлом году',
    'Создана экотропа с 10 стендами, проведено 5 экскурсий',
    '2026-03-01 14:30:00', '2026-02-15 10:00:00', '2026-03-10 16:00:00'
),
(
    2, 2, 'Мастер-классы для школьников',
    1, 1, 2,
    'Серия бесплатных мастер-классов по программированию и робототехнике для детей 10-14 лет',
    'Развитие технических навыков у детей из малообеспеченных семей',
    'Провести 10 мастер-классов с охватом 200+ детей',
    '1. Подготовка программы\n2. Поиск площадки\n3. Рекрутинг преподавателей',
    NULL, NULL,
    '2026-03-15 09:00:00', '2026-03-10 08:00:00', '2026-03-15 09:00:00'
),
(
    3, 2, 'Арт-терапия для пожилых',
    2, 2, 1,
    'Занятия по рисованию и лепке для людей старшего возраста в центре соцобслуживания',
    'Улучшение психоэмоционального состояния подопечных через творчество',
    'Запустить еженедельные группы по 8-10 человек',
    '1. Согласование с центром\n2. Закупка материалов',
    NULL, NULL,
    NULL, '2026-03-20 11:00:00', '2026-03-20 11:00:00'
);

-- Заявки Ивана (owner_id = 3)
INSERT INTO applications (
    id, owner_id, title, tender_id, direction_id, status_id,
    idea_description, importance_to_team, project_goal, project_tasks,
    implementation_experience, results_description,
    submitted_at, created_at, updated_at
) VALUES
(
    4, 3, 'Спортивный фестиваль "Дворовая лига"',
    2, 4, 3,
    'Организация районного турнира по футболу и волейболу среди дворовых команд',
    'Популяризация ЗОЖ и создание сообщества активных жителей',
    'Провести турнир с участием 16 команд и призовым фондом',
    '1. Разработка регламента\n2. Поиск спонсоров\n3. Аренда площадки',
    'Организовали дворовый турнир по футболу в 2025 году',
    NULL,
    '2026-03-05 12:00:00', '2026-02-20 09:00:00', '2026-03-12 14:00:00'
),
(
    5, 3, 'Научный квест для студентов',
    1, 5, 5,
    'Интерактивный квест по лабораториям вуза с элементами химических и физических опытов',
    'Повышение интереса абитуриентов к естественно-научным направлениям',
    'Привлечь 300+ участников за день мероприятия',
    '1. Сценарий квеста\n2. Безопасность опытов',
    NULL, NULL,
    '2026-02-28 10:00:00', '2026-02-10 15:00:00', '2026-03-12 11:00:00'
);

-- Заявки Марии (owner_id = 4)
INSERT INTO applications (
    id, owner_id, title, tender_id, direction_id, status_id,
    idea_description, importance_to_team, project_goal, project_tasks,
    implementation_experience, results_description,
    submitted_at, created_at, updated_at
) VALUES
(
    6, 4, 'Школа волонтёров',
    3, 1, 3,
    'Обучающая программа для начинающих волонтёров: основы проектной работы, коммуникации, первая помощь',
    'Создание устойчивого волонтёрского сообщества в городе',
    'Обучить 50 волонтёров за 3 месяца',
    '1. Разработка программы\n2. Приглашение тренеров\n3. Набор участников',
    'Мария — координатор волонтёрского центра с 3-летним опытом',
    NULL,
    '2026-03-18 10:00:00', '2026-03-01 08:00:00', '2026-03-20 12:00:00'
),
(
    7, 4, 'Фестиваль дворовой культуры',
    2, 2, 1,
    'Уличный фестиваль с концертами, мастер-классами и ярмаркой местных производителей',
    'Объединение жителей района через совместную культурную деятельность',
    'Привлечь 500+ посетителей, 20+ локальных артистов',
    '1. Площадка\n2. Программа\n3. Продвижение',
    NULL, NULL,
    NULL, '2026-03-22 14:00:00', '2026-03-22 14:00:00'
);

-- Заявки Дмитрия (owner_id = 5)
INSERT INTO applications (
    id, owner_id, title, tender_id, direction_id, status_id,
    idea_description, importance_to_team, project_goal, project_tasks,
    implementation_experience, results_description,
    submitted_at, created_at, updated_at
) VALUES
(
    8, 5, 'Цифровая грамотность для пенсионеров',
    1, 1, 4,
    'Курсы по использованию смартфонов, госуслуг и видеосвязи для людей старшего поколения',
    'Снижение цифровой изоляции пожилых людей',
    'Обучить 100 пенсионеров базовым цифровым навыкам',
    '1. Программа курса\n2. Волонтёры-преподаватели\n3. Помещение',
    'Дмитрий — IT-специалист, уже проводил подобные курсы',
    '100 обученных пенсионеров, 80% успешно используют госуслуги',
    '2026-03-08 11:00:00', '2026-02-25 09:00:00', '2026-03-15 10:00:00'
);

-- Заявки Елены (owner_id = 6)
INSERT INTO applications (
    id, owner_id, title, tender_id, direction_id, status_id,
    idea_description, importance_to_team, project_goal, project_tasks,
    implementation_experience, results_description,
    submitted_at, created_at, updated_at
) VALUES
(
    9, 6, 'Эко-лагерь для подростков',
    3, 3, 2,
    'Недельный летний лагерь с экологическими проектами: посадка деревьев, уборка территорий, исследования',
    'Формирование экологической ответственности у подростков 13-17 лет',
    'Организовать 2 смены по 30 человек',
    '1. Площадка\n2. Программа\n3. Безопасность',
    NULL, NULL,
    '2026-03-25 08:00:00', '2026-03-15 10:00:00', '2026-03-25 08:00:00'
),
(
    10, 6, 'Театральная студия для детей с ОВЗ',
    2, 2, 1,
    'Создание инклюзивной театральной студии для детей с ограниченными возможностями здоровья',
    'Социализация и творческое развитие детей через театральное искусство',
    'Запустить студию на 15 детей, подготовить спектакль к концу года',
    '1. Педагоги\n2. Помещение\n3. Реквизит',
    'Елена — актриса, 5 лет работы с инклюзивными группами',
    NULL,
    NULL, '2026-03-28 12:00:00', '2026-03-28 12:00:00'
);

SELECT setval('applications_id_seq', (SELECT MAX(id) FROM applications));

-- 4. Члены команды (Team Members)
-- ========================================

-- Заявка 1: Эко-тропа (Анна)
INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, consent_file, is_minor) VALUES
(1, 'Козлова', 'Мария', 'Алексеевна', 'Координация волонтёров, работа с парком', 'maria.k@example.com', 'vk.com/maria_k', 'consent_kozlova.pdf', false),
(1, 'Новиков', 'Дмитрий', 'Олегович', 'Дизайн стендов, вёрстка материалов', 'd.novikov@example.com', 't.me/dnovikov', 'consent_novikov.pdf', false),
(1, 'Лебедева', 'Софья', 'Ивановна', 'Сбор информации о флоре', 'sofya.l@example.com', NULL, 'consent_lebedeva.pdf', true);

-- Заявка 2: Мастер-классы (Анна)
INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, consent_file, is_minor) VALUES
(2, 'Морозов', 'Артём', 'Викторович', 'Преподаватель робототехники', 'artem.m@example.com', 'vk.com/artem_m', 'consent_morozov.pdf', false),
(2, 'Волкова', 'Алиса', 'Петровна', 'Преподаватель программирования', 'alisa.v@example.com', 't.me/alisav', 'consent_volkova.pdf', false);

-- Заявка 3: Арт-терапия (Анна) — черновик, 1 участник
INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, consent_file, is_minor) VALUES
(3, 'Петрова', 'Анна', 'Сергеевна', 'Организатор, ведущая занятий', 'anna@mail.com', NULL, 'consent_petrova.pdf', false);

-- Заявка 4: Спортивный фестиваль (Иван)
INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, consent_file, is_minor) VALUES
(4, 'Орлов', 'Максим', 'Андреевич', 'Главный судья, разработка регламента', 'max.orlov@example.com', 'vk.com/max_orlov', 'consent_orlov.pdf', false),
(4, 'Соколова', 'Дарья', 'Николаевна', 'Координация участников, регистрация', 'darya.s@example.com', 't.me/daryas', 'consent_sokolova.pdf', false),
(4, 'Кузнецов', 'Тимур', 'Рустамович', 'Обеспечение площадки, оборудование', 'timur.k@example.com', NULL, 'consent_kuznetsov.pdf', false);

-- Заявка 5: Научный квест (Иван) — отклонена
INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, consent_file, is_minor) VALUES
(5, 'Фёдоров', 'Кирилл', 'Сергеевич', 'Автор сценария, химические опыты', 'kirill.f@example.com', 'vk.com/kirill_f', 'consent_fedorov.pdf', false),
(5, 'Попова', 'Виктория', 'Дмитриевна', 'Физические опыты, безопасность', 'vika.p@example.com', 't.me/vikap', 'consent_popova.pdf', false);

-- Заявка 6: Школа волонтёров (Мария)
INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, consent_file, is_minor) VALUES
(6, 'Егоров', 'Павел', 'Алексеевич', 'Тренер по первой помощи', 'p.egorov@example.com', NULL, 'consent_egorov.pdf', false),
(6, 'Семёнова', 'Ольга', 'Владимировна', 'Тренер по коммуникациям', 'olga.s@example.com', 'vk.com/olga_s', 'consent_semenova.pdf', false);

-- Заявка 7: Фестиваль дворовой культуры (Мария) — черновик
INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, consent_file, is_minor) VALUES
(7, 'Голубев', 'Андрей', 'Михайлович', 'Музыкальная программа, звук', 'andrey.g@example.com', 't.me/andreyg', 'consent_golubev.pdf', false);

-- Заявка 8: Цифровая грамотность (Дмитрий)
INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, consent_file, is_minor) VALUES
(8, 'Тихонова', 'Наталья', 'Сергеевна', 'Преподаватель, работа с группой 1', 'n.tikhonova@example.com', NULL, 'consent_tikhonova.pdf', false),
(8, 'Белов', 'Артём', 'Дмитриевич', 'Преподаватель, работа с группой 2', 'artem.b@example.com', 'vk.com/artem_b', 'consent_belov.pdf', false),
(8, 'Комарова', 'Екатерина', 'Андреевна', 'Координация, расписание', 'ekaterina.k@example.com', 't.me/ekaterinak', 'consent_komarova.pdf', false);

-- Заявка 9: Эко-лагерь (Елена)
INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, consent_file, is_minor) VALUES
(9, 'Медведев', 'Роман', 'Олегович', 'Руководитель полевых работ', 'roman.m@example.com', NULL, 'consent_medvedev.pdf', false),
(9, 'Антонова', 'Полина', 'Васильевна', 'Вожатая, организация досуга', 'polina.a@example.com', 'vk.com/polina_a', 'consent_antonova.pdf', false);

-- Заявка 10: Театральная студия (Елена) — черновик
INSERT INTO team_members (application_id, surname, name, patronymic, tasks_in_project, contact_info, social_media_links, consent_file, is_minor) VALUES
(10, 'Осипова', 'Татьяна', 'Николаевна', 'Режиссёр-педагог', 't.osipova@example.com', NULL, 'consent_osipova.pdf', false);

SELECT setval('team_members_id_seq', (SELECT MAX(id) FROM team_members));

-- 5. Координаторы (Project Coordinators)
-- ========================================
-- Примечание: team_member_id ссылается на ID из team_members
-- Координаторы выбираются из существующих участников команд соответствующих заявок

INSERT INTO project_coordinators (application_id, team_member_id, relation_to_team, education, work_experience) VALUES
-- Заявка 1: team_members IDs 1-3 (Козлова, Новиков, Лебедева)
(1, 1, 'Координатор волонтёров, наставник', NULL, '15 лет координации волонтёрских программ'),
-- Заявка 2: team_members IDs 4-5 (Морозов, Волкова)
(2, 4, 'Преподаватель робототехники, завуч', NULL, '20 лет преподавания, 5 лет управления проектами'),
-- Заявка 4: team_members IDs 8-10 (Орлов, Соколова, Кузнецов)
(4, 8, 'Главный судья, тренер', NULL, '10 лет тренерской работы'),
-- Заявка 6: team_members IDs 13-14 (Егоров, Семёнова)
(6, 13, 'Тренер по первой помощи, руководитель', NULL, '8 лет координации волонтёрских программ'),
-- Заявка 8: team_members IDs 16-18 (Тихонова, Белов, Комарова)
(8, 16, 'Преподаватель, IT-директор', NULL, '12 лет в IT, 3 года обучения пенсионеров'),
-- Заявка 9: team_members IDs 19-20 (Медведев, Антонова)
(9, 19, 'Руководитель полевых работ, директор', NULL, '20 лет работы с детскими лагерями');

SELECT setval('project_coordinators_id_seq', (SELECT MAX(id) FROM project_coordinators));

-- 6. Ответственные по DOBRO.RU
-- ========================================
-- Примечание: team_member_id ссылается на ID из team_members
-- Ответственные выбираются из существующих участников команд соответствующих заявок

INSERT INTO dobro_responsible (application_id, team_member_id, relation_to_team, dobro_link) VALUES
-- Заявка 1: team_member ID 1 (Козлова)
(1, 1, 'Координатор волонтёров', 'https://dobro.ru/user/10001'),
-- Заявка 2: team_member ID 4 (Морозов)
(2, 4, 'Преподаватель', 'https://dobro.ru/user/10002'),
-- Заявка 4: team_member ID 9 (Соколова)
(4, 9, 'Координатор участников', 'https://dobro.ru/user/10003'),
-- Заявка 6: team_member ID 13 (Егоров)
(6, 13, 'Тренер', 'https://dobro.ru/user/10004'),
-- Заявка 8: team_member ID 16 (Тихонова)
(8, 16, 'Преподаватель', 'https://dobro.ru/user/10005'),
-- Заявка 9: team_member ID 20 (Антонова)
(9, 20, 'Вожатая', 'https://dobro.ru/user/10006');

SELECT setval('dobro_responsible_id_seq', (SELECT MAX(id) FROM dobro_responsible));

-- 7. Планы проектов (Project Plans)
-- ========================================

-- Заявка 1: Эко-тропа
INSERT INTO project_plans (application_id, task, event_name, event_description, start_date, end_date, results, fixation_form) VALUES
(1, 'Подготовка', 'Согласование с администрацией', 'Встреча с директором парка, подписание договора', '2026-04-01', '2026-04-15', 'Подписанный договор', 'Скан договора'),
(1, 'Проектирование', 'Разработка дизайна стендов', 'Создание макетов 10 информационных стендов', '2026-04-16', '2026-05-15', 'Утверждённые макеты', 'Файлы дизайна, протокол утверждения'),
(1, 'Реализация', 'Монтаж экотропы', 'Установка стендов, разметка маршрута', '2026-05-16', '2026-06-15', 'Готовая экотропа', 'Фотоотчёт, акт выполненных работ'),
(1, 'Презентация', 'Открытие экотропы', 'Торжественное открытие с экскурсией для жителей', '2026-06-20', '2026-06-20', '50+ участников открытия', 'Видеозапись, публикации в СМИ');

-- Заявка 2: Мастер-классы
INSERT INTO project_plans (application_id, task, event_name, event_description, start_date, end_date, results, fixation_form) VALUES
(2, 'Подготовка', 'Разработка программы', 'Создание учебных материалов и заданий', '2026-04-01', '2026-04-20', 'Готовая программа 10 занятий', 'Учебный план, методичка'),
(2, 'Организация', 'Поиск площадки', 'Переговоры со школами и библиотеками', '2026-04-10', '2026-04-30', 'Договор о предоставлении площадки', 'Договор, акт приёма-передачи'),
(2, 'Проведение', 'Первые 5 мастер-классов', 'Занятия по робототехнике и программированию', '2026-05-01', '2026-06-15', '100+ детей', 'Журнал посещаемости, фото'),
(2, 'Проведение', 'Вторые 5 мастер-классов', 'Продолжение занятий, итоговый проект', '2026-06-16', '2026-07-31', '100+ детей, 10 проектов', 'Проекты детей, видео презентации');

-- Заявка 4: Спортивный фестиваль
INSERT INTO project_plans (application_id, task, event_name, event_description, start_date, end_date, results, fixation_form) VALUES
(4, 'Подготовка', 'Старт регистрации команд', 'Открытие приёма заявок на сайте и в соцсетях', '2026-04-01', '2026-04-15', '16+ зарегистрированных команд', 'Скриншоты формы, реестр'),
(4, 'Подготовка', 'Поиск спонсоров', 'Переговоры с местными бизнесами', '2026-04-01', '2026-05-01', '3+ спонсора', 'Договоры, письма поддержки'),
(4, 'Проведение', 'Турнир по футболу', 'Групповой этап и плей-офф', '2026-06-10', '2026-06-14', 'Определение финалистов', 'Протоколы матчей, фото'),
(4, 'Завершение', 'Финальный матч и награждение', 'Торжественное закрытие', '2026-06-15', '2026-06-15', 'Награждение победителей', 'Видеозапись, протокол');

-- Заявка 6: Школа волонтёров
INSERT INTO project_plans (application_id, task, event_name, event_description, start_date, end_date, results, fixation_form) VALUES
(6, 'Подготовка', 'Разработка программы обучения', 'Создание учебных модулей', '2026-04-01', '2026-04-30', 'Программа из 5 модулей', 'Учебный план'),
(6, 'Набор', 'Рекрутинг участников', 'Приём заявок через сайт и соцсети', '2026-05-01', '2026-05-20', '50+ участников', 'Реестр участников'),
(6, 'Обучение', 'Модули 1-3', 'Основы проектной работы, коммуникации', '2026-06-01', '2026-07-15', '30+ выпускников', 'Тесты, сертификаты'),
(6, 'Обучение', 'Модули 4-5', 'Первая помощь, практика', '2026-07-16', '2026-08-31', '50 выпускников', 'Итоговый экзамен, сертификаты');

-- Заявка 8: Цифровая грамотность
INSERT INTO project_plans (application_id, task, event_name, event_description, start_date, end_date, results, fixation_form) VALUES
(8, 'Подготовка', 'Создание учебного пособия', 'Разработка пошаговых инструкций', '2026-04-01', '2026-04-30', 'Пособие из 12 уроков', 'Файл пособия'),
(8, 'Набор', 'Регистрация участников', 'Через центры соцобслуживания', '2026-05-01', '2026-05-31', '100+ участников', 'Реестр'),
(8, 'Обучение', 'Курс 1: Основы смартфона', 'Звонки, сообщения, камера', '2026-06-01', '2026-07-15', '50 человек', 'Журнал'),
(8, 'Обучение', 'Курс 2: Госуслуги и онлайн', 'Запись к врачу, оплата ЖКХ', '2026-07-16', '2026-09-15', '100 человек', 'Итоговый опрос');

-- Заявка 9: Эко-лагерь
INSERT INTO project_plans (application_id, task, event_name, event_description, start_date, end_date, results, fixation_form) VALUES
(9, 'Подготовка', 'Организация лагеря', 'Площадка, питание, безопасность', '2026-05-01', '2026-06-15', 'Готовая инфраструктура', 'Договоры, акты'),
(9, 'Смена 1', 'Первая экологическая смена', '7 дней: посадки, уборка, исследования', '2026-07-01', '2026-07-07', '30 участников', 'Фотоотчёт, дневник'),
(9, 'Смена 2', 'Вторая экологическая смена', '7 дней: продолжение проектов', '2026-07-15', '2026-07-21', '30 участников', 'Фотоотчёт, дневник');

SELECT setval('project_plans_id_seq', (SELECT MAX(id) FROM project_plans));

-- 8. Бюджет проектов (Project Budget)
-- ========================================

-- Заявка 1: Эко-тропа
INSERT INTO project_budget (application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment) VALUES
(1, 'Информационные стенды', 3500.00, 10, 35000.00, 5000.00, 30000.00, 'Антивандальные, двухсторонние'),
(1, 'Монтажные работы', 1500.00, 10, 15000.00, 0.00, 15000.00, 'Установка и крепление'),
(1, 'Полиграфия (брошюры)', 150.00, 200, 30000.00, 10000.00, 20000.00, 'Для раздачи посетителям');

-- Заявка 2: Мастер-классы
INSERT INTO project_budget (application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment) VALUES
(2, 'Робототехнические наборы', 12000.00, 5, 60000.00, 10000.00, 50000.00, 'Arduino-совместимые'),
(2, 'Ноутбуки (аренда)', 500.00, 10, 5000.00, 0.00, 5000.00, 'На 10 мастер-классов'),
(2, 'Расходные материалы', 2000.00, 10, 20000.00, 5000.00, 15000.00, 'Детали, провода, датчики');

-- Заявка 4: Спортивный фестиваль
INSERT INTO project_budget (application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment) VALUES
(4, 'Аренда стадиона', 15000.00, 5, 75000.00, 25000.00, 50000.00, '5 дней турнира'),
(4, 'Призовой фонд', 5000.00, 6, 30000.00, 10000.00, 20000.00, '1-3 места, 2 вида спорта'),
(4, 'Медицинское обеспечение', 5000.00, 5, 25000.00, 0.00, 25000.00, 'Скорая помощь на площадке'),
(4, 'Вода и питание', 200.00, 200, 40000.00, 15000.00, 25000.00, 'Для участников и зрителей');

-- Заявка 6: Школа волонтёров
INSERT INTO project_budget (application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment) VALUES
(6, 'Аренда зала', 3000.00, 20, 60000.00, 10000.00, 50000.00, '20 занятий'),
(6, 'Раздаточные материалы', 500.00, 50, 25000.00, 5000.00, 20000.00, 'Рабочие тетради'),
(6, 'Сертификаты', 200.00, 50, 10000.00, 0.00, 10000.00, 'Для выпускников');

-- Заявка 8: Цифровая грамотность
INSERT INTO project_budget (application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment) VALUES
(8, 'Планшеты для обучения', 8000.00, 10, 80000.00, 20000.00, 60000.00, 'Бюджетные модели'),
(8, 'Печать пособий', 150.00, 100, 15000.00, 5000.00, 10000.00, 'Пошаговые инструкции'),
(8, 'Аренда помещения', 5000.00, 20, 100000.00, 30000.00, 70000.00, '20 занятий по 2 группы');

-- Заявка 9: Эко-лагерь
INSERT INTO project_budget (application_id, resource_type, unit_cost, quantity, total_cost, own_funds, grant_funds, comment) VALUES
(9, 'Проживание и питание', 1500.00, 60, 90000.00, 20000.00, 70000.00, '60 человек, 2 смены'),
(9, 'Саженцы и инструменты', 500.00, 100, 50000.00, 10000.00, 40000.00, 'Посадочный материал'),
(9, 'Трансфер', 300.00, 60, 18000.00, 5000.00, 13000.00, 'Доставка до лагеря и обратно');

SELECT setval('project_budget_id_seq', (SELECT MAX(id) FROM project_budget));

-- 9. Дополнительные материалы (Additional Materials)
-- ========================================

INSERT INTO additional_materials (application_id, file_path, file_name, file_type, file_size, comment) VALUES
(1, 'uploads/documents/eco_trail_design.pdf', 'Дизайн_стендов_макет.pdf', 'application/pdf', 2458621, 'Визуализация стендов'),
(1, 'uploads/documents/park_agreement_draft.docx', 'Проект_догоора_с_парком.docx', 'application/msword', 156432, 'Черновик договора'),
(2, 'uploads/documents/robotics_curriculum.pdf', 'Программа_курса_робототехники.pdf', 'application/pdf', 1245000, 'Детальный план занятий'),
(2, 'uploads/documents/school_support_letter.pdf', 'Письмо_поддержки_школа42.pdf', 'application/pdf', 156432, 'Официальное письмо от директора'),
(4, 'uploads/documents/tournament_regulation.docx', 'Регламент_турнира.docx', 'application/msword', 345000, 'Правила проведения'),
(4, 'uploads/documents/sponsor_letters.pdf', 'Письма_спонсоров.pdf', 'application/pdf', 520000, 'Подтверждения от спонсоров'),
(6, 'uploads/documents/volunteer_program.pdf', 'Программа_школы_волонтёров.pdf', 'application/pdf', 890000, 'Учебный план'),
(8, 'uploads/documents/digital_guide_draft.pdf', 'Черновик_учебного_пособия.pdf', 'application/pdf', 1560000, 'Пошаговые инструкции'),
(9, 'uploads/documents/camp_safety_plan.pdf', 'План_безопасности_лагеря.pdf', 'application/pdf', 430000, 'Медицинское обеспечение');

SELECT setval('additional_materials_id_seq', (SELECT MAX(id) FROM additional_materials));

-- 10. Эксперты
-- ========================================

INSERT INTO experts (id, surname, name, patronymic, extra_info, created_at) VALUES
(1, 'Смирнов', 'Алексей', 'Владимирович', 'Кандидат экономических наук, доцент кафедры управления проектами', '2026-01-15 10:00:00'),
(2, 'Кузнецова', 'Елена', 'Михайловна', 'Эксперт по социальному проектированию, более 10 лет опыта', '2026-01-20 11:30:00'),
(3, 'Попов', 'Дмитрий', 'Сергеевич', 'Волонтёр с 5-летним стажем, координатор региональных программ', '2026-02-01 09:15:00'),
(4, 'Васильева', 'Наталья', 'Александровна', 'Специалист по экологическим проектам, кандидат биологических наук', '2026-02-10 14:45:00'),
(5, 'Морозов', 'Игорь', 'Петрович', 'Эксперт по спортивным проектам, мастер спорта', '2026-02-15 10:00:00'),
(6, 'Лебедева', 'Ольга', 'Дмитриевна', 'Специалист по образовательным программам, PhD в педагогике', '2026-02-20 11:00:00'),
(7, 'Новиков', 'Андрей', 'Викторович', 'Эксперт по IT-проектам, senior developer', '2026-03-01 09:00:00'),
(8, 'Фёдорова', 'Марина', 'Сергеевна', 'Культуролог, эксперт по инклюзивным проектам', '2026-03-05 14:00:00')
ON CONFLICT (id) DO NOTHING;

SELECT setval('experts_id_seq', COALESCE((SELECT MAX(id) FROM experts), 0) + 1);

-- Назначение экспертов на заявки
UPDATE applications SET expert_1 = 1, expert_2 = 4 WHERE id = 1;  -- Эко-тропа
UPDATE applications SET expert_1 = 6, expert_2 = 7 WHERE id = 2;  -- Мастер-классы
UPDATE applications SET expert_1 = 5, expert_2 = 3 WHERE id = 4;  -- Спортивный фестиваль
UPDATE applications SET expert_1 = 1, expert_2 = 3 WHERE id = 5;  -- Научный квест
UPDATE applications SET expert_1 = 2, expert_2 = 3 WHERE id = 6;  -- Школа волонтёров
UPDATE applications SET expert_1 = 7, expert_2 = 6 WHERE id = 8;  -- Цифровая грамотность
UPDATE applications SET expert_1 = 4, expert_2 = 5 WHERE id = 9;  -- Эко-лагерь

-- Вердикты экспертов
INSERT INTO expert_verdicts (application_id, expert_id, verdict, comment, created_at) VALUES
(1, 1, 'approved', 'Проект соответствует критериям. Бюджет обоснован, команда мотивирована.', '2026-03-05 10:00:00'),
(1, 4, 'approved', 'Экологическая значимость высокая. Рекомендую к поддержке.', '2026-03-05 11:30:00'),
(2, 6, 'approved', 'Актуальная программа, хороший охват целевой аудитории.', '2026-03-18 10:00:00'),
(2, 7, 'approved', 'Техническая часть проработана качественно.', '2026-03-18 11:00:00'),
(4, 5, 'approved', 'Перспективный проект. Есть потенциал масштабирования.', '2026-03-10 14:00:00'),
(4, 3, 'rejected', 'Бюджет завышен. Требуется доработка плана мероприятий.', '2026-03-10 15:30:00'),
(5, 1, 'rejected', 'Недостаточно проработан план реализации.', '2026-03-12 10:00:00'),
(5, 3, 'rejected', 'Целевая аудитория определена нечётко.', '2026-03-12 11:00:00'),
(6, 2, 'approved', 'Отличная инициатива. Волонтёрское сообщество нуждается в обучении.', '2026-03-22 10:00:00'),
(6, 3, 'approved', 'Программа обучения comprehensive, команда опытная.', '2026-03-22 11:00:00'),
(8, 7, 'approved', 'Актуальный проект. Цифровая грамотность пенсионеров — важная тема.', '2026-03-18 14:00:00'),
(8, 6, 'approved', 'Программа обучения хорошо структурирована.', '2026-03-18 15:00:00'),
(9, 4, 'approved', 'Экологическое воспитание с детства — правильно.', '2026-03-28 10:00:00'),
(9, 5, 'approved', 'Хорошая организация, план безопасности проработан.', '2026-03-28 11:00:00');

-- 11. Документы и шаблоны
-- ========================================

-- Образцы согласий
INSERT INTO documents (title, description, category_id, file_path, file_name, file_type, file_size, is_template, template_type, created_by, created_at) VALUES
(
  'Образец согласия на обработку персональных данных (14+)',
  'Шаблон согласия для участников проекта старше 14 лет',
  3,
  'СОГЛАСИЕ после 14 лет.docx',
  'СОГЛАСИЕ после 14 лет.docx',
  'application/vnd.ms-word',
  245000,
  true,
  'consent_adult',
  1,
  '2026-03-01 09:00:00'
),
(
  'Образец согласия на обработку персональных данных (до 14)',
  'Шаблон согласия для участников проекта младше 14 лет (заполняет родитель)',
  3,
  'СОГЛАСИЕ до 14 лет.docx',
  'СОГЛАСИЕ до 14 лет.docx',
  'application/vnd.ms-word',
  258000,
  true,
  'consent_minor',
  1,
  '2026-03-01 09:00:00'
);

-- Другие документы
INSERT INTO documents (title, description, category_id, file_path, file_name, file_type, file_size, is_template, created_by, created_at) VALUES
(
  'Положение о гранте "Арбузный грант"',
  'Основной документ, регламентирующий участие в грантовой программе',
  1,
  'polozhenie_o_grante_2026.pdf',
  'polozhenie_o_grante_2026.pdf',
  'application/pdf',
  2450000,
  false,
  1,
  '2026-03-01 10:00:00'
),
(
  'Методические рекомендации по заполнению заявки',
  'Подробное руководство по оформлению и подаче заявки на грант',
  2,
  'metodicheskie_rekomendacii_2026.pdf',
  'metodicheskie_rekomendacii_2026.pdf',
  'application/pdf',
  1850000,
  false,
  1,
  '2026-03-05 11:00:00'
),
(
  'Форма согласия на обработку персональных данных (пустой бланк)',
  'Пустой бланк для заполнения',
  3,
  'blank_soglasiya.pdf',
  'blank_soglasiya.pdf',
  'application/pdf',
  520000,
  false,
  1,
  '2026-02-20 14:00:00'
),
(
  'Требования к оформлению проектов',
  'Технические требования к оформлению проектной документации',
  1,
  'trebovaniya_k_oformleniyu.pdf',
  'trebovaniya_k_oformleniyu.pdf',
  'application/pdf',
  1200000,
  false,
  1,
  '2026-03-10 09:30:00'
),
(
  'Календарь мероприятий 2026',
  'План мероприятий грантовой программы на 2026 год',
  1,
  'kalendar_meropriyatiy_2026.pdf',
  'kalendar_meropriyatiy_2026.pdf',
  'application/pdf',
  3100000,
  false,
  1,
  '2026-01-15 16:00:00'
);

SELECT setval('documents_id_seq', COALESCE((SELECT MAX(id) FROM documents), 0) + 1);

-- 12. Журнал изменений
-- ========================================

INSERT INTO change_logs (application_id, user_id, action, old_value, new_value, created_at) VALUES
(1, 2, 'create', NULL, '{"title": "Эко-тропа в городском парке", "status": "Черновик"}', '2026-02-15 10:00:00'),
(1, 2, 'update_status', '{"status_id": 1}', '{"status_id": 2, "submitted_at": "2026-03-01 14:30:00"}', '2026-03-01 14:30:00'),
(1, 1, 'update_status', '{"status_id": 2}', '{"status_id": 3}', '2026-03-03 09:00:00'),
(1, 1, 'update_status', '{"status_id": 3}', '{"status_id": 4}', '2026-03-10 16:00:00'),
(2, 2, 'create', NULL, '{"title": "Мастер-классы для школьников", "status": "Черновик"}', '2026-03-10 08:00:00'),
(2, 2, 'update_status', '{"status_id": 1}', '{"status_id": 2, "submitted_at": "2026-03-15 09:00:00"}', '2026-03-15 09:00:00'),
(4, 3, 'create', NULL, '{"title": "Спортивный фестиваль", "status": "Черновик"}', '2026-02-20 09:00:00'),
(4, 3, 'update_status', '{"status_id": 1}', '{"status_id": 2}', '2026-03-05 12:00:00'),
(4, 1, 'update_status', '{"status_id": 2}', '{"status_id": 3}', '2026-03-08 10:00:00'),
(5, 3, 'create', NULL, '{"title": "Научный квест", "status": "Черновик"}', '2026-02-10 15:00:00'),
(5, 3, 'update_status', '{"status_id": 1}', '{"status_id": 2}', '2026-02-28 10:00:00'),
(5, 1, 'update_status', '{"status_id": 2}', '{"status_id": 5}', '2026-03-12 11:00:00'),
(6, 4, 'create', NULL, '{"title": "Школа волонтёров", "status": "Черновик"}', '2026-03-01 08:00:00'),
(6, 4, 'update_status', '{"status_id": 1}', '{"status_id": 2}', '2026-03-18 10:00:00'),
(6, 1, 'update_status', '{"status_id": 2}', '{"status_id": 3}', '2026-03-20 12:00:00'),
(8, 5, 'create', NULL, '{"title": "Цифровая грамотность", "status": "Черновик"}', '2026-02-25 09:00:00'),
(8, 5, 'update_status', '{"status_id": 1}', '{"status_id": 2}', '2026-03-08 11:00:00'),
(8, 1, 'update_status', '{"status_id": 2}', '{"status_id": 3}', '2026-03-10 10:00:00'),
(8, 1, 'update_status', '{"status_id": 3}', '{"status_id": 4}', '2026-03-15 10:00:00'),
(9, 6, 'create', NULL, '{"title": "Эко-лагерь", "status": "Черновик"}', '2026-03-15 10:00:00'),
(9, 6, 'update_status', '{"status_id": 1}', '{"status_id": 2}', '2026-03-25 08:00:00');
