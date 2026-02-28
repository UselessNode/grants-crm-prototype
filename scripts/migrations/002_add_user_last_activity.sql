-- Миграция: Добавление поля last_activity для отслеживания активности пользователей
-- Дата: 2026-02-28

-- Добавляем поле для отслеживания последней активности пользователя
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Создаём индекс для быстрого поиска по активности
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);

-- Добавляем комментарий к полю
COMMENT ON COLUMN users.last_activity IS 'Время последней активности пользователя для управления сессиями';
