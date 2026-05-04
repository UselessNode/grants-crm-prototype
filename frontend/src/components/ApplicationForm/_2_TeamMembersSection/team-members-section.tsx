import { useState, useEffect } from 'react';
import { useToast } from '../../../context/toast-context';
import type { TeamMember, Document } from '../../../types';
import { adminService } from '../../../services/adminService';
import './TeamMembersSection.css';
import { Icon } from '../../common/icon';

interface TeamMembersSectionProps {
  team_members: TeamMember[];
  errors: Record<string, string>;
  onChange: (index: number, field: keyof TeamMember, value: string | boolean | null | string[]) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function TeamMembersSection({
  team_members,
  errors,
  onChange,
  onAdd,
  onRemove,
}: TeamMembersSectionProps) {
  const toast = useToast();
  const [consentTemplates, setConsentTemplates] = useState<{
    adult: Document | null;
    minor: Document | null;
  }>({ adult: null, minor: null });
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    loadConsentTemplates();
  }, []);

  const loadConsentTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const [adultResponse, minorResponse] = await Promise.all([
        adminService.getTemplates('consent_adult').catch(() => ({ data: [] })),
        adminService.getTemplates('consent_minor').catch(() => ({ data: [] })),
      ]);
      setConsentTemplates({
        adult: adultResponse.data[0] || null,
        minor: minorResponse.data[0] || null,
      });
    } catch (err) {
      console.error('Error loading consent templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleFileChange = (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentFiles = team_members[index].consent_files || [];
    const newFiles = Array.from(files);

    // Ограничение: максимум 5 файлов
    const availableSlots = 5 - currentFiles.length;
    if (availableSlots <= 0) {
      toast.warning('Внимание', 'Максимум 5 файлов на участника');
      return;
    }

    const filesToAdd = newFiles.slice(0, availableSlots);
    const updatedFiles = [...currentFiles, ...filesToAdd.map(f => f.name)];
    onChange(index, 'consent_files', updatedFiles);
  };

  const handleRemoveFile = (index: number, fileIndex: number) => {
    const currentFiles = team_members[index].consent_files || [];
    const updatedFiles = currentFiles.filter((_, i) => i !== fileIndex);
    onChange(index, 'consent_files', updatedFiles);
  };

  const handleDownloadTemplate = async (type: 'adult' | 'minor') => {
    const template = type === 'adult' ? consentTemplates.adult : consentTemplates.minor;
    if (!template) return;

    try {
      const blob = await adminService.downloadDocument(template.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = template.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading template:', err);
    }
  };

  return (
    <div className="section-card TeamMembersSection">
      <div className="TeamMembersSection__header">
        <h2 className="section-title">
          2. Состав команды проекта
        </h2>
        <div className="TeamMembersSection__info">
          <Icon name="info" size={16} className="text-blue-600" />
          <p className="text-sm text-gray-600">
            Для каждого участника команды необходимо загрузить согласие на обработку персональных данных
          </p>
        </div>
        <div className="TeamMembersSection__samples">
          <span className="text-sm font-medium text-gray-700">Образцы согласий:</span>
          {loadingTemplates ? (
            <span className="text-sm text-gray-500">Загрузка...</span>
          ) : (
            <>
              <button
                type="button"
                disabled={!consentTemplates.adult}
                className={`text-sm hover:underline inline-flex items-center gap-1 ${
                  consentTemplates.adult
                    ? 'text-blue-600 hover:text-blue-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => handleDownloadTemplate('adult')}
              >
                <Icon name="download" size={14} />
                Для совершеннолетних (14+)
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                disabled={!consentTemplates.minor}
                className={`text-sm hover:underline inline-flex items-center gap-1 ${
                  consentTemplates.minor
                    ? 'text-blue-600 hover:text-blue-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                onClick={() => handleDownloadTemplate('minor')}
              >
                <Icon name="download" size={14} />
                Для несовершеннолетних (до 14)
              </button>
            </>
          )}
        </div>
      </div>
      {team_members.map((member, idx) => (
        <div key={idx} className="TeamMembersSection__item">
          <div className="TeamMembersSection__item-header">
            <span className="item-label">Участник #{idx + 1}</span>
            {team_members.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="btn-remove"
              >
                Удалить
              </button>
            )}
          </div>
          <div className="TeamMembersSection__grid">
            <div>
              <label className="field-label">
                Фамилия <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={member.surname}
                onChange={(e) => onChange(idx, 'surname', e.target.value)}
                className={`field-input ${errors[`team_member_${idx}`] ? 'field-input-error' : ''}`}
                placeholder="Иванов"
              />
              {errors[`team_member_${idx}`] && <p className="field-error">{errors[`team_member_${idx}`]}</p>}
            </div>
            <div>
              <label className="field-label">
                Имя <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={member.name}
                onChange={(e) => onChange(idx, 'name', e.target.value)}
                className={`field-input ${errors[`team_member_${idx}_name`] ? 'field-input-error' : ''}`}
                placeholder="Иван"
              />
            </div>
            <div>
              <label className="field-label">Отчество</label>
              <input
                type="text"
                value={member.patronymic || ''}
                onChange={(e) => onChange(idx, 'patronymic', e.target.value)}
                className="field-input"
                placeholder="Иванович"
              />
            </div>
          </div>
          <div className="TeamMembersSection__grid TeamMembersSection__mt">
            <div>
              <label className="field-label">Задачи в проекте</label>
              <input
                type="text"
                value={member.tasks_in_project || ''}
                onChange={(e) => onChange(idx, 'tasks_in_project', e.target.value)}
                className="field-input"
                placeholder="Разработчик, дизайнер..."
              />
            </div>
            <div>
              <label className="field-label">Контактные данные</label>
              <input
                type="text"
                value={member.contact_info || ''}
                onChange={(e) => onChange(idx, 'contact_info', e.target.value)}
                className="field-input"
                placeholder="Телефон, email"
              />
            </div>
            <div>
              <label className="field-label">Соц. сети</label>
              <input
                type="text"
                value={member.social_media_links || ''}
                onChange={(e) => onChange(idx, 'social_media_links', e.target.value)}
                className="field-input"
                placeholder="VK, Telegram..."
              />
            </div>
          </div>

          {/* Согласие на обработку персональных данных */}
          <div className="TeamMembersSection__consent TeamMembersSection__mt">
            <div className="TeamMembersSection__consent-header">
              <label className="field-label-lg">
                <Icon name="document" size={16} className="inline mr-1" />
                Согласие на обработку персональных данных <span className="required-mark">*</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={member.is_minor || false}
                    onChange={(e) => onChange(idx, 'is_minor', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">Несовершеннолетний (до 14 лет)</span>
                </label>
              </div>
            </div>

            <div className="TeamMembersSection__consent-upload">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(idx, e.target.files)}
                onClick={(e) => {
                  // Сбрасываем value, чтобы при отмене не было проблем
                  (e.target as HTMLInputElement).value = '';
                }}
                className="block w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0
                         file:text-sm file:font-medium
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-2">
                Форматы: PDF, JPG, PNG. Максимум 5 файлов, до 5 МБ каждый
              </p>
              {team_members[idx].consent_files && team_members[idx].consent_files.length > 0 && (
                <div className="TeamMembersSection__consent-files">
                  {team_members[idx].consent_files.map((fileName, fileIdx) => (
                    <div key={fileIdx} className="TeamMembersSection__consent-file">
                      <Icon name="check" size={16} className="text-green-600" />
                      <span className="text-sm text-gray-700 truncate flex-1">{fileName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx, fileIdx)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium ml-auto"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="btn-add"
      >
        + Добавить участника
      </button>
    </div>
  );
}
