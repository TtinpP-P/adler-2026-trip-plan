"use client";

/* eslint-disable @next/next/no-img-element */

import {
  ArrowRight,
  Barbell,
  CalendarDots,
  CaretDown,
  Check,
  CheckCircle,
  Coffee,
  Compass,
  DownloadSimple,
  ForkKnife,
  Heart,
  House,
  Info,
  ListChecks,
  MapPin,
  Mountains,
  NavigationArrow,
  Phone,
  Printer,
  Tree,
  Wallet,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import {
  BUDGET,
  DAYS,
  HOME,
  PLAN_TOTAL,
  PLACES,
  WORKING_CEILING,
  type Place,
  type PlaceCategory,
  type TimelineItem,
} from "./data";

const STORAGE_KEY = "adler-2026-trip-planner-v2";

type StoredState = {
  dayId?: string;
  checks?: Record<string, boolean>;
  selectedPlaces?: string[];
  actuals?: Record<string, number>;
};

const CATEGORY_LABELS: Record<PlaceCategory | "all", string> = {
  all: "Все",
  own: "Своя еда",
  treat: "Вкусняшки",
  date: "Свидание",
  activity: "Маршрут",
};

const KIND_ICONS: Record<
  TimelineItem["kind"],
  React.ComponentType<{ size?: number; weight?: "regular" | "bold" | "fill" }>
> = {
  move: NavigationArrow,
  nature: Tree,
  training: Barbell,
  date: Heart,
  mountain: Mountains,
  rest: Compass,
  task: ListChecks,
};

const formatRub = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value) + " ₽";

function chooseInitialDay() {
  const now = new Date();
  const first = new Date(`${DAYS[0].id}T00:00:00+03:00`);
  const last = new Date(`${DAYS[DAYS.length - 1].id}T23:59:59+03:00`);
  if (now < first) return DAYS[0].id;
  if (now > last) return DAYS[DAYS.length - 1].id;
  const local = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
  }).format(now);
  return DAYS.find((day) => day.id === local)?.id ?? DAYS[0].id;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
  });
}

function IconButtonLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number; weight?: "regular" | "bold" }>;
  children: React.ReactNode;
}) {
  return (
    <>
      <Icon size={19} weight="bold" aria-hidden="true" />
      <span>{children}</span>
    </>
  );
}

