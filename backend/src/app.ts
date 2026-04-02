import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

// Инициализация Express
const app = express();

// Middleware
app.use(helmet()); // Защита заголовков
app.use(cors()); // Разрешение CORS

// Логирование только ошибок (4xx и 5xx)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const status = res.statusCode;
    if (status >= 400) {
      const duration = Date.now() - start;
      console.error(`[ERROR] ${req.method} ${req.url} ${status} - ${duration}ms`);
    }
  });
  next();
});

// Установка кодировки UTF-8 для всех ответов
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Базовый маршрут для проверки работы сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Подключение маршрутов
import authRoutes from './routes/auth-routes';
import applicationRoutes from './routes/application-routes';
import adminRoutes from './routes/admin-routes';
import documentRoutes from './routes/document-routes';

app.use('/api', authRoutes);
app.use('/api', applicationRoutes);
app.use('/api', adminRoutes);
app.use('/api', documentRoutes);

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден',
  });
});

// Обработка ошибок
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера',
    error: err.message,
  });
});

// Порт из переменных окружения или по умолчанию
const PORT = process.env.BACKEND_PORT || 3001;

// Запуск сервера
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log('========================================');
  console.log('📝 Тестовые учётные данные:');
  console.log('----------------------------------------');
  console.log('👤 Администратор:');
  console.log('   Email: admin@crm.test');
  console.log('   Пароль: 123456');
  console.log('----------------------------------------');
  console.log('👤 Обычный пользователь:');
  console.log('   Email: anna@mail.com');
  console.log('   Пароль: 123456');
  console.log('========================================\n');
});

export default app;
