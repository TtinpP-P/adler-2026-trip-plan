import {
  BUDGET,
  DAYS,
  EVENT_COUNT,
  FEATURED_EVENT_IDS,
  PLACES,
  PRACTICAL_PLACES,
  TICKETS,
  WORKING_CEILING,
} from "./data";

const CATEGORY_LABELS = {
  training: "Зал",
  groceries: "Продукты",
  delicacies: "Местные деликатесы",
  souvenirs: "Сувениры",
  date: "Свидание",
  treat: "Вкусняшки",
} as const;

const rub = (value: number) =>
  `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (symbol) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[symbol];
  });

const links = (items: Array<[string, string | undefined]>) => {
  const content = items
    .filter((item): item is [string, string] => Boolean(item[1]))
    .map(
      ([label, href]) =>
        `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`,
    )
    .join("");
  return content ? `<div class="links">${content}</div>` : "";
};

export function buildOfflinePlanHtml() {
  const selectedIds = new Set<string>(FEATURED_EVENT_IDS);
  const events = PLACES.filter((place) => selectedIds.has(place.id));

  const days = DAYS.map(
    (day) => `<article class="day">
      <div class="day-head"><div><span class="kicker">${escapeHtml(day.shortDate)} · ${escapeHtml(day.weekday)}</span>
      <h3>${escapeHtml(day.title)}</h3><p>${escapeHtml(day.subtitle)}</p></div>
      <strong>${escapeHtml(day.budget)}</strong></div>
      <div class="day-grid">
        <div><h4>Маршрут</h4><ol class="timeline">${day.timeline
          .map(
            (entry) => `<li><time>${escapeHtml(entry.time)}</time><div><b>${escapeHtml(entry.title)}</b>
              <p>${escapeHtml(entry.detail)}</p>
              ${entry.warning ? `<p class="warning">${escapeHtml(entry.warning)}</p>` : ""}
              ${links([
                ["Карта", entry.mapUrl],
                ["Маршрут", entry.routeUrl],
                ["Позвонить", entry.phone ? `tel:${entry.phone}` : undefined],
              ])}</div></li>`,
          )
          .join("")}</ol></div>
        <div><h4>Питание</h4><div class="meals">${day.meals
          .map(
            (meal) => `<section class="meal"><span class="kicker">${escapeHtml(meal.time)} · ${escapeHtml(meal.label)}</span>
              <b>${escapeHtml(meal.title)}</b><p>${escapeHtml(meal.location)}</p>
              <dl><dt>Взять</dt><dd>${escapeHtml(meal.pack)}</dd><dt>Хранение</dt><dd>${escapeHtml(meal.storage)}</dd>
              <dt>Вода</dt><dd>${escapeHtml(meal.water)}</dd></dl>
              ${meal.note ? `<p class="muted">${escapeHtml(meal.note)}</p>` : ""}
              ${links([
                ["Карта", meal.mapUrl],
                ["Маршрут", meal.routeUrl],
              ])}</section>`,
          )
          .join("")}</div></div>
      </div>
      <details><summary>План Б</summary><p>${escapeHtml(day.fallback)}</p></details>
    </article>`,
  ).join("");

  const eventCards = events
    .map(
      (place) => `<article class="card"><span class="kicker">${escapeHtml(place.context)}</span>
        <h3>${escapeHtml(place.title)}</h3><p>${escapeHtml(place.location)}</p>
        <p>${escapeHtml(place.practical)}</p><p class="muted">${escapeHtml(place.foodPolicy)}</p>
        <strong>${escapeHtml(place.price)}</strong>
        ${links([
          ["Карта", place.mapUrl],
          ["Маршрут", place.routeUrl],
          [place.sourceLabel ?? "Официальный сайт", place.sourceUrl],
        ])}</article>`,
    )
    .join("");

  const ticketCards = TICKETS.map(
    (ticket) => `<article class="card"><span class="kicker">${escapeHtml(ticket.date)}</span>
      <h3>${escapeHtml(ticket.title)}</h3><p>${escapeHtml(ticket.detail)}</p>
      <p><strong>${rub(ticket.unitPrice)} × ${ticket.initialQty} = ${rub(
        ticket.unitPrice * ticket.initialQty,
      )}</strong>${ticket.priceNote ? ` · ${escapeHtml(ticket.priceNote)}` : ""}</p>
      ${links([[ticket.action, ticket.href]])}</article>`,
  ).join("");

  const practicalCards = PRACTICAL_PLACES.map(
    (place) => `<article class="card"><span class="kicker">${escapeHtml(
      CATEGORY_LABELS[place.category],
    )}</span><h3>${escapeHtml(place.title)}</h3><p>${escapeHtml(place.location)}</p>
      <p>${escapeHtml(place.practical)}</p>
      ${links([
        ["Карта", place.mapUrl],
        ["Маршрут", place.routeUrl],
        ["Позвонить", place.phone ? `tel:${place.phone}` : undefined],
        [place.sourceLabel ?? "Сайт", place.sourceUrl],
      ])}</article>`,
  ).join("");

  return `<!doctype html><html lang="ru"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="dark light">
  <title>Адлер 2026 — автономный план</title><style>
  :root{color-scheme:dark;--bg:#071014;--panel:#0d191e;--line:#294048;--text:#edf5f4;--muted:#9bb0b5;--cyan:#70e0e4;--lime:#c7ef6f}
  *{box-sizing:border-box}html{scroll-behavior:smooth}body{max-width:1080px;margin:auto;padding:28px 18px 72px;background:var(--bg);color:var(--text);font:14px/1.55 system-ui,-apple-system,sans-serif}
  h1,h2,h3,h4,p{margin-top:0}h1{font-size:clamp(34px,8vw,72px);letter-spacing:-.065em;margin-bottom:4px}h2{font-size:clamp(24px,4vw,38px);margin-bottom:20px}h3{font-size:18px;margin-bottom:7px}h4{font-size:12px;letter-spacing:.12em;text-transform:uppercase}
  .hero{padding:38px 0 22px}.hero p{color:var(--muted)}.hero strong,.day-head>strong,.total strong{color:var(--lime)}
  nav{position:sticky;top:0;z-index:2;display:flex;gap:8px;overflow:auto;padding:10px 0;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(12px)}
  nav a,.links a{display:inline-flex;align-items:center;min-height:36px;padding:7px 10px;border:1px solid var(--line);color:var(--cyan);text-decoration:none;white-space:nowrap}
  main>section{padding:38px 0;border-top:1px solid var(--line)}.kicker{display:block;margin-bottom:7px;color:var(--cyan);font:700 10px/1.2 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase}
  .day{padding:24px 0;border-top:1px solid var(--line)}.day-head{display:flex;justify-content:space-between;gap:20px}.day-head>strong{white-space:nowrap}
  .day-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:32px}.timeline{list-style:none;padding:0}.timeline li{display:grid;grid-template-columns:58px 1fr;gap:10px;padding:12px 0;border-top:1px solid var(--line)}time{color:var(--lime);font:700 11px ui-monospace,monospace}
  .timeline p,.meal p,.card p{color:var(--muted);margin-bottom:8px}.warning{color:#ffc084!important}.meals{display:grid;gap:10px}.meal,.card{padding:16px;background:var(--panel);border:1px solid var(--line)}.meal b{display:block}
  dl{display:grid;grid-template-columns:72px 1fr;gap:3px 8px;margin:10px 0}dt{color:var(--muted)}dd{margin:0}.links{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.muted{color:var(--muted)}
  details{margin-top:14px;color:var(--muted)}summary{cursor:pointer;color:var(--text)}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:680px}td,th{padding:10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{color:var(--muted);font-size:10px;text-transform:uppercase}td:last-child,th:last-child{text-align:right;white-space:nowrap}
  .total{display:flex;justify-content:space-between;gap:16px;padding-top:16px;font-size:18px}
  @media(max-width:700px){body{padding:18px 12px 48px}.day-grid,.grid{grid-template-columns:1fr}.day-head{display:block}.day-head>strong{display:block;margin-bottom:14px}.timeline li{grid-template-columns:48px 1fr}nav{margin-inline:-12px;padding-inline:12px}.card{padding:14px}}
  @media print{:root{color-scheme:light;--bg:#fff;--panel:#fff;--line:#bbb;--text:#111;--muted:#444;--cyan:#111;--lime:#111}body{max-width:none;padding:0;font-size:10pt}nav{display:none}main>section{padding:18px 0}.day,.card,.meal,tr{break-inside:avoid}.grid{grid-template-columns:1fr 1fr}.links a{color:#111;padding:0;border:0;min-height:0}.links a::after{content:" (" attr(href) ")"}.hero{padding-top:0}}
  </style></head><body><header class="hero"><span class="kicker">FIELD ATLAS · автономная копия</span>
  <h1>Адлер 2026</h1><p>1–8 августа · 2 человека · рабочий потолок <strong>${rub(
    WORKING_CEILING,
  )}</strong></p></header>
  <nav aria-label="Разделы"><a href="#days">Дни</a><a href="#events">Мероприятия</a><a href="#tickets">Билеты</a><a href="#places">Адреса</a><a href="#budget">Смета</a></nav>
  <main><section id="days"><h2>Маршрут по дням</h2>${days}</section>
  <section id="events"><h2>${EVENT_COUNT} мероприятий</h2><div class="grid">${eventCards}</div></section>
  <section id="tickets"><h2>Билеты и бронь</h2><div class="grid">${ticketCards}</div></section>
  <section id="places"><h2>Практические адреса</h2><div class="grid">${practicalCards}</div></section>
  <section id="budget"><h2>Смета</h2><div class="table-wrap"><table><thead><tr><th>Статья</th><th>Расчёт</th><th>Комментарий</th><th>Сумма</th></tr></thead><tbody>${BUDGET.map(
    (row) =>
      `<tr><td>${escapeHtml(row.category)}</td><td>${escapeHtml(row.calculation)}</td><td>${escapeHtml(row.note)}</td><td>${rub(row.amount)}</td></tr>`,
  ).join("")}</tbody></table></div><div class="total"><span>Итого с резервом</span><strong>${rub(
    WORKING_CEILING,
  )}</strong></div></section></main></body></html>`;
}
