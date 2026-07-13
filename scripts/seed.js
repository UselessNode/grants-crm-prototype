const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "app_postgres",
  database: process.env.DB_NAME || "grants_crm",
  password: process.env.DB_PASSWORD || "postgres",
  port: parseInt(process.env.DB_PORT || "5432"),
});

async function seed() {
  const client = await pool.connect();
  const seedDir = path.join(__dirname, "seed");

  if (!fs.existsSync(seedDir)) {
    console.error(`\n❌ Папка seed не найдена по пути: ${seedDir}`);
    process.exit(1);
  }

  // Читаем только .sql файлы и сортируем по алфавиту
  const files = fs
    .readdirSync(seedDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("\n⚠️ В папке seed нет .sql файлов.");
    process.exit(0);
  }

  let currentFile = "";
  let currentSql = "";

  try {
    console.log("📦 Заполнение тестовыми данными...\n");
    await client.query("BEGIN");

    for (const file of files) {
      currentFile = file;
      currentSql = fs.readFileSync(path.join(seedDir, file), "utf-8");

      console.log(`  📄 ${file}`);
      await client.query(currentSql);
    }

    await client.query("COMMIT");
    console.log("\n✅ Seed-данные успешно добавлены!");
    console.log(
      "\n💡 Примечание: Повторный запуск не создаст дубликатов (используется ON CONFLICT DO NOTHING).\n",
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (e) {} // Игнорируем ошибки самого отката

    console.error("\n❌ Ошибка при выполнении seed-данных!");
    console.error(`📂 Файл: seed/${currentFile}`);
    console.error(`💬 Сообщение: ${error.message}`);

    if (error.position && currentSql) {
      const pos = parseInt(error.position);
      const linesUpToError = currentSql.substring(0, pos).split("\n");
      const lineNumber = linesUpToError.length;
      const errorLineText = linesUpToError[lineNumber - 1] || "";

      console.error(`📍 Ошибка в строке: ${lineNumber} (символ № ${pos})`);
      console.error(`🔍 Контекст строки:\n   > ${errorLineText.trim()}`);
    } else {
      console.error(error.stack);
    }

    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
