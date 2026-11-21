import { useEffect, useRef, useState } from "react";

import { type LandingView, presentLanding } from "@/landing.ts";
import type { MarketingKit } from "@/types.ts";

import { brandFont, brandRoles, ctaColors, readableInk } from "./brand-style.ts";

/** Orden mobile: header, hero, beneficios, reseñas, fotos, cómo llegar, cierre, footer. */
export function BusinessLanding({ kit }: { kit: MarketingKit }) {
  const [now, setNow] = useState(() => new Date());
  const footerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [footerVisible, setFooterVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const view = presentLanding(kit, now);
  const schemaJson = JSON.stringify(view.schema);
  const roles = brandRoles(kit.brand);
  const ink = readableInk(roles.paper);
  const cta = ctaColors(roles.paper, roles.ink);
  const display = brandFont(kit.brand, "Títulos", "Georgia, serif");
  const text = brandFont(kit.brand, "Texto", "sans-serif");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const footer = footerRef.current;
    const hero = heroRef.current;
    const footerObserver = new IntersectionObserver(([entry]) => setFooterVisible(entry?.isIntersecting ?? false), { threshold: 0.4 });
    const heroObserver = new IntersectionObserver(([entry]) => setHeroVisible((entry?.intersectionRatio ?? 0) > 0.25), {
      threshold: [0, 0.25, 0.6],
    });
    if (footer) footerObserver.observe(footer);
    if (hero) heroObserver.observe(hero);
    return () => {
      footerObserver.disconnect();
      heroObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = view.titleTag;
    const meta = document.querySelector('meta[name="description"]');
    const created = !meta;
    const element = meta ?? document.createElement("meta");
    if (!meta) {
      element.setAttribute("name", "description");
      document.head.appendChild(element);
    }
    const previousContent = element.getAttribute("content");
    element.setAttribute("content", view.metaDescription);
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = schemaJson;
    document.head.appendChild(script);
    return () => {
      document.title = previousTitle;
      if (created) element.remove();
      else if (previousContent === null) element.removeAttribute("content");
      else element.setAttribute("content", previousContent);
      script.remove();
    };
  }, [view.titleTag, view.metaDescription, schemaJson]);

  return (
    <article className="rounded-3xl border border-line" style={{ background: roles.paper, color: ink, fontFamily: text }}>
      <header className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-medium"
            style={{ background: roles.ink, color: readableInk(roles.ink) }}
          >
            {kit.brand.logo.initials}
          </span>
          <p className="truncate text-base font-medium">{view.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {view.openLabel ? (
            <p className="inline-flex min-h-11 items-center rounded-full border px-3 text-sm" style={{ borderColor: roles.accent }}>
              {view.openLabel}
            </p>
          ) : null}
          <a
            className="inline-flex min-h-11 items-center text-base underline underline-offset-4"
            href={view.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Cómo llegar
          </a>
        </div>
      </header>

      <div className="flex flex-col gap-12 px-5 pb-10 sm:px-8 sm:pb-12">
        <section ref={heroRef} className="flex flex-col gap-5">
          {view.photos[0] ? (
            <img src={view.photos[0].url} alt={view.photos[0].alt} className="aspect-[4/3] w-full rounded-2xl object-cover" />
          ) : null}
          <p className="text-sm" style={{ color: roles.accent }}>
            {view.category}
          </p>
          <h1 className="text-4xl font-light tracking-[-0.03em] text-balance sm:text-5xl" style={{ fontFamily: display }}>
            {view.headline}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-pretty">{view.summary}</p>
          {view.ratingHook ? (
            <a
              className="inline-flex min-h-11 items-center text-base"
              href={view.ratingHook.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {view.ratingHook.label}
            </a>
          ) : null}
          {view.looseQuote ? (
            <blockquote className="max-w-xl text-pretty">
              <p>«{view.looseQuote.text}»</p>
              <footer className="mt-2 text-sm opacity-70">{view.looseQuote.author}</footer>
            </blockquote>
          ) : null}
          <Contact view={view} colors={cta} />
          <p className="text-sm">
            {view.street}, {view.locality}
          </p>
          {view.todayHours ? <p className="text-sm">{view.todayHours}</p> : null}
        </section>

        {view.benefits.length > 0 ? (
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-light tracking-tight sm:text-3xl" style={{ fontFamily: display }}>
              {view.benefitsHeading}
            </h2>
            <ul className="grid gap-6 sm:grid-cols-3">
              {view.benefits.map((benefit) => (
                <li key={benefit} className="border-t pt-4 text-pretty" style={{ borderColor: roles.accent }}>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {view.reviewBlock ? (
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-light tracking-tight" style={{ fontFamily: display }}>
              Reseñas
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {view.reviewBlock.map((review) => (
                <li key={`${review.author}-${review.text}`} className="rounded-2xl p-5" style={{ background: "rgb(255 255 255 / 0.45)" }}>
                  <p className="text-pretty">«{review.text}»</p>
                  <p className="mt-3 text-sm opacity-70">{review.author}</p>
                </li>
              ))}
            </ul>
            <Contact view={view} colors={cta} />
          </section>
        ) : null}

        {view.photos.length > 0 ? (
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-light tracking-tight" style={{ fontFamily: display }}>
              Fotos
            </h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {view.photos.map((photo) => (
                <li key={photo.url}>
                  <img src={photo.url} alt={photo.alt} className="aspect-square w-full rounded-xl object-cover" />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-light tracking-tight" style={{ fontFamily: display }}>
              Marca
            </h2>
            <ul className="grid grid-cols-2 gap-3">
              {kit.brand.palette.map((color) => (
                <li key={color.hex} className="flex min-h-11 items-center gap-3">
                  <span aria-hidden="true" className="size-8 rounded-md border border-line" style={{ background: color.hex }} />
                  <span>
                    {color.name}
                    <span className="block text-sm opacity-70">{color.hex}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-light tracking-tight" style={{ fontFamily: display }}>
            Cómo llegar
          </h2>
          <p className="font-medium">{view.name}</p>
          <p>{view.address}</p>
          {view.phoneLine ? <p>{view.phoneKind === "whatsapp" ? `WhatsApp ${view.phoneLine}` : view.phoneLine}</p> : null}
          <p>{view.locality}, Mendoza</p>
          {view.hoursText ? <p className="text-sm whitespace-pre-line leading-relaxed">{view.hoursText}</p> : null}
          {view.todayHours ? <p className="text-sm">{view.todayHours}</p> : null}
          {view.mapEmbedUrl ? (
            <iframe
              title={`Mapa de ${view.name}`}
              src={view.mapEmbedUrl}
              className="mt-2 h-56 w-full rounded-2xl border-0"
              loading="lazy"
            />
          ) : null}
          <a
            className="inline-flex min-h-11 w-fit items-center text-base underline underline-offset-4"
            href={view.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Cómo llegar
          </a>
        </section>

        <section className="flex flex-col items-start gap-4 rounded-3xl px-6 py-8" style={{ background: cta.background, color: cta.color }}>
          <h2 className="text-2xl font-light tracking-tight text-balance" style={{ fontFamily: display }}>
            {view.headline}
          </h2>
          <Contact view={view} colors={{ background: cta.color, color: cta.background }} />
        </section>
      </div>

      <footer ref={footerRef} className="flex flex-col gap-2 border-t px-5 py-6 text-sm sm:px-8" style={{ borderColor: roles.accent }}>
        <p className="font-medium">{view.name}</p>
        <p>{view.address}</p>
        {view.phoneLine ? <p>{view.phoneKind === "whatsapp" ? `WhatsApp ${view.phoneLine}` : view.phoneLine}</p> : null}
        <a
          className="inline-flex min-h-11 w-fit items-center underline underline-offset-4"
          href={view.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver la ficha
        </a>
        {view.whatsappUrl ? (
          <a
            className="inline-flex min-h-11 w-fit items-center underline underline-offset-4"
            href={view.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {view.cta}
          </a>
        ) : null}
      </footer>

      {view.contactLabel && view.whatsappUrl && !footerVisible && !heroVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
          <a
            href={view.whatsappUrl}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-base font-medium"
            style={{ background: cta.background, color: cta.color }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {view.contactLabel}
          </a>
          <p className="mt-1 text-center text-xs text-muted">{view.ctaNote}</p>
        </div>
      ) : null}
    </article>
  );
}

function Contact({ view, colors }: { view: LandingView; colors: { background: string; color: string } }) {
  const href = view.whatsappUrl ?? view.phoneUrl;
  if (!href || !view.contactLabel) return null;
  return (
    <div className="flex flex-col items-start gap-2">
      <a
        href={href}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-base font-medium sm:w-fit"
        style={{ background: colors.background, color: colors.color }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {view.contactLabel}
      </a>
      <p className="text-sm opacity-80">{view.ctaNote}</p>
    </div>
  );
}
