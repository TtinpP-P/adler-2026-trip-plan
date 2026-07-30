import type { Metadata } from "next";
import AppShell from "./components/AppShell";
import JourneyOverview from "./components/JourneyOverview";

export const metadata: Metadata = {
  title: "Адлер 2026 — обзор поездки",
  description: "Текущий этап, ближайшее действие и последовательный маршрут поездки в Адлер.",
};

export default function Home() {
  return (
    <AppShell active="/" title="Обзор">
      <JourneyOverview />
    </AppShell>
  );
}
