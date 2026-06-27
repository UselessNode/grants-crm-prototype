-- Фикс: связываем существующих экспертов с пользователями и устанавливаем статус
-- Запускать после миграции 010 и seed_data.sql

UPDATE experts SET user_id = 7, status = 'approved', specialization_id = 5 WHERE id = 1;
UPDATE experts SET user_id = 8, status = 'approved', specialization_id = 2 WHERE id = 2;
UPDATE experts SET user_id = 9, status = 'approved', specialization_id = 1 WHERE id = 3;
UPDATE experts SET user_id = 10, status = 'approved', specialization_id = 3 WHERE id = 4;
UPDATE experts SET user_id = 11, status = 'approved', specialization_id = 4 WHERE id = 5;
UPDATE experts SET user_id = 12, status = 'approved', specialization_id = 1 WHERE id = 6;
UPDATE experts SET user_id = 13, status = 'approved', specialization_id = 1 WHERE id = 7;
UPDATE experts SET user_id = 14, status = 'approved', specialization_id = 2 WHERE id = 8;