import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import DayCatalog from "../components/DayCatalog";
import { PageIntro } from "../components/Primitives";

export const metadata: Metadata = {
  title: "Маршрут по дням — Адлер 2026",
};

export default function PlanPage() {
  return (
    <AppShell active="/plan" title="Маршрут">
      <PageIntro
        eyebrow="8 дней · один открытый"
        title="Каталог маршрута"
        lead="Все дни остаются в поле зрения. Нажмите на ПН, ВТ или другой день — выбранный план расширится, остальные аккуратно сожмутся."
      />
      <DayCatalog />
    </AppShell>
  );
}
