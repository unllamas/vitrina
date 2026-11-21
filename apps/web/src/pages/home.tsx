import { useNavigate } from "@tanstack/react-router";
import { Button } from "@vitrina/ui/components/button";
import { Input } from "@vitrina/ui/components/input";
import { type FormEvent, useState } from "react";

import { DEMO_KIT_ID } from "@/fixture.ts";

function businessQuery(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 4000) return null;
  return trimmed;
}

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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-medium text-balance">Pegá el link de tu negocio</h1>
        <p className="text-pretty text-muted">
          Con la ficha de Google Business armamos el branding, la landing, 9 posteos y 5 ideas de anuncios.
        </p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
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
      <p className="text-sm text-muted">
        El primer kit es gratis y no hace falta cuenta. Para pedir un ajuste, creá una cuenta: son 30 créditos. Sin clave de Google se
        muestra el kit de demostración.
      </p>
    </div>
  );
}
