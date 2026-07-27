import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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

test("server-renders the compact Adler trip planner", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Адлер 2026 — интерактивный план поездки/);
  assert.match(html, /Все 6 мероприятий/);
  assert.match(html, /55[^\d]*300/);
  assert.match(html, /Продукты, деликатесы, сувениры и важные точки/);
  assert.match(html, /Скачать HTML/);
  assert.doesNotMatch(html, /Открыть ближайший день/);
  assert.doesNotMatch(html, /Скачать офлайн/);
  assert.doesNotMatch(html, /Главное правило/);
  assert.doesNotMatch(html, /<footer\b/i);
});

test("keeps six main events and all practical link categories in source", async () => {
  const [planner, data, css] = await Promise.all([
    readFile(new URL("../app/TripPlanner.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const featuredBlock = data.match(
    /export const FEATURED_EVENT_IDS = \[([\s\S]*?)\] as const;/,
  );
  assert.ok(featuredBlock);
  assert.equal((featuredBlock[1].match(/"[^"]+"/g) ?? []).length, 6);

  for (const value of [
    "Тисо-самшитовая роща",
    "Жюль Верн",
    "Апельсин.Базар",
    "Центральный Адлерский рынок",
    "Море сувениров",
    "Сырные дела",
  ]) {
    assert.match(data, new RegExp(value));
  }

  assert.match(planner, /sidebarCollapsed/);
  assert.match(planner, /dataset\.theme/);
  assert.match(css, /\[data-theme="light"\]/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(planner, /\bPrinter\b/);
  assert.doesNotMatch(planner, /<footer\b/);
});
