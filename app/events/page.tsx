/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import { ArrowRight, MapPin } from "../components/UiIcons";
import AppShell from "../components/AppShell";
import { NextStepLink, PageIntro, PlaceLinks } from "../components/Primitives";
import { EVENT_COUNT, FEATURED_EVENT_IDS, PLACES } from "../data";

export const metadata: Metadata = {
  title: `${EVENT_COUNT} мероприятий — Адлер 2026`,
};

const BUY_LINKS: Record<string, { href: string; label: string }> = {
  "southern-cultures": { href: "/tickets#southern", label: "Билет в кассе" },
  "grove-rest": { href: "/tickets#grove", label: "Билет в день похода" },
  skypark: { href: "/tickets#skypark", label: "Выбрать билеты" },
  "rosa-valley": { href: "/tickets#rosa", label: "Выбрать билеты" },
  "jules-verne": { href: "/tickets#gym", label: "Уточнить вход" },
};

export default function EventsPage() {
  const ids = new Set<string>(FEATURED_EVENT_IDS);
  const events = PLACES.filter((place) => ids.has(place.id));
  return (
    <AppShell active="/events" title={`${EVENT_COUNT} мест`}>
      <PageIntro
        eyebrow="Утверждённый маршрут"
        title={`${EVENT_COUNT} мероприятий — все на одном экране`}
        lead="Без фильтров и запасных карточек: только те места, которые входят в поездку, с картой, маршрутом и покупкой."
        aside={
          <NextStepLink href="/tickets" step="Дальше · 03">
            Выбрать билеты
          </NextStepLink>
        }
      />
      <section className="event-catalog">
        {events.map((place, index) => (
          <article id={place.id} key={place.id}>
            <div className="event-catalog__image">
              <img src={place.image} alt={place.imageAlt} loading="lazy" decoding="async" />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="event-catalog__body">
              <p className="eyebrow">{place.context}</p>
              <h2>{place.title}</h2>
              <p className="event-location"><MapPin size={15} weight="fill" /> {place.location}</p>
              <p>{place.practical}</p>
              <p className="event-food">{place.foodPolicy}</p>
              <div className="event-catalog__foot">
                <b>{place.price}</b>
                <PlaceLinks
                  mapUrl={place.mapUrl}
                  routeUrl={place.routeUrl}
                  sourceUrl={place.sourceUrl}
                />
              </div>
              {BUY_LINKS[place.id] ? (
                <a className="event-buy" href={BUY_LINKS[place.id].href}>
                  {BUY_LINKS[place.id].label} <ArrowRight size={15} weight="bold" />
                </a>
              ) : (
                <span className="event-buy is-free">Вход свободный</span>
              )}
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
