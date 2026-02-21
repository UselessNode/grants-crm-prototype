#!/usr/bin/env node

/**
 * Скрипт применения миграций базы данных
 * Использование: npm run migrate
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

async function runMigrations() {
  const client = await pool.connect();

  try {
    // Создаем таблицу для отслеживания примененных миграций
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Получаем список уже примененных миграций
    const appliedResult = await client.query(
      "SELECT version FROM schema_migrations",
    );
    const appliedMigrations = new Set(appliedResult.rows.map((r) => r.version));

    // Получаем список файлов миграций
    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    console.log(`Найдено миграций: ${migrationFiles.length}`);
    console.log(`Уже применено: ${appliedMigrations.size}`);

    // Применяем новые миграции
    for (const file of migrationFiles) {
      if (appliedMigrations.has(file)) {
        console.log(`(>>) Пропущено: ${file}`);
        continue;
      }

      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, "utf-8");

      console.log(`Применяется: ${file}`);

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [file],
        );
        await client.query("COMMIT");
        console.log(`Применено: ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("\nВсе миграции успешно применены!");
  } catch (error) {
    console.error("(Х) Ошибка при применении миграций:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