function ActionLink({
  href,
  children,
  kind = "secondary",
}: {
  href: string;
  children: React.ReactNode;
  kind?: "primary" | "secondary" | "quiet";
}) {
  return (
    <a
      className={`action-link action-link--${kind}`}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

function MealCard({
  meal,
  checked,
  onCheck,
}: {
  meal: (typeof DAYS)[number]["meals"][number];
  checked: boolean;
  onCheck: () => void;
}) {
  return (
    <article className={`meal-card ${meal.type === "date" ? "meal-card--date" : ""}`}>
      <div className="meal-card__top">
        <div>
          <span className="meal-card__time">{meal.time}</span>
          <span className="meal-card__label">{meal.label}</span>
        </div>
        <button
          className={`check-button ${checked ? "is-checked" : ""}`}
          type="button"
          aria-label={`${checked ? "Отменить отметку" : "Отметить"}: ${meal.label}`}
          aria-pressed={checked}
          onClick={onCheck}
        >
          {checked ? <Check size={17} weight="bold" /> : null}
        </button>
      </div>

      <div className="meal-card__title-row">
        {meal.type === "date" ? (
          <Heart size={21} weight="fill" aria-hidden="true" />
        ) : (
          <ForkKnife size={21} weight="bold" aria-hidden="true" />
        )}
        <h3>{meal.title}</h3>
      </div>
      <p className="meal-card__place">{meal.location}</p>
      <span className={`status-pill status-pill--${meal.status ?? "confirmed"}`}>
        {meal.status === "verify" ? "Уточнить место" : meal.type === "date" ? "Ресторан" : "Своя еда"}
      </span>

      <details className="inline-details">
        <summary>
          Что взять и как хранить
          <CaretDown size={17} weight="bold" aria-hidden="true" />
        </summary>
        <div className="meal-detail-grid">
          <div>
            <span>Взять</span>
            <p>{meal.pack}</p>
          </div>
          <div>
            <span>Хранение</span>
            <p>{meal.storage}</p>
          </div>
          <div>
            <span>Вода</span>
            <p>{meal.water}</p>
          </div>
          <div className="meal-detail-grid__note">
            <span>Практично</span>
            <p>{meal.note}</p>
          </div>
        </div>
      </details>

      <div className="card-actions">
        <ActionLink href={meal.mapUrl} kind="quiet">
          <MapPin size={18} weight="bold" aria-hidden="true" />
          На карте
        </ActionLink>
        <ActionLink href={meal.routeUrl} kind="quiet">
          <NavigationArrow size={18} weight="bold" aria-hidden="true" />
          Маршрут
        </ActionLink>
      </div>
    </article>
  );
}

function PlaceCard({
  place,
  selected,
  onSelect,
  onOpen,
}: {
  place: Place;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="place-card">
      <div className="place-card__media">
        <img src={place.image} alt={place.imageAlt} loading="lazy" />
        <span className={`category-chip category-chip--${place.category}`}>
          {CATEGORY_LABELS[place.category]}
        </span>
      </div>
      <div className="place-card__body">
        <p className="place-card__context">{place.context}</p>
        <h3>{place.title}</h3>
        <p className="place-card__location">
          <MapPin size={17} weight="fill" aria-hidden="true" />
          {place.location}
        </p>
        <div className="place-card__facts">
          <span>{place.price}</span>
          <span>{place.foodPolicy}</span>
        </div>
        <div className="place-card__footer">
          <button className="text-button" type="button" onClick={onOpen}>
            Подробнее
            <ArrowRight size={17} weight="bold" aria-hidden="true" />
          </button>
          <button
            className={`save-button ${selected ? "is-selected" : ""}`}
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
          >
            {selected ? (
              <>
                <CheckCircle size={19} weight="fill" aria-hidden="true" />
                Выбрано
              </>
            ) : (
              "Сохранить"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function PlaceSheet({ place, onClose }: { place: Place; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.classList.add("sheet-open");
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("sheet-open");
    };
  }, [onClose]);

  return (
    <div
      className="sheet-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section className="place-sheet" role="dialog" aria-modal="true" aria-labelledby="place-sheet-title">
        <button className="sheet-close" type="button" onClick={onClose} aria-label="Закрыть">
          <X size={21} weight="bold" />
        </button>
        <img src={place.image} alt={place.imageAlt} />
        <div className="place-sheet__content">
          <span className={`category-chip category-chip--${place.category}`}>
            {CATEGORY_LABELS[place.category]}
          </span>
          <p className="eyebrow">{place.context}</p>
          <h2 id="place-sheet-title">{place.title}</h2>
          <p className="sheet-location">
            <MapPin size={18} weight="fill" aria-hidden="true" />
            {place.location}
          </p>
          <div className="sheet-fact">
            <span>Бюджет</span>
            <p>{place.price}</p>
          </div>
          <div className="sheet-fact">
            <span>На практике</span>
            <p>{place.practical}</p>
          </div>
          <div className="sheet-fact">
            <span>Еда</span>
            <p>{place.foodPolicy}</p>
          </div>
          <div className="sheet-actions">
            <ActionLink href={place.mapUrl} kind="secondary">
              <MapPin size={19} weight="bold" aria-hidden="true" />
              На карте
            </ActionLink>
            <ActionLink href={place.routeUrl} kind="primary">
              <NavigationArrow size={19} weight="bold" aria-hidden="true" />
              Построить маршрут
            </ActionLink>
          </div>
          {place.sourceUrl ? (
            <a className="source-link" href={place.sourceUrl} target="_blank" rel="noreferrer">
              {place.sourceLabel ?? "Источник информации"}
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default function TripPlanner() {
  const [dayId, setDayId] = useState(chooseInitialDay);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [actuals, setActuals] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<PlaceCategory | "all">("all");
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    let stored: StoredState = {};
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as StoredState;
    } catch {
      // A damaged local preference should never block the plan.
    }
    const timer = window.setTimeout(() => {
      if (stored.dayId && DAYS.some((day) => day.id === stored.dayId)) setDayId(stored.dayId);
      if (stored.checks) setChecks(stored.checks);
      if (stored.selectedPlaces) setSelectedPlaces(stored.selectedPlaces);
      if (stored.actuals) setActuals(stored.actuals);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const value: StoredState = { dayId, checks, selectedPlaces, actuals };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }, [actuals, checks, dayId, hydrated, selectedPlaces]);

  const selectedDay = DAYS.find((day) => day.id === dayId) ?? DAYS[0];
  const visiblePlaces = useMemo(
    () => (filter === "all" ? PLACES : PLACES.filter((place) => place.category === filter)),
    [filter],
  );
  const checkedCount = Object.values(checks).filter(Boolean).length;
  const totalTasks = DAYS.reduce(
    (sum, day) => sum + day.timeline.filter((item) => item.checkable).length + day.meals.length,
    0,
  );
  const actualTotal = Object.values(actuals).reduce(
    (sum, value) => sum + (Number.isFinite(value) ? value : 0),
    0,
  );
  const remaining = WORKING_CEILING - actualTotal;

  const setDay = (nextDayId: string) => {
    setDayId(nextDayId);
    history.replaceState(null, "", `?day=${nextDayId}#day`);
  };

  const toggleCheck = (id: string) =>
    setChecks((current) => ({ ...current, [id]: !current[id] }));

  const togglePlace = (id: string) =>
    setSelectedPlaces((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const downloadHtml = () => {
    const esc = (value: string) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    const dayMarkup = DAYS.map(
      (day) => `
        <section>
          <p class="eyebrow">${esc(day.eyebrow)} · ${esc(day.weekday)}</p>
          <h2>${esc(day.shortDate)} · ${esc(day.title)}</h2>
          <p>${esc(day.subtitle)}</p>
          <h3>Три приёма пищи</h3>
          ${day.meals
            .map(
              (meal) => `
              <details>
                <summary><strong>${esc(meal.time)} · ${esc(meal.label)}:</strong> ${esc(meal.title)}</summary>
                <p><b>Где:</b> ${esc(meal.location)}</p>
                <p><b>Взять:</b> ${esc(meal.pack)}</p>
                <p><b>Хранение:</b> ${esc(meal.storage)}</p>
                <p><b>Вода:</b> ${esc(meal.water)}</p>
                <p>${esc(meal.note)}</p>
                <p><a href="${meal.mapUrl}">На карте</a> · <a href="${meal.routeUrl}">Маршрут</a></p>
              </details>`,
            )
            .join("")}
          <h3>Маршрут дня</h3>
          <ol>${day.timeline
            .map(
              (item) =>
                `<li><b>${esc(item.time)} · ${esc(item.title)}</b><br>${esc(item.detail)}</li>`,
            )
            .join("")}</ol>
          <p class="fallback"><b>План Б:</b> ${esc(day.fallback)}</p>
        </section>`,
    ).join("");
    const budgetMarkup = BUDGET.map(
      (row) =>
        `<tr><td>${esc(row.category)}</td><td>${esc(row.calculation)}</td><td>${formatRub(
          row.amount,
        )}</td></tr>`,
    ).join("");
    const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Адлер 2026 — офлайн-план</title>
<style>
body{margin:auto;max-width:860px;padding:32px 20px 80px;background:#f6f4ee;color:#172a2f;font:16px/1.55 Arial,sans-serif}
h1,h2{font-family:Georgia,serif}section{background:#fff;border:1px solid #dce3e2;border-radius:18px;padding:20px;margin:18px 0}
details{border-top:1px solid #dce3e2;padding:12px 0}summary{cursor:pointer}.eyebrow{color:#0f6b72;font-weight:700;text-transform:uppercase;font-size:12px}
a{color:#0f6b72}.fallback{background:#fff4da;padding:12px;border-radius:10px}table{width:100%;border-collapse:collapse}td,th{padding:10px;border-bottom:1px solid #dce3e2;text-align:left}td:last-child{text-align:right;white-space:nowrap}
@media(max-width:600px){body{padding:18px 12px 64px}section{padding:16px}table{font-size:13px}}
</style></head><body>
<p class="eyebrow">1–8 августа 2026 · сценарий B</p><h1>Адлер: понятный план поездки</h1>
<p><b>Ваш рацион:</b> 23 приёма своей еды + 1 ресторанный ужин на свидании. Вкусняшки — отдельный конверт 2 000 ₽.</p>
<p><b>Бюджет:</b> план ${formatRub(PLAN_TOTAL)} · рабочий потолок ${formatRub(WORKING_CEILING)}.</p>
${dayMarkup}
<section><h2>Смета</h2><table><thead><tr><th>Статья</th><th>Расчёт</th><th>Сумма</th></tr></thead><tbody>${budgetMarkup}</tbody></table></section>
<p>Скачано из интерактивного плана «Адлер 2026».</p></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Адлер_2026_офлайн_план.html";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2600);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Навигация по плану">
        <a className="brand" href="#overview" onClick={() => scrollToSection("overview")}>
          <span className="brand__mark">
            <Compass size={24} weight="fill" />
          </span>
          <span>
            <strong>Адлер</strong>
            <small>1–8 августа 2026</small>
          </span>
        </a>
        <nav className="sidebar__nav">
          <button type="button" onClick={() => scrollToSection("overview")}>
            <House size={20} weight="bold" /> Обзор
          </button>
          <button type="button" onClick={() => scrollToSection("day")}>
            <CalendarDots size={20} weight="bold" /> По дням
          </button>
          <button type="button" onClick={() => scrollToSection("food")}>
            <ForkKnife size={20} weight="bold" /> Еда
          </button>
          <button type="button" onClick={() => scrollToSection("places")}>
            <MapPin size={20} weight="bold" /> Места
          </button>
          <button type="button" onClick={() => scrollToSection("budget")}>
            <Wallet size={20} weight="bold" /> Смета
          </button>
        </nav>
        <div className="sidebar__budget">
          <span>Рабочий потолок</span>
          <strong>{formatRub(WORKING_CEILING)}</strong>
          <div className="mini-progress" aria-hidden="true">
            <i style={{ width: `${(PLAN_TOTAL / WORKING_CEILING) * 100}%` }} />
          </div>
          <small>План {formatRub(PLAN_TOTAL)} · резерв 1 100 ₽</small>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div className="topbar__brand">
            <Compass size={20} weight="fill" />
            <span>Адлер 2026</span>
          </div>
          <div className="topbar__actions">
            <button
              className="icon-action"
              type="button"
              aria-label="Распечатать план"
              onClick={() => window.print()}
            >
              <Printer size={19} weight="bold" />
              <span>Печать</span>
            </button>
            <button
              className="button button--primary button--compact"
              type="button"
              aria-label="Скачать план в HTML"
              onClick={downloadHtml}
            >
              <IconButtonLabel icon={DownloadSimple}>Скачать HTML</IconButtonLabel>
            </button>
          </div>
        </header>

        <section className="hero section-anchor" id="overview">
          <div className="hero__copy">
            <p className="eyebrow">Персональный полевой план · 2 человека</p>
            <h1>Поездка, в которой ясно, что делать дальше</h1>
            <p className="hero__lead">
              Восемь дней, 24 приёма пищи, маршруты и бюджет — без ресторанного квеста на каждом шаге.
              Вы едите свою еду; исключение одно: свидание 3 августа.
            </p>
            <div className="hero__buttons">
              <button className="button button--primary" type="button" onClick={() => scrollToSection("day")}>
                <CalendarDots size={20} weight="bold" />
                Открыть ближайший день
              </button>
              <button className="button button--secondary" type="button" onClick={downloadHtml}>
                <DownloadSimple size={20} weight="bold" />
                Скачать офлайн
              </button>
            </div>
          </div>
          <div className="hero__stats">
            <div className="stat-card stat-card--budget">
              <span>Рабочий потолок</span>
              <strong>{formatRub(WORKING_CEILING)}</strong>
              <p>План {formatRub(PLAN_TOTAL)} + рабочий резерв 1 100 ₽</p>
            </div>
            <div className="stat-card">
              <ForkKnife size={24} weight="bold" />
              <strong>23 + 1</strong>
              <p>своя еда + ресторанное свидание</p>
            </div>
            <div className="stat-card stat-card--treat">
              <Coffee size={24} weight="fill" />
              <strong>2 000 ₽</strong>
              <p>отдельно на кофе, десерты и напитки</p>
            </div>
            <div className="stat-card">
              <ListChecks size={24} weight="bold" />
              <strong>
                {checkedCount}/{totalTasks}
              </strong>
              <p>отмечено на этом устройстве</p>
            </div>
          </div>
        </section>

        <section className="quick-note" aria-label="Ключевое правило питания">
          <div>
            <ForkKnife size={22} weight="bold" />
            <p>
              <strong>Главное правило.</strong> Три приёма пищи запланированы каждый день. Вкусняшки не
              заменяют завтрак, обед или ужин.
            </p>
          </div>
          <button type="button" onClick={() => scrollToSection("food")}>
            Показать еду
            <ArrowRight size={18} weight="bold" />
          </button>
        </section>

        <section className="day-section section-anchor" id="day">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Маршрут по дням</p>
              <h2>Один день — один понятный сценарий</h2>
            </div>
            <p>Выбор дня сохраняется только на этом устройстве.</p>
          </div>

          <div className="day-tabs" role="tablist" aria-label="Выберите день поездки">
            {DAYS.map((day) => (
              <button
                key={day.id}
                className={day.id === selectedDay.id ? "is-active" : ""}
                type="button"
                role="tab"
                aria-selected={day.id === selectedDay.id}
                onClick={() => setDay(day.id)}
              >
                <span>{day.shortDate}</span>
                <small>{day.weekday.slice(0, 3)}</small>
              </button>
            ))}
          </div>

          <article className="day-hero">
            <img src={selectedDay.image} alt={selectedDay.imageAlt} />
            <div className="day-hero__overlay" />
            <div className="day-hero__content">
              <p className="eyebrow">{selectedDay.eyebrow}</p>
              <h2>{selectedDay.title}</h2>
              <p>{selectedDay.subtitle}</p>
              <span>{selectedDay.budget} на день</span>
            </div>
          </article>

          <div className="day-layout">
            <div className="timeline-panel">
              <div className="panel-title">
                <div>
                  <span>Маршрут</span>
                  <h3>{selectedDay.weekday}, {selectedDay.shortDate}</h3>
                </div>
                <span className="panel-title__count">{selectedDay.timeline.length} шага</span>
              </div>
              <ol className="timeline">
                {selectedDay.timeline.map((item) => {
                  const Icon = KIND_ICONS[item.kind];
                  return (
                    <li key={item.id} className={checks[item.id] ? "is-done" : ""}>
                      <div className={`timeline__icon timeline__icon--${item.kind}`}>
                        <Icon size={20} weight={item.kind === "date" ? "fill" : "bold"} />
                      </div>
                      <div className="timeline__body">
                        <span className="timeline__time">{item.time}</span>
                        <h4>{item.title}</h4>
                        <p>{item.detail}</p>
                        {item.warning ? (
                          <p className="inline-warning">
                            <WarningCircle size={17} weight="fill" />
                            {item.warning}
                          </p>
                        ) : null}
                        <div className="timeline__actions">
                          {item.mapUrl ? (
                            <ActionLink href={item.mapUrl} kind="quiet">
                              <MapPin size={17} weight="bold" />
                              Карта
                            </ActionLink>
                          ) : null}
                          {item.routeUrl ? (
                            <ActionLink href={item.routeUrl} kind="quiet">
                              <NavigationArrow size={17} weight="bold" />
                              Маршрут
                            </ActionLink>
                          ) : null}
                          {item.phone ? (
                            <a className="action-link action-link--quiet" href={`tel:${item.phone}`}>
                              <Phone size={17} weight="bold" />
                              Позвонить
                            </a>
                          ) : null}
                        </div>
                      </div>
                      {item.checkable ? (
                        <button
                          className={`check-button timeline__check ${checks[item.id] ? "is-checked" : ""}`}
                          type="button"
                          aria-pressed={Boolean(checks[item.id])}
                          aria-label={`${checks[item.id] ? "Отменить отметку" : "Отметить"}: ${item.title}`}
                          onClick={() => toggleCheck(item.id)}
                        >
                          {checks[item.id] ? <Check size={17} weight="bold" /> : null}
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
              <div className="fallback-card">
                <Info size={21} weight="fill" aria-hidden="true" />
                <p>
                  <strong>План Б</strong>
                  {selectedDay.fallback}
                </p>
              </div>
            </div>

            <aside className="day-side">
              <div className="side-card">
                <span>База</span>
                <h3>Фермерская, 26</h3>
                <p>Гостевой дом «Дядя Стёпа»</p>
                <ActionLink href={`https://yandex.ru/maps/?text=${encodeURIComponent(HOME)}`} kind="quiet">
                  <MapPin size={18} weight="bold" />
                  Открыть
                </ActionLink>
              </div>
              <div className="side-card side-card--food">
                <span>Питание дня</span>
                <h3>3 из 3 слотов</h3>
                <ul>
                  {selectedDay.meals.map((meal) => (
                    <li key={meal.id}>
                      <span>{meal.time}</span>
                      <p>{meal.label}</p>
                      <small>{meal.type === "date" ? "Свидание" : "Своя еда"}</small>
                    </li>
                  ))}
                </ul>
                <button type="button" className="text-button" onClick={() => scrollToSection("food")}>
                  Открыть детали
                  <ArrowRight size={17} weight="bold" />
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="food-section section-anchor" id="food">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Еда · {selectedDay.shortDate}</p>
              <h2>Завтрак, обед и ужин уже стоят в маршруте</h2>
            </div>
            <div className="food-rule">
              <ForkKnife size={20} weight="bold" />
              {selectedDay.meals.filter((meal) => meal.type === "own").length} своих ·{" "}
              {selectedDay.meals.filter((meal) => meal.type === "date").length} ресторан
            </div>
          </div>
          <div className="meal-grid">
            {selectedDay.meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                checked={Boolean(checks[meal.id])}
                onCheck={() => toggleCheck(meal.id)}
              />
            ))}
          </div>
          <div className="companion-note">
            <Info size={21} weight="fill" />
            <p>
              <strong>Про второй бюджет.</strong> В смете сохранён отдельный конверт 12 000 ₽ на обычное
              питание девушки. Он не меняет ваш режим своей еды и не входит в конверт вкусняшек.
            </p>
          </div>
        </section>

        <section className="places-section section-anchor" id="places">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Каталог мест</p>
              <h2>Выбрать по фото, смыслу и логистике</h2>
            </div>
            <p>{selectedPlaces.length} сохранено на этом устройстве</p>
          </div>
          <div className="filter-row" role="group" aria-label="Фильтр каталога">
            {(Object.keys(CATEGORY_LABELS) as Array<PlaceCategory | "all">).map((category) => (
              <button
                key={category}
                type="button"
                className={filter === category ? "is-active" : ""}
                aria-pressed={filter === category}
                onClick={() => setFilter(category)}
              >
                {category === "own" ? <ForkKnife size={18} weight="bold" /> : null}
                {category === "treat" ? <Coffee size={18} weight="fill" /> : null}
                {category === "date" ? <Heart size={18} weight="fill" /> : null}
                {category === "activity" ? <Compass size={18} weight="bold" /> : null}
                {CATEGORY_LABELS[category]}
              </button>
            ))}
          </div>
          <div className="place-grid">
            {visiblePlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                selected={selectedPlaces.includes(place.id)}
                onSelect={() => togglePlace(place.id)}
                onOpen={() => setActivePlace(place)}
              />
            ))}
          </div>
        </section>

        <section className="download-banner">
          <div>
            <DownloadSimple size={28} weight="bold" />
            <div>
              <p className="eyebrow">Работает без приложения</p>
              <h2>Сохраните весь план одним HTML-файлом</h2>
              <p>Он откроется на телефоне и компьютере даже без интернета. Ссылки на карты останутся кликабельными.</p>
            </div>
          </div>
          <button className="button button--primary" type="button" onClick={downloadHtml}>
            <DownloadSimple size={20} weight="bold" />
            Скачать HTML
          </button>
        </section>

        <section className="budget-section section-anchor" id="budget">
          <details className="budget-details">
            <summary>
              <div>
                <p className="eyebrow">Смета · в самом конце</p>
                <h2>На что посчитаны {formatRub(WORKING_CEILING)}</h2>
                <p>План {formatRub(PLAN_TOTAL)} + рабочий резерв 1 100 ₽</p>
              </div>
              <span className="budget-details__toggle">
                Развернуть таблицу
                <CaretDown size={21} weight="bold" />
              </span>
            </summary>
            <div className="budget-content">
              <div className="budget-overview">
                <div>
                  <span>Плановые конверты</span>
                  <strong>{formatRub(PLAN_TOTAL)}</strong>
                </div>
                <div>
                  <span>Рабочий резерв</span>
                  <strong>1 100 ₽</strong>
                </div>
                <div>
                  <span>Рабочий потолок</span>
                  <strong>{formatRub(WORKING_CEILING)}</strong>
                </div>
                <div>
                  <span>Факт введён</span>
                  <strong>{formatRub(actualTotal)}</strong>
                </div>
              </div>
              <div className="budget-meter" aria-label={`Остаток до потолка ${formatRub(remaining)}`}>
                <div>
                  <span>Остаток до рабочего потолка</span>
                  <strong className={remaining < 0 ? "is-over" : ""}>{formatRub(remaining)}</strong>
                </div>
                <div className="budget-meter__track">
                  <i
                    className={actualTotal > WORKING_CEILING ? "is-over" : ""}
                    style={{
                      width: `${Math.min(100, Math.max(0, (actualTotal / WORKING_CEILING) * 100))}%`,
                    }}
                  />
                </div>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Статья</th>
                      <th>Как посчитано</th>
                      <th>План</th>
                      <th>Факт</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BUDGET.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <strong>{row.category}</strong>
                          <small>{row.note}</small>
                        </td>
                        <td>{row.calculation}</td>
                        <td>{formatRub(row.amount)}</td>
                        <td>
                          <label className="actual-input">
                            <span className="sr-only">Фактические траты: {row.category}</span>
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              step="50"
                              value={actuals[row.id] ?? ""}
                              placeholder="0"
                              onChange={(event) => {
                                const value = event.currentTarget.valueAsNumber;
                                setActuals((current) => ({
                                  ...current,
                                  [row.id]: Number.isFinite(value) ? value : 0,
                                }));
                              }}
                            />
                            <span>₽</span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}>Рабочий потолок</td>
                      <td>{formatRub(WORKING_CEILING)}</td>
                      <td>{formatRub(actualTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="budget-footnotes">
                <p>
                  <Info size={18} weight="fill" />
                  Рабочий потолок снижен с 57 700 до 55 300 ₽ за счёт уменьшения операционного резерва с
                  3 500 до 1 100 ₽. Сами активности и отдельные 2 000 ₽ на вкусняшки сохранены.
                </p>
                <p>
                  Аварийная граница 60 000 ₽ — не цель для расходов. При приближении к 55 300 ₽ сначала
                  останавливаются необязательные покупки и премиальные замены.
                </p>
              </div>
            </div>
          </details>
        </section>

        <footer>
          <p>Адлер · Сириус · Хоста · Роза Хутор</p>
          <span>Данные и цены проверены 27.07.2026; расписание и правила еды в объектах перепроверить перед выездом.</span>
          <small>
            Фото: официальные страницы Кавказского заповедника, Skypark, Роза Хутор, Сочи Парк Отеля,
            ресторанов; Олимпийский парк и вокзал — Wikimedia Commons.
          </small>
        </footer>
      </main>

      <nav className="mobile-nav" aria-label="Основная навигация">
        <button type="button" onClick={() => scrollToSection("overview")}>
          <House size={21} weight="bold" />
          <span>Сейчас</span>
        </button>
        <button type="button" onClick={() => scrollToSection("day")}>
          <CalendarDots size={21} weight="bold" />
          <span>Дни</span>
        </button>
        <button type="button" onClick={() => scrollToSection("food")}>
          <ForkKnife size={21} weight="bold" />
          <span>Еда</span>
        </button>
        <button type="button" onClick={() => scrollToSection("places")}>
          <MapPin size={21} weight="bold" />
          <span>Места</span>
        </button>
        <button type="button" onClick={() => scrollToSection("budget")}>
          <Wallet size={21} weight="bold" />
          <span>Смета</span>
        </button>
      </nav>

      {activePlace ? <PlaceSheet place={activePlace} onClose={() => setActivePlace(null)} /> : null}
      {downloaded ? (
        <div className="toast" role="status">
          <CheckCircle size={20} weight="fill" />
          HTML-файл скачан
        </div>
      ) : null}
    </div>
  );
}
