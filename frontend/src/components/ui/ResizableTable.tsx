import { useRef, useState, useCallback } from 'react';
import './ResizableTable.css';

export interface ColumnConfig {
  field: string;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export interface ResizableTableProps {
  columns: ColumnConfig[];
  children: React.ReactNode;
  className?: string;
}

/**
 * Таблица с изменяемой шириной столбцов
 */
export function ResizableTable({
  columns,
  children,
  className = '',
}: ResizableTableProps) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    columns.reduce((acc, col) => {
      acc[col.field] = col.width || 0;
      return acc;
    }, {} as Record<string, number>)
  );

  const resizingRef = useRef<{
    column: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, column: string, currentWidth: number) => {
      e.preventDefault();
      resizingRef.current = {
        column,
        startX: e.clientX,
        startWidth: currentWidth,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return;

        const diff = moveEvent.clientX - resizingRef.current.startX;
        const newWidth = Math.max(
          columns.find((c) => c.field === column)?.minWidth || 100,
          resizingRef.current.startWidth + diff
        );

        const maxWidth = columns.find((c) => c.field === column)?.maxWidth;
        const finalWidth = maxWidth ? Math.min(newWidth, maxWidth) : newWidth;

        setColumnWidths((prev) => ({
          ...prev,
          [column]: finalWidth,
        }));
      };

      const handleMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [columns]
  );

  const getColumnWidth = (col: ColumnConfig): string => {
    const width = columnWidths[col.field] || col.width;
    if (width) return `${width}px`;
    return col.width ? `${col.width}px` : 'auto';
  };

  return (
    <div className={`ResizableTable ${className}`}>
      <table className="ResizableTable__table">
        <colgroup>
          {columns.map((col) => (
            <col
              key={col.field}
              style={{ width: getColumnWidth(col) }}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.field}
                className={`th ResizableTable__th ${col.className || ''}`}
              >
                {col.header}
                {index < columns.length - 1 && (
                  <div
                    className="ResizableTable__resizer"
                    onMouseDown={(e) =>
                      handleMouseDown(e, col.field, columnWidths[col.field] || col.width || 0)
                    }
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        {children}
      </table>
    </div>
  );
}
