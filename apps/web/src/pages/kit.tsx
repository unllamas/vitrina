import { getRouteApi } from "@tanstack/react-router";
import { Button } from "@vitrina/ui/components/button";
import { Card } from "@vitrina/ui/components/card";
import { Section } from "@vitrina/ui/components/section";
import { type FormEvent, useEffect, useState } from "react";

import { AdList } from "@/components/ad-mockup.tsx";
import { brandFont } from "@/components/brand-style.ts";
import { BusinessLanding } from "@/components/business-landing.tsx";
import { PostGrid } from "@/components/post-grid.tsx";
import { ADJUSTMENT_COST, applyAdjustment, canAfford, grantSignupCredits } from "@/credits.ts";
import { personalizeKit } from "@/places/personalize-kit.ts";
import type { BusinessLookup } from "@/places/resolve-business.ts";
import type { Account, AdjustmentTarget, MarketingKit } from "@/types.ts";

const route = getRouteApi("/kit/$kitId");

const targets: { value: AdjustmentTarget; label: string }[] = [
  { value: "brand", label: "Branding" },
  { value: "landing", label: "Landing" },
  { value: "posts", label: "Posteos" },
  { value: "ads", label: "Anuncios" },
];

export function KitPage() {
  const fixtureKit = route.useLoaderData();
  const { link } = route.useSearch();
  const [kit, setKit] = useState<MarketingKit>(fixtureKit);
  const [banner, setBanner] = useState<string | null>(link ? "Buscando el comercio…" : "Datos de demostración");
  const [raw, setRaw] = useState<unknown>(null);
  const [account, setAccount] = useState<Account>(() => grantSignupCredits());
  const [instruction, setInstruction] = useState("");
  const [target, setTarget] = useState<AdjustmentTarget>("brand");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onAdjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = instruction.trim();
    if (!text) {
      setNotice(null);
      setError("Escribí qué querés cambiar.");
      return;
    }
    if (!canAfford(account, ADJUSTMENT_COST)) {
      setNotice(null);
      setError("No te alcanzan los créditos para este ajuste.");
      return;
    }
    setAccount(applyAdjustment(account));
    setInstruction("");
    setError(null);
    setNotice("Anotamos el ajuste. En esta demo el kit no se vuelve a generar.");
  }

  useEffect(() => {
    if (!link) return;
    let cancelled = false;
    void fetch(`/api/business?q=${encodeURIComponent(link)}`)
      .then((response) => response.json() as Promise<BusinessLookup>)
      .then((body) => {
        if (cancelled) return;
        if (body.source === "places" && body.business) {
          setKit(personalizeKit(fixtureKit, body.business, body.landing));
          setRaw(body.raw);
          setBanner("Ficha de Google Places. Los posteos y los anuncios siguen siendo una plantilla.");
          return;
        }
        setKit(fixtureKit);
        setRaw(null);
        setBanner(body.message ?? "Mostramos el kit de demostración.");
      })
      .catch(() => {
        if (cancelled) return;
        setKit(fixtureKit);
        setBanner("No pudimos consultar Google. Mostramos el kit de demostración.");
      });
    return () => {
      cancelled = true;
    };
  }, [fixtureKit, link]);

  return (
    <div className="mx-auto flex min-w-0 w-full max-w-5xl flex-col gap-20 px-5 py-14 max-md:pb-36 sm:gap-24 sm:py-20">
      <header className="flex min-w-0 flex-col gap-4">
        {banner ? <p className="text-sm text-muted">{banner}</p> : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-3xl text-4xl font-light tracking-[-0.03em] text-balance sm:text-5xl">{kit.business.name}</p>
          <p className="inline-flex min-h-11 w-fit items-center rounded-full border border-line px-4 text-base">
            {account.credits} {account.credits === 1 ? "crédito" : "créditos"}
          </p>
        </div>
        <p className="text-muted">
          {kit.business.category} · {kit.business.address}
        </p>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          La cuenta de la demo arranca con 30 créditos. Este primer kit no se descontó. Cada ajuste sale {ADJUSTMENT_COST} crédito.
        </p>
        {link ? (
          <p className="min-w-0 max-w-full break-all text-sm text-muted" title={link}>
            Link pegado: {link}
          </p>
        ) : null}
        {raw ? <PlaceRaw raw={raw} /> : null}
      </header>

      <section id="landing" className="scroll-mt-24">
        <BusinessLanding kit={kit} />
      </section>

      <Section id="branding" className="scroll-mt-24" title="Branding" description="Paleta, tipografías, tono y un placeholder del logo.">
        <Card className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-2xl text-base font-medium"
              style={{ background: kit.brand.palette[2]?.hex ?? "#4A3226", color: "#F3E6D0" }}
            >
              {kit.brand.logo.initials}
            </div>
            <div>
              <p className="font-medium">{kit.brand.logo.label}</p>
              <p className="text-sm text-muted">Placeholder del logo</p>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {kit.brand.palette.map((color) => (
              <li key={color.hex} className="flex min-h-11 items-center gap-3">
                <span aria-hidden="true" className="size-10 rounded-md border border-line" style={{ background: color.hex }} />
                <span>
                  {color.name}
                  <span className="block text-sm text-muted">{color.hex}</span>
                </span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2">
            {kit.brand.fonts.map((font) => (
              <li key={font.role} style={{ fontFamily: brandFont(kit.brand, font.role, "sans-serif") }}>
                {font.role}: {font.name}
              </li>
            ))}
          </ul>
          <p className="max-w-xl text-pretty">{kit.brand.voice}</p>
        </Card>
      </Section>

      <Section
        id="posteos"
        className="scroll-mt-24"
        title="9 posteos para Instagram"
        description="Tocá una pieza para verla como en el perfil."
      >
        <PostGrid posts={kit.posts} business={kit.business} brand={kit.brand} />
      </Section>

      <Section id="anuncios" className="scroll-mt-24" title="5 ideas de anuncios" description="Cada idea, en el formato del canal.">
        <AdList ads={kit.ads} business={kit.business} brand={kit.brand} />
      </Section>

      <Section id="ajuste" className="scroll-mt-24" title="Pedir un ajuste" description="Un texto libre sobre la parte que no cierra.">
        <Card>
          <form className="flex flex-col gap-4" onSubmit={onAdjust}>
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="adjustment-target">
              Qué parte
              <select
                id="adjustment-target"
                className="min-h-11 rounded-2xl border border-line bg-canvas px-3 text-base font-normal text-ink"
                value={target}
                onChange={(event) => setTarget(event.target.value as AdjustmentTarget)}
              >
                {targets.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="adjustment-text">
              Qué querés cambiar
              <textarea
                id="adjustment-text"
                className="min-h-28 rounded-2xl border border-line bg-canvas px-3 py-3 text-base font-normal text-ink"
                placeholder="Colores más cálidos"
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
              />
            </label>
            <Button type="submit" className="w-full sm:w-fit">
              Pedir ajuste
            </Button>
            <p className="text-sm text-muted">Sale {ADJUSTMENT_COST} crédito. El Plan Pro con Mercado Pago está simulado.</p>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            {notice ? (
              <p className="text-sm" role="status">
                {notice}
              </p>
            ) : null}
          </form>
        </Card>
      </Section>
    </div>
  );
}

function PlaceRaw({ raw }: { raw: unknown }) {
  function download() {
    const blob = new Blob([JSON.stringify(raw, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "comercio.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <details className="min-w-0 max-w-full rounded-xl border border-line bg-surface p-4">
      <summary className="min-h-11 cursor-pointer text-base">Datos del comercio</summary>
      <div className="mt-3 flex flex-col gap-3">
        <Button type="button" variant="secondary" className="w-full sm:w-fit" onClick={download}>
          Descargar JSON
        </Button>
        <pre className="max-h-80 max-w-full overflow-auto whitespace-pre-wrap break-all text-sm">{JSON.stringify(raw, null, 2)}</pre>
      </div>
    </details>
  );
}
