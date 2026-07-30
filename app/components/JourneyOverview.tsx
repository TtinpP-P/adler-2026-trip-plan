"use client";

/* eslint-disable @next/next/no-img-element */

import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  NavigationArrow,
  Ticket,
  Wallet,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DAYS,
  PLAN_TOTAL,
  TICKETS,
  WORKING_CEILING,
  type Meal,
  type TimelineItem,
  type TripDay,
} from "../data";
import { formatRub } from "../format";

type JourneyPhase = "preparation" | "arrival" | "route" | "departure" | "summary";

type DayEntry =
  | { id: string; time: string; title: string; type: "meal"; value: Meal }
  | { id: string; time: string; title: string; type: "timeline"; value: TimelineItem };

const TRIP_START = DAYS[0].id;
const TRIP_END = DAYS[DAYS.length - 1].id;
const REFERENCE_DATE = "2026-07-30";

const STAGES: Array<{
  id: JourneyPhase;
  label: string;
  meta: string;
  href: string;
}> = [
  {
    id: "preparation",
    label: "Подготовка",
    meta: "билеты и сборы",
    href: "/tickets",
  },
  {
    id: "arrival",
    label: "Прибытие",
    meta: "1 авг · Адлер",
    href: `/plan?day=${DAYS[0].id}`,
  },
  {
    id: "route",
    label: "Маршрут",
    meta: "2–7 авг · 6 дней",
    href: `/plan?day=${DAYS[1].id}`,
  },
  {
    id: "departure",
    label: "Выезд",
    meta: "8 авг · 05:46",
    href: `/plan?day=${DAYS[DAYS.length - 1].id}`,
  },
  {
    id: "summary",
    label: "Итог",
    meta: formatRub(WORKING_CEILING),
    href: "/budget",
  },
];

const toMinutes = (value: string) => {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 9999;
};

const toDayEntries = (day: TripDay): DayEntry[] =>
  [
    ...day.meals.map((value) => ({
      id: value.id,
      time: value.time,
      title: `${value.label}: ${value.title}`,
      type: "meal" as const,
      value,
    })),
    ...day.timeline.map((value) => ({
      id: value.id,
      time: value.time,
      title: value.title,
      type: "timeline" as const,
      value,
    })),
  ].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

const moscowDateId = (date: Date) => {
  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

const dateStamp = (dateId: string) => {
  const [year, month, day] = dateId.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
};

const daysBetween = (from: string, to: string) =>
  Math.max(0, Math.ceil((dateStamp(to) - dateStamp(from)) / 86_400_000));

const dayWord = (value: number) => {
  if (value % 10 === 1 && value % 100 !== 11) return "день";
  if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) {
    return "дня";
  }
  return "дней";
};

const phaseForDate = (dateId: string): JourneyPhase => {
  if (dateId < TRIP_START) return "preparation";
  if (dateId === TRIP_START) return "arrival";
  if (dateId > TRIP_END) return "summary";
  if (dateId === TRIP_END) return "departure";
  return "route";
};

