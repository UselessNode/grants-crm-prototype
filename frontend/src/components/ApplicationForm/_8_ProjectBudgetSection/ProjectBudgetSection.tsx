// ProjectBudgetSection
import React from 'react';
import type { ProjectBudget } from '../../../utils/types';
import { ResizableTable } from '../../ui/ResizableTable';
import { toNumber, formatDecimal } from '../../../utils/numbers';
import './ProjectBudgetSection.css';

interface ProjectBudgetSectionProps {
  project_budget: ProjectBudget[];
  onBudgetChange: (index: number, field: keyof ProjectBudget, value: string | number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function ProjectBudgetSection({
  project_budget,
  onBudgetChange,
  onAdd,
  onRemove,
}: ProjectBudgetSectionProps) {
  // Подсчитываем totals с явным приведением типов
  const totalCost: number = project_budget.reduce(
    (sum, item) => sum + (toNumber(item.unit_cost) * toNumber(item.quantity)),
    0
  );

  const totalOwnFunds: number = project_budget.reduce(
    (sum, item) => sum + toNumber(item.own_funds),
    0
  );

  const totalGrantFunds: number = project_budget.reduce(
    (sum, item) => sum + toNumber(item.grant_funds),
    0
  );

  // Проверка: стоимость статьи не превышает сумму финансирования
  const isArticleValid = (item: ProjectBudget): boolean => {
    const itemTotal = toNumber(item.unit_cost) * toNumber(item.quantity);
    const itemFunding = toNumber(item.grant_funds) + toNumber(item.own_funds);
    return itemTotal <= itemFunding;
  };

  return (
    <div className="section-card ProjectBudgetSection">
      <h2 className="section-title">
        8. Бюджет проекта
      </h2>
      <p className='mb-4'>Опишите какие ресурсы вам нужны и в каком объёме, укажите, что из этого вы можете найти самостоятельно и где, а на что требуется грант.</p>
      <ResizableTable
        columns={[
          { field: 'resource_type', header: 'Ресурс', width: 200, minWidth: 150, maxWidth: 400 },
          { field: 'unit_cost', header: 'Стоимость ед.', width: 120, minWidth: 100 },
          { field: 'quantity', header: 'Кол-во', width: 80, minWidth: 60, className: 'td-center' },
          { field: 'grant_funds', header: 'Средства гранта', width: 120, minWidth: 100 },
          { field: 'own_funds', header: 'Собственные и привлечённые средства', width: 130, minWidth: 100 },
          { field: 'actions', header: '', width: 50, minWidth: 40, className: 'td-center' },
        ]}
        className="ProjectBudgetSection__table"
      >
        <tbody className="tbody">
            {project_budget.map((item, idx) => {
              const valid = isArticleValid(item);
              const itemTotal = toNumber(item.unit_cost) * toNumber(item.quantity);
              const itemFunding = toNumber(item.grant_funds) + toNumber(item.own_funds);

              return (
                <React.Fragment key={idx}>
                  {/* Разделитель между статьями (кроме первой) */}
                  {idx > 0 && (
                    <tr className="table-divider-row">
                      <td colSpan={6} className="table-divider"></td>
                    </tr>
                  )}
                  {/* Основная строка с полями ввода */}
                  <tr className={`table-row ${!valid ? 'table-row-error' : ''}`}>
                    {/* Название */}
                    <td className="td">
                      <input
                        type="text"
                        value={item.resource_type}
                        onChange={(e) => onBudgetChange(idx, 'resource_type', e.target.value)}
                        className="table-input"
                        placeholder="Название ресурса..."
                      />
                    </td>
                    {/* Стоимость */}
                    <td className="td">
                      <div className="table-input-wrapper">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formatDecimal(item.unit_cost)}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9,.]/g, '').replace(',', '.');
                            onBudgetChange(idx, 'unit_cost', val === '' ? 0 : parseFloat(val));
                          }}
                          onKeyDown={(e) => {
                            // Блокируем минус, e, E, +
                            if (['-', 'e', 'E', '+'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className="table-input-number table-input-with-currency-right"
                          placeholder="0.00"
                        />
                        <span className="table-input-currency-right">₽</span>
                      </div>
                    </td>
                    {/* Количество */}
                    <td className="td td-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatDecimal(item.quantity)}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          onBudgetChange(idx, 'quantity', val === '' ? 1 : parseInt(val));
                        }}
                        onKeyDown={(e) => {
                          // Блокируем минус, e, E, +, .
                          if (['-', 'e', 'E', '+', '.'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className="table-input-center"
                        placeholder="1"
                      />
                    </td>
                    {/* Из гранта */}
                    <td className="td">
                      <div className="table-input-wrapper">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formatDecimal(item.grant_funds)}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9,.]/g, '').replace(',', '.');
                            onBudgetChange(idx, 'grant_funds', val === '' ? 0 : parseFloat(val));
                          }}
                          onKeyDown={(e) => {
                            // Блокируем минус, e, E, +
                            if (['-', 'e', 'E', '+'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className="table-input-number table-input-with-currency-right"
                          placeholder="0.00"
                        />
                        <span className="table-input-currency-right">₽</span>
                      </div>
                    </td>
                    {/* Из собственных */}
                    <td className="td">
                      <div className="table-input-wrapper">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formatDecimal(item.own_funds)}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9,.]/g, '').replace(',', '.');
                            onBudgetChange(idx, 'own_funds', val === '' ? 0 : parseFloat(val));
                          }}
                          onKeyDown={(e) => {
                            // Блокируем минус, e, E, +
                            if (['-', 'e', 'E', '+'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className="table-input-number table-input-with-currency-right"
                          placeholder="0.00"
                        />
                        <span className="table-input-currency-right">₽</span>
                      </div>
                    </td>
                    {/* Удалить */}
                    <td className="td td-center">
                      <button
                        type="button"
                        onClick={() => project_budget.length > 1 && onRemove(idx)}
                        className="table-action-btn-delete"
                        title="Удалить статью расходов"
                        disabled={project_budget.length <= 1}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {/* Строка с комментарием */}
                  <tr className={`table-comment-row ${!valid ? 'table-comment-row-error' : ''}`}>
                    <td colSpan={6} className="td-comment">
                      <div className="table-comment-wrapper">
                        <svg className={`table-comment-icon ${!valid ? 'table-comment-icon-error' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                        </svg>
                        <textarea
                          value={item.comment || ''}
                          onChange={(e) => onBudgetChange(idx, 'comment', e.target.value)}
                          rows={1}
                          className="table-comment-input"
                          placeholder="Добавить комментарий к статье расходов..."
                        />
                      </div>
                      {/* Метка об ошибках */}
                      {!valid && (
                        <div className="table-article-error">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>
                            Стоимость ({Number(itemTotal).toFixed(2)} ₽) превышает финансирование ({Number(itemFunding).toFixed(2)} ₽)
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}

            {/* Пустое состояние */}
            {project_budget.length === 0 && (
              <tr>
                <td colSpan={6} className="table-empty-state">
                  <div className="table-empty-content">
                    <svg className="table-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="table-empty-text">Список расходов пуст. Добавьте первую статью.</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Кнопка добавить */}
            {project_budget.length > 0 && (
              <tr className="table-add-row">
                <td colSpan={6} className="td-add">
                  <button
                    type="button"
                    onClick={onAdd}
                    className="btn-add-icon-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Добавить статью расходов
                  </button>
                </td>
              </tr>
            )}
        </tbody>
        {/* Итоги */}
        {project_budget.length > 0 && (
          <tfoot className="table-footer">
              <tr>
                <td className="table-footer-label">Итого:</td>
                <td className="table-footer-value">
                  <div className="table-footer-input-wrapper">
                    <span>{Number(totalCost).toFixed(2)}</span>
                    <span className="table-footer-currency">₽</span>
                  </div>
                </td>
                <td className="table-footer-value td-center">
                  {project_budget.reduce((acc, item) => acc + toNumber(item.quantity), 0)}
                </td>
                <td className="table-footer-value">
                  <div className="table-footer-input-wrapper">
                    <span className="table-footer-value-primary">{Number(totalGrantFunds).toFixed(2)}</span>
                    <span className="table-footer-currency">₽</span>
                  </div>
                </td>
                <td className="table-footer-value">
                  <div className="table-footer-input-wrapper">
                    <span className="table-footer-value-success">{Number(totalOwnFunds).toFixed(2)}</span>
                    <span className="table-footer-currency">₽</span>
                  </div>
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
      </ResizableTable>
    </div>
  );
}
