/**
 * Утилиты для работы с числами
 * Помогают избежать ошибок с null/undefined значениями
 */

/**
 * Преобразует значение в число, возвращая 0 для null/undefined
 */
export const toNumber = (value: number | null | undefined): number => {
  return value ?? 0;
};

/**
 * Форматирует число для отображения в поле ввода
 * Пустая строка для 0, иначе строковое представление
 */
export const formatNumber = (value: number | null | undefined): string => {
  const num = toNumber(value);
  return num === 0 ? '' : num.toString();
};

/**
 * Форматирует число для отображения в поле ввода с плавающей точкой
 */
export const formatDecimal = (value: number | null | undefined): string => {
  const num = toNumber(value);
  return num === 0 ? '' : num.toString();
};

/**
 * Форматирует число для отображения в поле ввода целого числа
 */
export const formatInteger = (value: number | null | undefined): string => {
  const num = toNumber(value);
  return num === 0 ? '' : num.toString();
};

/**
 * Безопасное сложение чисел
 */
export const safeSum = (...values: Array<number | null | undefined>): number => {
  return values.reduce((sum: number, val) => sum + toNumber(val), 0);
};

/**
 * Безопасное умножение чисел
 */
export const safeMultiply = (
  a: number | null | undefined,
  b: number | null | undefined
): number => {
  return toNumber(a) * toNumber(b);
};

/**
 * Форматирует число для отображения с фиксированным количеством знаков
 */
export const formatFixed = (
  value: number | null | undefined,
  decimals: number = 2
): string => {
  const num = toNumber(value);
  return num === 0 ? '' : num.toFixed(decimals);
};

/**
 * Форматирует валюту (рубли)
 */
export const formatCurrency = (
  value: number | null | undefined,
  showZero: boolean = false
): string => {
  const num = toNumber(value);
  if (num === 0 && !showZero) return '';
  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
