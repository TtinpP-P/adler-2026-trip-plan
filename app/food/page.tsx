import type { Metadata } from "next";
import { ForkKnife, MapPin } from "../components/UiIcons";
import AppShell from "../components/AppShell";
import { PageIntro, PlaceLinks } from "../components/Primitives";
import { DAYS } from "../data";

export const metadata: Metadata = {
  title: "Питание — Адлер 2026",
};

const CODES: Record<string, string> = {
  Понедельник: "ПН",
  Вторник: "ВТ",
  Среда: "СР",
  Четверг: "ЧТ",
  Пятница: "ПТ",
  Суббота: "СБ",
  Воскресенье: "ВС",
};

export default function FoodPage() {
  return (
    <AppShell active="/food" title="Еда">
      <PageIntro
        eyebrow="Своя еда · свидание · вкусняшки"
        title="Питание по дням"
        lead="Завтрак, обед и ужин привязаны к реальному маршруту. Ресторан — только на свидании 3 августа; кофе и десерты идут отдельным конвертом."
      />
      <section className="meal-matrix">
        {DAYS.map((day) => (
          <article key={day.id}>
            <header>
              <b>{CODES[day.weekday]}</b>
              <span>{day.shortDate}</span>
              <p>{day.title}</p>
            </header>
            <div className="meal-matrix__meals">
              {day.meals.map((meal) => (
                <div key={meal.id}>
                  <time>{meal.time}</time>
                  <span className="meal-matrix__icon"><ForkKnife size={15} weight="bold" /></span>
                  <div>
                    <p className="meal-matrix__title">
                      <b>{meal.label}</b>
                      <span className={meal.type === "date" ? "tag is-date" : "tag"}>
                        {meal.type === "date" ? "свидание" : "своя еда"}
                      </span>
                    </p>
                    <h2>{meal.title}</h2>
                    <p className="event-location"><MapPin size={14} weight="fill" /> {meal.location}</p>
                    <details className="flat-details">
                      <summary>Подготовка</summary>
                      <p><b>Взять:</b> {meal.pack}</p>
                      <p><b>Хранение:</b> {meal.storage}</p>
                      <p><b>Вода:</b> {meal.water}</p>
                      <p>{meal.note}</p>
                    </details>
                    <PlaceLinks mapUrl={meal.mapUrl} routeUrl={meal.routeUrl} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
