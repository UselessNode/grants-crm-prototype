import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { httpLogger, logger } from './utils/logger';
import { constants } from './config/database';
import authRoutes from './routes/auth-routes';
import expertRoutes from './routes/expert-routes';
import applicationRoutes from './routes/application-routes';
import documentRoutes from './routes/document-routes';
import adminRoutes from './routes/admin-routes';
import applicationFilesRoutes from './routes/application-files-routes';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключаем чистый HTTP-логгер
app.use(httpLogger);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api', authRoutes);

app.use('/api', applicationRoutes);
app.use('/api', expertRoutes);
app.use('/api', adminRoutes);
app.use('/api', documentRoutes);
app.use('/api', applicationFilesRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Маршрут не найден' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Ошибка сервера');
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера',
    error: err.message,
  });
});

const PORT = process.env.BACKEND_PORT || 3001;

const startServer = async () => {
  try {
    await constants.load();
    app.listen(PORT, () => {
      logger.info(`🚀 Сервер запущен на порту ${PORT}`);
      logger.info('Администратор: admin1@test.ru / 123456');
      logger.info('Эксперт: expert1@test.ru / 123456');
      logger.info('Пользователь: user1@test.ru / 123456');
    });
  } catch (error) {
    logger.error({ error }, 'Ошибка запуска сервера');
    process.exit(1);
  }
};

startServer();

export default app;
