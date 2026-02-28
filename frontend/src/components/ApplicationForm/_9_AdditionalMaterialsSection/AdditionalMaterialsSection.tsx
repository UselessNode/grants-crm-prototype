import { useState } from 'react';
import type { AdditionalMaterial } from '../../../utils/types';
import './AdditionalMaterialsSection.css';

interface AdditionalMaterialsSectionProps {
  additional_materials: AdditionalMaterial[];
}

export function AdditionalMaterialsSection({
  additional_materials,
}: AdditionalMaterialsSectionProps) {
  const [isDragging, setIsDragging] = useState(false);

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
    // TODO: Реализовать обработку загружаемых файлов
    console.log('Файлы для загрузки:', e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Реализовать обработку выбранных файлов
    console.log('Выбранные файлы:', e.target.files);
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
          Максимальный размер файла: 10 МБ
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

      {/* Список загруженных файлов */}
      {additional_materials.length === 0 ? (
        <div className="AdditionalMaterialsSection__text-muted AdditionalMaterialsSection__dark-text-muted mt-4">
          Файлы будут добавлены после сохранения заявки
        </div>
      ) : (
        <div className="AdditionalMaterialsSection__space-y mt-4">
          {additional_materials.map((file, idx) => (
            <div key={idx} className="AdditionalMaterialsSection__item AdditionalMaterialsSection__item-content">
              <div>
                <div className="AdditionalMaterialsSection__item-label">{file.file_name}</div>
                {file.comment && <div className="text-sm text-gray-500 dark:text-gray-400">{file.comment}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
