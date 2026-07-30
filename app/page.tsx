/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarBlank,
  CheckCircle,
  Clock,
  Ticket,
  Wallet,
} from "./components/UiIcons";
import AppShell from "./components/AppShell";
import { PageIntro } from "./components/Primitives";
import { DAYS, PLAN_TOTAL, WORKING_CEILING } from "./data";
import { formatRub } from "./format";

export const metadata: Metadata = {
  title: "Адлер 2026 — обзор поездки",
  description: "Обзор маршрута, билетов и бюджета поездки в Адлер.",
};

export default function Home() {
  const paidActivities = 4;
  return (
    <AppShell active="/" title="Обзор">
      <PageIntro
        eyebrow="Сценарий B · утверждено"
        title="Вся поездка — без длинного единого экрана"
        lead="Маршрут, билеты, питание, адреса и смета разделены по задачам. Начните с дня или закройте покупки заранее."
        aside={
          <a className="primary-path" href="/tickets">
            <span>
              <small>Следующее действие</small>
              Билеты и бронь
            </span>
            <ArrowRight size={18} weight="bold" />
          </a>
        }
      />

      <section className="overview-hero">
        <img src="/places/rosa.webp" alt="Горный маршрут поездки на Роза Хутор" />
        <div className="overview-hero__veil">
          <p className="eyebrow">1–8 августа 2026</p>
          <h2>8 дней · 6 мероприятий · 2 человека</h2>
          <p>База в Адлере, один ресторанный ужин, остальная еда — своя.</p>
        </div>
      </section>

      <div className="overview-grid">
        <section className="overview-index">
          <div className="section-label">
            <span>01</span>
            <p>Рабочие разделы</p>
          </div>
          <a href="/plan">
            <CalendarBlank size={20} weight="fill" />
            <span><b>Маршрут по дням</b><small>Горизонтальный каталог, план Б и отметки</small></span>
            <ArrowRight size={17} weight="bold" />
          </a>
          <a href="/tickets">
            <Ticket size={20} weight="fill" />
            <span><b>Билеты и бронь</b><small>{paidActivities} платные точки, единый расчёт</small></span>
            <ArrowRight size={17} weight="bold" />
          </a>
          <a href="/budget">
            <Wallet size={20} weight="fill" />
            <span><b>Смета</b><small>План, фактические траты и остаток</small></span>
            <ArrowRight size={17} weight="bold" />
          </a>
        </section>

        <section className="trip-pulse">
          <div className="section-label">
            <span>02</span>
            <p>Контроль поездки</p>
          </div>
          <dl>
            <div>
              <dt><Clock size={16} weight="bold" /> Дней</dt>
              <dd>{DAYS.length}</dd>
            </div>
            <div>
              <dt><Ticket size={16} weight="bold" /> Онлайн-покупки</dt>
              <dd>2</dd>
            </div>
            <div>
              <dt><Wallet size={16} weight="bold" /> План</dt>
              <dd>{formatRub(PLAN_TOTAL)}</dd>
            </div>
            <div>
              <dt><CheckCircle size={16} weight="bold" /> Потолок</dt>
              <dd>{formatRub(WORKING_CEILING)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </AppShell>
  );
}
