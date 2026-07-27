import type { Metadata } from "next";
import "@fontsource-variable/lora";
import "@fontsource-variable/raleway";
import "./globals.css";

export const metadata: Metadata = {
  title: "Адлер 2026 — интерактивный план",
  description:
    "Персональный план поездки с маршрутами, едой, каталогом мест и бюджетом.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
