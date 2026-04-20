# Grants CRM

**Grants CRM** — это система для управления заявками на гранты с полным циклом: от создания черновика до экспертизы и финального решения.

---

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск режима разработки
npm run dev

# Сборка для продакшена
npm run build
```

### База данных

```bash
# Сброс и инициализация (миграции + seed)
npm run db:rebuild

# Сброс БД (только миграции)
npm run db:reset

# Применение миграций
npm run migrate

# Заполнение тестовыми данными
npm run seed

# Создание тестовых файлов документов
node scripts/seed-docs.js
```

---

## 🔐 Тестовые учётные данные

| Email | Пароль | Роль |
|-------|--------|------|
| `admin@crm.test` | `123456` | Администратор |
| `anna@mail.com` | `123456` | Пользователь |
| `ivan@mail.com` | `123456` | Пользователь |
| `maria@mail.com` | `123456` | Пользователь |
| `dmitry@mail.com` | `123456` | Пользователь |
| `elena@mail.com` | `123456` | Пользователь |

---

## ✅ Возможности

### Для пользователей

- Создание и редактирование заявок на гранты (9 секций формы)
- Валидация формы с подсветкой ошибок в оглавлении
- **Валидация всех полей плана проекта** (задача, мероприятие, описание, даты, результат, форма фиксации)
- **Исправленный ввод бюджета** (свободное удаление текста в поле "Кол-во", валидация при потере фокуса)
- Загрузка согласий на обработку персональных данных (до 5 файлов на участника)
- Загрузка дополнительных материалов (drag & drop, до 10 файлов)
- Валидация дат плана проекта (start ≤ end)
- Валидация бюджета (точное равенство стоимости и финансирования)
- Отслеживание статуса заявки
- Просмотр справочных документов

### Для администраторов

- Управление пользователями (CRUD)
- Управление экспертами (CRUD)
- Назначение экспертов на заявки
- Изменение статусов заявок
- **Фильтрация и сортировка заявок** (по дате, ID, статусу, направлению, **конкурсу**, эксперту, без экспертов)
- **Отображение конкурсов (тендеров)** в таблице и карточках заявок
- Просмотр статистики и отчётность
- Управление документами (загрузка, редактирование, удаление)
- Визуальное отличие: фиолетовый хедер + бейдж "Admin"
- **Кнопка создания новой заявки** в навигационной панели

### Экспертиза

- Назначение двух экспертов на заявку
- Вердикты с комментариями (approved / rejected)
- Фильтр заявок без назначенных экспертов

---

## 🏗 Технологический стек

| Компонент | Технология |
|-----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| База данных | PostgreSQL |
| Стили | Tailwind CSS |
| Роутинг | React Router v6 |
| Состояние | Zustand |

---

## 📊 Статусы заявок

| Статус | Описание |
|--------|----------|
| Черновик | Заявка в создании, доступно редактирование |
| Подана | Ожидает назначения экспертов |
| На рассмотрении | Эксперты проверяют заявку |
| Одобрена | Заявка одобрена, можно вносить правки |
| Отклонена | Требуется доработка и повторная подача |

---

## 📁 Структура проекта

```
C:\project\src\
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── app.ts
│   └── uploads/
│       ├── documents/      # Файлы доп. материалов заявок
│       └── templates/      # Шаблоны документов
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ApplicationForm/
│       │   │   ├── _1_BasicInfoSection/
│       │   │   ├── _2_TeamMembersSection/
│       │   │   ├── _3_CoordinatorsSection/
│       │   │   ├── _4_DobroResponsibleSection/
│       │   │   ├── _5_ProjectDescriptionSection/
│       │   │   ├── _6_ProjectPlanSection/
│       │   │   ├── _7_ProjectResultsSection/
│       │   │   ├── _8_ProjectBudgetSection/
│       │   │   ├── _9_AdditionalMaterialsSection/
│       │   │   └── TableOfContents/
│       │   ├── admin-panel/
│       │   │   ├── ApplicationsList/       # Рефакторинг: модули (types, hook, components)
│       │   │   │   ├── ApplicationsList.tsx
│       │   │   │   ├── ApplicationsListCard.tsx
│       │   │   │   ├── ApplicationsListFilters.tsx
│       │   │   │   ├── ApplicationsListControls.tsx
│       │   │   │   ├── useApplicationsList.ts
│       │   │   │   ├── types.ts
│       │   │   │   └── ApplicationsList.css
│       │   │   ├── AdminApplicationsTable/
│       │   │   │   ├── index.tsx
│       │   │   │   └── AdminApplicationsTable.css
│       │   │   └── ...
│       │   ├── common/                   # Общие компоненты
│       │   │   └── main-navigation.tsx    # + кнопка "Новая заявка"
│       │   ├── showcase/           # UI Showcase компоненты
│       │   └── UserPanel/
│       ├── hooks/
│       │   └── use-application-form.ts
│       ├── pages/
│       ├── services/
│       ├── utils/
│       │   └── documentHelpers.ts  # Общие утилиты для документов
│       └── types/
├── scripts/
│   ├── migrations/
│   │   ├── 001_Init.sql
│   │   ├── 002_AddRoles.sql
│   │   ├── 003_AddStatusFlags.sql
│   │   ├── 004_AddExperts.sql
│   │   ├── 005_AddDobroLink.sql
│   │   ├── 005_AddDocuments.sql
│   │   ├── 006_DocumentsFilePath.sql
│   │   └── 007_TeamMemberConsent.sql
│   ├── seed_data.sql
│   ├── seed-docs.js          # Создание тестовых файлов
│   ├── migrate.js
│   └── seed.js
└── .gitignore
```

---

## 🔧 Конфигурация

### Backend (.env)

```bash
BACKEND_PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=grants_crm
DB_PASSWORD=postgres
DB_PORT=5432
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

