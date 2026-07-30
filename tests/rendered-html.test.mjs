import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const routeHref = (route) =>
  BASE_PATH ? `${BASE_PATH}${route === "/" ? "/" : `${route}/`}` : route;

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  const url = new URL(path, "http://localhost");
  if (url.pathname !== "/" && !url.pathname.endsWith("/")) {
    url.pathname += "/";
  }

  return worker.fetch(
    new Request(url, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the multipage Adler overview", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /До поездки — 2 дня/);
  assert.match(html, /Следующее действие/);
  assert.match(html, /Подготовка/);
  assert.match(html, /Прибытие/);
  assert.match(html, /Финальная точка/);
  assert.match(html, /52[^\d]*700/);
  assert.ok(html.includes(`href="${routeHref("/plan")}"`));
  assert.ok(html.includes(`href="${routeHref("/tickets")}"`));
  assert.match(html, /Скачать HTML/);
  assert.doesNotMatch(html, /Главное правило/);
  assert.doesNotMatch(html, /<footer\b/i);
});

test("server-renders all requested task pages", async () => {
  const expectations = new Map([
    ["/plan", /Каталог маршрута/],
    ["/events", /5 мероприятий/],
    ["/tickets", /Билеты и бронь/],
    ["/food", /Питание по дням/],
    ["/guide", /Адреса без дополнительного поиска/],
    ["/budget", /План и фактические траты/],
  ]);

  for (const [path, pattern] of expectations) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), pattern, path);
  }
});

test("connects the supporting pages into one contextual action flow", async () => {
  const expectations = new Map([
    ["/plan", `href="${routeHref("/events")}"`],
    ["/events", `href="${routeHref("/tickets")}"`],
    ["/tickets", `href="${routeHref("/food")}"`],
    ["/food", `href="${routeHref("/guide")}"`],
    ["/guide", `href="${routeHref("/budget")}"`],
    ["/budget", `href="${routeHref("/plan")}"`],
  ]);

  for (const [path, nextHref] of expectations) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), new RegExp(nextHref), path);
  }
});

test("exports every public page as a standalone static document", async () => {
  const files = [
    "index.html",
    "plan/index.html",
    "events/index.html",
    "tickets/index.html",
    "food/index.html",
    "guide/index.html",
    "budget/index.html",
  ];

  for (const file of files) {
    const html = await readFile(new URL(`../dist/client/${file}`, import.meta.url), "utf8");
    assert.match(html, /<main\b/);
    assert.ok(html.length > 10_000, `${file} is unexpectedly small`);
    if (BASE_PATH) {
      assert.match(html, new RegExp(`${BASE_PATH.replaceAll("/", "\\/")}\\/assets\\/`));
    }
  }
});

