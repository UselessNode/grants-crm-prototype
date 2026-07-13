#!/usr/bin/env node

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
  const force = process.argv.includes("--force");
  const isProd = process.env.NODE_ENV === "production";

  try {
    if (isProd && !force) {
      console.error("❌ Продакшн-среда. Используй --force для сброса.");
      process.exit(1);
    }

    console.log("🗑  Сброс базы данных...");

    // 1. Дроп таблиц одним запросом
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);
    const tables = tablesResult.rows.map((r) => `"${r.tablename}"`);

    if (tables.length > 0) {
      await client.query(`DROP TABLE IF EXISTS ${tables.join(", ")} CASCADE`);
      console.log(`   Удалено таблиц: ${tables.length}`);
    }

    // 2. Таблица миграций
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Применение миграций
    console.log("📁 Миграции...");
    const migrationsDir = path.join(__dirname, "new_migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const appliedRes = await client.query(
      "SELECT version FROM schema_migrations",
    );
    const appliedSet = new Set(appliedRes.rows.map((r) => r.version));

    let appliedCount = 0;

    for (const file of migrationFiles) {
      if (appliedSet.has(file)) {
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [file],
        );
        await client.query("COMMIT");
        console.log(`   ✅ Выполнена: ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query("ROLLBACK");
        // Привязываем к ошибке имя файла и его SQL-содержимое
        err.migrationFile = file;
        err.migrationSql = sql;
        throw err;
      }
    }

    console.log(`🎉 Сброс завершен. Применено миграций: ${appliedCount}`);
  } catch (error) {
    console.error("\n❌ Произошла ошибка при выполнении скрипта!");

    if (error.migrationFile) {
      console.error(`📂 Файл миграции: ${error.migrationFile}`);
    }

    console.error(`💬 Сообщение: ${error.message}`);

    // Вычисляем строку по позиции символа от pg
    if (error.position && error.migrationSql) {
      const pos = parseInt(error.position);
      const sqlText = error.migrationSql;

      // Считаем номер строки
      const linesUpToError = sqlText.substring(0, pos).split("\n");
      const lineNumber = linesUpToError.length;

      // Достаем саму строку из текста
      const errorLineText = linesUpToError[lineNumber - 1] || "";

      console.error(`📍 Ошибка в строке: ${lineNumber} (символ № ${pos})`);
      console.error(`🔍 Контекст строки:\n   > ${errorLineText.trim()}`);
    }

    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Запуск функции
resetDatabase();
