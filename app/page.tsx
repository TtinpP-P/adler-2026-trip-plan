import type { Metadata } from "next";
import TripPlanner from "./TripPlanner";

export const metadata: Metadata = {
  title: "Адлер 2026 — интерактивный план поездки",
  description:
    "Адаптивная дорожная карта на 1–8 августа: маршруты, три приёма пищи в день, каталог мест и смета 55 300 ₽.",
};

export default function Home() {
  return <TripPlanner />;
}
