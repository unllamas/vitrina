import { Button } from "@vitrina/ui/components/button";
import { Card } from "@vitrina/ui/components/card";
import { Input } from "@vitrina/ui/components/input";
import { type FormEvent, useState } from "react";

import { creditLabel, emptySession, readSession, registerSession } from "@/session.ts";
import { useSession } from "@/use-session.ts";

export function RegistroPage() {
  const [session, setSession] = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    const nextEmail = email.trim();
    const invalidName = nextName.length < 2;
    const invalidEmail = !nextEmail.includes("@");
    setNameError(invalidName ? "Escribí cómo te llamás." : null);
    setEmailError(invalidEmail ? "El correo tiene que llevar un @." : null);
    if (invalidName || invalidEmail) return;

    const current = readSession();
    if (current.registered) {
      setNotice("Esta demo ya tiene una cuenta. Los créditos siguen igual.");
      return;
    }
    setSession(registerSession(current));
    setNotice(`Listo, ${nextName}. Sumamos 30 créditos. No enviamos el correo.`);
  }

  function reset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setSession(emptySession());
    setConfirmReset(false);
    setName("");
    setEmail("");
    setNotice("La demo volvió al inicio: 1 kit gratis, sin cuenta.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-medium text-balance">Crear cuenta</h1>
        <p className="text-pretty text-muted">
          Es falso: no hay servidor. Al crearla sumás 30 créditos en este navegador. Ahora: {creditLabel(session)}.
        </p>
      </div>
      <Card>
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <Input
            label="Nombre"
            name="nombre"
            autoComplete="name"
            placeholder="Ana Pérez"
            value={name}
            error={nameError ?? undefined}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label="Correo"
            name="correo"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ana@correo.com"
            hint="No lo enviamos a ningún lado."
            value={email}
            error={emailError ?? undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" className="w-full sm:w-fit">
            Crear cuenta
          </Button>
          {notice ? (
            <p className="text-sm" role="status">
              {notice}
            </p>
          ) : null}
        </form>
      </Card>
      <div className="flex flex-col gap-2">
        <Button type="button" variant="secondary" className="w-full sm:w-fit" onClick={reset}>
          {confirmReset ? "Sí, borrar la cuenta de esta demo" : "Reiniciar la demo"}
        </Button>
        {confirmReset ? <p className="text-sm text-muted">Se pierden los créditos y el plan Pro de este navegador.</p> : null}
      </div>
    </div>
  );
}
