import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

// Инициализация Express
const app = express();

// Middleware
app.use(helmet()); // Защита заголовков
app.use(cors()); // Разрешение CORS
app.use(morgan('dev')); // Логирование запросов
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Базовый маршрут для проверки работы сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Подключение маршрутов
import applicationRoutes from './routes/applicationRoutes';
app.use('/api', applicationRoutes);

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
  console.log(`Server is running on port ${PORT}`);
});

export default app;
