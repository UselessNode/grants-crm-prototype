-- Внешние ключи (если не были заданы inline) + триггеры
-- (Все внешние ключи уже заданы в CREATE TABLE через REFERENCES,
--  поэтому дополнительные ALTER не нужны, кроме случаев,
--  когда связь добавляется позже

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для всех таблиц с полем updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'roles', 'file_categories', 'files', 'tenders', 'directions',
        'application_statuses', 'users', 'applications', 'team_members',
        'application_reviews', 'project_plans', 'project_budget',
        'additional_materials', 'change_logs'
    ] LOOP
        BEGIN
            EXECUTE format(
                'CREATE TRIGGER trg_%s_updated_at
                 BEFORE UPDATE ON %I
                 FOR EACH ROW
                 EXECUTE FUNCTION trg_set_updated_at();',
                tbl, tbl
            );
        EXCEPTION WHEN duplicate_object THEN
            -- триггер уже существует, пропускаем
            NULL;
        END;
    END LOOP;
END $$;

-- Триггер логирования изменения статуса заявки (Опционально)
CREATE OR REPLACE FUNCTION trg_log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status_id IS DISTINCT FROM NEW.status_id THEN
        INSERT INTO change_logs (application_id, user_id, action, old_value, new_value)
        VALUES (
            NEW.id,
            NULL,   -- можно передавать через SET config или параметры
            'status_change',
            jsonb_build_object('status_id', OLD.status_id),
            jsonb_build_object('status_id', NEW.status_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_status_change ON applications;
CREATE TRIGGER trg_applications_status_change
    AFTER UPDATE ON applications
    FOR EACH ROW
    WHEN (OLD.status_id IS DISTINCT FROM NEW.status_id)
    EXECUTE FUNCTION trg_log_status_change();
