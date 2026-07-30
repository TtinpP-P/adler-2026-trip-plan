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
import { DAYS, type TimelineItem } from "../data";
import { PlaceLinks } from "./Primitives";

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

const routeStops = (items: TimelineItem[]) => {
  if (items.length <= 3) {
    return items;
  }

  return [items[0], items[Math.floor((items.length - 1) / 2)], items.at(-1)!];
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

  const revealSelectedDay = (id: string) => {
    window.requestAnimationFrame(() => {
      const panel = document.getElementById(`day-panel-${id}`);
      if (!panel) {
        return;
      }
      const bounds = panel.getBoundingClientRect();
      if (bounds.top < 150 || bounds.top > window.innerHeight * 0.58) {
        panel.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      }
    });
  };

  const selectDay = (id: string, reveal = true) => {
    setOpenDay(id);
    const url = new URL(window.location.href);
    url.searchParams.set("day", id);
    window.history.replaceState({}, "", url);
    if (reveal) {
      revealSelectedDay(id);
    }
  };

  const handleDayKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % DAYS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + DAYS.length) % DAYS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = DAYS.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    const nextDay = DAYS[nextIndex];
    selectDay(nextDay.id, false);
    window.requestAnimationFrame(() => {
      document.getElementById(`day-tab-${nextDay.id}`)?.focus();
    });
  };

  const activeDay = DAYS.find((day) => day.id === openDay) ?? DAYS[0];

  return (
    <div className="day-catalog">
      <p className="sr-only" aria-live="polite">
        Открыт план: {activeDay.shortDate}, {activeDay.title}
      </p>
      <nav
        className="day-selector mobile-day-strip"
        aria-label="Выбор дня маршрута"
        role="tablist"
        aria-orientation="horizontal"
      >
        {DAYS.map((day, index) => {
          const isActive = openDay === day.id;
          const total = day.timeline.length + day.meals.length;
          const completed = [...day.timeline, ...day.meals].filter(
            (item) => checks[item.id],
          ).length;

          return (
            <button
              key={day.id}
              id={`day-tab-${day.id}`}
              type="button"
              role="tab"
              className={isActive ? "is-active" : ""}
              aria-selected={isActive}
              aria-controls={`day-panel-${day.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectDay(day.id)}
              onKeyDown={(event) => handleDayKeyDown(event, index)}
            >
              <span className="day-selector__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="day-selector__date">
                <b>{DAY_CODES[day.weekday] ?? day.weekday.slice(0, 2)}</b>
                <small>{day.shortDate.replace(" авг", "")}</small>
              </span>
              <span className="day-selector__summary">
                <b>{day.title}</b>
                <small>
                  {total} пунктов · {day.budget}
                  {completed ? ` · ${completed} готово` : ""}
                </small>
              </span>
              <span className="day-selector__route" aria-hidden="true" />
            </button>
          );
        })}
      </nav>
      {DAYS.map((day) => {
        const isOpen = openDay === day.id;
        const timeline = [...day.timeline].sort(
          (a, b) => toMinutes(a.time) - toMinutes(b.time),
        );
        const meals = [...day.meals].sort(
          (a, b) => toMinutes(a.time) - toMinutes(b.time),
        );
        const allItems = [...timeline, ...meals];
        const firstItem = [...allItems].sort(
          (a, b) => toMinutes(a.time) - toMinutes(b.time),
        )[0];
        const stops = routeStops(timeline);
        return (
          <section
            className={`day-row${isOpen ? " is-open" : ""}`}
            id={`day-panel-${day.id}`}
            role="tabpanel"
            aria-labelledby={`day-tab-${day.id}`}
            hidden={!isOpen}
            key={day.id}
          >
            <div className="day-row__reveal">
              <div className="day-row__inner">
                <div className="day-visual">
                  <img
                    src={day.image}
                    alt={day.imageAlt}
                    loading={isOpen ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <div>
                    <div className="day-visual__label">
                      <span>01</span>
                      <p className="eyebrow">{day.eyebrow}</p>
                    </div>
                    <h2>{day.title}</h2>
                    <p>{day.subtitle}</p>
                  </div>
                </div>

                <section className="day-layer day-route" aria-labelledby={`route-${day.id}`}>
                  <header className="day-layer__heading">
                    <span>02</span>
                    <div>
                      <p>Маршрут и время</p>
                      <h3 id={`route-${day.id}`}>Как пройдёт день</h3>
                    </div>
                  </header>

                  <dl className="day-route__facts">
                    <div>
                      <dt>Старт</dt>
                      <dd>{firstItem?.time ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Этапов</dt>
                      <dd>{timeline.length}</dd>
                    </div>
                    <div>
                      <dt>Бюджет дня</dt>
                      <dd>{day.budget}</dd>
                    </div>
                  </dl>

                  <ol className="day-route__track" aria-label="Ключевые точки маршрута">
                    {stops.map((item) => (
                      <li key={item.id}>
                        <span aria-hidden="true" />
                        <time>{item.time}</time>
                        <b>{item.title}</b>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="day-layer day-content" aria-labelledby={`actions-${day.id}`}>
                  <header className="day-layer__heading">
                    <span>03</span>
                    <div>
                      <p>Действия и питание</p>
                      <h3 id={`actions-${day.id}`}>Что делать по ходу дня</h3>
                    </div>
                  </header>

                  <div className="day-content__grid">
                    <section aria-labelledby={`timeline-${day.id}`}>
                      <div className="day-content__subheading">
                        <Compass size={18} weight="bold" />
                        <div>
                          <p>Основной план</p>
                          <h4 id={`timeline-${day.id}`}>{timeline.length} этапов</h4>
                        </div>
                      </div>
                      <ol className="schedule-list schedule-list--actions">
                        {timeline.map((item) => {
                          const Icon = KIND_ICONS[item.kind];
                          return (
                            <li className={checks[item.id] ? "is-done" : ""} key={item.id}>
                              <time>{item.time}</time>
                              <span className="schedule-list__icon">
                                <Icon size={16} weight="bold" />
                              </span>
                              <div className="schedule-list__body">
                                <div className="schedule-list__title">
                                  <b>{item.title}</b>
                                </div>
                                <p>{item.detail}</p>
                                <PlaceLinks
                                  mapUrl={item.mapUrl}
                                  routeUrl={item.routeUrl}
                                  phone={item.phone}
                                />
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
                    </section>

                    <section className="day-meals" aria-labelledby={`meals-${day.id}`}>
                      <div className="day-content__subheading">
                        <ForkKnife size={18} weight="bold" />
                        <div>
                          <p>Питание</p>
                          <h4 id={`meals-${day.id}`}>3 приёма пищи</h4>
                        </div>
                      </div>
                      <ol className="day-meal-list">
                        {meals.map((meal) => (
                          <li className={checks[meal.id] ? "is-done" : ""} key={meal.id}>
                            <div className="day-meal-list__time">
                              <time>{meal.time}</time>
                              <span>{meal.label}</span>
                            </div>
                            <div className="day-meal-list__body">
                              <div>
                                <b>{meal.title}</b>
                                <span className={meal.type === "date" ? "tag is-date" : "tag"}>
                                  {meal.type === "date" ? "свидание" : "своя еда"}
                                </span>
                              </div>
                              <p>{meal.location}</p>
                              <PlaceLinks mapUrl={meal.mapUrl} routeUrl={meal.routeUrl} />
                            </div>
                            <button
                              className={`check-dot${checks[meal.id] ? " is-checked" : ""}`}
                              type="button"
                              aria-pressed={Boolean(checks[meal.id])}
                              aria-label={`${checks[meal.id] ? "Снять отметку" : "Отметить"}: ${meal.title}`}
                              onClick={() => toggleCheck(meal.id)}
                            >
                              {checks[meal.id] ? <Check size={14} weight="bold" /> : null}
                            </button>
                          </li>
                        ))}
                      </ol>
                    </section>
                  </div>
                </section>

                <section className="day-layer day-notes" aria-labelledby={`notes-${day.id}`}>
                  <header className="day-layer__heading">
                    <span>04</span>
                    <div>
                      <p>Подробные примечания</p>
                      <h3 id={`notes-${day.id}`}>Открывать только при необходимости</h3>
                    </div>
                  </header>

                  <div className="day-notes__grid">
                    <details className="flat-details">
                      <summary>
                        <span>
                          <b>План Б</b>
                          <small>Запасной сценарий дня</small>
                        </span>
                        <CaretDown size={16} weight="bold" />
                      </summary>
                      <p>{day.fallback}</p>
                    </details>

                    <details className="flat-details">
                      <summary>
                        <span>
                          <b>Логистика питания</b>
                          <small>Упаковка, хранение и вода</small>
                        </span>
                        <CaretDown size={16} weight="bold" />
                      </summary>
                      <div className="day-food-notes">
                        {meals.map((meal) => (
                          <article key={meal.id}>
                            <header>
                              <time>{meal.time}</time>
                              <b>{meal.label}</b>
                            </header>
                            <dl>
                              <div>
                                <dt>Взять</dt>
                                <dd>{meal.pack}</dd>
                              </div>
                              <div>
                                <dt>Хранить</dt>
                                <dd>{meal.storage}</dd>
                              </div>
                              <div>
                                <dt>Вода</dt>
                                <dd>{meal.water}</dd>
                              </div>
                            </dl>
                            {meal.note ? <p>{meal.note}</p> : null}
                          </article>
                        ))}
                      </div>
                    </details>
                  </div>
                </section>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
