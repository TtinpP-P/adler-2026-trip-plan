"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { BUDGET, PLAN_TOTAL, WORKING_CEILING } from "../data";
import { formatRub } from "../format";

export default function BudgetTracker() {
  const [actuals, setActuals] = useState<Record<string, number>>({});

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setActuals(JSON.parse(localStorage.getItem("adler-budget-actuals") || "{}"));
      } catch {
        setActuals({});
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const actualTotal = useMemo(
    () => Object.values(actuals).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [actuals],
  );
  const remaining = WORKING_CEILING - actualTotal;

  const update = (id: string, value: number) => {
    setActuals((current) => {
      const next = { ...current, [id]: Number.isFinite(value) ? value : 0 };
      localStorage.setItem("adler-budget-actuals", JSON.stringify(next));
      return next;
    });
  };

  return (
    <details className="budget-ledger" open>
      <summary>
        <div>
          <p className="eyebrow">Полная смета</p>
          <h2>{formatRub(WORKING_CEILING)}</h2>
        </div>
        <div className="budget-stats">
          <span>План <b>{formatRub(PLAN_TOTAL)}</b></span>
          <span>Резерв <b>{formatRub(WORKING_CEILING - PLAN_TOTAL)}</b></span>
          <span>Факт <b>{formatRub(actualTotal)}</b></span>
          <span
            className={remaining < 0 ? "is-negative" : ""}
            aria-live="polite"
            aria-atomic="true"
          >
            Остаток <b>{formatRub(remaining)}</b>
          </span>
        </div>
        <span className="budget-ledger__toggle">
          Детали <CaretDown size={17} weight="bold" />
        </span>
      </summary>
      <div className="budget-ledger__body">
        <div className="budget-progress" aria-label={`Потрачено ${formatRub(actualTotal)}`}>
          <i
            className={remaining < 0 ? "is-negative" : ""}
            style={{ width: `${Math.min(100, (actualTotal / WORKING_CEILING) * 100)}%` }}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Статья</th>
                <th>Расчёт</th>
                <th>План</th>
                <th>Факт</th>
              </tr>
            </thead>
            <tbody>
              {BUDGET.map((row) => (
                <tr key={row.id}>
                  <td data-label="Статья">
                    <b>{row.category}</b>
                    <small>{row.note}</small>
                  </td>
                  <td data-label="Расчёт">{row.calculation}</td>
                  <td data-label="План">{formatRub(row.amount)}</td>
                  <td data-label="Факт">
                    <label className="money-input">
                      <span className="sr-only">Фактические траты: {row.category}</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        inputMode="numeric"
                        placeholder="0"
                        value={actuals[row.id] ?? ""}
                        onChange={(event) => update(row.id, event.currentTarget.valueAsNumber)}
                      />
                      <span>₽</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}
