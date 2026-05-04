import { useState } from 'react';
import { useToast } from '../../../context/toast-context';
import type { AdditionalMaterial } from '../../../types';
import './AdditionalMaterialsSection.css';

interface AdditionalMaterialsSectionProps {
  additional_materials: AdditionalMaterial[];
  onFilesAdded?: (files: { file_name: string; comment: string }[]) => void;
  onFileRemoved?: (index: number) => void;
}

const MAX_FILES = 10;
const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
];

export function AdditionalMaterialsSection({
  additional_materials,
  onFilesAdded,
  onFileRemoved,
}: AdditionalMaterialsSectionProps) {
  const toast = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ name: string; size: number }[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    // Сброс value для повторного выбора
    (e.target as HTMLInputElement).value = '';
  };

  const processFiles = (fileList: FileList) => {
    const files = Array.from(fileList);

    // Проверка количества
    const totalFiles = pendingFiles.length + additional_materials.length;
    if (totalFiles + files.length > MAX_FILES) {
      toast.warning('Внимание', `Максимум ${MAX_FILES} файлов. Уже загружено: ${totalFiles}`);
      return;
    }

    // Проверка размера и формата
    const validFiles: { name: string; size: number }[] = [];
    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error('Ошибка размера', `Файл "${file.name}" превышает ${MAX_SIZE_MB} МБ`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|xls|xlsx|doc|docx|ppt|pptx|odt)$/i)) {
        toast.error('Ошибка формата', `Файл "${file.name}" имеет недопустимый формат`);
        continue;
      }
      validFiles.push({ name: file.name, size: file.size });
    }

    if (validFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...validFiles]);
      onFilesAdded?.(validFiles.map(f => ({ file_name: f.name, comment: '' })));
    }
  };

  const handleRemovePending = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
    onFileRemoved?.(additional_materials.length + index);
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="section-card AdditionalMaterialsSection">
      <h2 className="section-title">
        9. Дополнительные материалы
      </h2>
      <div className="AdditionalMaterialsSection__text AdditionalMaterialsSection__dark-text mb-4">
        Допустимые форматы: *.pdf, *.xls, *.xlsx, *.doc, *.docx, *.ppt, *.pptx, *.odt
      </div>

      {/* Зона загрузки файлов */}
      <div
        className={`AdditionalMaterialsSection__dropzone ${isDragging ? 'AdditionalMaterialsSection__dropzone--dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg className="AdditionalMaterialsSection__dropzone-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <p className="AdditionalMaterialsSection__dropzone-text">
          Перетащите файлы сюда или нажмите для выбора
        </p>
        <p className="AdditionalMaterialsSection__dropzone-hint">
          Максимум {MAX_FILES} файлов, до {MAX_SIZE_MB} МБ каждый
        </p>
        <input
          type="file"
          id="file-upload"
          className="AdditionalMaterialsSection__file-input"
          multiple
          accept=".pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx,.odt"
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload" className="btn-header mt-2">
          Выбрать файлы
        </label>
      </div>

      {/* Ожидают сохранения (новые файлы) */}
      {pendingFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Новые файлы (будут сохранены при отправке):</h3>
          <div className="AdditionalMaterialsSection__space-y">
            {pendingFiles.map((file, idx) => (
              <div key={idx} className="AdditionalMaterialsSection__item AdditionalMaterialsSection__item-content AdditionalMaterialsSection__item--pending">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePending(idx)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex-shrink-0"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Сохранённые файлы */}
      {additional_materials.length === 0 && pendingFiles.length === 0 ? (
        <div className="AdditionalMaterialsSection__text-muted AdditionalMaterialsSection__dark-text-muted mt-4">
          Файлы ещё не добавлены
        </div>
      ) : additional_materials.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Сохранённые файлы:</h3>
          <div className="AdditionalMaterialsSection__space-y">
            {additional_materials.map((file, idx) => (
              <div key={idx} className="AdditionalMaterialsSection__item AdditionalMaterialsSection__item-content">
                <div>
                  <div className="AdditionalMaterialsSection__item-label">{file.file_name}</div>
                  {file.comment && <div className="text-sm text-gray-500">{file.comment}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
