-- Миграция для заполнения таблицы ролей
-- Запускается после 001_Init.sql

-- Добавляем базовые роли
INSERT INTO "roles" ("id", "name", "description")
VALUES
  (1, 'user', 'Обычный пользователь'),
  (2, 'admin', 'Администратор')
ON CONFLICT ("id") DO NOTHING;

-- Сброс счетчика последовательности (если нужно)
SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 0) + 1);
