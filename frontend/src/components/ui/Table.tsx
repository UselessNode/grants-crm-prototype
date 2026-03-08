import React from 'react';

export interface TableColumn<T = any> {
  field: keyof T | 'actions';
  header: React.ReactNode;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface TableProps<T = any> {
  /** Колонки таблицы */
  columns: TableColumn<T>[];
  /** Данные для отображения (для режима просмотра) */
  data?: T[];
  /** Класс контейнера таблицы */
  containerClassName?: string;
  /** Класс таблицы */
  className?: string;
  /** Пустое состояние */
  emptyState?: React.ReactNode;
  /** Подвал таблицы */
  footer?: React.ReactNode;
  /** Дети (для режима редактирования с кастомной разметкой) */
  children?: React.ReactNode;
}

/**
 * Универсальный компонент таблицы
 * Поддерживает два режима работы:
 * 1. Режим просмотра (data) — для отображения списков (заявки, пользователи и т.д.)
 * 2. Режим редактирования (children) — для интерактивных таблиц с полями ввода
 */
export function Table<T = any>({
  columns,
  data,
  containerClassName,
  className = 'table',
  emptyState,
  footer,
  children,
}: TableProps<T>) {
  // Режим просмотра с данными
  if (data) {
    return (
      <div className={`table-container ${containerClassName || ''}`}>
        <table className={className}>
          <thead className="table-header">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.field)}
                  className={`th ${col.className || ''}`}
                  style={{
                    width: col.width,
                    minWidth: col.minWidth,
                    maxWidth: col.maxWidth,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tbody">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-state">
                  {emptyState || 'Данные отсутствуют'}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={(item as any).id || index} className="table-row">
                  {columns.map((col) => (
                    <td
                      key={String(col.field)}
                      className={`td ${col.className || ''}`}
                    >
                      {col.render ? col.render(item, index) : (item[col.field] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {footer && (
            <tfoot className="table-footer">
              {footer}
            </tfoot>
          )}
        </table>
      </div>
    );
  }

  // Режим редактирования с кастомными детьми
  return (
    <div className={`table-container ${containerClassName || ''}`}>
      <table className={className}>
        <thead className="table-header">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.field)}
                className={`th ${col.className || ''}`}
                style={{
                  width: col.width,
                  minWidth: col.minWidth,
                  maxWidth: col.maxWidth,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        {children}
        {footer && (
          <tfoot className="table-footer">
            {footer}
          </tfoot>
        )}
      </table>
    </div>
  );
}

/**
 * Компонент пустой строки таблицы
 */
export function TableEmptyState({
  colSpan,
  children,
}: {
  colSpan?: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="table-empty-state">
        <div className="table-empty-content">
          <svg className="table-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p className="table-empty-text">{children}</p>
        </div>
      </td>
    </tr>
  );
}

/**
 * Компонент разделителя строк
 */
export function TableDivider({ colSpan }: { colSpan?: number }) {
  return (
    <tr className="table-divider-row">
      <td colSpan={colSpan} className="table-divider"></td>
    </tr>
  );
}

/**
 * Компонент строки добавления
 */
export function TableAddRow({
  colSpan,
  onAdd,
  label = 'Добавить',
}: {
  colSpan?: number;
  onAdd: () => void;
  label?: string;
}) {
  return (
    <tr className="table-add-row">
      <td colSpan={colSpan} className="td-add">
        <button type="button" onClick={onAdd} className="btn-add-icon-sm">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          {label}
        </button>
      </td>
    </tr>
  );
}
