import type { Metadata } from "next";
import "@fontsource-variable/lora";
import "@fontsource-variable/raleway";
import "./globals.css";
import "./art-direction.css";
import "./motion.css";
import "./catalog-mechanics.css";
import "./action-flow.css";
import "./accessibility.css";
import "./mobile-devices.css";
import { assetPath } from "./imageMeta";

export const metadata: Metadata = {
  title: {
    default: "Адлер 2026 — интерактивный план",
    template: "%s",
  },
  description:
    "Многостраничный план поездки с маршрутом по дням, билетами, едой, адресами и сметой.",
  icons: {
    icon: assetPath("/favicon.svg"),
    shortcut: assetPath("/favicon.svg"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
