import { getRouteApi } from "@tanstack/react-router";
import { Button, buttonClassName } from "@vitrina/ui/components/button";
import { Card } from "@vitrina/ui/components/card";
import { type FormEvent, useState } from "react";

import { ADJUSTMENT_COST, applyAdjustment, canAfford, grantSignupCredits } from "@/credits.ts";
import type { Account, AdChannel, AdjustmentTarget } from "@/types.ts";

const route = getRouteApi("/kit/$kitId");

const channelLabel: Record<AdChannel, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  "google-ads": "Google Ads",
};

const targets: { value: AdjustmentTarget; label: string }[] = [
  { value: "brand", label: "Branding" },
  { value: "landing", label: "Landing" },
  { value: "posts", label: "Posteos" },
  { value: "ads", label: "Anuncios" },
];

export function KitPage() {
  const kit = route.useLoaderData();
  const { link } = route.useSearch();
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

  const whatsapp = `https://wa.me/${kit.business.whatsapp}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">Datos de demostración</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-3xl font-medium text-balance">{kit.business.name}</h1>
          <p className="inline-flex min-h-11 items-center text-base font-medium">
            {account.credits} {account.credits === 1 ? "crédito" : "créditos"}
          </p>
        </div>
        <p className="text-muted">
          {kit.business.category} · {kit.business.address}
        </p>
        <p className="text-sm text-muted">
          La cuenta de la demo arranca con 30 créditos. Este primer kit no se descontó. Cada ajuste sale {ADJUSTMENT_COST} crédito.
        </p>
        {link ? <p className="text-sm text-pretty text-muted">Link pegado: {link}. No lo consultamos.</p> : null}
      </div>

      <section className="flex flex-col gap-3" id="branding">
        <h2 className="text-xl font-medium">Branding</h2>
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-xl text-base font-medium"
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
                <span aria-hidden="true" className="size-8 rounded-md border border-line" style={{ background: color.hex }} />
                <span>
                  {color.name}
                  <span className="block text-sm text-muted">{color.hex}</span>
                </span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-1">
            {kit.brand.fonts.map((font) => (
              <li key={font.role}>
                {font.role}: {font.name}
              </li>
            ))}
          </ul>
          <p className="text-pretty">{kit.brand.voice}</p>
        </Card>
      </section>

      <section className="flex flex-col gap-3" id="landing">
        <h2 className="text-xl font-medium">Landing</h2>
        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-balance">{kit.landing.headline}</h3>
          <p className="text-pretty">{kit.landing.summary}</p>
          <a className={buttonClassName("primary", "w-full sm:w-fit")} href={whatsapp}>
            {kit.landing.whatsappCta}
          </a>
          <ul className="flex flex-col gap-3">
            {kit.landing.testimonials.map((review) => (
              <li key={review.author} className="border-t border-line pt-3">
                <p className="text-pretty">«{review.text}»</p>
                <p className="text-sm text-muted">{review.author}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="flex flex-col gap-3" id="posteos">
        <h2 className="text-xl font-medium">9 posteos para Instagram</h2>
        <ol className="flex flex-col gap-3">
          {kit.posts.map((post, index) => (
            <li key={post.id}>
              <Card className="flex flex-col gap-2">
                <p className="text-sm text-muted">Posteo {index + 1}</p>
                <p className="text-pretty">{post.caption}</p>
                <p className="text-sm text-pretty text-muted">{post.visual}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3" id="anuncios">
        <h2 className="text-xl font-medium">5 ideas de anuncios</h2>
        <ol className="flex flex-col gap-3">
          {kit.ads.map((ad) => (
            <li key={ad.id}>
              <Card className="flex flex-col gap-2">
                <p className="text-sm text-muted">{channelLabel[ad.channel]}</p>
                <p className="font-medium">{ad.objective}</p>
                <p className="text-pretty">{ad.copy}</p>
                <p className="text-sm text-muted">Público: {ad.audience}</p>
                <p className="text-sm text-muted">CTA: {ad.cta}</p>
                <p className="text-sm text-pretty text-muted">{ad.visual}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3" id="ajuste">
        <h2 className="text-xl font-medium">Pedir un ajuste</h2>
        <Card>
          <form className="flex flex-col gap-4" onSubmit={onAdjust}>
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="adjustment-target">
              Qué parte
              <select
                id="adjustment-target"
                className="min-h-11 rounded-xl border border-line bg-surface px-3 text-base font-normal text-ink"
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
                className="min-h-24 rounded-xl border border-line bg-surface px-3 py-3 text-base font-normal text-ink"
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
      </section>
    </div>
  );
}
