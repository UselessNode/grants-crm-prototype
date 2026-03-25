import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../utils/adminService';
import type { Application, Expert, Status } from '../../utils/types';
import './ApplicationsList.css';

interface ApplicationsListProps {
  applications: (Application & { owner_email?: string; owner_name?: string })[];
  experts: Expert[];
  statuses: Status[];
  onExpertsAssigned?: () => void;
  onStatusChanged?: () => void;
}

interface FilterState {
  search: string;
  status_id: string;
  direction_id: string;
  expert_id: string;
}

export function ApplicationsList({
  applications,
  experts,
  statuses,
  onExpertsAssigned,
  onStatusChanged,
}: ApplicationsListProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status_id: '',
    direction_id: '',
    expert_id: '',
  });
  const [assigningExpert1, setAssigningExpert1] = useState<number | ''>('');
  const [assigningExpert2, setAssigningExpert2] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [changingStatusId, setChangingStatusId] = useState<number | null>(null);
  const [newStatusId, setNewStatusId] = useState<Record<number, number>>({});

  // Фильтрация заявок
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = app.title.toLowerCase().includes(searchLower);
        const ownerMatch = (app.owner_name || '').toLowerCase().includes(searchLower) ||
                          (app.owner_email || '').toLowerCase().includes(searchLower);
        if (!titleMatch && !ownerMatch) return false;
      }
      if (filters.status_id && app.status_id?.toString() !== filters.status_id) return false;
      if (filters.direction_id && app.direction_id?.toString() !== filters.direction_id) return false;
      if (filters.expert_id) {
        const expertId = parseInt(filters.expert_id);
        if (app.expert_1 !== expertId && app.expert_2 !== expertId) return false;
      }
      return true;
    });
  }, [applications, filters]);

  const uniqueStatuses = useMemo(() => {
    const statusMap = new Map<number, string>();
    applications.forEach(app => {
      if (app.status_id && app.status_name) {
        statusMap.set(app.status_id, app.status_name);
      }
    });
    return Array.from(statusMap.entries()).map(([id, name]) => ({ id, name }));
  }, [applications]);

  const uniqueDirections = useMemo(() => {
    const directionMap = new Map<number, string>();
    applications.forEach(app => {
      if (app.direction_id && app.direction_name) {
        directionMap.set(app.direction_id, app.direction_name);
      }
    });
    return Array.from(directionMap.entries()).map(([id, name]) => ({ id, name }));
  }, [applications]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredApplications.map(app => app.id!));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = async () => {
    if (selectedIds.length === 0) {
      alert('Выберите хотя бы одну заявку');
      return;
    }
    if (assigningExpert1 === '' && assigningExpert2 === '') {
      alert('Выберите хотя бы одного эксперта');
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        selectedIds.map(id =>
          adminService.assignExperts(id, {
            expert1Id: assigningExpert1 === '' ? null : assigningExpert1,
            expert2Id: assigningExpert2 === '' ? null : assigningExpert2,
          })
        )
      );
      alert(`Эксперты назначены на ${selectedIds.length} заявок(ки)`);
      setSelectedIds([]);
      setAssigningExpert1('');
      setAssigningExpert2('');
      onExpertsAssigned?.();
    } catch (err) {
      alert('Ошибка при назначении экспертов');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeStatus = async (applicationId: number, statusId: number) => {
    setChangingStatusId(applicationId);
    try {
      await adminService.changeStatus(applicationId, { status_id: statusId });
      alert('Статус заявки успешно изменён');
      onStatusChanged?.();
    } catch (err) {
      alert('Ошибка при изменении статуса');
      console.error(err);
    } finally {
      setChangingStatusId(null);
    }
  };

  const handleStatusSelect = (applicationId: number, statusId: number) => {
    setNewStatusId(prev => ({ ...prev, [applicationId]: statusId }));
  };

  const getStatusBadgeClass = (statusName?: string) => {
    const classes: Record<string, string> = {
      'Черновик': 'badge-status-draft',
      'Подана': 'badge-status-submitted',
      'На рассмотрении': 'badge-status-review',
      'Одобрена': 'badge-status-approved',
      'Отклонена': 'badge-status-rejected',
    };
    return classes[statusName || ''] || 'badge-default';
  };

  return (
    <div className="applications-list-component">
      {/* Панель управления */}
      <div className="applications-controls">
        {/* Фильтры */}
        <div className="applications-filters">
          <div className="applications-filters__row">
            <div className="applications-filters__field">
              <label className="applications-label">Поиск</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="applications-input"
                placeholder="Название, владелец..."
              />
            </div>
            <div className="applications-filters__field">
              <label className="applications-label">Статус</label>
              <select
                value={filters.status_id}
                onChange={(e) => setFilters({ ...filters, status_id: e.target.value })}
                className="applications-select"
              >
                <option value="">Все</option>
                {uniqueStatuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="applications-filters__field">
              <label className="applications-label">Направление</label>
              <select
                value={filters.direction_id}
                onChange={(e) => setFilters({ ...filters, direction_id: e.target.value })}
                className="applications-select"
              >
                <option value="">Все</option>
                {uniqueDirections.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="applications-filters__field">
              <label className="applications-label">Эксперт</label>
              <select
                value={filters.expert_id}
                onChange={(e) => setFilters({ ...filters, expert_id: e.target.value })}
                className="applications-select"
              >
                <option value="">Все</option>
                {experts.map(exp => (
                  <option key={exp.id} value={exp.id}>
                    {`${exp.surname || ''} ${exp.name || ''}`.trim()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="applications-filters__count">
            Найдено: <strong>{filteredApplications.length}</strong>
          </div>
        </div>

        {/* Массовые действия */}
        <div className="applications-bulk-actions">
          <label className="applications-checkbox">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
              onChange={handleSelectAll}
            />
            Выбрать все ({selectedIds.length})
          </label>
          <div className="applications-bulk-actions__assign">
            <select
              value={assigningExpert1}
              onChange={(e) => setAssigningExpert1(e.target.value ? Number(e.target.value) : '')}
              className="applications-select applications-select--sm"
              disabled={saving}
            >
              <option value="">Эксперт 1</option>
              {experts.map(exp => (
                <option key={exp.id} value={exp.id}>
                  {`${exp.surname || ''} ${exp.name || ''}`.trim()}
                </option>
              ))}
            </select>
            <select
              value={assigningExpert2}
              onChange={(e) => setAssigningExpert2(e.target.value ? Number(e.target.value) : '')}
              className="applications-select applications-select--sm"
              disabled={saving}
            >
              <option value="">Эксперт 2</option>
              {experts.map(exp => (
                <option key={exp.id} value={exp.id}>
                  {`${exp.surname || ''} ${exp.name || ''}`.trim()}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkAssign}
              disabled={saving || selectedIds.length === 0}
              className="btn-primary btn-sm"
            >
              {saving ? '...' : 'Назначить'}
            </button>
          </div>
        </div>
      </div>

      {/* Список карточек */}
      <div className="applications-cards">
        {filteredApplications.length === 0 ? (
          <div className="applications-empty">Заявки не найдены</div>
        ) : (
          filteredApplications.map(app => (
            <div key={app.id} className="application-card">
              {/* Чекбокс выбора */}
              <div className="application-card__select">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(app.id!)}
                  onChange={() => handleSelectOne(app.id!)}
                />
              </div>

              {/* Основная информация */}
              <div className="application-card__main">
                <div className="application-card__header">
                  <span className="application-card__id">№{app.id}</span>
                  <Link
                    to={`/applications/${app.id}`}
                    className="application-card__title"
                  >
                    {app.title}
                  </Link>
                </div>
                <div className="application-card__meta">
                  <div className="application-card__meta-item">
                    <span className="application-card__meta-label">Владелец:</span>
                    <span className="application-card__meta-value">{app.owner_name || app.owner_email || '—'}</span>
                  </div>
                  <div className="application-card__meta-item">
                    <span className="application-card__meta-label">Статус:</span>
                    <span className={`badge ${getStatusBadgeClass(app.status_name)}`}>
                      {app.status_name || '—'}
                    </span>
                  </div>
                  <div className="application-card__meta-item">
                    <span className="application-card__meta-label">Направление:</span>
                    <span className="application-card__meta-value">{app.direction_name || '—'}</span>
                  </div>
                  <div className="application-card__meta-item">
                    <span className="application-card__meta-label">Дата:</span>
                    <span className="application-card__meta-value">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Эксперты */}
              <div className="application-card__experts">
                <div className="application-card__experts-label">Эксперты:</div>
                <div className="application-card__experts-list">
                  {app.expert1 ? (
                    <span className="expert-tag" title={app.expert1.surname + ' ' + app.expert1.name}>
                      Э1: {app.expert1.surname} {app.expert1.name?.[0]}.
                    </span>
                  ) : (
                    <span className="expert-tag expert-tag--empty">Э1: —</span>
                  )}
                  {app.expert2 ? (
                    <span className="expert-tag" title={app.expert2.surname + ' ' + app.expert2.name}>
                      Э2: {app.expert2.surname} {app.expert2.name?.[0]}.
                    </span>
                  ) : (
                    <span className="expert-tag expert-tag--empty">Э2: —</span>
                  )}
                </div>
              </div>

              {/* Смена статуса */}
              <div className="application-card__status-change">
                <label className="application-card__status-label">Сменить статус:</label>
                <select
                  value={newStatusId[app.id!] || app.status_id || ''}
                  onChange={(e) => handleStatusSelect(app.id!, parseInt(e.target.value))}
                  className="applications-select applications-select--sm"
                  disabled={changingStatusId === app.id}
                >
                  {statuses.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleChangeStatus(app.id!, newStatusId[app.id!] || app.status_id!)}
                  disabled={changingStatusId === app.id || (newStatusId[app.id!] === app.status_id && !newStatusId[app.id!])}
                  className="btn-primary btn-sm"
                >
                  {changingStatusId === app.id ? '...' : 'Применить'}
                </button>
              </div>

              {/* Действия */}
              <div className="application-card__actions">
                <Link
                  to={`/applications/${app.id}/edit`}
                  className="application-card__action-btn"
                  title="Редактировать"
                >
                  {/*<Icon name="edit" size={16} />*/}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ApplicationsList;
