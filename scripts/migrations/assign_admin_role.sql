-- Скрипт для назначения пользователя администратором
-- Замените user_id на ID нужного пользователя

-- Назначить роль администратора (id=2) пользователю
UPDATE "users"
SET "role_id" = 2
WHERE "id" = 1; -- Замените на ID пользователя

-- Проверка результата
SELECT u.id, u.email, u.surname, u.name, r.name as role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.id = 1; -- Замените на ID пользователя
