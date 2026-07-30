import type { Metadata } from "next";
import {
  Barbell,
  ForkKnife,
  Gift,
  Heart,
  ShoppingBag,
  Storefront,
} from "../components/UiIcons";
import AppShell from "../components/AppShell";
import { PageIntro, PlaceLinks } from "../components/Primitives";
import { PRACTICAL_PLACES, type PracticalPlaceCategory } from "../data";

export const metadata: Metadata = {
  title: "Полезные адреса — Адлер 2026",
};

const CATEGORY: Record<
  PracticalPlaceCategory,
  { label: string; icon: typeof Storefront }
> = {
  training: { label: "Зал", icon: Barbell },
  groceries: { label: "Продукты", icon: ShoppingBag },
  delicacies: { label: "Деликатесы", icon: ForkKnife },
  souvenirs: { label: "Сувениры", icon: Gift },
  date: { label: "Свидание", icon: Heart },
  treat: { label: "Вкусняшки", icon: Storefront },
};

export default function GuidePage() {
  return (
    <AppShell active="/guide" title="Адреса">
      <PageIntro
        eyebrow="Магазины и важные точки"
        title="Адреса без дополнительного поиска"
        lead="Продукты, местные деликатесы, сувениры, зал, свидание и вкусняшки — с конкретными адресами и маршрутом из плана."
      />
      <section className="guide-catalog">
        {PRACTICAL_PLACES.map((place, index) => {
          const meta = CATEGORY[place.category];
          const Icon = meta.icon;
          return (
            <article key={place.id}>
              <span className="guide-catalog__number">{String(index + 1).padStart(2, "0")}</span>
              <span className="guide-catalog__icon"><Icon size={18} weight="bold" /></span>
              <div>
                <p className="eyebrow">{meta.label}</p>
                <h2>{place.title}</h2>
                <p className="guide-catalog__address">{place.location}</p>
                <p>{place.practical}</p>
              </div>
              <PlaceLinks
                mapUrl={place.mapUrl}
                routeUrl={place.routeUrl}
                sourceUrl={place.sourceUrl}
                phone={place.phone}
              />
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