---

## 🗄️ Миграции БД

| Файл | Описание |
|------|----------|
| `001_Init.sql` | Инициализация основных таблиц (включает **tenders** и **directions**) |
| `002_AddRoles.sql` | Роли пользователей |
| `003_AddStatusFlags.sql` | Флаги статусов заявок |
| `004_AddExperts.sql` | Эксперты, вердикты, поля expert_1/2 |
| `005_AddDobroLink.sql` | Поле dobro_link в dobro_responsible |
| `005_AddDocuments.sql` | Таблицы documents, document_categories |
| `006_DocumentsFilePath.sql` | Поле file_path в documents (вместо BYTEA) |
| `007_TeamMemberConsent.sql` | Поля consent_file, is_minor в team_members |
| `008_CoordinatorDobroAsTeamMember.sql` | Координатор и ответственный DOBRO как team_member |
| `009_TeamMemberConsentFiles.sql` | Файлы согласий членов команды (consent_files string[]) |

---

## 🧩 Архитектурные решения

### Хранение файлов документов
Файлы хранятся на диске (`backend/uploads/{documents,templates}`), в БД — только путь, имя и метаданные. Это позволяет:
- Избежать раздувания БД (BYTEA → VARCHAR)
- Использовать `res.download()` для отдачи файлов
- Автоматическое удаление старых файлов при обновлении/удалении документа

### Валидация формы заявки
- **TableOfContents** — сайдбар с навигацией по 9 секциям, подсветка текущей секции при скролле, индикация ошибок (`!`)
- На экранах < 1024px — кнопка-бургер с бейджем количества ошибок, плавающий сайдбар с overlay
- **use-application-form** — `validate()` возвращает `{ valid, errorCount, errorKeys }`, после ошибки — скролл к первому проблемному полю + toast-уведомление

### Роуты Express — порядок важен
Маршруты `documentRoutes` должны идти **перед** `adminRoutes`, иначе `/api/documents/:id` конфликтует с `/api/admin/:resource`.

### Тост-уведомления
Контекст `ToastContext` (вместо `alert`) — единый механизм уведомлений: `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`.

---

## 📂 Новые папки (после рефакторинга)

| Путь | Назначение |
|------|------------|
| `frontend/public/` | Статические файлы (favicon.ico) |
| `frontend/src/components/showcase/` | UI Showcase (user-header, стили) |
| `frontend/src/context/` | React-контексты (toast-context) |
| `frontend/src/utils/` | Общие утилиты (documentHelpers: formatFileSize, downloadDocument) |
| `backend/uploads/documents/` | Файлы доп. материалов заявок |
| `backend/uploads/templates/` | Шаблоны документов |

---

## 📝 Примечания для разработки

### Известные ограничения
1. **CoordinatorsSection** и **DobroResponsibleSection** — сейчас выбирают из `team_members` ( FK `team_member_id`), файлы согласий не загружаются (нет полей в БД)
2. **AdditionalMaterialsSection** — файлы хранятся в состоянии как `string[]` (имена), реальная отправка на сервер не реализована
3. Для полноценной загрузки файлов нужен endpoint `POST /api/applications/:id/files` и таблица `application_files`

### Команды проверки качества
```bash
# TypeScript — бэкенд
cd backend && npm run build

# TypeScript — фронтенд
cd frontend && npm run type-check

# Линтинг фронтенда
cd frontend && npm run lint
```

### Порты
| Сервер | Порт |
|--------|------|
| Backend (Express) | 3001 |
| Frontend (Vite) | 5173 |
