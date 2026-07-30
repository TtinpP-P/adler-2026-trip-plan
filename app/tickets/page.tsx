import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import { NextStepLink, PageIntro } from "../components/Primitives";
import TicketCenter from "../components/TicketCenter";

export const metadata: Metadata = {
  title: "Билеты и бронь — Адлер 2026",
};

export default function TicketsPage() {
  return (
    <AppShell active="/tickets" title="Билеты">
      <PageIntro
        eyebrow="Выбор → расчёт → официальный продавец"
        title="Билеты и бронь"
        lead="Количество и общий бюджет считаются здесь. Для защищённой оплаты сайт переводит ровно на официальную форму выбранного места."
        aside={
          <NextStepLink href="/food" step="Дальше · 04">
            Сверить питание
          </NextStepLink>
        }
      />
      <div className="booking-steps" aria-label="Этапы покупки">
        <span className="is-active"><b>01</b> Выбрать</span>
        <span><b>02</b> Сверить сумму</span>
        <span><b>03</b> Оплатить официально</span>
        <span><b>04</b> Отметить готовым</span>
      </div>
      <TicketCenter />
    </AppShell>
  );
}
