import type { AnchorHTMLAttributes } from "react";

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export function sitePath(href: string) {
  if (
    !BASE_PATH ||
    !href.startsWith("/") ||
    href.startsWith("//") ||
    href.startsWith(BASE_PATH)
  ) {
    return href;
  }

  const suffixIndex = href.search(/[?#]/);
  const path = suffixIndex === -1 ? href : href.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : href.slice(suffixIndex);
  const hasFileExtension = /\/[^/]+\.[^/]+$/.test(path);
  const normalizedPath =
    path === "/" || path.endsWith("/") || hasFileExtension ? path : `${path}/`;

  return `${BASE_PATH}${normalizedPath}${suffix}`;
}

export default function SiteLink({
  href,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string }) {
  return <a href={sitePath(href)} {...props} />;
}
