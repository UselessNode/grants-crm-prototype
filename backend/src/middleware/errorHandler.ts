import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    statusCode?: number;
}

export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Установка статуса ошибки по умолчанию
    const statusCode = err.statusCode || 500;

    // Установка сообщения ошибки
    const message = err.message || 'Internal Server Error';

    // Отправка ответа с ошибкой
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

// Функция для создания кастомных ошибок
export const createError = (message: string, statusCode: number = 500) => {
    const error = new Error(message) as CustomError;
    error.statusCode = statusCode;
    return error;
};
