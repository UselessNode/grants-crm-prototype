# Grants CRM — Контекст для Qwen Code

## Обзор проекта

**Grants CRM** — это CRM-система для управления заявками на гранты с полным циклом: от создания черновика до экспертизы и финального решения. Проект разработан в учебных целях (студенческий проект) с возможностью дальнейшего развития при финансировании.

### Технологический стек

| Компонент | Технология |
|-----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Стили | Tailwind CSS |
| Роутинг | React Router v6 |
| Состояние | Zustand (+ persist middleware) |
| HTTP-клиент | Axios + TanStack Query |
| Backend | Node.js + Express + TypeScript |
| База данных | PostgreSQL |
| ORM | pg (нативный клиент) |
| Аутентификация | JWT (7-дневные сессии) |
| Хэширование | bcrypt |

## Структура проекта

```
src/
├── frontend/
│   └── src/
│       ├── assets/
│       │   ├── icons/          # SVG иконки
│       │   └── images/         # Изображения
│       ├── components/
│       │   ├── admin-panel/    # Компоненты админ-панели
│       │   ├── ApplicationForm/ # Секции формы заявки
│       │   ├── common/         # Общие компоненты
│       │   │   ├── icon.tsx
│       │   │   ├── logo.tsx
│       │   │   ├── private-route.tsx
│       │   │   └── session-warning-modal.tsx
│       │   ├── layout/         # Layout компоненты
│       │   │   └── user-header.tsx
│       │   ├── ui/             # UI компоненты
│       │   │   ├── badge.tsx
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── date-input.tsx
│       │   │   ├── index.ts
│       │   │   ├── input.tsx
│       │   │   ├── modal.tsx
│       │   │   ├── resizable-table.tsx
│       │   │   ├── table.tsx
│       │   │   ├── toggle-button.tsx
│       │   │   └── toggle-switch.tsx
│       │   └── UserPanel/      # Пользовательская панель
│       │       ├── user-panel-layout.tsx
│       │       └── user-panel-tabs.tsx
│       ├── hooks/
│       │   ├── use-application-form.ts
│       │   └── use-auth.ts
│       ├── pages/
│       │   ├── admin-panel.tsx
│       │   ├── application-form.tsx
│       │   ├── application-view.tsx
│       │   ├── applications-list.tsx
│       │   ├── documents.tsx
│       │   ├── login.tsx
│       │   ├── profile.tsx
│       │   ├── register.tsx
│       │   └── ui-showcase.tsx
│       ├── services/
│       │   ├── adminService.ts
│       │   ├── api.ts
│       │   ├── applicationService.ts
│       │   ├── config.ts
│       │   └── expertService.ts
│       ├── store/
│       │   └── auth-store.ts
│       ├── styles/
│       │   ├── components.css
│       │   ├── global.css
│       │   └── pages/
│       ├── types/
│       │   ├── format.ts
│       │   └── index.ts
│       ├── App.tsx
│       └── main.tsx
├── backend/
│   └── src/
│       ├── controllers/
│       │   ├── admin-controller.ts
│       │   ├── application-controller.ts
│       │   └── auth-controller.ts
│       ├── middleware/
│       │   └── auth.ts
│       ├── models/
│       │   ├── application.ts
│       │   └── user.ts
│       ├── routes/
│       │   ├── admin-routes.ts
│       │   ├── application-routes.ts
│       │   └── auth-routes.ts
│       ├── utils/
│       │   └── jwt.ts
│       ├── config/
│       │   └── database.ts
│       └── app.ts
├── scripts/
│   ├── migrations/
│   ├── reset-db.js
│   ├── migrate.js
│   ├── seed.js
│   └── seed_data.sql
└── .husky/
```

## Сборка и запуск

### Установка зависимостей

```bash
npm install
```

### Режим разработки

```bash
npm run dev
```

### Сборка для продакшена

```bash
npm run build
```

### Запуск продакшен-версии

```bash
npm start
```

### Работа с базой данных

```bash
# Сброс базы данных
npm run db:reset

# Применение миграций
npm run migrate

# Заполнение тестовыми данными
npm run seed

# Сброс + заполнение
npm run db:rebuild
```

## Переменные окружения

### Backend

```bash
BACKEND_PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=grants_crm
DB_PASSWORD=postgres
DB_PORT=5432
```

### Frontend

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

## Тестовые учётные данные

| Email | Пароль | Роль |
|-------|--------|------|
| `admin@crm.test` | `123456` | Администратор |
| `anna@mail.com` | `123456` | Пользователь |
| `ivan@mail.com` | `123456` | Пользователь |

## API Endpoints

### Авторизация (`/api/auth`)

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| POST | `/register` | Регистрация |
| POST | `/login` | Вход |
| GET | `/verify` | Проверка токена |
| GET | `/me` | Профиль |

### Заявки (`/api/applications`)

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/applications` | Список заявок |
| GET | `/applications/:id` | Заявка по ID |
| POST | `/applications` | Создание |
| PUT | `/applications/:id` | Обновление |
| DELETE | `/applications/:id` | Удаление |
| POST | `/applications/:id/submit` | Подать заявку |
| POST | `/applications/:id/verdict` | Вердикт эксперта |
| PUT | `/applications/:id/status` | Изменить статус (админ) |

### Админ-панель (`/api/admin`)

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/admin/users` | Пользователи |
| PUT | `/admin/users/:id` | Обновить пользователя |
| DELETE | `/admin/users/:id` | Удалить пользователя |
| GET | `/admin/experts` | Эксперты |
| POST | `/admin/experts` | Добавить эксперта |
| PUT | `/admin/experts/:id` | Обновить эксперта |
| DELETE | `/admin/experts/:id` | Удалить эксперта |
| GET | `/admin/directions` | Направления |
| GET | `/admin/tenders` | Тендеры |

## Навигация

### Пользовательская панель

- **Заявки** (`/applications`) — список заявок
- **Документы** (`/documents`) — справочные документы
- **Профиль** (`/profile`) — настройки профиля

### Админ-панель

- **Пользователи** — управление пользователями
- **Заявки** — все заявки системы
- **Эксперты** — управление экспертами
- **Справочники** — направления и тендеры

## Правила разработки

1. **Не делать того, что не просили**
2. **Не использовать эмодзи** в коде (кроме README.md, TODO.md)
3. **README.md** держать кратким
4. **Документацию** писать в корне проекта
5. **Комментарии в коде** писать на русском языке

## Сроки

- **Финальная сверка**: 28 марта 2026
- **Итоговый показ**: 4 апреля 2026

## Ссылки

- Репозиторий: https://github.com/UselessNode/grants-crm-prototype
- Документация: `README.md`, `ПЛАН.md`, `TODO.md`
