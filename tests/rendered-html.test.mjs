import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
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
  assert.match(html, /href="\/plan"/);
  assert.match(html, /href="\/tickets"/);
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

test("keeps horizontal day catalogue, official checkout handoff and five events", async () => {
  const [data, dayCatalog, journey, tickets, css] = await Promise.all([
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/DayCatalog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/JourneyOverview.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/TicketCenter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const featuredBlock = data.match(
    /export const FEATURED_EVENT_IDS = \[([\s\S]*?)\] as const;/,
  );
  assert.ok(featuredBlock);
  assert.equal((featuredBlock[1].match(/"[^"]+"/g) ?? []).length, 5);
  assert.doesNotMatch(data, /Олимпийский парк|Поющий фонтан|Сочи Парк/);

  assert.match(dayCatalog, /DAY_CODES/);
  assert.match(dayCatalog, /aria-expanded/);
  assert.match(css, /\.day-catalog\s*\{[\s\S]*display:\s*flex/);
  assert.match(css, /\.day-row\.is-open[\s\S]*flex:\s*1 1/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*grid-template-rows:\s*0fr/);

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
});
