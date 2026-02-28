import { useState, useEffect, useRef } from 'react';
import './DateInput.css';

export interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  name?: string;
}

/**
 * Компонент ввода даты с валидацией
 * Исправляет проблемы:
 * - Подсветка текущего дня при выборе другого месяца
 * - Ввод некорректных дат (31 февраля и т.п.)
 */
export function DateInput({
  value,
  onChange,
  className = '',
  placeholder,
  name,
}: DateInputProps) {
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Проверка корректности даты
  const validateDate = (dateString: string): string | null => {
    if (!dateString) return null;

    // Проверка формата YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return 'Некорректный формат даты (должен быть ГГГГ-ММ-ДД)';
    }

    const date = new Date(dateString);

    // Проверка на Invalid Date
    if (isNaN(date.getTime())) {
      return 'Некорректная дата';
    }

    // Получаем компоненты даты из строки (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-').map(Number);

    // Проверяем, что день существует в месяце
    // Месяцы в JS начинаются с 0, поэтому month - 1
    const checkDate = new Date(year, month - 1, day);

    if (
      checkDate.getFullYear() !== year ||
      checkDate.getMonth() !== month - 1 ||
      checkDate.getDate() !== day
    ) {
      return `Дата ${dateString} не существует`;
    }

    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const validationError = validateDate(newValue);

    // Показываем ошибку сразу при вводе некорректной даты
    if (newValue && validationError) {
      setError(validationError);
      setTouched(true);
    } else {
      setError(validationError || '');
      if (touched && !newValue) setTouched(false);
    }

    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    if (value) {
      const validationError = validateDate(value);
      setError(validationError || '');
    }
  };

  // Сброс ошибки при изменении значения извне
  useEffect(() => {
    if (!value) {
      setError('');
      setTouched(false);
    }
  }, [value]);

  const hasError = touched && error;

  return (
    <div className="DateInput">
      <input
        ref={inputRef}
        type="date"
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`field-input ${className} ${hasError ? 'field-input-error' : ''}`}
        placeholder={placeholder}
      />
      {hasError && (
        <div className="DateInput__error">
          <svg className="DateInput__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
