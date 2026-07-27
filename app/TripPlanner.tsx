"use client";

/* eslint-disable @next/next/no-img-element */

import {
  ArrowLeft,
  ArrowRight,
  Barbell,
  CalendarDots,
  CaretDown,
  Check,
  CheckCircle,
  Compass,
  DownloadSimple,
  ForkKnife,
  House,
  List,
  MapPin,
  Moon,
  NavigationArrow,
  Phone,
  ShoppingBag,
  Storefront,
  Sun,
  Tree,
  Wallet,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import {
  BUDGET,
  DAYS,
  FEATURED_EVENT_IDS,
  PLAN_TOTAL,
  PLACES,
  PRACTICAL_PLACES,
  WORKING_CEILING,
  type Meal,
  type Place,
  type PracticalPlaceCategory,
  type TimelineItem,
} from "./data";

const STORAGE_KEY = "adler-2026-trip-planner-v3";

type Theme = "dark" | "light";

type StoredState = {
  dayId?: string;
  checks?: Record<string, boolean>;
  actuals?: Record<string, number>;
  theme?: Theme;
  sidebarCollapsed?: boolean;
};

type DayEntry =
  | { type: "timeline"; sort: number; item: TimelineItem }
  | { type: "meal"; sort: number; item: Meal };

const NAV_ITEMS = [
  { id: "plan", label: "План поездки", icon: CalendarDots },
  { id: "events", label: "6 мероприятий", icon: Compass },
  { id: "food", label: "Питание", icon: ForkKnife },
  { id: "guide", label: "Магазины и точки", icon: Storefront },
  { id: "budget", label: "Смета", icon: Wallet },
] as const;

const PRACTICAL_LABELS: Record<PracticalPlaceCategory, string> = {
  training: "Зал",
  groceries: "Продукты",
  delicacies: "Деликатесы",
  souvenirs: "Сувениры",
  date: "Свидание",
  treat: "Вкусняшки",
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

const formatRub = (value: number) =>
  `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

const timeToNumber = (value: string) => {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 9999;
};

function chooseInitialDay() {
  const params = new URLSearchParams(
    typeof window === "undefined" ? "" : window.location.search,
  );
  const requested = params.get("day");
  if (requested && DAYS.some((day) => day.id === requested)) return requested;

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
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
  });
  target.focus({ preventScroll: true });
}

function ActionLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      className={`action-link${primary ? " action-link--primary" : ""}`}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

function EventCard({ place, number }: { place: Place; number: number }) {
  return (
    <article className="event-card">
      <img src={place.image} alt={place.imageAlt} loading="lazy" />
      <div className="event-card__body">
        <div className="event-card__meta">
          <span>0{number}</span>
          <p>{place.context}</p>
        </div>
        <h3>{place.title}</h3>
        <p className="location-line">
          <MapPin size={15} weight="fill" aria-hidden="true" />
          {place.location}
        </p>
        <strong className="event-card__price">{place.price}</strong>
        <details className="compact-details">
          <summary>
            Практические детали
            <CaretDown size={16} weight="bold" aria-hidden="true" />
          </summary>
          <div>
            <p>{place.practical}</p>
            <p>{place.foodPolicy}</p>
          </div>
        </details>
        <div className="action-row">
          <ActionLink href={place.mapUrl}>
            <MapPin size={16} weight="bold" />
            Карта
          </ActionLink>
          <ActionLink href={place.routeUrl} primary>
            <NavigationArrow size={16} weight="bold" />
            Маршрут
          </ActionLink>
          {place.sourceUrl ? (
            <ActionLink href={place.sourceUrl}>Источник</ActionLink>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MealRow({
  meal,
  checked,
  onCheck,
}: {
  meal: Meal;
  checked: boolean;
  onCheck: () => void;
}) {
  return (
    <article className="meal-row">
      <div className="meal-row__time">
        <strong>{meal.time}</strong>
        <span>{meal.label}</span>
      </div>
      <div className="meal-row__body">
        <div className="meal-row__title">
          <h4>{meal.title}</h4>
          <span className={meal.type === "date" ? "pill pill--date" : "pill"}>
            {meal.type === "date" ? "Свидание" : "Своя еда"}
          </span>
        </div>
        <p className="location-line">
          <MapPin size={15} weight="fill" aria-hidden="true" />
          {meal.location}
        </p>
        <details className="compact-details">
          <summary>
            Что взять и как хранить
            <CaretDown size={16} weight="bold" aria-hidden="true" />
          </summary>
          <div className="meal-details">
            <p><b>Взять:</b> {meal.pack}</p>
            <p><b>Хранение:</b> {meal.storage}</p>
            <p><b>Вода:</b> {meal.water}</p>
            <p><b>Практично:</b> {meal.note}</p>
          </div>
        </details>
        <div className="action-row">
          <ActionLink href={meal.mapUrl}>
            <MapPin size={16} weight="bold" />
            Карта
          </ActionLink>
          <ActionLink href={meal.routeUrl}>
            <NavigationArrow size={16} weight="bold" />
            Маршрут
          </ActionLink>
        </div>
      </div>
      <button
        className={`check-control${checked ? " is-checked" : ""}`}
        type="button"
        aria-pressed={checked}
        aria-label={`${checked ? "Отменить отметку" : "Отметить"}: ${meal.title}`}
        onClick={onCheck}
      >
        {checked ? <Check size={16} weight="bold" /> : null}
      </button>
    </article>
  );
}

export default function TripPlanner() {
  const [dayId, setDayId] = useState(chooseInitialDay);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [actuals, setActuals] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState<Theme>("dark");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("plan");
  const [hydrated, setHydrated] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    let stored: StoredState = {};
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as StoredState;
    } catch {
      // Local preferences are optional.
    }
    const timer = window.setTimeout(() => {
      if (stored.dayId && DAYS.some((day) => day.id === stored.dayId)) {
        setDayId(stored.dayId);
      }
      if (stored.checks) setChecks(stored.checks);
      if (stored.actuals) setActuals(stored.actuals);
      if (stored.theme) setTheme(stored.theme);
      if (typeof stored.sidebarCollapsed === "boolean") {
        setSidebarCollapsed(stored.sidebarCollapsed);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!hydrated) return;
    const value: StoredState = {
      dayId,
      checks,
      actuals,
      theme,
      sidebarCollapsed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }, [actuals, checks, dayId, hydrated, sidebarCollapsed, theme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-20% 0px -64% 0px", threshold: [0.05, 0.25, 0.5] },
    );
    NAV_ITEMS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  const selectedDayIndex = Math.max(
    0,
    DAYS.findIndex((day) => day.id === dayId),
  );
  const selectedDay = DAYS[selectedDayIndex] ?? DAYS[0];

  const featuredEvents = useMemo(
    () =>
      FEATURED_EVENT_IDS.map((id) => PLACES.find((place) => place.id === id)).filter(
        (place): place is Place => Boolean(place),
      ),
    [],
  );

  const dayEntries = useMemo<DayEntry[]>(
    () =>
      [
        ...selectedDay.timeline.map((item) => ({
          type: "timeline" as const,
          sort: timeToNumber(item.time),
          item,
        })),
        ...selectedDay.meals.map((item) => ({
          type: "meal" as const,
          sort: timeToNumber(item.time),
          item,
        })),
      ].sort((a, b) => a.sort - b.sort),
    [selectedDay],
  );

  const actualTotal = Object.values(actuals).reduce(
    (sum, value) => sum + (Number.isFinite(value) ? value : 0),
    0,
  );
  const remaining = WORKING_CEILING - actualTotal;

  const setDay = (nextDayId: string) => {
    setDayId(nextDayId);
    history.replaceState(null, "", `?day=${nextDayId}#plan`);
  };

  const moveDay = (direction: -1 | 1) => {
    const next = Math.min(DAYS.length - 1, Math.max(0, selectedDayIndex + direction));
    setDay(DAYS[next].id);
  };

  const toggleCheck = (id: string) =>
    setChecks((current) => ({ ...current, [id]: !current[id] }));

  const navigate = (id: string) => {
    setDrawerOpen(false);
    setActiveSection(id);
    window.setTimeout(() => scrollToSection(id), 40);
  };

  const toggleMenu = () => {
    if (window.matchMedia("(max-width: 859px)").matches) {
      setDrawerOpen((current) => !current);
    } else {
      setSidebarCollapsed((current) => !current);
    }
  };

  const downloadHtml = () => {
    const esc = (value: string | number) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    const link = (href: string, label: string) =>
      `<a href="${esc(href)}">${esc(label)}</a>`;
    const daysMarkup = DAYS.map(
      (day) => `<section>
        <p class="eyebrow">${esc(day.eyebrow)} · ${esc(day.weekday)}</p>
        <h2>${esc(day.shortDate)} · ${esc(day.title)}</h2>
        <p>${esc(day.subtitle)}</p>
        <h3>Питание</h3>
        ${day.meals
          .map(
            (meal) => `<details>
              <summary><b>${esc(meal.time)} · ${esc(meal.label)}</b> — ${esc(meal.title)}</summary>
              <p>${esc(meal.location)}</p><p><b>Взять:</b> ${esc(meal.pack)}</p>
              <p><b>Хранение:</b> ${esc(meal.storage)}</p><p><b>Вода:</b> ${esc(meal.water)}</p>
              <p>${link(meal.mapUrl, "Карта")} · ${link(meal.routeUrl, "Маршрут")}</p>
            </details>`,
          )
          .join("")}
        <h3>Маршрут</h3>
        <ol>${day.timeline
          .map(
            (item) => `<li class="${checks[item.id] ? "done" : ""}">
              <b>${esc(item.time)} · ${esc(item.title)}</b><br>${esc(item.detail)}
              ${item.mapUrl ? `<br>${link(item.mapUrl, "Карта")}` : ""}
              ${item.routeUrl ? ` · ${link(item.routeUrl, "Маршрут")}` : ""}
            </li>`,
          )
          .join("")}</ol>
        <details><summary>План Б</summary><p>${esc(day.fallback)}</p></details>
      </section>`,
    ).join("");
    const eventsMarkup = featuredEvents
      .map(
        (place) => `<article><h3>${esc(place.title)}</h3><p>${esc(place.context)} · ${esc(
          place.location,
        )}</p><p><b>${esc(place.price)}</b></p><p>${esc(place.practical)}</p>
        <p>${link(place.mapUrl, "Карта")} · ${link(place.routeUrl, "Маршрут")}${
          place.sourceUrl ? ` · ${link(place.sourceUrl, "Источник")}` : ""
        }</p></article>`,
      )
      .join("");
    const guideMarkup = PRACTICAL_PLACES.map(
      (place) => `<article><h3>${esc(place.title)}</h3><p>${esc(place.location)}</p>
      <p>${esc(place.practical)}</p><p>${link(place.mapUrl, "Карта")} · ${link(
        place.routeUrl,
        "Маршрут",
      )}${place.sourceUrl ? ` · ${link(place.sourceUrl, "Источник")}` : ""}</p></article>`,
    ).join("");
    const budgetMarkup = BUDGET.map(
      (row) => `<tr><td>${esc(row.category)}</td><td>${esc(row.calculation)}</td>
      <td>${esc(formatRub(row.amount))}</td><td>${esc(formatRub(actuals[row.id] ?? 0))}</td></tr>`,
    ).join("");
    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Адлер 2026 — план поездки</title><style>
      :root{color-scheme:dark}*{box-sizing:border-box}body{max-width:900px;margin:auto;padding:24px 16px 64px;background:#0b1018;color:#e8edf5;font:15px/1.55 Arial,sans-serif}
      h1,h2,h3{line-height:1.2}section,article{border:1px solid #293342;background:#111824;padding:16px;margin:12px 0;border-radius:4px}
      article{display:inline-block;width:calc(50% - 8px);vertical-align:top}a{color:#81e6d9}.eyebrow{color:#7dd3fc;font-size:12px;font-weight:700;text-transform:uppercase}
      details{border-top:1px solid #293342;padding:10px 0}summary{cursor:pointer}.done{opacity:.55;text-decoration:line-through}
      table{width:100%;border-collapse:collapse}td,th{padding:9px;border-bottom:1px solid #293342;text-align:left}td:nth-last-child(-n+2){white-space:nowrap}
      @media(max-width:620px){article{display:block;width:100%}table{font-size:12px}body{padding:14px 10px 48px}}
      </style></head><body><p class="eyebrow">1–8 августа 2026 · сценарий B</p>
      <h1>Адлер 2026</h1><p><b>Рабочий потолок:</b> ${esc(formatRub(WORKING_CEILING))}</p>
      ${daysMarkup}<section><h2>6 мероприятий</h2>${eventsMarkup}</section>
      <section><h2>Магазины и полезные точки</h2>${guideMarkup}</section>
      <section><h2>Смета</h2><table><thead><tr><th>Статья</th><th>Расчёт</th><th>План</th><th>Факт</th></tr></thead>
      <tbody>${budgetMarkup}</tbody></table></section></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Адлер_2026_план.html";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2400);
  };

  return (
    <div
      className={`app-shell${sidebarCollapsed ? " is-sidebar-collapsed" : ""}${
        drawerOpen ? " is-drawer-open" : ""
      }`}
    >
      <aside className="sidebar" aria-label="Навигация по плану">
        <button className="sidebar__brand" type="button" onClick={() => navigate("plan")}>
          <span className="brand-mark"><Compass size={20} weight="fill" /></span>
          <span className="sidebar__label">
            <strong>АДЛЕР.26</strong>
            <small>Полевой план</small>
          </span>
        </button>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={activeSection === id ? "is-active" : ""}
              aria-current={activeSection === id ? "page" : undefined}
              aria-label={label}
              onClick={() => navigate(id)}
            >
              <Icon size={20} weight={activeSection === id ? "fill" : "bold"} />
              <span className="sidebar__label">{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__summary">
          <span className="sidebar__label">Потолок</span>
          <strong>{formatRub(WORKING_CEILING)}</strong>
        </div>
        <button
          className="sidebar__collapse"
          type="button"
          onClick={() => setSidebarCollapsed((current) => !current)}
          aria-label={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          <ArrowLeft size={18} weight="bold" />
          <span className="sidebar__label">Свернуть</span>
        </button>
      </aside>

      {drawerOpen ? (
        <button
          type="button"
          className="drawer-scrim"
          aria-label="Закрыть меню"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      <main id="content">
        <header className="topbar">
          <button className="icon-button" type="button" onClick={toggleMenu} aria-label="Меню">
            {drawerOpen ? <X size={21} weight="bold" /> : <List size={21} weight="bold" />}
          </button>
          <div className="topbar__title">
            <span>{NAV_ITEMS.find((item) => item.id === activeSection)?.label ?? "План поездки"}</span>
            <small>1–8 августа · 2 человека</small>
          </div>
          <div className="topbar__actions">
            <button
              className="icon-button"
              type="button"
              aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="fill" />}
            </button>
            <button className="download-button" type="button" onClick={downloadHtml}>
              <DownloadSimple size={18} weight="bold" />
              <span>Скачать HTML</span>
            </button>
          </div>
        </header>

        <div className="content">
          <section className="plan-section section-anchor" id="plan" tabIndex={-1}>
            <div className="trip-strip">
              <div>
                <span>Сценарий B</span>
                <strong>1–8 августа 2026</strong>
              </div>
              <div>
                <span>Мероприятий</span>
                <strong>6</strong>
              </div>
              <div>
                <span>Рабочий потолок</span>
                <strong>{formatRub(WORKING_CEILING)}</strong>
              </div>
              <div>
                <span>Вкусняшки</span>
                <strong>2 000 ₽</strong>
              </div>
            </div>

            <div className="section-heading">
              <div>
                <p className="eyebrow">{selectedDay.eyebrow}</p>
                <h1>{selectedDay.title}</h1>
                <p>{selectedDay.subtitle}</p>
              </div>
              <span className="day-budget">{selectedDay.budget}</span>
            </div>

            <div className="day-switcher" aria-label="Выбор дня поездки">
              <button
                type="button"
                onClick={() => moveDay(-1)}
                disabled={selectedDayIndex === 0}
                aria-label="Предыдущий день"
              >
                <ArrowLeft size={18} weight="bold" />
              </button>
              <label>
                <span className="sr-only">День поездки</span>
                <select value={selectedDay.id} onChange={(event) => setDay(event.currentTarget.value)}>
                  {DAYS.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.shortDate} · {day.weekday}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => moveDay(1)}
                disabled={selectedDayIndex === DAYS.length - 1}
                aria-label="Следующий день"
              >
                <ArrowRight size={18} weight="bold" />
              </button>
            </div>

            <div className="day-workspace">
              <div className="day-image">
                <img src={selectedDay.image} alt={selectedDay.imageAlt} />
                <span>{selectedDay.shortDate}</span>
              </div>
              <div className="timeline-panel">
                <div className="panel-heading">
                  <h2>Хронология дня</h2>
                  <span>{dayEntries.length} пунктов</span>
                </div>
                <ol className="timeline">
                  {dayEntries.map((entry) => {
                    if (entry.type === "meal") {
                      const meal = entry.item;
                      return (
                        <li key={meal.id} className={checks[meal.id] ? "is-done" : ""}>
                          <div className="timeline__time">{meal.time}</div>
                          <div className="timeline__icon timeline__icon--meal">
                            <ForkKnife size={17} weight="bold" />
                          </div>
                          <div className="timeline__content">
                            <div className="timeline__title">
                              <h3>{meal.label}: {meal.title}</h3>
                              <span className={meal.type === "date" ? "pill pill--date" : "pill"}>
                                {meal.type === "date" ? "Свидание" : "Своя еда"}
                              </span>
                            </div>
                            <p>{meal.location}</p>
                            <div className="action-row">
                              <ActionLink href={meal.mapUrl}>Карта</ActionLink>
                              <ActionLink href={meal.routeUrl}>Маршрут</ActionLink>
                            </div>
                          </div>
                          <button
                            className={`check-control${checks[meal.id] ? " is-checked" : ""}`}
                            type="button"
                            aria-pressed={Boolean(checks[meal.id])}
                            aria-label={`Отметить: ${meal.title}`}
                            onClick={() => toggleCheck(meal.id)}
                          >
                            {checks[meal.id] ? <Check size={15} weight="bold" /> : null}
                          </button>
                        </li>
                      );
                    }
                    const item = entry.item;
                    const Icon = KIND_ICONS[item.kind];
                    return (
                      <li key={item.id} className={checks[item.id] ? "is-done" : ""}>
                        <div className="timeline__time">{item.time}</div>
                        <div className={`timeline__icon timeline__icon--${item.kind}`}>
                          <Icon size={17} weight="bold" />
                        </div>
                        <div className="timeline__content">
                          <h3>{item.title}</h3>
                          <p>{item.detail}</p>
                          <div className="action-row">
                            {item.mapUrl ? <ActionLink href={item.mapUrl}>Карта</ActionLink> : null}
                            {item.routeUrl ? <ActionLink href={item.routeUrl}>Маршрут</ActionLink> : null}
                            {item.phone ? (
                              <a className="action-link" href={`tel:${item.phone}`}>
                                <Phone size={15} weight="bold" />
                                Позвонить
                              </a>
                            ) : null}
                          </div>
                        </div>
                        {item.checkable ? (
                          <button
                            className={`check-control${checks[item.id] ? " is-checked" : ""}`}
                            type="button"
                            aria-pressed={Boolean(checks[item.id])}
                            aria-label={`Отметить: ${item.title}`}
                            onClick={() => toggleCheck(item.id)}
                          >
                            {checks[item.id] ? <Check size={15} weight="bold" /> : null}
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
                <details className="fallback-details">
                  <summary>
                    План Б
                    <CaretDown size={17} weight="bold" />
                  </summary>
                  <p>{selectedDay.fallback}</p>
                </details>
              </div>
            </div>

            <div className="food-panel section-anchor" id="food" tabIndex={-1}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Питание · {selectedDay.shortDate}</p>
                  <h2>Завтрак, обед и ужин</h2>
                </div>
                <span>{selectedDay.meals.filter((meal) => meal.type === "own").length} своё · {selectedDay.meals.filter((meal) => meal.type === "date").length} ресторан</span>
              </div>
              <div className="meal-list">
                {selectedDay.meals.map((meal) => (
                  <MealRow
                    key={meal.id}
                    meal={meal}
                    checked={Boolean(checks[meal.id])}
                    onCheck={() => toggleCheck(meal.id)}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="section-anchor" id="events" tabIndex={-1}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Основной маршрут</p>
                <h2>Все 6 мероприятий</h2>
                <p>Без фильтров: каждое место уже входит в утверждённый план.</p>
              </div>
            </div>
            <div className="event-grid">
              {featuredEvents.map((place, index) => (
                <EventCard key={place.id} place={place} number={index + 1} />
              ))}
            </div>
          </section>

          <section className="section-anchor" id="guide" tabIndex={-1}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Адреса и ссылки</p>
                <h2>Продукты, деликатесы, сувениры и важные точки</h2>
                <p>Конкретные адреса, карты и маршруты — без отдельного поиска на месте.</p>
              </div>
            </div>
            <div className="guide-list">
              {PRACTICAL_PLACES.map((place) => (
                <article className="guide-row" key={place.id}>
                  <div className="guide-row__icon">
                    {place.category === "training" ? (
                      <Barbell size={19} weight="bold" />
                    ) : place.category === "groceries" || place.category === "delicacies" ? (
                      <ShoppingBag size={19} weight="bold" />
                    ) : (
                      <Storefront size={19} weight="bold" />
                    )}
                  </div>
                  <div className="guide-row__body">
                    <div>
                      <span className="pill">{PRACTICAL_LABELS[place.category]}</span>
                      <h3>{place.title}</h3>
                    </div>
                    <p className="location-line">
                      <MapPin size={15} weight="fill" />
                      {place.location}
                    </p>
                    <p>{place.practical}</p>
                  </div>
                  <div className="guide-row__actions">
                    <ActionLink href={place.mapUrl}>Карта</ActionLink>
                    <ActionLink href={place.routeUrl} primary>Маршрут</ActionLink>
                    {place.phone ? (
                      <a className="action-link" href={`tel:${place.phone}`}>
                        <Phone size={15} weight="bold" />
                        Звонок
                      </a>
                    ) : null}
                    {place.sourceUrl ? <ActionLink href={place.sourceUrl}>Источник</ActionLink> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="budget-section section-anchor" id="budget" tabIndex={-1}>
            <details className="budget-details">
              <summary>
                <div>
                  <p className="eyebrow">Смета</p>
                  <h2>{formatRub(WORKING_CEILING)}</h2>
                </div>
                <div className="budget-summary">
                  <span>План <b>{formatRub(PLAN_TOTAL)}</b></span>
                  <span>Резерв <b>1 100 ₽</b></span>
                  <span>Факт <b>{formatRub(actualTotal)}</b></span>
                  <span className={remaining < 0 ? "is-over" : ""}>Остаток <b>{formatRub(remaining)}</b></span>
                </div>
                <span className="budget-toggle">
                  Развернуть
                  <CaretDown size={19} weight="bold" />
                </span>
              </summary>
              <div className="budget-content">
                <div className="budget-meter" aria-label={`Потрачено ${formatRub(actualTotal)}`}>
                  <i
                    className={actualTotal > WORKING_CEILING ? "is-over" : ""}
                    style={{ width: `${Math.min(100, (actualTotal / WORKING_CEILING) * 100)}%` }}
                  />
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Статья</th>
                        <th>Расчёт</th>
                        <th>План</th>
                        <th>Факт</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BUDGET.map((row) => (
                        <tr key={row.id}>
                          <td data-label="Статья">
                            <strong>{row.category}</strong>
                            <small>{row.note}</small>
                          </td>
                          <td data-label="Расчёт">{row.calculation}</td>
                          <td data-label="План">{formatRub(row.amount)}</td>
                          <td data-label="Факт">
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
                  </table>
                </div>
              </div>
            </details>
          </section>
        </div>
      </main>

      {downloaded ? (
        <div className="toast" role="status">
          <CheckCircle size={19} weight="fill" />
          HTML скачан
        </div>
      ) : null}
    </div>
  );
}
