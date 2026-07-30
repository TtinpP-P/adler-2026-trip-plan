import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { DAYS } from "../app/data";
import { buildOfflinePlanHtml } from "../app/offline-plan";

const outputPath = resolve(
  process.cwd(),
  "..",
  "Адлер_2026_ФИНАЛЬНЫЙ_САЙТ.html",
);

const images = await Promise.all(
  DAYS.map(async (day) => {
    const mobileImage = day.image.replace(/\.webp$/, "-640.webp");
    const imagePath = resolve(process.cwd(), "public", mobileImage.slice(1));
    const bytes = await readFile(imagePath);
    return {
      alt: day.imageAlt,
      src: `data:image/webp;base64,${bytes.toString("base64")}`,
    };
  }),
);

let imageIndex = 0;
let html = buildOfflinePlanHtml().replaceAll(
  '<article class="day">',
  () => {
    const image = images[imageIndex++];
    return `<article class="day"><img class="day-image" src="${image.src}" alt="${image.alt.replaceAll('"', "&quot;")}">`;
  },
);

html = html.replace(
  "</style>",
  `.day-image{display:block;width:100%;height:clamp(180px,32vw,360px);margin-bottom:18px;object-fit:cover;filter:saturate(.82) contrast(1.04)}
  @media(max-width:700px){.day-image{height:210px;margin-bottom:14px}}
  @media print{.day-image{height:160px;filter:none}}
  </style>`,
);

await writeFile(outputPath, html, "utf8");
console.log(outputPath);
