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

async function seed() {
  const client = await pool.connect();

  try {
    const seedPath = path.join(__dirname, "seed_data.sql");
    const sql = fs.readFileSync(seedPath, "utf-8");

    console.log("📦 Заполнение тестовыми данными...\n");

    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("COMMIT");
      console.log("\n✅ Seed-данные успешно добавлены!");
      console.log(
        "\n💡 Примечание: Повторный запуск не создаст дубликатов (используется ON CONFLICT DO NOTHING).\n",
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("\n❌ Ошибка при выполнении seed-данных:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
