import { Request, Response, NextFunction } from "express";
import { timeStamp } from "node:console";

const now = new Date();

// Format date and time parts
const formatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});


export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timeStamp = formatter.format(now).replace(',', '') + ':' +
                    now.getMilliseconds().toString().padStart(3, '0');
  const method = req.method;
  const url = req.originalUrl || req.url;

  const originalSend = res.send; // Запоминаем оригинальный send.

  res.send = function (body) {
    res.send = originalSend; // Восстанавливаем, чтобы не сломать последующие вызовы.

    const duration = Date.now() - start;
    const status = res.statusCode;

    // Формируем базовое сообщение
    let logMessage = `[${timeStamp}] ${method} ${url} → ${status} (${duration}ms)`;

    // Добавляем информацию о теле/параметрах для изменяющих методов
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (method === 'DELETE' && Object.keys(req.query).length) {
        logMessage += ` | query: ${JSON.stringify(req.query)}`;
      } else if (req.body && Object.keys(req.body).length) {
        const bodyStr = JSON.stringify(req.body);
        // Ограничиваем вывод, чтобы не засорять консоль (первые 200 символов)
        const truncated = bodyStr.length > 200 ? bodyStr.substring(0, 200) + '…' : bodyStr;
        logMessage += ` | body: ${truncated}`;
      }
    }

    // Цветовое выделение в зависимости от статуса
    if (status >= 500) {
      console.error(`🔴 ${logMessage}`);
    } else if (status >= 400) {
      console.warn(`🟡 ${logMessage}`);
    } else {
      console.log(`🟢 ${logMessage}`);
    }

    // Вызываем оригинальный send
    return originalSend.call(this, body);
  };
  next();
};
