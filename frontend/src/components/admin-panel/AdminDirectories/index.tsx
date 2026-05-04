import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import './AdminDirectories.css';
import Icon from '../../../components/common/icon';

type AdminDirectoriesProps = {
  directions: { id: number; name: string; description?: string | null }[];
  tenders: { id: number; name: string; description?: string | null }[];
};

export function AdminDirectories({ directions, tenders }: AdminDirectoriesProps) {
  const [dirs, setDirs] = useState(directions || []);
  const [tnds, setTnds] = useState(tenders || []);

  // sync when props change
  useEffect(() => setDirs(directions || []), [directions]);
  useEffect(() => setTnds(tenders || []), [tenders]);

  // Direction modal state
  const [showDirModal, setShowDirModal] = useState(false);
  const [dirForm, setDirForm] = useState<{ id?: number; name: string; description?: string | null }>({ name: '', description: '' });
  const [savingDir, setSavingDir] = useState(false);

  // Tender modal state
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [tenderForm, setTenderForm] = useState<{ id?: number; name: string; description?: string | null }>({ name: '', description: '' });
  const [savingTender, setSavingTender] = useState(false);

  // Direction handlers
  const openAddDirection = () => { setDirForm({ name: '', description: '' }); setShowDirModal(true); };
  const openEditDirection = (d: any) => { setDirForm({ id: d.id, name: d.name || '', description: d.description || '' }); setShowDirModal(true); };

  const saveDirection = async () => {
    if (!dirForm.name || dirForm.name.trim() === '') return alert('Название обязательно');
    setSavingDir(true);
    try {
      if (dirForm.id) {
        const res = await adminService.updateDirection(dirForm.id, { name: dirForm.name, description: dirForm.description });
        setDirs(prev => prev.map(p => (p.id === dirForm.id ? res.data : p)));
      } else {
        const res = await adminService.createDirection({ name: dirForm.name, description: dirForm.description });
        setDirs(prev => [res.data, ...prev]);
      }
      setShowDirModal(false);
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения направления');
    } finally { setSavingDir(false); }
  };

  const deleteDirection = async (id: number) => {
    if (!confirm('Удалить направление?')) return;
    try {
      await adminService.deleteDirection(id);
      setDirs(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
      alert('Ошибка удаления направления');
    }
  };

  // Tender handlers
  const openAddTender = () => { setTenderForm({ name: '', description: '' }); setShowTenderModal(true); };
  const openEditTender = (t: any) => { setTenderForm({ id: t.id, name: t.name || '', description: t.description || '' }); setShowTenderModal(true); };

  const saveTender = async () => {
    if (!tenderForm.name || tenderForm.name.trim() === '') return alert('Название обязательно');
    setSavingTender(true);
    try {
      if (tenderForm.id) {
        const res = await adminService.updateTender(tenderForm.id, { name: tenderForm.name, description: tenderForm.description });
        setTnds(prev => prev.map(p => (p.id === tenderForm.id ? res.data : p)));
      } else {
        const res = await adminService.createTender({ name: tenderForm.name, description: tenderForm.description });
        setTnds(prev => [res.data, ...prev]);
      }
      setShowTenderModal(false);
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения тендера');
    } finally { setSavingTender(false); }
  };

  const deleteTender = async (id: number) => {
    if (!confirm('Удалить конкурс/тендер?')) return;
    try {
      await adminService.deleteTender(id);
      setTnds(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
      alert('Ошибка удаления тендера');
    }
  };

  return (
    <div className="AdminDirectories">
      {/* Направления */}
      <div className="AdminDirectories__card">
        <div className="flex justify-between items-center">
          <h2 className="AdminDirectories__title">Направления</h2>
          <div>
            <button className="btn btn-sm btn-primary" onClick={openAddDirection}>
              <Icon name="add" size={16} />
            </button>
          </div>
        </div>

        <ul className="AdminDirectories__list">
          {dirs.map(d => (
            <li key={d.id} className="AdminDirectories__item flex justify-between items-start">
              <div>
                <div className="AdminDirectories__itemName">{d.name}</div>
                {d.description && <div className="AdminDirectories__itemDescription">{d.description}</div>}
              </div>
              <div className="flex gap-2">
                <button className="btn" title="Редактировать" onClick={() => openEditDirection(d)}>
                  <Icon name="edit" size={16} />
                </button>
                <button className="btn btn-danger" title="Удалить" onClick={() => deleteDirection(d.id)}>
                  <Icon name="delete" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Конкурсы */}
      <div className="AdminDirectories__card">
        <div className="flex justify-between items-center">
          <h2 className="AdminDirectories__title">Конкурсы</h2>
          <div>
            <button className="btn btn-sm btn-primary" title="Добавить конкурс" onClick={openAddTender}>
              <Icon name="add" size={16} />
            </button>
          </div>
        </div>

        <ul className="AdminDirectories__list">
          {tnds.map(t => (
            <li key={t.id} className="AdminDirectories__item flex justify-between items-start">
              <div>
                <div className="AdminDirectories__itemName">{t.name}</div>
                {t.description && <div className="AdminDirectories__itemDescription">{t.description}</div>}
              </div>
              <div className="flex gap-2">
                <button className="btn" title="Редактировать" onClick={() => openEditTender(t)}>
                  <Icon name="edit" size={16} />
                </button>
                <button className="btn btn-danger" title="Удалить" onClick={() => deleteTender(t.id)}>
                  <Icon name="delete" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Direction Modal */}
      {showDirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{dirForm.id ? 'Редактировать направление' : 'Новое направление'}</h3>
            <div className="mb-3">
              <label className="text-xs font-medium">Название</label>
              <input className="w-full border rounded px-2 py-1" value={dirForm.name} onChange={(e) => setDirForm({ ...dirForm, name: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="text-xs font-medium">Описание</label>
              <textarea className="w-full border rounded px-2 py-1" value={dirForm.description || ''} onChange={(e) => setDirForm({ ...dirForm, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn" title="Отмена" onClick={() => setShowDirModal(false)}>
                <span>Отмена</span>
              </button>
              <button className="btn btn-primary" title="Сохранить" onClick={saveDirection} disabled={savingDir}>{savingDir ? 'Сохраняю...' : 'Сохранить'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Tender Modal */}
      {showTenderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{tenderForm.id ? 'Редактировать конкурс' : 'Новый конкурс'}</h3>
            <div className="mb-3">
              <label className="text-xs font-medium">Название</label>
              <input className="w-full border rounded px-2 py-1" value={tenderForm.name} onChange={(e) => setTenderForm({ ...tenderForm, name: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="text-xs font-medium">Описание</label>
              <textarea className="w-full border rounded px-2 py-1" value={tenderForm.description || ''} onChange={(e) => setTenderForm({ ...tenderForm, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setShowTenderModal(false)}>Отмена</button>
              <button className="btn btn-primary" onClick={saveTender} disabled={savingTender}>{savingTender ? 'Сохраняю...' : 'Сохранить'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
