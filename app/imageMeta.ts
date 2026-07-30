const IMAGE_META: Record<string, { width: number; height: number }> = {
  "/places/adler-station.webp": { width: 1280, height: 960 },
  "/places/southern-cultures.webp": { width: 1400, height: 700 },
  "/places/date-happiness.webp": { width: 1200, height: 630 },
  "/places/grove.webp": { width: 1300, height: 867 },
  "/places/skypark.webp": { width: 1200, height: 680 },
  "/places/rosa.webp": { width: 2000, height: 1333 },
  "/places/cafe-malina.webp": { width: 1200, height: 800 },
  "/places/surf-coffee.webp": { width: 772, height: 484 },
  "/places/date-star.webp": { width: 1400, height: 973 },
};

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export function assetPath(src: string) {
  if (!BASE_PATH || !src.startsWith("/") || src.startsWith(BASE_PATH)) {
    return src;
  }

  return `${BASE_PATH}${src}`;
}

export function responsiveImageProps(src: string) {
  const meta = IMAGE_META[src];
  if (!meta) {
    return { src: assetPath(src) };
  }

  const mobileSrc = src.replace(/\.webp$/, "-640.webp");
  return {
    src: assetPath(src),
    width: meta.width,
    height: meta.height,
    srcSet: `${assetPath(mobileSrc)} 640w, ${assetPath(src)} ${meta.width}w`,
  };
}
