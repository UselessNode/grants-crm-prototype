// THIS IS CORRECT

import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Table, type TableColumn } from '../../ui/table';
import { Icon } from '../../common/icon';
import type { Document } from '../../../types';
import { formatFileSize } from '../../../utils/documentHelpers';

type AdminDocumentsTableProps = {
  documents: Document[];
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onDownload: (doc: Document) => void;
};

export function AdminDocumentsTable({
  documents,
  onEdit,
  onDelete,
  onDownload,
}: AdminDocumentsTableProps) {
  const columns: TableColumn<Document>[] = [
    {
      field: 'id',
      header: 'ID',
      width: 80,
    },
    {
      field: 'title',
      header: 'Название',
      render: (doc) => (
        <div>
          <div className="text-gray-900 font-medium">{doc.title}</div>
          {doc.description && (
            <div className="text-gray-500 text-sm truncate max-w-md">{doc.description}</div>
          )}
        </div>
      ),
    },
    {
      field: 'category_name',
      header: 'Категория',
      render: (doc) => (
        doc.category_name ? (
          <Badge variant="default" size="sm">
            {doc.category_name}
          </Badge>
        ) : (
          <span className="text-gray-400">—</span>
        )
      ),
    },
    {
      field: 'file_name',
      header: 'Файл',
      render: (doc) => (
        <div className="text-sm text-gray-500">
          <div>{doc.file_name}</div>
          <div>{formatFileSize(doc.file_size)}</div>
        </div>
      ),
    },
    {
      field: 'is_template',
      header: 'Тип',
      width: 120,
      render: (doc) => (
        doc.is_template ? (
          <Badge variant="info" size="sm">
            Шаблон
          </Badge>
        ) : (
          <Badge variant="default" size="sm">
            Документ
          </Badge>
        )
      ),
    },
    {
      field: 'download_count',
      header: 'Скачиваний',
      width: 100,
      render: (doc) => (
        <span className="text-gray-500">{doc.download_count || 0}</span>
      ),
    },
    {
      field: 'created_at',
      header: 'Дата загрузки',
      width: 120,
      render: (doc) => (
        <span className="text-gray-500">
          {doc.created_at ? new Date(doc.created_at).toLocaleDateString('ru-RU') : '—'}
        </span>
      ),
    },
    {
      field: 'actions',
      header: 'Действия',
      width: 220,
      render: (doc) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(doc)}
            title="Скачать"
          >
            <Icon name="download" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(doc)}
            title="Редактировать"
          >
            <Icon name="edit" size={16} />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(doc)}
            title="Удалить"
          >
            <Icon name="trash" size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={documents} />;
}
