import type { Metadata } from "next";
import TripPlanner from "./TripPlanner";

export const metadata: Metadata = {
  title: "Адлер 2026 — интерактивный план поездки",
  description:
    "Компактный адаптивный план на 1–8 августа: маршрут по дням, шесть мероприятий, полезные адреса и смета 55 300 ₽.",
};

export default function Home() {
  return <TripPlanner />;
}
