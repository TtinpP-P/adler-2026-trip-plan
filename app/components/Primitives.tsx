"use client";

import {
  ArrowRight,
  ArrowSquareOut,
  MapPin,
  NavigationArrow,
  Phone,
} from "@phosphor-icons/react";
import Link from "next/link";

export function PageIntro({
  eyebrow,
  title,
  lead,
  aside,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-intro__lead">{lead}</p>
      </div>
      {aside ? <div className="page-intro__aside">{aside}</div> : null}
    </header>
  );
}

export function NextStepLink({
  href,
  step,
  children,
}: {
  href: string;
  step: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="primary-path" href={href}>
      <span>
        <small>{step}</small>
        <b>{children}</b>
      </span>
      <ArrowRight size={18} weight="bold" aria-hidden="true" />
    </Link>
  );
}

export function TextLink({
  href,
  children,
  kind = "default",
}: {
  href: string;
  children: React.ReactNode;
  kind?: "default" | "route" | "buy";
}) {
  return (
    <a
      className={`text-link text-link--${kind}`}
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
    >
      {children}
      {kind === "route" ? (
        <NavigationArrow size={14} weight="bold" />
      ) : (
        <ArrowSquareOut size={14} weight="bold" />
      )}
    </a>
  );
}

export function PlaceLinks({
  mapUrl,
  routeUrl,
  sourceUrl,
  phone,
}: {
  mapUrl?: string;
  routeUrl?: string;
  sourceUrl?: string;
  phone?: string;
}) {
  return (
    <div className="inline-links">
      {mapUrl ? (
        <a href={mapUrl} target="_blank" rel="noreferrer">
          <MapPin size={14} weight="fill" /> На карте
        </a>
      ) : null}
      {routeUrl ? (
        <a href={routeUrl} target="_blank" rel="noreferrer">
          <NavigationArrow size={14} weight="fill" /> Маршрут
        </a>
      ) : null}
      {phone ? (
        <a href={`tel:${phone}`}>
          <Phone size={14} weight="fill" /> Позвонить
        </a>
      ) : null}
      {sourceUrl ? (
        <a href={sourceUrl} target="_blank" rel="noreferrer">
          <ArrowSquareOut size={14} weight="bold" /> Сайт
        </a>
      ) : null}
    </div>
  );
}