test("keeps horizontal day catalogue, official checkout handoff and five events", async () => {
  const [data, dayCatalog, journey, tickets, budget, css, artDirection, motion, catalogue, actionFlow, accessibility] = await Promise.all([
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/DayCatalog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/JourneyOverview.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/TicketCenter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/BudgetTracker.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/art-direction.css", import.meta.url), "utf8"),
    readFile(new URL("../app/motion.css", import.meta.url), "utf8"),
    readFile(new URL("../app/catalog-mechanics.css", import.meta.url), "utf8"),
    readFile(new URL("../app/action-flow.css", import.meta.url), "utf8"),
    readFile(new URL("../app/accessibility.css", import.meta.url), "utf8"),
  ]);

  const featuredBlock = data.match(
    /export const FEATURED_EVENT_IDS = \[([\s\S]*?)\] as const;/,
  );
  assert.ok(featuredBlock);
  assert.equal((featuredBlock[1].match(/"[^"]+"/g) ?? []).length, 5);
  assert.doesNotMatch(data, /Олимпийский парк|Поющий фонтан|Сочи Парк/);
  assert.doesNotMatch(data, /\/places\/[^"]+\.(?:jpg|png)/);

  assert.match(dayCatalog, /DAY_CODES/);
  assert.match(dayCatalog, /role="tablist"/);
  assert.match(dayCatalog, /aria-selected=\{isActive\}/);
  assert.match(dayCatalog, /role="tabpanel"/);
  assert.match(dayCatalog, /hidden=\{!isOpen\}/);
  assert.match(dayCatalog, /event\.key === "ArrowRight"/);
  assert.match(dayCatalog, /day-route__track/);
  assert.match(dayCatalog, /day-content__grid/);
  assert.match(dayCatalog, /3 приёма пищи/);
  assert.match(dayCatalog, /Логистика питания/);
  assert.match(dayCatalog, /Открывать только при необходимости/);
  assert.match(css, /\.day-catalog\s*\{[\s\S]*display:\s*flex/);
  assert.match(css, /\.day-row\.is-open[\s\S]*flex:\s*1 1/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*grid-template-rows:\s*0fr/);
  assert.match(css, /\.day-route__facts/);
  assert.match(css, /\.day-notes__grid/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.day-content__grid\s*\{[\s\S]*grid-template-columns:\s*1fr/);

  assert.match(journey, /phaseForDate/);
  assert.match(journey, /adler-ticket-status/);
  assert.match(journey, /adler-route-checks/);
  assert.match(journey, /aria-current=\{isActive \? "step"/);
  assert.match(css, /\.journey-track/);

  assert.match(data, /export const TICKETS/);
  assert.match(data, /https:\/\/skypark\.ru\//);
  assert.match(data, /https:\/\/rosakhutor\.ru\/tickets\//);
  assert.match(tickets, /import \{ TICKETS, type TicketItem \} from "\.\.\/data"/);
  assert.match(tickets, /официального продавца/);
  assert.match(tickets, /localStorage/);
  assert.match(css, /\[data-theme="light"\]/);
  assert.match(css, /prefers-reduced-motion/);

  assert.match(artDirection, /FIELD ATLAS/);
  assert.match(artDirection, /--atlas-topo-line/);
  assert.match(artDirection, /\.journey-focus__media\s*\{[\s\S]*position:\s*absolute/);
  assert.match(artDirection, /\.day-visual\s*\{[\s\S]*min-height:\s*340px/);
  assert.match(artDirection, /\.event-catalog > article:first-child/);
  assert.match(artDirection, /\.day-route__track > li:not\(:last-child\)::after/);
  assert.match(artDirection, /@media \(max-width: 620px\)/);

  assert.match(dayCatalog, /aria-live="polite"/);
  assert.match(motion, /MOTION CONTINUITY/);
  assert.match(motion, /--motion-page-enter/);
  assert.match(motion, /@view-transition/);
  assert.match(motion, /\.journey-track::before[\s\S]*atlas-route-draw/);
  assert.match(motion, /\.day-row\.is-open \.day-route__track/);
  assert.match(motion, /prefers-reduced-motion:\s*reduce/);

  assert.match(catalogue, /DAY CATALOGUE MECHANICS/);
  assert.match(catalogue, /\.day-catalog\s*\{[\s\S]*display:\s*block/);
  assert.match(catalogue, /\.day-row__inner,[\s\S]*overflow:\s*visible/);
  assert.match(catalogue, /@media \(min-width: 1181px\)[\s\S]*display:\s*flex/);
  assert.match(catalogue, /\.day-selector button\.is-active\s*\{[\s\S]*flex:\s*3\.25/);
  assert.match(catalogue, /grid-template-columns:\s*repeat\(4/);
  assert.match(catalogue, /prefers-reduced-motion:\s*reduce/);

  assert.match(tickets, /cart-disclosure/);
  assert.match(actionFlow, /CONTEXTUAL ACTION FLOW/);
  assert.match(actionFlow, /\.page-intro__aside/);
  assert.match(actionFlow, /\.primary-path::before/);
  assert.match(actionFlow, /\.cart-disclosure/);

  assert.match(tickets, /aria-live="polite"/);
  assert.match(budget, /aria-live="polite"/);
  assert.match(accessibility, /RESPONSIVE ACCESSIBILITY/);
  assert.match(accessibility, /env\(safe-area-inset-top/);
  assert.match(accessibility, /\.money-input:focus-within/);
  assert.match(accessibility, /min-height:\s*44px/);
  assert.match(accessibility, /forced-colors:\s*active/);
});

test("ships responsive WebP photography within the mobile asset budget", async () => {
  const [data, imageMeta] = await Promise.all([
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/imageMeta.ts", import.meta.url), "utf8"),
  ]);
  const imagePaths = [...new Set(
    [...data.matchAll(/image:\s*"([^"]+)"/g)].map((match) => match[1]),
  )];

  for (const imagePath of imagePaths) {
    assert.match(imagePath, /\.webp$/);
    const mobilePath = imagePath.replace(/\.webp$/, "-640.webp");
    const mobileFile = new URL(`../public${mobilePath}`, import.meta.url);
    const fileStat = await stat(mobileFile);
    assert.ok(fileStat.size < 100_000, `${mobilePath} exceeds 100 KB`);
  }

  assert.match(imageMeta, /srcSet:/);
  assert.match(imageMeta, /width:\s*1280/);
  assert.match(imageMeta, /height:\s*960/);
});

test("builds a complete self-contained offline field plan", async () => {
  const [offlinePlan, appShell, accessibility] = await Promise.all([
    readFile(new URL("../app/offline-plan.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AppShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/accessibility.css", import.meta.url), "utf8"),
  ]);

  assert.match(offlinePlan, /PRACTICAL_PLACES/);
  assert.match(offlinePlan, /TICKETS/);
  assert.match(offlinePlan, /href="#days"/);
  assert.match(offlinePlan, /href="#budget"/);
  assert.match(offlinePlan, /@media print/);
  assert.match(offlinePlan, /tel:\$\{place\.phone\}/);
  assert.match(offlinePlan, /meal\.pack/);
  assert.match(offlinePlan, /row\.note/);
  assert.doesNotMatch(offlinePlan, /<img\b/);

  assert.match(appShell, /buildOfflinePlanHtml/);
  assert.match(appShell, /HTML скачан/);
  assert.match(appShell, /aria-live="polite"/);
  assert.match(accessibility, /\.download-control\.is-complete/);
});

test("adapts the complete interface for iPhone and large Android phones", async () => {
  const [layout, mobile] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/mobile-devices.css", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /mobile-devices\.css/);
  assert.match(mobile, /@media \(max-width: 480px\)/);
  assert.match(mobile, /@media \(max-width: 400px\)/);
  assert.match(mobile, /safe-area-inset-top/);
  assert.match(mobile, /safe-area-inset-bottom/);
  assert.match(mobile, /min-height:\s*48px/);
  assert.match(mobile, /overflow-x:\s*clip/);
  assert.match(mobile, /orientation:\s*landscape/);
  assert.match(mobile, /\.ticket-row[\s\S]*grid-template-columns:\s*24px minmax\(0,\s*1fr\)/);
  assert.match(mobile, /\.event-catalog > article[\s\S]*grid-template-rows:\s*190px auto/);
});
