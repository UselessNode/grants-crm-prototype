import pino from 'pino';
import pinoHttp from 'pino-http';

const isDev = process.env.NODE_ENV === 'development';

// Базовый логгер приложения
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss.l',
          ignore: 'pid,hostname',
          singleLine: true, // Компактный вывод в dev
        },
      }
    : undefined,
});

// HTTP-логгер для Express
export const httpLogger = pinoHttp({
  logger,
  // В dev логируем только ошибки (4xx/5xx), чтобы не засорять консоль успешными запросами
  autoLogging: {
    ignore: (req) => {
      if (!isDev) return false;
      const statusCode = (req as any).res?.statusCode;
      return statusCode && statusCode < 400;
    },
  },
  // Кастомные сообщения для компактности
  customSuccessMessage: (req, res) => `${req.method} ${req.url} → ${res.statusCode}`,
  customErrorMessage: (req, res) => `${req.method} ${req.url} → ${res.statusCode}`,
  // Скрываем чувствительные данные
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["x-api-key"]'],
    censor: '[REDACTED]',
  },
  // Убираем лишние поля из каждого лога запроса
  customProps: () => ({}),
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
