import type { User } from '../store/authStore';
import type { Application, Direction, Status, Tender } from '../utils/types';

/**
 * Моковые пользователи
 */
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@example.com',
    surname: 'Админов',
    name: 'Админ',
    patronymic: 'Админович',
    full_name: 'Админов Админ Админович',
    role: 'admin',
  },
  {
    id: 2,
    email: 'user@example.com',
    surname: 'Пользователей',
    name: 'Пользователь',
    patronymic: 'Пользователевич',
    full_name: 'Пользователей Пользователь Пользователевич',
    role: 'user',
  },
];

/**
 * Моковые направления
 */
export const mockDirections: Direction[] = [
  { id: 1, name: 'Образование', description: 'Проекты в сфере образования и просвещения' },
  { id: 2, name: 'Культура', description: 'Культурные и творческие проекты' },
  { id: 3, name: 'Экология', description: 'Экологические инициативы' },
  { id: 4, name: 'Спорт', description: 'Спортивные мероприятия и ЗОЖ' },
  { id: 5, name: 'Наука', description: 'Научные исследования и разработки' },
  { id: 6, name: 'Волонтёрство', description: 'Добровольческая деятельность' },
  { id: 7, name: 'Социальное проектирование', description: 'Социально значимые проекты' },
];

/**
 * Моковые статусы
 */
export const mockStatuses: Status[] = [
  { id: 1, name: 'Черновик', description: 'Заявка находится в процессе заполнения' },
  { id: 2, name: 'Подана', description: 'Заявка подана на рассмотрение' },
  { id: 3, name: 'На рассмотрении', description: 'Заявка на рассмотрении у координаторов' },
  { id: 4, name: 'Одобрена', description: 'Заявка одобрена' },
  { id: 5, name: 'Отклонена', description: 'Заявка отклонена' },
];

/**
 * Моковые тендеры
 */
export const mockTenders: Tender[] = [
  { id: 1, name: 'Грант 2026', description: 'Ежегодный грант на социальные проекты 2026' },
  { id: 2, name: 'Молодёжные инициативы', description: 'Конкурс для молодёжных проектов' },
  { id: 3, name: 'Волонтёрство 2026', description: 'Поддержка волонтёрских движений' },
];

/**
 * Моковые заявки
 */
export const mockApplications: Application[] = [
  {
    id: 1,
    title: 'Развитие цифровых компетенций у школьников',
    tender_id: 1,
    direction_id: 1,
    status_id: 4,
    idea_description: 'Создание сети IT-кружков в сельских школах',
    importance_to_team: 'Мы верим, что каждый ребёнок должен иметь доступ к качественному IT-образованию',
    project_goal: 'Обучить 500 школьников основам программирования за год',
    project_tasks: 'Открыть 10 кружков, подготовить методические материалы, провести финальный хакатон',
    implementation_experience: 'Наша команда уже 3 года проводит образовательные программы',
    results_description: 'Запущенные кружки, сертифицированные выпускники, методические пособия',
    created_at: '2026-01-15T00:00:00.000Z',
    updated_at: '2026-02-20T00:00:00.000Z',
    submitted_at: '2026-02-01T00:00:00.000Z',
    direction_name: 'Образование',
    status_name: 'Одобрена',
  },
  {
    id: 2,
    title: 'Эко-тропа в городском парке',
    tender_id: 1,
    direction_id: 3,
    status_id: 3,
    idea_description: 'Создание экологической тропы с информационными стендами о местной флоре и фауне',
    importance_to_team: 'Хотим повысить экологическую сознательность горожан',
    project_goal: 'Создать современную эко-тропу протяжённостью 2 км',
    project_tasks: 'Разработать маршрут, установить стенды, провести экскурсию для СМИ',
    implementation_experience: 'Команда включает экологов и дизайнеров',
    results_description: 'Готовая эко-тропа, серия публикаций в СМИ',
    created_at: '2026-02-01T00:00:00.000Z',
    updated_at: '2026-02-25T00:00:00.000Z',
    submitted_at: '2026-02-10T00:00:00.000Z',
    direction_name: 'Экология',
    status_name: 'На рассмотрении',
  },
  {
    id: 3,
    title: 'Молодёжный спортивный фестиваль',
    tender_id: 2,
    direction_id: 4,
    status_id: 2,
    idea_description: 'Ежегодный фестиваль по уличным видам спорта',
    importance_to_team: 'Пропаганда здорового образа жизни среди молодёжи',
    project_goal: 'Привлечь 1000 участников к занятиям спортом',
    project_tasks: 'Организовать соревнования по скейтбордингу, воркауту, брейк-дансу',
    implementation_experience: 'Проводим подобные мероприятия с 2024 года',
    results_description: 'Проведённый фестиваль, охват в соцсетях 50000+',
    created_at: '2026-02-10T00:00:00.000Z',
    updated_at: '2026-02-26T00:00:00.000Z',
    submitted_at: '2026-02-15T00:00:00.000Z',
    direction_name: 'Спорт',
    status_name: 'Подана',
  },
  {
    id: 4,
    title: 'Волонтёры культуры',
    tender_id: 3,
    direction_id: 6,
    status_id: 1,
    idea_description: 'Программа подготовки волонтёров для музеев и театров',
    importance_to_team: 'Развитие культурного волонтёрства в регионе',
    project_goal: 'Подготовить 200 волонтёров культуры',
    project_tasks: 'Разработать программу обучения, провести тренинги, закрепить за учреждениями',
    implementation_experience: null,
    results_description: null,
    created_at: '2026-02-20T00:00:00.000Z',
    updated_at: '2026-02-27T00:00:00.000Z',
    submitted_at: null,
    direction_name: 'Волонтёрство',
    status_name: 'Черновик',
  },
  {
    id: 5,
    title: 'Научный стендап для школьников',
    tender_id: 2,
    direction_id: 5,
    status_id: 5,
    idea_description: 'Популяризация науки через формат научных стендапов',
    importance_to_team: 'Показать, что наука — это интересно и доступно',
    project_goal: 'Провести 10 научных стендапов в 5 городах',
    project_tasks: 'Найти спикеров, организовать площадки, привлечь аудиторию',
    implementation_experience: 'Успешный пилотный проект в 2025 году',
    results_description: null,
    created_at: '2026-01-20T00:00:00.000Z',
    updated_at: '2026-02-15T00:00:00.000Z',
    submitted_at: '2026-01-25T00:00:00.000Z',
    direction_name: 'Наука',
    status_name: 'Отклонена',
  },
];

/**
 * Получить мокового пользователя по email
 */
export function getMockUserByEmail(email: string): User | undefined {
  return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Проверить моковый пароль (для всех пользователей одинаковый)
 */
export function checkMockPassword(password: string): boolean {
  return password === 'test123';
}
