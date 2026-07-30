"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Barbell,
  CaretDown,
  Check,
  CheckCircle,
  Compass,
  ForkKnife,
  House,
  NavigationArrow,
  Tree,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { DAYS, type Meal, type TimelineItem } from "../data";
import { PlaceLinks } from "./Primitives";

type Entry =
  | { type: "meal"; time: number; value: Meal }
  | { type: "timeline"; time: number; value: TimelineItem };

const DAY_CODES: Record<string, string> = {
  Понедельник: "ПН",
  Вторник: "ВТ",
  Среда: "СР",
  Четверг: "ЧТ",
  Пятница: "ПТ",
  Суббота: "СБ",
  Воскресенье: "ВС",
};

const KIND_ICONS: Record<
  TimelineItem["kind"],
  React.ComponentType<{ size?: number; weight?: "regular" | "bold" | "fill" }>
> = {
  move: NavigationArrow,
  nature: Tree,
  training: Barbell,
  date: Compass,
  mountain: Compass,
  rest: House,
  task: CheckCircle,
};

const toMinutes = (value: string) => {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 9999;
};

function initialDay() {
  return DAYS[0].id;
}

export default function DayCatalog() {
  const [openDay, setOpenDay] = useState(initialDay);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const requested = new URLSearchParams(window.location.search).get("day");
      if (requested && DAYS.some((day) => day.id === requested)) {
        setOpenDay(requested);
      }
      try {
        const stored = JSON.parse(localStorage.getItem("adler-route-checks") || "{}");
        setChecks(stored);
      } catch {
        setChecks({});
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleCheck = (id: string) => {
    setChecks((current) => {
      const next = { ...current, [id]: !current[id] };
      localStorage.setItem("adler-route-checks", JSON.stringify(next));
      return next;
    });
  };

  const selectDay = (id: string) => {
    setOpenDay(id);
    const url = new URL(window.location.href);
    url.searchParams.set("day", id);
    window.history.replaceState({}, "", url);
  };

  return (
    <div className="day-catalog">
      <nav className="mobile-day-strip" aria-label="Быстрый выбор дня">
        {DAYS.map((day) => (
          <button
            key={day.id}
            type="button"
            className={openDay === day.id ? "is-active" : ""}
            aria-current={openDay === day.id ? "date" : undefined}
            onClick={() => selectDay(day.id)}
          >
            <b>{DAY_CODES[day.weekday] ?? day.weekday.slice(0, 2)}</b>
            <small>{day.shortDate.replace(" авг", "")}</small>
          </button>
        ))}
      </nav>
      {DAYS.map((day, index) => {
        const isOpen = openDay === day.id;
        const entries: Entry[] = [
          ...day.meals.map((value) => ({
            type: "meal" as const,
            time: toMinutes(value.time),
            value,
          })),
          ...day.timeline.map((value) => ({
            type: "timeline" as const,
            time: toMinutes(value.time),
            value,
          })),
        ].sort((a, b) => a.time - b.time);
        const completed = entries.filter((entry) => checks[entry.value.id]).length;

        return (
          <section className={`day-row${isOpen ? " is-open" : ""}`} key={day.id}>
            <button
              className="day-row__trigger"
              type="button"
              aria-expanded={isOpen}
              aria-controls={`day-${day.id}`}
              onClick={() => selectDay(day.id)}
            >
              <span className="day-row__number">{String(index + 1).padStart(2, "0")}</span>
              <span className="day-row__code">{DAY_CODES[day.weekday] ?? day.weekday.slice(0, 2)}</span>
              <span className="day-row__date">{day.shortDate}</span>
              <span className="day-row__summary">
                <b>{day.title}</b>
                <small>
                  {entries.length} пунктов · {day.budget}
                  {completed ? ` · ${completed} готово` : ""}
                </small>
              </span>
              <CaretDown size={18} weight="bold" />
            </button>

            <div className="day-row__reveal" id={`day-${day.id}`}>
              <div className="day-row__inner">
                <div className="day-visual">
                  <img src={day.image} alt={day.imageAlt} />
                  <div>
                    <p className="eyebrow">{day.eyebrow}</p>
                    <h2>{day.title}</h2>
                    <p>{day.subtitle}</p>
                  </div>
                </div>

                <ol className="schedule-list">
                  {entries.map((entry) => {
                    const item = entry.value;
                    const isMeal = entry.type === "meal";
                    const Icon =
                      entry.type === "meal"
                        ? ForkKnife
                        : KIND_ICONS[entry.value.kind];
                    const description =
                      entry.type === "meal"
                        ? entry.value.location
                        : entry.value.detail;
                    const phone =
                      entry.type === "timeline" ? entry.value.phone : undefined;
                    return (
                      <li className={checks[item.id] ? "is-done" : ""} key={item.id}>
                        <time>{item.time}</time>
                        <span className={`schedule-list__icon${isMeal ? " is-meal" : ""}`}>
                          <Icon size={16} weight="bold" />
                        </span>
                        <div className="schedule-list__body">
                          <div className="schedule-list__title">
                            <b>
                              {entry.type === "meal"
                                ? `${entry.value.label}: ${entry.value.title}`
                                : entry.value.title}
                            </b>
                            {entry.type === "meal" ? (
                              <span className={entry.value.type === "date" ? "tag is-date" : "tag"}>
                                {entry.value.type === "date" ? "свидание" : "своя еда"}
                              </span>
                            ) : null}
                          </div>
                          <p>{description}</p>
                          <PlaceLinks mapUrl={item.mapUrl} routeUrl={item.routeUrl} phone={phone} />
                        </div>
                        <button
                          className={`check-dot${checks[item.id] ? " is-checked" : ""}`}
                          type="button"
                          aria-pressed={Boolean(checks[item.id])}
                          aria-label={`${checks[item.id] ? "Снять отметку" : "Отметить"}: ${item.title}`}
                          onClick={() => toggleCheck(item.id)}
                        >
                          {checks[item.id] ? <Check size={14} weight="bold" /> : null}
                        </button>
                      </li>
                    );
                  })}
                </ol>

                <details className="flat-details">
                  <summary>
                    План Б
                    <CaretDown size={16} weight="bold" />
                  </summary>
                  <p>{day.fallback}</p>
                </details>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
