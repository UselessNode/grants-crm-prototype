// UIShowcase.tsx
import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ToggleButton } from '../components/ui/toggle-button';
import { Table, TableEmptyState, TableDivider, TableAddRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { ShowcaseUserHeader } from '../components/showcase/user-header';
import '../components/showcase/ui-showcase.css';

export function UiShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [toggleActive, setToggleActive] = useState(false);
  const [toggleSuccess, setToggleSuccess] = useState(false);
  const [toggleWarning, setToggleWarning] = useState(false);

  // Данные для демонстрации таблицы
  const [tableData, setTableData] = useState([
    { id: 1, name: 'Проект "Экология"', direction: 'Экология', status: 'На рассмотрении', date: '01.02.2024' },
    { id: 2, name: 'Молодёжный форум', direction: 'Образование', status: 'Одобрена', date: '15.01.2024' },
    { id: 3, name: 'Волонтёрская программа', direction: 'Социальное', status: 'Черновик', date: '20.02.2024' },
  ]);

  // Данные для интерактивной таблицы
  const [budgetItems, setBudgetItems] = useState([
    { id: 1, resource: 'Компьютеры', cost: '50000', quantity: '2', grant: '40000', own: '10000', comment: '' },
    { id: 2, resource: 'Принтеры', cost: '20000', quantity: '1', grant: '15000', own: '5000', comment: '' },
  ]);

  const handleAddBudgetItem = () => {
    setBudgetItems([...budgetItems, { id: Date.now(), resource: '', cost: '0', quantity: '1', grant: '0', own: '0', comment: '' }]);
  };

  const handleRemoveBudgetItem = (id: number) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ShowcaseUserHeader />

      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Заголовок с кнопкой */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">UI Showcase</h2>
          <Link
            to="/applications"
            className="btn-ghost"
          >
            ← Назад к списку
          </Link>
        </div>

        <div className="space-y-8">

          {/* Введение */}
          <div className="section-card">
            <h2 className="section-title">Компоненты UI</h2>
            <p className="text-gray-600 mb-4">
              Страница демонстрирует все компоненты интерфейса, используемые в проекте.
              Все стили определены в <code className="bg-gray-100 px-2 py-1 rounded">global.css</code>.
            </p>
          </div>

          {/* Карточки */}
          <div className="section-card">
            <h2 className="section-title">1. Карточки</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Базовая карточка (.card)</h3>
                <div className="card">
                  <p className="text-gray-600">Содержимое карточки</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Карточка секции (.section-card)</h3>
                <div className="section-card">
                  <p className="text-gray-600">Содержимое секции</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Вложенная карточка (.section-card-item)</h3>
                <div className="section-card">
                  <div className="section-card-item">
                    <p className="text-gray-600">Вложенный элемент</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="section-card">
            <h2 className="section-title">2. Кнопки</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Основные кнопки</h3>
                <div className="flex gap-3 flex-wrap">
                  <button className="btn-primary px-4 py-2">Primary</button>
                  <button className="btn-secondary px-4 py-2">Secondary</button>
                  <button className="btn-danger px-4 py-2">Danger</button>
                  <button className="btn-ghost px-4 py-2">Ghost</button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Отключённая кнопка</h3>
                <button className="btn-primary px-4 py-2" disabled>Disabled</button>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Кнопки действий формы</h3>
                <div className="flex gap-3">
                  <button className="btn-add">+ Добавить</button>
                  <button className="btn-remove">✕ Удалить</button>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="section-card">
            <h2 className="section-title">2.1 Кнопки-переключатели (ToggleButton)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Обычная кнопка-переключатель
                </h3>
                <div className="flex gap-3">
                  <ToggleButton
                    active={toggleActive}
                    onClick={() => setToggleActive(!toggleActive)}
                    label="Назначить координатором"
                    variant="default"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Состояние: {toggleActive ? 'Активно' : 'Неактивно'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Кнопка-переключатель (Success — зелёная)
                </h3>
                <div className="flex gap-3">
                  <ToggleButton
                    active={toggleSuccess}
                    onClick={() => setToggleSuccess(!toggleSuccess)}
                    label="Назначить координатором"
                    variant="success"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Состояние: {toggleSuccess ? 'Активно' : 'Неактивно'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Кнопка-переключатель (Warning — янтарная)
                </h3>
                <div className="flex gap-3">
                  <ToggleButton
                    active={toggleWarning}
                    onClick={() => setToggleWarning(!toggleWarning)}
                    label="Назначить ответственным за портал"
                    variant="warning"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Состояние: {toggleWarning ? 'Активно' : 'Неактивно'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Отключённая кнопка-переключатель
                </h3>
                <div className="flex gap-3">
                  <ToggleButton
                    active={true}
                    onClick={() => {}}
                    label="Заблокировано"
                    variant="success"
                    disabled={true}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Поля ввода */}
          <div className="section-card">
            <h2 className="section-title">3. Поля ввода</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Текстовое поле (.field-input)</h3>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="field-input"
                  placeholder="Введите текст"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Поле с ошибкой (.field-input-error)</h3>
                <input
                  type="text"
                  className="field-input field-input-error"
                  placeholder="Поле с ошибкой"
                  defaultValue="Некорректное значение"
                />
                <p className="field-error">Сообщение об ошибке</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Многострочное поле (textarea)</h3>
                <textarea
                  className="field-textarea"
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  rows={4}
                  placeholder="Введите многострочный текст"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Выпадающий список (select)</h3>
                <select
                  className="field-select"
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                >
                  <option value="">Выберите значение</option>
                  <option value="1">Опция 1</option>
                  <option value="2">Опция 2</option>
                  <option value="3">Опция 3</option>
                </select>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Поле даты (date)</h3>
                <input
                  type="date"
                  className="field-input"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Числовое поле (number)</h3>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="field-input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Checkbox и Radio */}
          <div className="section-card">
            <h2 className="section-title">4. Checkbox и Radio</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Checkbox</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="checkbox1"
                    checked={checkboxValue}
                    onChange={(e) => setCheckboxValue(e.target.checked)}
                  />
                  <label htmlFor="checkbox1" className="text-gray-700">Согласен с условиями</label>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Radio buttons</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="radio1"
                      name="radio"
                      value="option1"
                      checked={radioValue === 'option1'}
                      onChange={(e) => setRadioValue(e.target.value)}
                    />
                    <label htmlFor="radio1" className="text-gray-700">Опция 1</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="radio2"
                      name="radio"
                      value="option2"
                      checked={radioValue === 'option2'}
                      onChange={(e) => setRadioValue(e.target.value)}
                    />
                    <label htmlFor="radio2" className="text-gray-700">Опция 2</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="radio3"
                      name="radio"
                      value="option3"
                      checked={radioValue === 'option3'}
                      onChange={(e) => setRadioValue(e.target.value)}
                    />
                    <label htmlFor="radio3" className="text-gray-700">Опция 3</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Бейджи */}
          <div className="section-card">
            <h2 className="section-title">5. Бейджи</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Цветовые варианты</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Типы документов</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="document">Документ</Badge>
                  <Badge variant="regulation">Нормативный</Badge>
                  <Badge variant="form">Форма</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Статусы заявок</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="status-draft">Черновик</Badge>
                  <Badge variant="status-submitted">Отправлена</Badge>
                  <Badge variant="status-review">На рассмотрении</Badge>
                  <Badge variant="status-approved">Одобрена</Badge>
                  <Badge variant="status-rejected">Отклонена</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Размеры</h3>
                <div className="flex gap-2 flex-wrap items-center">
                  <Badge variant="info" size="sm">Small</Badge>
                  <Badge variant="info" size="md">Medium</Badge>
                  <Badge variant="info" size="lg">Large</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Редактируемые бейджи</h3>
                <div className="flex gap-2 flex-wrap items-center">
                  <Badge mode="interactive" variant="status-draft" onEdit={() => alert('Редактировать статус')} editTooltip="Изменить статус">
                    Черновик
                  </Badge>
                  <Badge mode="interactive" variant="document" onEdit={() => alert('Редактировать тип')} editTooltip="Изменить тип">
                    Документ
                  </Badge>
                  <Badge mode="interactive" variant="status-approved" onEdit={() => {}} editTooltip="Недоступно">
                    Одобрена
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Бейдж с раскрытием (Expandable)</h3>
                <div className="flex gap-4 flex-wrap items-start">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Статусы:</p>
                    <Badge
                      mode="expandable"
                      variant="status-draft"
                      options={[
                        { id: 1, label: 'Черновик', variant: 'status-draft' },
                        { id: 2, label: 'Отправлена', variant: 'status-submitted' },
                        { id: 3, label: 'На рассмотрении', variant: 'status-review' },
                        { id: 4, label: 'Одобрена', variant: 'status-approved' },
                        { id: 5, label: 'Отклонена', variant: 'status-rejected' },
                      ]}
                      value={1}
                      colorizeOptions
                      onSelect={(option) => alert(`Выбрано: ${option.label}`)}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Типы:</p>
                    <Badge
                      mode="expandable"
                      variant="document"
                      options={[
                        { id: 'doc', label: 'Документ', variant: 'document' },
                        { id: 'reg', label: 'Нормативный', variant: 'regulation' },
                        { id: 'form', label: 'Форма', variant: 'form' },
                      ]}
                      value="reg"
                      colorizeOptions
                      onSelect={(option) => alert(`Выбрано: ${option.label}`)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Метки и подписи */}
          <div className="section-card">
            <h2 className="section-title">6. Метки и подписи</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Метка поля (.field-label)</h3>
                <label className="field-label">Название поля</label>
                <input type="text" className="field-input" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Большая метка (.field-label-lg)</h3>
                <label className="field-label-lg">Название поля</label>
                <input type="text" className="field-input-lg" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Обязательное поле</h3>
                <label className="field-label-lg">
                  Название поля <span className="required-mark">*</span>
                </label>
                <input type="text" className="field-input" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Сообщение об ошибке</h3>
                <input type="text" className="field-input field-input-error" defaultValue="Ошибка" />
                <p className="field-error">Это поле обязательно для заполнения</p>
                <p className="field-error-lg">Большое сообщение об ошибке</p>
              </div>
            </div>
          </div>

          {/* Блок итогов */}
          <div className="section-card">
            <h2 className="section-title">7. Блок итогов (.summary-block)</h2>
            <div className="summary-block">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="summary-label">Общая стоимость:</span>
                  <span className="summary-value">100 000.00 ₽</span>
                </div>
                <div>
                  <span className="summary-label">Собственные средства:</span>
                  <span className="summary-value">30 000.00 ₽</span>
                </div>
                <div>
                  <span className="summary-label">Запрашивается из гранта:</span>
                  <span className="summary-value">70 000.00 ₽</span>
                </div>
              </div>
            </div>
          </div>

          {/* Таблицы */}
          <div className="section-card">
            <h2 className="section-title">9. Таблицы</h2>
            <div className="space-y-6">
              {/* Режим просмотра */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Таблица в режиме просмотра (с данными)
                </h3>
                <Table
                  columns={[
                    { field: 'id', header: 'ID', width: 60 },
                    { field: 'name', header: 'Название' },
                    { field: 'direction', header: 'Направление' },
                    {
                      field: 'status',
                      header: 'Статус',
                      render: (item) => {
                        const colors: Record<string, string> = {
                          'Черновик': 'bg-gray-100 text-gray-800',
                          'На рассмотрении': 'bg-yellow-100 text-yellow-800',
                          'Одобрена': 'bg-green-100 text-green-800',
                        };
                        return (
                          <span className={`px-2 py-1 text-xs rounded-full ${colors[item.status] || 'bg-gray-100'}`}>
                            {item.status}
                          </span>
                        );
                      },
                    },
                    { field: 'date', header: 'Дата', width: 120 },
                  ]}
                  data={tableData}
                  emptyState={<TableEmptyState colSpan={5}>Список проектов пуст</TableEmptyState>}
                />
              </div>

              {/* Интерактивная таблица */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Интерактивная таблица (с полями ввода)
                </h3>
                <Table
                  columns={[
                    { field: 'resource', header: 'Ресурс', width: 200 },
                    { field: 'cost', header: 'Стоимость', width: 120 },
                    { field: 'quantity', header: 'Кол-во', width: 80, className: 'td-center' },
                    { field: 'grant', header: 'Из гранта', width: 120 },
                    { field: 'own', header: 'Собственные', width: 120 },
                    { field: 'actions', header: '', width: 50, className: 'td-center' },
                  ]}
                  footer={
                    <tr>
                      <td className="table-footer-label">Итого:</td>
                      <td className="table-footer-value">70 000 ₽</td>
                      <td className="table-footer-value td-center">3</td>
                      <td className="table-footer-value">55 000 ₽</td>
                      <td className="table-footer-value">15 000 ₽</td>
                      <td></td>
                    </tr>
                  }
                >
                  <tbody className="tbody">
                    {budgetItems.map((item, idx) => (
                      <Fragment key={item.id}>
                        {idx > 0 && <TableDivider colSpan={6} />}
                        <tr className="table-row">
                          <td className="td">
                            <input
                              type="text"
                              value={item.resource}
                              onChange={(e) => {
                                const newItems = [...budgetItems];
                                newItems[idx].resource = e.target.value;
                                setBudgetItems(newItems);
                              }}
                              className="table-input"
                              placeholder="Название ресурса..."
                            />
                          </td>
                          <td className="td">
                            <input
                              type="text"
                              value={item.cost}
                              onChange={(e) => {
                                const newItems = [...budgetItems];
                                newItems[idx].cost = e.target.value;
                                setBudgetItems(newItems);
                              }}
                              className="table-input-number table-input-with-currency-right"
                              placeholder="0.00"
                            />
                            <span className="table-input-currency-right">₽</span>
                          </td>
                          <td className="td td-center">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...budgetItems];
                                newItems[idx].quantity = e.target.value;
                                setBudgetItems(newItems);
                              }}
                              className="table-input-center"
                              placeholder="1"
                            />
                          </td>
                          <td className="td">
                            <input
                              type="text"
                              value={item.grant}
                              onChange={(e) => {
                                const newItems = [...budgetItems];
                                newItems[idx].grant = e.target.value;
                                setBudgetItems(newItems);
                              }}
                              className="table-input-number table-input-with-currency-right"
                              placeholder="0.00"
                            />
                            <span className="table-input-currency-right">₽</span>
                          </td>
                          <td className="td">
                            <input
                              type="text"
                              value={item.own}
                              onChange={(e) => {
                                const newItems = [...budgetItems];
                                newItems[idx].own = e.target.value;
                                setBudgetItems(newItems);
                              }}
                              className="table-input-number table-input-with-currency-right"
                              placeholder="0.00"
                            />
                            <span className="table-input-currency-right">₽</span>
                          </td>
                          <td className="td td-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveBudgetItem(item.id)}
                              className="table-action-btn-delete"
                              disabled={budgetItems.length <= 1}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </td>
                        </tr>
                        <tr className="table-comment-row">
                          <td colSpan={6} className="td-comment">
                            <div className="table-comment-wrapper">
                              <svg className="table-comment-icon w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                              </svg>
                              <textarea
                                value={item.comment}
                                onChange={(e) => {
                                  const newItems = [...budgetItems];
                                  newItems[idx].comment = e.target.value;
                                  setBudgetItems(newItems);
                                }}
                                rows={1}
                                className="table-comment-input"
                                placeholder="Добавить комментарий..."
                              />
                            </div>
                          </td>
                        </tr>
                      </Fragment>
                    ))}
                    <TableAddRow colSpan={6} onAdd={handleAddBudgetItem} label="Добавить статью расходов" />
                  </tbody>
                </Table>
              </div>
            </div>
          </div>

          {/* Заголовки */}
          <div className="section-card">
            <h2 className="section-title">10. Типографика</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Заголовки</h3>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Заголовок H1</h1>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Заголовок H2</h2>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Заголовок H3</h3>
                <h4 className="text-base font-bold text-gray-900 mb-2">Заголовок H4</h4>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Текст</h3>
                <p className="text-gray-600 mb-2">Обычный текст (gray-600)</p>
                <p className="text-gray-700 mb-2">Текст темнее (gray-700)</p>
                <p className="text-gray-900 mb-2">Самый тёмный текст (gray-900)</p>
                <p className="text-sm text-gray-500 mb-2">Маленький текст (sm, gray-500)</p>
                <p className="text-xs text-gray-400">Очень маленький текст (xs, gray-400)</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default UiShowcase;
