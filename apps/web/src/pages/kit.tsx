import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@vitrina/ui/components/button";
import { Card } from "@vitrina/ui/components/card";
import { type FormEvent, useEffect, useState } from "react";

import { ADJUSTMENT_COST } from "@/credits.ts";
import { AdList, LandingPreview, PostGrid } from "@/features/kit/components/kit-pieces.tsx";
import { personalizeKit } from "@/places/personalize-kit.ts";
import type { BusinessLookup } from "@/places/resolve-business.ts";
import { readSession, tryAdjust } from "@/session.ts";
import type { MarketingKit } from "@/types.ts";
import { useSession } from "@/use-session.ts";
import { brandSlots, fontName, isVariantId, matchVariant, presentKit, type VariantId } from "@/variants.ts";

const route = getRouteApi("/kit/$kitId");

const steps = ["Leyendo la ficha", "Eligiendo paleta y tipografías", "Escribiendo los posteos", "Armando los anuncios"];
const examples = ["más formal", "colores más cálidos", "más cercano"];

export function KitPage() {
  const fixtureKit = route.useLoaderData();
  const { link, ajuste } = route.useSearch();
  const navigate = useNavigate();
  const [baseKit, setBaseKit] = useState<MarketingKit>(fixtureKit);
  const [banner, setBanner] = useState<string | null>(link ? "Buscando el comercio…" : "Datos de demostración");
  const [raw, setRaw] = useState<unknown>(null);
  const [lookupDone, setLookupDone] = useState(!link);
  const [waitDone, setWaitDone] = useState(false);
  const [session, setSession] = useSession();
  const [instruction, setInstruction] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAccountLinks, setShowAccountLinks] = useState(false);

  const requested: VariantId = ajuste && isVariantId(ajuste) ? ajuste : "base";
  const allowed = requested === "base" || session.account.plan === "pro" || session.paidAdjustments.includes(requested);
  const variant: VariantId = allowed ? requested : "base";
  const kit = presentKit(baseKit, variant);
  const showKit = lookupDone && waitDone;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setWaitDone(true), reduce ? 200 : 1700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!link) return;
    let cancelled = false;
    void fetch(`/api/business?q=${encodeURIComponent(link)}`)
      .then((response) => response.json() as Promise<BusinessLookup>)
      .then((body) => {
        if (cancelled) return;
        if (body.source === "places" && body.business) {
          setBaseKit(personalizeKit(fixtureKit, body.business));
          setRaw(body.raw);
          setBanner("Ficha de Google Places. Los posteos y los anuncios salen de la plantilla, con este nombre.");
          return;
        }
        setBaseKit(fixtureKit);
        setRaw(null);
        setBanner(body.message ?? "Mostramos el kit de demostración.");
      })
      .catch(() => {
        if (cancelled) return;
        setBaseKit(fixtureKit);
        setBanner("No pudimos consultar Google. Mostramos el kit de demostración.");
      })
      .finally(() => {
        if (!cancelled) setLookupDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, [fixtureKit, link]);

  useEffect(() => {
    if (!showKit) return;
    const current = readSession();
    if (current.freeKitUsed || current.registered || current.account.plan === "pro") return;
    setSession({ ...current, freeKitUsed: true });
  }, [showKit, setSession]);

  function apply(text: string) {
    const matched = matchVariant(text);
    if (!matched) {
      setNotice(null);
      setShowAccountLinks(false);
      setError("En la demo entendemos «más formal», «colores más cálidos» y «más cercano».");
      return;
    }
    const result = tryAdjust(readSession(), matched);
    if (!result.ok) {
      setNotice(null);
      setShowAccountLinks(true);
      setError("Te falta 1 crédito para este ajuste.");
      return;
    }
    setSession(result.session);
    setInstruction("");
    setError(null);
    setShowAccountLinks(false);
    setNotice(
      result.charged
        ? "Listo. Se usó 1 crédito y el kit cambió."
        : matched === "base"
          ? "Volvimos al original."
          : "Ese ajuste ya estaba incluido.",
    );
    void navigate({
      to: "/kit/$kitId",
      params: { kitId: fixtureKit.id },
      search: { link, ajuste: matched === "base" ? undefined : matched },
      replace: true,
      resetScroll: false,
    });
  }

  function onAdjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = instruction.trim();
    if (!text) {
      setNotice(null);
      setShowAccountLinks(false);
      setError("Escribí qué querés cambiar.");
      return;
    }
    apply(text);
  }

  if (!showKit) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">{banner}</p>
          <h1 className="text-3xl font-medium text-balance">Analizando tu negocio</h1>
          <p className="text-pretty text-muted">{baseKit.business.name}</p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div className="animate-bar h-full w-full bg-ink" />
        </div>
        <ol className="flex flex-col gap-2" aria-label="Pasos del armado">
          {steps.map((step, index) => (
            <li key={step} className="animate-step text-base" style={{ animationDelay: `${index * 0.35}s` }}>
              {step}
            </li>
          ))}
        </ol>
        <p role="status">Estamos armando el kit de {baseKit.business.name}.</p>
        <Button type="button" variant="secondary" className="w-full sm:w-fit" onClick={() => setWaitDone(true)}>
          Saltar
        </Button>
      </div>
    );
  }

  const { fondo, acento, tinta } = brandSlots(kit.brand.palette);
  const display = fontName(kit, "Títulos");

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div className="flex min-w-0 flex-col gap-3">
        {banner ? <p className="text-sm text-muted">{banner}</p> : null}
        <h1 className="text-3xl font-medium text-balance">{kit.business.name}</h1>
        <p className="text-muted">
          {kit.business.category} · {kit.business.address}
        </p>
        <p className="text-sm text-muted">Este kit es el gratis. Cada ajuste sale {ADJUSTMENT_COST} crédito.</p>
        {link ? (
          <p className="min-w-0 max-w-full break-all text-sm text-muted" title={link}>
            Link pegado: {link}
          </p>
        ) : null}
        {raw ? <PlaceRaw raw={raw} /> : null}
      </div>

      <nav className="flex flex-wrap gap-x-4" aria-label="Partes del kit">
        {[
          ["#branding", "Marca"],
          ["#landing", "Landing"],
          ["#posteos", "Posteos"],
          ["#anuncios", "Anuncios"],
        ].map(([href, label]) => (
          <a key={href} className="inline-flex min-h-11 items-center text-base font-medium" href={href}>
            {label}
          </a>
        ))}
      </nav>

      <section className="flex flex-col gap-3" id="ajuste">
        <h2 className="text-xl font-medium">Pedir un ajuste</h2>
        <Card>
          <form className="flex flex-col gap-4" onSubmit={onAdjust}>
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="adjustment-text">
              Qué querés cambiar
              <textarea
                id="adjustment-text"
                className="min-h-24 rounded-xl border border-line bg-surface px-3 py-3 text-base font-normal text-ink"
                placeholder="más formal"
                value={instruction}
                aria-describedby={error ? "adjustment-error" : "adjustment-hint"}
                onChange={(event) => setInstruction(event.target.value)}
              />
            </label>
            <p id="adjustment-hint" className="text-sm text-muted">
              Por ejemplo: colores más cálidos. La marca nueva se ve en la landing, los posteos y los anuncios.
            </p>
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <Button key={example} variant="secondary" type="button" onClick={() => apply(example)}>
                  {example}
                </Button>
              ))}
              {variant !== "base" ? (
                <Button variant="secondary" type="button" onClick={() => apply("volver al original")}>
                  Volver al original
                </Button>
              ) : null}
            </div>
            <Button type="submit" className="w-full sm:w-fit">
              Aplicar ajuste
            </Button>
            {error ? (
              <p id="adjustment-error" className="text-sm text-danger">
                {error}
                {showAccountLinks ? (
                  <>
                    {" "}
                    <Link to="/registro" className="underline">
                      Crear cuenta
                    </Link>{" "}
                    o{" "}
                    <Link to="/pro" className="underline">
                      ver el plan Pro
                    </Link>
                    .
                  </>
                ) : null}
              </p>
            ) : null}
            {notice ? (
              <p className="text-sm" role="status">
                {notice}
              </p>
            ) : null}
          </form>
        </Card>
      </section>

      <section className="flex flex-col gap-3" id="branding">
        <h2 className="text-xl font-medium">Branding</h2>
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-16 items-center justify-center rounded-2xl text-xl"
              style={{
                background: tinta.hex,
                color: fondo.hex,
                fontFamily: `"${display}", serif`,
                boxShadow: `inset 0 -4px 0 ${acento.hex}`,
              }}
            >
              {kit.brand.logo.initials}
            </div>
            <div>
              <p className="text-lg font-medium" style={{ fontFamily: `"${display}", serif` }}>
                {kit.brand.logo.label}
              </p>
              <p className="text-sm text-muted">Placeholder del logo</p>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {kit.brand.palette.map((color) => (
              <li key={`${color.name}-${color.hex}`} className="flex min-h-11 items-center gap-3">
                <span aria-hidden="true" className="size-10 shrink-0 rounded-lg border border-line" style={{ background: color.hex }} />
                <span>
                  <span className="block font-medium">{color.name}</span>
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
        <LandingPreview kit={kit} />
      </section>

      <section className="flex flex-col gap-3" id="posteos">
        <h2 className="text-xl font-medium">9 posteos para Instagram</h2>
        <PostGrid kit={kit} />
      </section>

      <section className="flex flex-col gap-3" id="anuncios">
        <h2 className="text-xl font-medium">5 ideas de anuncios</h2>
        <AdList kit={kit} />
      </section>
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
