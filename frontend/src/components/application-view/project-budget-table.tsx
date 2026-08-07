// frontend/src/components/application-view/project-budget-table.tsx
import type { ProjectBudget } from "../../types";
import { toNumber } from "../../types/format";

interface ProjectBudgetTableProps {
  items: ProjectBudget[];
  formatMoney: (amount: number) => string;
}

export function ProjectBudgetTable({ items, formatMoney }: ProjectBudgetTableProps) {
  if (!items || items.length === 0) return null;

  const budgetTotal = items.reduce(
    (acc, item) => {
      const total = toNumber((item as any).total_cost);
      const grant = toNumber((item as any).grant_funds);
      const own = toNumber((item as any).own_funds);
      return {
        total: acc.total + total,
        grant: acc.grant + grant,
        own: acc.own + own,
      };
    },
    { total: 0, grant: 0, own: 0 },
  );

  return (
    <div className="application-section">
      <h3 className="application-section-title">Бюджет проекта</h3>
      <div className="overflow-x-auto">
        <table className="application-table">
          <thead>
            <tr>
              <th>Тип ресурса</th>
              <th className="text-right">Стоимость ед.</th>
              <th className="text-right">Кол-во</th>
              <th className="text-right">Всего</th>
              <th className="text-right">Свои средства</th>
              <th className="text-right">Грант</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const hasUnit = (item as any).unit_cost != null;
              const hasQty = (item as any).quantity != null;
              const hasTotal = (item as any).total_cost != null;
              const hasOwn = (item as any).own_funds != null;
              const hasGrant = (item as any).grant_funds != null;

              return (
                <tr key={item.id || index}>
                  <td className="text-left">{item.resource_type || "нет данных"}</td>
                  <td className="text-right whitespace-nowrap">
                    {hasUnit
                      ? formatMoney(toNumber((item as any).unit_cost))
                      : "—"}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    {hasQty ? toNumber((item as any).quantity) : "—"}
                  </td>
                  <td className="text-right font-medium whitespace-nowrap">
                    {hasTotal
                      ? formatMoney(toNumber((item as any).total_cost))
                      : formatMoney(
                          toNumber((item as any).unit_cost) *
                            toNumber((item as any).quantity),
                        )}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    {hasOwn
                      ? formatMoney(toNumber((item as any).own_funds))
                      : "—"}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    {hasGrant
                      ? formatMoney(toNumber((item as any).grant_funds))
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="budget-total">
        <div className="budget-total-row">
          <span className="budget-total-label">Свои средства:</span>
          <span className="budget-total-value">{formatMoney(budgetTotal.own)}</span>
        </div>
        <div className="budget-total-row">
          <span className="budget-total-label">Средства гранта:</span>
          <span className="budget-total-value">{formatMoney(budgetTotal.grant)}</span>
        </div>
        <div className="budget-total-separator"></div>
        <div className="budget-total-row">
          <span className="budget-total-label font-bold">Итого:</span>
          <span className="budget-total-value font-bold">{formatMoney(budgetTotal.total)}</span>
        </div>
      </div>
    </div>
  );
}
