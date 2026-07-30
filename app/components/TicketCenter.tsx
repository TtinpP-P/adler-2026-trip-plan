"use client";

import {
  ArrowRight,
  CaretDown,
  Check,
  CheckCircle,
  Minus,
  Plus,
  ShoppingCart,
  Ticket,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { TICKETS, type TicketItem } from "../data";
import { formatRub } from "../format";

const MODE_LABELS: Record<TicketItem["mode"], string> = {
  online: "онлайн",
  onsite: "в кассе",
  free: "бесплатно",
  booking: "подтвердить",
};

export default function TicketCenter() {
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(TICKETS.map((ticket) => [ticket.id, ticket.initialQty])),
  );
  const [purchased, setPurchased] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedQuantities = JSON.parse(localStorage.getItem("adler-ticket-qty") || "{}");
        const storedPurchased = JSON.parse(localStorage.getItem("adler-ticket-status") || "{}");
        setQuantities((current) => ({ ...current, ...storedQuantities }));
        setPurchased(storedPurchased);
      } catch {
        // Keep the safe defaults when storage contains invalid data.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const updateQty = (id: string, value: number) => {
    setQuantities((current) => {
      const next = { ...current, [id]: Math.max(0, Math.min(8, value)) };
      localStorage.setItem("adler-ticket-qty", JSON.stringify(next));
      return next;
    });
  };

  const togglePurchased = (id: string) => {
    setPurchased((current) => {
      const next = { ...current, [id]: !current[id] };
      localStorage.setItem("adler-ticket-status", JSON.stringify(next));
      return next;
    });
  };

  const selected = useMemo(
    () => TICKETS.filter((ticket) => (quantities[ticket.id] ?? 0) > 0),
    [quantities],
  );
  const total = selected.reduce(
    (sum, ticket) => sum + ticket.unitPrice * (quantities[ticket.id] ?? 0),
    0,
  );
  const onlineSelected = selected.filter((ticket) => ticket.mode === "online");

  return (
    <>
      <a className="mobile-cart-summary" href="#ticket-cart">
        <ShoppingCart size={16} weight="fill" />
        <span>{selected.length} позиций</span>
        <b>{formatRub(total)}</b>
        <ArrowRight size={15} weight="bold" />
      </a>
      <div className="ticket-layout">
        <section className="ticket-list" aria-label="Каталог билетов">
        {TICKETS.map((ticket, index) => {
          const quantity = quantities[ticket.id] ?? 0;
          const rowTotal = ticket.unitPrice * quantity;
          return (
            <article
              className={`ticket-row${purchased[ticket.id] ? " is-complete" : ""}`}
              id={ticket.id}
              key={ticket.id}
            >
              <span className="ticket-row__index">{String(index + 1).padStart(2, "0")}</span>
              <div className="ticket-row__main">
                <div className="ticket-row__meta">
                  <span>{ticket.date}</span>
                  <span className={`status status--${ticket.mode}`}>{MODE_LABELS[ticket.mode]}</span>
                </div>
                <h2>{ticket.title}</h2>
                <p>{ticket.detail}</p>
              </div>
              <div className="ticket-row__price">
                <b>{ticket.unitPrice ? formatRub(ticket.unitPrice) : "0 ₽"}</b>
                <small>{ticket.priceNote ?? "за человека"}</small>
              </div>
              {ticket.mode === "free" ? (
                <span className="ticket-row__free">
                  <CheckCircle size={18} weight="fill" /> билет не нужен
                </span>
              ) : (
                <div className="quantity" aria-label={`Количество: ${ticket.title}`}>
                  <button
                    type="button"
                    onClick={() => updateQty(ticket.id, quantity - 1)}
                    aria-label="Уменьшить"
                  >
                    <Minus size={13} weight="bold" />
                  </button>
                  <output>{quantity}</output>
                  <button
                    type="button"
                    onClick={() => updateQty(ticket.id, quantity + 1)}
                    aria-label="Увеличить"
                  >
                    <Plus size={13} weight="bold" />
                  </button>
                </div>
              )}
              <div className="ticket-row__actions">
                <a href={ticket.href} target="_blank" rel="noreferrer">
                  {ticket.action}
                  <ArrowRight size={15} weight="bold" />
                </a>
                <button
                  type="button"
                  className={purchased[ticket.id] ? "is-checked" : ""}
                  onClick={() => togglePurchased(ticket.id)}
                >
                  <Check size={14} weight="bold" />
                  {purchased[ticket.id] ? "Готово" : "Отметить покупку"}
                </button>
              </div>
              <strong className="ticket-row__total">{formatRub(rowTotal)}</strong>
            </article>
          );
        })}
        </section>

      <aside className="cart-panel" id="ticket-cart">
        <div className="cart-panel__head">
          <ShoppingCart size={20} weight="fill" />
          <div>
            <p className="eyebrow">Ваш набор</p>
            <h2>{selected.length} позиций</h2>
          </div>
        </div>
        <div className="cart-lines">
          {selected.map((ticket) => (
            <div key={ticket.id}>
              <span>
                {ticket.title}
                <small>{quantities[ticket.id]} шт.</small>
              </span>
              <b>{formatRub(ticket.unitPrice * quantities[ticket.id])}</b>
            </div>
          ))}
        </div>
        <div className="cart-total">
          <span>Билеты по плану</span>
          <b>{formatRub(total)}</b>
        </div>
        <div className="checkout-list">
          {onlineSelected.map((ticket) => (
            <a href={ticket.href} target="_blank" rel="noreferrer" key={ticket.id}>
              <Ticket size={16} weight="fill" />
              {ticket.action}
              <ArrowRight size={15} weight="bold" />
            </a>
          ))}
        </div>
        <details className="cart-disclosure">
          <summary>
            Как проходит оплата
            <CaretDown size={15} weight="bold" />
          </summary>
          <p className="cart-note">
            Выбор и расчёт остаются здесь. Оплата открывается у официального продавца:
            данные карты не попадают на сайт поездки.
          </p>
        </details>
      </aside>
      </div>
    </>
  );
}
