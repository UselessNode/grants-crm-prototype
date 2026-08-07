import { Request, Response, NextFunction } from "express";

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
  const now = new Date();

  // Форматируем время
  const datePart = formatter.format(now).replace(',', '');
  const msPart = now.getMilliseconds().toString().padStart(3, '0');
  const timeStamp = `${datePart}:${msPart}`;

  const method = req.method;
  const url = req.originalUrl || req.url;

  const originalSend = res.send;

  res.send = function (body) {
    res.send = originalSend;

    const duration = Date.now() - start;
    const status = res.statusCode;

    let logMessage = `[${timeStamp}] ${method} ${url} → ${status} (${duration}ms)`;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (method === 'DELETE' && Object.keys(req.query).length) {
        logMessage += ` | query: ${JSON.stringify(req.query)}`;
      } else if (req.body && Object.keys(req.body).length) {
        const bodyStr = JSON.stringify(req.body);
        const truncated = bodyStr.length > 200 ? bodyStr.substring(0, 200) + '…' : bodyStr;
        logMessage += ` | body: ${truncated}`;
      }
    }

    if (status >= 500) {
      console.error(`🔴 ${logMessage}`);
    } else if (status >= 400) {
      console.warn(`🟡 ${logMessage}`);
    } else {
      console.log(`🟢 ${logMessage}`);
    }

    return originalSend.call(this, body);
  };
  next();
};
