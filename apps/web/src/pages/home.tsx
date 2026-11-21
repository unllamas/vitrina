import { useNavigate } from "@tanstack/react-router";
import { Button } from "@vitrina/ui/components/button";
import { Input } from "@vitrina/ui/components/input";
import { Section } from "@vitrina/ui/components/section";
import { type FormEvent, useState } from "react";

import { MendozaHero } from "@/components/mendoza-hero.tsx";
import { DEMO_KIT_ID } from "@/fixture.ts";

function businessQuery(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 4000) return null;
  return trimmed;
}

const businessTypes = ["Cafés", "Bodegas", "Peluquerías", "Panaderías", "Almacenes", "Verdulerías"];

const metrics = [
  { value: "1", label: "link de Google Business" },
  { value: "9", label: "posteos para Instagram" },
  { value: "5", label: "ideas de anuncios" },
];

const steps = [
  {
    title: "Pegá el link",
    text: "Copiás la URL de la ficha de Google Business, o el nombre del comercio.",
    icon: LinkIcon,
  },
  {
    title: "Se arma el kit",
    text: "Salen el branding, una landing con WhatsApp, 9 posteos y 5 ideas de anuncios.",
    icon: KitIcon,
  },
  {
    title: "Pedí un ajuste",
    text: "Un texto libre cambia la parte que no cierra. Sale 1 crédito.",
    icon: PencilIcon,
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = businessQuery(link);
    if (!parsed) {
      setError(link.trim() ? "Escribí un nombre o pegá un link." : "Pegá el link de la ficha.");
      return;
    }
    setError(null);
    void navigate({ to: "/kit/$kitId", params: { kitId: DEMO_KIT_ID }, search: { link: parsed } });
  }

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] sm:h-[38rem]" aria-hidden="true">
          <MendozaHero />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col px-5 pt-16 pb-8 sm:pt-28 sm:pb-16">
          <h1 className="max-w-4xl text-5xl font-light tracking-[-0.035em] text-balance sm:text-7xl sm:leading-[1.02]">
            Pegá el link de tu negocio
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-pretty text-muted sm:text-base">
            Con la ficha de Google Business armamos el branding, la landing, 9 posteos y 5 ideas de anuncios.
          </p>
          <form id="armar" className="mt-8 flex max-w-xl scroll-mt-28 flex-col gap-4" onSubmit={onSubmit} noValidate>
            <Input
              name="business-link"
              label="Link de Google Business"
              hint="Link de Google Maps, un link corto o el nombre del comercio."
              error={error ?? undefined}
              inputMode="url"
              autoComplete="url"
              placeholder="https://maps.app.goo.gl/ejemplo"
              value={link}
              onChange={(event) => setLink(event.target.value)}
            />
            <Button type="submit" className="w-full sm:w-fit">
              Armar el kit
            </Button>
          </form>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            El primer kit es gratis. En el resultado vas a ver los 30 créditos del registro, para probar un ajuste. Los datos son
            inventados.
          </p>
        </div>
      </section>

      <section aria-label="Rubros" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <p className="text-center text-sm text-muted">Pensado para comercios de Mendoza</p>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {businessTypes.map((type) => (
            <li key={type} className="text-sm tracking-wide text-muted">
              {type}
            </li>
          ))}
        </ul>
      </section>

      <Section title="Qué incluye el kit" className="mx-auto max-w-6xl px-5 py-8 sm:py-16">
        <ul className="grid gap-10 sm:grid-cols-3">
          {metrics.map((metric) => (
            <li key={metric.label}>
              <p className="text-6xl font-light tracking-[-0.04em] sm:text-7xl">{metric.value}</p>
              <p className="mt-2 text-sm text-muted">{metric.label}</p>
            </li>
          ))}
        </ul>
      </Section>

      <div className="bg-mist">
        <Section
          title="Cómo funciona"
          description="De la ficha al material, sin armarlo a mano."
          className="mx-auto max-w-6xl px-5 py-20 sm:py-28"
        >
          <ol className="grid gap-12 sm:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex flex-col gap-4">
                  <Icon />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-light tracking-tight">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-pretty text-muted">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>
      </div>

      <footer className="mx-auto max-w-6xl px-5 py-10 text-sm text-muted">Demo de hackatón. Los datos del kit son ficticios.</footer>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <path
        d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KitIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <path d="M4 20h4l11-11-4-4L4 16v4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13 7l4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
