import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import BudgetTracker from "../components/BudgetTracker";
import { PageIntro } from "../components/Primitives";
import { WORKING_CEILING } from "../data";
import { formatRub } from "../format";

export const metadata: Metadata = {
  title: "Смета — Адлер 2026",
};

export default function BudgetPage() {
  return (
    <AppShell active="/budget" title="Смета">
      <PageIntro
        eyebrow={`Потолок ${formatRub(WORKING_CEILING)}`}
        title="План и фактические траты"
        lead="Каждая сумма привязана к расчёту. Вносите факт по мере поездки — остаток обновится автоматически."
      />
      <BudgetTracker />
    </AppShell>
  );
}
