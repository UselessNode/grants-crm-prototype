#!/usr/bin/env node

/**
 * Скрипт сброса и применения миграций БД
 * Использование: npm run db:reset
 *
 * Внимание: Это удалит ВСЕ данные из базы!
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "grants_crm",
  password: process.env.DB_PASSWORD || "postgres",
  port: parseInt(process.env.DB_PORT || "5432"),
});

async function resetDatabase() {
  const client = await pool.connect();

  try {
    console.log("⚠️  Сброс базы данных...");
    console.log("   Внимание: Все данные будут удалены!\n");

    // Получаем список всех таблиц
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const tables = tablesResult.rows.map(r => r.tablename);

    if (tables.length > 0) {
      console.log("Удаление таблиц:");
      for (const table of tables) {
        console.log(`  - ${table}`);
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      }
      console.log();
    }

    // Создаём таблицу миграций заново
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ База данных сброшена\n");
    console.log("📁 Применение миграций...\n");

    // Получаем список файлов миграций
    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    // Применяем миграции
    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, "utf-8");

      console.log(`  Применяется: ${file}`);

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [file],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("\n✅ Миграции применены\n");
    console.log("📦 Готово! База данных пересоздана и готова к работе.");
    console.log("\nДля заполнения тестовыми данными выполните: npm run seed\n");

  } catch (error) {
    console.error("\n❌ Ошибка:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();