export default function JourneyOverview() {
  const [todayId, setTodayId] = useState(REFERENCE_DATE);
  const [purchased, setPurchased] = useState<Record<string, boolean>>({});
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTodayId(moscowDateId(new Date()));
      try {
        setPurchased(JSON.parse(localStorage.getItem("adler-ticket-status") || "{}"));
        setChecks(JSON.parse(localStorage.getItem("adler-route-checks") || "{}"));
      } catch {
        setPurchased({});
        setChecks({});
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const currentDayIndex = DAYS.findIndex((day) => day.id === todayId);
  const currentDay = currentDayIndex >= 0 ? DAYS[currentDayIndex] : undefined;
  const phase = phaseForDate(todayId);
  const phaseIndex = STAGES.findIndex((stage) => stage.id === phase);
  const daysUntil = daysBetween(todayId, TRIP_START);

  const pendingTicket = TICKETS.filter(
    (ticket) => ticket.mode === "online" || ticket.mode === "booking",
  ).find((ticket) => !purchased[ticket.id]);

  const currentEntries = useMemo(
    () => (currentDay ? toDayEntries(currentDay) : []),
    [currentDay],
  );
  const pendingEntry = currentEntries.find((entry) => !checks[entry.id]);
  const nextDay =
    currentDayIndex >= 0 && currentDayIndex < DAYS.length - 1
      ? DAYS[currentDayIndex + 1]
      : phase === "preparation"
        ? DAYS[0]
        : undefined;

  let eyebrow = "Сейчас · подготовка";
  let headline = `До поездки — ${daysUntil} ${dayWord(daysUntil)}`;
  let summary =
    "Закрываем обязательные покупки и переходим к первому дню без лишних разделов и поиска.";
  let image = DAYS[0].image;
  let imageAlt = DAYS[0].imageAlt;
  let position = "Дом → Адлер";
  let priority = pendingTicket ? pendingTicket.title : "Первый день поездки";
  let nextCheckpoint = "1 августа · прибытие";
  let actionTitle = pendingTicket
    ? `Закрыть: ${pendingTicket.title}`
    : "Открыть день прибытия";
  let actionMeta = pendingTicket
    ? `${pendingTicket.date} · ${formatRub(pendingTicket.unitPrice * pendingTicket.initialQty)}`
    : "1 августа · заселение и минимальная закупка";
  let actionHref = pendingTicket ? `/tickets#${pendingTicket.id}` : `/plan?day=${DAYS[0].id}`;
  let actionLabel = pendingTicket ? "К билетам" : "Открыть день";
  let ActionIcon = pendingTicket ? Ticket : NavigationArrow;

  if (currentDay) {
    const dayNumber = currentDayIndex + 1;
    eyebrow = `Сейчас · день ${dayNumber} из ${DAYS.length}`;
    headline = currentDay.title;
    summary = currentDay.subtitle;
    image = currentDay.image;
    imageAlt = currentDay.imageAlt;
    position = `${currentDay.shortDate} · ${currentDay.weekday}`;
    priority = currentDay.title;
    nextCheckpoint = nextDay ? `${nextDay.shortDate} · ${nextDay.title}` : "Финальный расчёт";
    actionTitle = pendingEntry?.title ?? (nextDay ? "Перейти к следующему дню" : "Сверить итог поездки");
    actionMeta = pendingEntry
      ? `${pendingEntry.time} · ${
          pendingEntry.type === "meal" ? "питание" : "пункт маршрута"
        }`
      : nextDay
        ? `${nextDay.shortDate} · ${nextDay.weekday}`
        : `План ${formatRub(PLAN_TOTAL)}`;
    actionHref = pendingEntry
      ? `/plan?day=${currentDay.id}`
      : nextDay
        ? `/plan?day=${nextDay.id}`
        : "/budget";
    actionLabel = pendingEntry ? "Открыть день" : nextDay ? "Следующий день" : "К смете";
    ActionIcon = pendingEntry || nextDay ? NavigationArrow : Wallet;
  } else if (phase === "summary") {
    eyebrow = "Маршрут завершён · итог";
    headline = "Поездка собрана в один финансовый итог";
    summary = "Сверьте фактические расходы, остаток резерва и закрытые пункты маршрута.";
    image = DAYS[DAYS.length - 1].image;
    imageAlt = DAYS[DAYS.length - 1].imageAlt;
    position = "Адлер → домой";
    priority = "Фактические расходы";
    nextCheckpoint = "Итог поездки";
    actionTitle = "Сверить план и факт";
    actionMeta = `Рабочий потолок · ${formatRub(WORKING_CEILING)}`;
    actionHref = "/budget";
    actionLabel = "Открыть смету";
    ActionIcon = Wallet;
  }

  const reserve = WORKING_CEILING - PLAN_TOTAL;
  const budgetShare = `${Math.round((PLAN_TOTAL / WORKING_CEILING) * 100)}%`;

  return (
    <div className="journey-overview">
      <section className="journey-focus" aria-labelledby="journey-heading">
        <div className="journey-focus__media">
          <img src={image} alt={imageAlt} fetchPriority="high" decoding="async" />
          <div className="journey-focus__image-meta">
            <span>01–08 AUG</span>
            <span>{String(phaseIndex + 1).padStart(2, "0")} / 05</span>
          </div>
        </div>

        <div className="journey-focus__content">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="journey-heading">{headline}</h1>
          <p className="journey-focus__summary">{summary}</p>

          <div className="journey-action" aria-live="polite">
            <span className="journey-action__icon">
              <ActionIcon size={19} weight="bold" />
            </span>
            <span className="journey-action__copy">
              <small>Следующее действие</small>
              <b>{actionTitle}</b>
              <span>{actionMeta}</span>
            </span>
            <Link href={actionHref}>
              {actionLabel}
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>

          <dl className="journey-facts">
            <div>
              <dt>
                <MapPin size={14} weight="fill" />
                Положение
              </dt>
              <dd>{position}</dd>
            </div>
            <div>
              <dt>
                <NavigationArrow size={14} weight="fill" />
                Главное
              </dt>
              <dd>{priority}</dd>
            </div>
            <div>
              <dt>
                <Clock size={14} weight="bold" />
                Следом
              </dt>
              <dd>{nextCheckpoint}</dd>
            </div>
          </dl>
        </div>
      </section>

      <nav className="journey-track" aria-label="Этапы поездки">
        {STAGES.map((stage, index) => {
          const isActive = index === phaseIndex;
          const isComplete = index < phaseIndex;
          return (
            <Link
              className={`${isActive ? "is-active" : ""}${isComplete ? " is-complete" : ""}`}
              href={stage.href}
              aria-current={isActive ? "step" : undefined}
              key={stage.id}
            >
              <span className="journey-track__marker">
                <span>
                  {isComplete ? <Check size={13} weight="bold" /> : String(index + 1).padStart(2, "0")}
                </span>
              </span>
              <span>
                <b>{stage.label}</b>
                <small>{stage.meta}</small>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="journey-followup">
        {nextDay ? (
          <Link className="next-chapter" href={`/plan?day=${nextDay.id}`}>
            <img src={nextDay.image} alt="" loading="lazy" decoding="async" />
            <span className="next-chapter__veil" />
            <span className="next-chapter__copy">
              <small>Следующая глава · {nextDay.shortDate}</small>
              <b>{nextDay.title}</b>
              <span>
                Открыть день
                <ArrowRight size={15} weight="bold" />
              </span>
            </span>
          </Link>
        ) : (
          <Link className="next-chapter is-summary" href="/budget">
            <span className="next-chapter__copy">
              <small>Маршрут завершён</small>
              <b>Сверить итог поездки</b>
              <span>
                Открыть смету
                <ArrowRight size={15} weight="bold" />
              </span>
            </span>
          </Link>
        )}

        <Link className="journey-budget" href="/budget">
          <span className="journey-budget__head">
            <span>
              <small>Финальная точка</small>
              <b>Бюджет поездки</b>
            </span>
            <ArrowRight size={16} weight="bold" />
          </span>
          <span className="journey-budget__bar" aria-hidden="true">
            <i style={{ width: budgetShare }} />
          </span>
          <span className="journey-budget__numbers">
            <span>
              <small>План</small>
              <b>{formatRub(PLAN_TOTAL)}</b>
            </span>
            <span>
              <small>Резерв</small>
              <b>{formatRub(reserve)}</b>
            </span>
            <span>
              <small>Потолок</small>
              <b>{formatRub(WORKING_CEILING)}</b>
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
