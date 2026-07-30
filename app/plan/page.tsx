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
        lead="Выберите день. Сначала — маршрут, затем действия, питание и детали."
      />
      <DayCatalog />
    </AppShell>
  );
}
