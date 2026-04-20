/**
 * Скрипт для создания тестовых файлов документов
 * Запускать после seed: node scripts/seed-docs.js
 */

const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(
  __dirname,
  "..",
  "backend",
  "uploads",
  "documents",
);
const templatesDir = path.join(
  __dirname,
  "..",
  "backend",
  "uploads",
  "templates",
);

// Создаём директории
[uploadsDir, templatesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Создаёт минимальный валидный PDF-файл
 */
function createSamplePdf(title, filePath) {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 64 >>
stream
BT
/F1 18 Tf
100 700 Td
(${title}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
0000000380 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
448
%%EOF`;

  fs.writeFileSync(filePath, content, "utf8");
  console.log(
    `  ✓ ${path.basename(filePath)} (${(fs.statSync(filePath).size / 1024).toFixed(1)} КБ)`,
  );
}

/**
 * Создаёт минимальный DOCX-файл (ZIP с минимальным содержимым)
 */
function createSampleDocx(title, filePath) {
  // DOCX — это ZIP-архив. Создаём минимальный валидный DOCX вручную.
  // Для простоты создаём файл с правильным ZIP-содержимым через Buffer.
  // Но проще — создадим текстовый файл-заглушку, т.к. сервер отдаёт его как файл.
  const content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>${title}</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  fs.writeFileSync(filePath, content, "utf8");
  console.log(
    `  ✓ ${path.basename(filePath)} (${(fs.statSync(filePath).size / 1024).toFixed(1)} КБ)`,
  );
}

console.log("\n📄 Создание тестовых файлов документов...\n");

// Шаблоны согласий (templates) — имена должны совпадать с seed_data.sql
console.log("📋 Шаблоны согласий:");
createSampleDocx(
  "Образец согласия на обработку персональных данных (14+)",
  path.join(templatesDir, "СОГЛАСИЕ после 14 лет.docx"),
);
createSampleDocx(
  "Образец согласия на обработку персональных данных (до 14)",
  path.join(templatesDir, "СОГЛАСИЕ до 14 лет.docx"),
);

// Согласия членов команды (uploads/documents — заглушки)
console.log("\n📝 Согласия членов команды:");
const consentFiles = [
  "consent_kozlova.pdf",
  "consent_novikov.pdf",
  "consent_lebedeva.pdf",
  "consent_morozov.pdf",
  "consent_volkova.pdf",
  "consent_petrova.pdf",
  "consent_orlov.pdf",
  "consent_sokolova.pdf",
  "consent_kuznetsov.pdf",
  "consent_fedorov.pdf",
  "consent_popova.pdf",
  "consent_egorov.pdf",
  "consent_semenova.pdf",
  "consent_golubev.pdf",
  "consent_tikhonova.pdf",
  "consent_belov.pdf",
  "consent_komarova.pdf",
  "consent_medvedev.pdf",
  "consent_antonova.pdf",
  "consent_osipova.pdf",
];
consentFiles.forEach((name) => {
  createSamplePdf(
    `Согласие: ${name.replace(".pdf", "")}`,
    path.join(uploadsDir, name),
  );
});

// Документы заявок (uploads/documents)
console.log("\n📁 Дополнительные материалы заявок:");
const docFiles = [
  { name: "eco_trail_design.pdf", title: "Дизайн стендов — макет" },
  { name: "park_agreement_draft.docx", title: "Проект договора с парком" },
  { name: "robotics_curriculum.pdf", title: "Программа курса робототехники" },
  { name: "school_support_letter.pdf", title: "Письмо поддержки школа 42" },
  { name: "tournament_regulation.docx", title: "Регламент турнира" },
  { name: "sponsor_letters.pdf", title: "Письма спонсоров" },
  { name: "volunteer_program.pdf", title: "Программа школы волонтёров" },
  { name: "digital_guide_draft.pdf", title: "Черновик учебного пособия" },
  { name: "camp_safety_plan.pdf", title: "План безопасности лагеря" },
];
docFiles.forEach(({ name, title }) => {
  if (name.endsWith(".docx")) {
    createSampleDocx(title, path.join(uploadsDir, name));
  } else {
    createSamplePdf(title, path.join(uploadsDir, name));
  }
});

// Публичные документы (uploads/documents)
console.log("\n📚 Публичные документы:");
createSamplePdf(
  'Положение о гранте "Арбузный грант"',
  path.join(uploadsDir, "polozhenie_o_grante_2026.pdf"),
);
createSamplePdf(
  "Методические рекомендации по заполнению заявки",
  path.join(uploadsDir, "metodicheskie_rekomendacii_2026.pdf"),
);
createSamplePdf(
  "Форма согласия на обработку персональных данных (пустой бланк)",
  path.join(uploadsDir, "blank_soglasiya.pdf"),
);
createSamplePdf(
  "Требования к оформлению проектов",
  path.join(uploadsDir, "trebovaniya_k_oformleniyu.pdf"),
);
createSamplePdf(
  "Календарь мероприятий 2026",
  path.join(uploadsDir, "kalendar_meropriyatiy_2026.pdf"),
);

console.log("\n✅ Тестовые файлы созданы!\n");
