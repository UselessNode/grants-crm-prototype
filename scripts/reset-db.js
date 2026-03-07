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
    const tables = tablesResult.rows.map(r => `"${r.tablename}"`);
    
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
    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const appliedRes = await client.query("SELECT version FROM schema_migrations");
    const appliedSet = new Set(appliedRes.rows.map(r => r.version));
    
    let appliedCount = 0;
    for (const file of migrationFiles) {
      if (appliedSet.has(file)) {
        console.log(`   ⊘ ${file}`);
        continue;
      }
      
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`   ✓ ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    console.log("\n✅ Готово");
    console.log(`   Применено миграций: ${appliedCount}/${migrationFiles.length}`);
    console.log("\n💡 Для тестовых данных: npm run seed");

  } catch (error) {
    console.error("\n❌ Ошибка:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();