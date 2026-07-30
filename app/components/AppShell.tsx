"use client";

import {
  CalendarBlank,
  Check,
  Compass,
  DownloadSimple,
  ForkKnife,
  House,
  List,
  MapPin,
  Moon,
  Receipt,
  Storefront,
  Sun,
  Ticket,
  Wallet,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { buildOfflinePlanHtml } from "../offline-plan";
import {
  BUDGET,
  DAYS,
  EVENT_COUNT,
  FEATURED_EVENT_IDS,
  PLACES,
  WORKING_CEILING,
} from "../data";
import Link from "../sitePath";

type Theme = "dark" | "light";

const NAV = [
  { href: "/", label: "Обзор", icon: House },
  { href: "/plan", label: "Маршрут", icon: CalendarBlank },
  { href: "/events", label: `${EVENT_COUNT} мест`, icon: Compass },
  { href: "/tickets", label: "Билеты", icon: Ticket, accent: true },
  { href: "/food", label: "Еда", icon: ForkKnife },
  { href: "/guide", label: "Адреса", icon: Storefront },
  { href: "/budget", label: "Смета", icon: Wallet },
] as const;

const formatRub = (value: number) =>
  `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

function downloadOfflinePlan() {
  const completeHtml = buildOfflinePlanHtml();
  const eventIds = new Set<string>(FEATURED_EVENT_IDS);
  const events = PLACES.filter((place) => eventIds.has(place.id));
  const esc = (value: string) =>
    value.replace(/[&<>"']/g, (symbol) => {
      const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return map[symbol];
    });

  const days = DAYS.map(
    (day) => `<section><p>${esc(day.shortDate)} · ${esc(day.weekday)}</p>
      <h2>${esc(day.title)}</h2><p>${esc(day.subtitle)}</p>
      <ol>${[...day.timeline, ...day.meals]
        .map(
          (entry) =>
            `<li><b>${esc(entry.time)}</b> — ${esc(entry.title)}${
              "detail" in entry ? `: ${esc(entry.detail)}` : ""
            }</li>`,
        )
        .join("")}</ol></section>`,
  ).join("");

  const html = `<!doctype html><html lang="ru"><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Адлер 2026 — офлайн-план</title><style>
  body{max-width:900px;margin:auto;padding:24px 16px 64px;background:#091014;color:#edf4f5;
  font:15px/1.55 system-ui,sans-serif}h1,h2{line-height:1.15}section{padding:18px 0;border-top:1px solid #2a3940}
  a{color:#68dbe4}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #2a3940;text-align:left}
  </style><body><h1>Адлер 2026</h1><p>1–8 августа · потолок ${formatRub(WORKING_CEILING)}</p>
  ${days}<section><h2>${EVENT_COUNT} мероприятий</h2><ol>${events
    .map((place) => `<li><b>${esc(place.title)}</b> — ${esc(place.price)}</li>`)
    .join("")}</ol></section>
  <section><h2>Смета</h2><table>${BUDGET.map(
    (row) =>
      `<tr><td>${esc(row.category)}</td><td>${esc(row.calculation)}</td><td>${formatRub(row.amount)}</td></tr>`,
  ).join("")}</table></section></body></html>`;

  void html;
  const blob = new Blob([completeHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Адлер_2026_автономный_план.html";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AppShell({
  active,
  title,
  children,
}: {
  active: string;
  title: string;
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedTheme = localStorage.getItem("adler-theme") as Theme | null;
      const savedCollapsed = localStorage.getItem("adler-sidebar-collapsed");
      const nextTheme = savedTheme === "light" ? "light" : "dark";
      setTheme(nextTheme);
      setCollapsed(savedCollapsed === "true");
      document.documentElement.dataset.theme = nextTheme;
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("adler-theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const toggleSidebar = () => {
    if (window.matchMedia("(max-width: 860px)").matches) {
      setDrawerOpen((current) => !current);
      return;
    }
    setCollapsed((current) => {
      localStorage.setItem("adler-sidebar-collapsed", String(!current));
      return !current;
    });
  };

  const handleDownload = () => {
    downloadOfflinePlan();
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2400);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <div
        className={`app-frame${collapsed ? " is-collapsed" : ""}${
          drawerOpen ? " is-drawer-open" : ""
        }`}
      >
      <aside className="side-rail" aria-label="Основная навигация">
        <button className="brand" type="button" onClick={toggleSidebar}>
          <span className="brand__mark">
            <MapPin size={18} weight="fill" />
          </span>
          <span className="side-label">
            <b>АДЛЕР.26</b>
            <small>полевой план</small>
          </span>
        </button>

        <nav className="side-nav">
          {NAV.map(({ href, label, icon: Icon, ...item }) => (
            <Link
              key={href}
              className={`${active === href ? "is-active" : ""}${
                "accent" in item && item.accent ? " is-accent" : ""
              }`}
              href={href}
              aria-current={active === href ? "page" : undefined}
              onClick={() => setDrawerOpen(false)}
            >
              <Icon size={19} weight={active === href ? "fill" : "bold"} />
              <span className="side-label">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="side-budget">
          <Receipt size={17} weight="bold" />
          <span className="side-label">
            <small>потолок</small>
            <b>{formatRub(WORKING_CEILING)}</b>
          </span>
        </div>
      </aside>

      {drawerOpen ? (
        <button
          className="drawer-scrim"
          type="button"
          aria-label="Закрыть меню"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      <div className="app-stage">
        <header className="topbar">
          <button className="icon-control" type="button" onClick={toggleSidebar} aria-label="Меню">
            {drawerOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
          <div className="topbar__title">
            <b>{title}</b>
            <small>1–8 августа · 2 человека</small>
          </div>
          <div className="topbar__actions">
            <button
              className="icon-control"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
            >
              {theme === "dark" ? <Sun size={19} weight="bold" /> : <Moon size={19} weight="fill" />}
            </button>
            <button
              className={`download-control${downloaded ? " is-complete" : ""}`}
              type="button"
              onClick={handleDownload}
              aria-live="polite"
              aria-label={downloaded ? "HTML-файл скачан" : "Скачать автономный HTML"}
            >
              {downloaded ? (
                <Check size={18} weight="bold" />
              ) : (
                <DownloadSimple size={18} weight="bold" />
              )}
              <span>{downloaded ? "HTML скачан" : "Скачать HTML"}</span>
            </button>
          </div>
        </header>
        <main className="page-shell" id="main-content" tabIndex={-1} key={active}>
          {children}
        </main>
      </div>
      </div>
    </>
  );
}
