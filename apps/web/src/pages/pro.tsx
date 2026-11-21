import { Button } from "@vitrina/ui/components/button";
import { Card } from "@vitrina/ui/components/card";
import { useState } from "react";

import { activateProSession, readSession } from "@/session.ts";
import { useSession } from "@/use-session.ts";

export function ProPage() {
  const [session, setSession] = useSession();
  const [paying, setPaying] = useState(false);
  const active = session.account.plan === "pro";

  function confirm() {
    setSession(activateProSession(readSession()));
    setPaying(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-medium text-balance">Plan Pro</h1>
        <p className="text-pretty text-muted">
          Kits y ajustes sin límite, por $ 14.900 al mes. En esta demo el cobro está simulado: no se contacta a Mercado Pago y no se
          descuenta nada.
        </p>
      </div>
      {active ? (
        <Card>
          <p className="font-medium" role="status">
            El plan Pro quedó activo en esta demo.
          </p>
          <p className="mt-2 text-pretty text-sm text-muted">
            Podés pedir ajustes sin gastar créditos. Sigue en este navegador hasta que reinicies la demo.
          </p>
        </Card>
      ) : (
        <Card className="flex flex-col gap-4">
          <p className="text-sm text-muted">Mercado Pago · simulado</p>
          <p className="text-2xl font-medium">$ 14.900</p>
          <p className="text-sm text-muted">por mes · un comercio</p>
          {paying ? (
            <>
              <p>Confirmá el pago de prueba. No pide tarjeta ni abre Mercado Pago.</p>
              <Button type="button" className="w-full sm:w-fit" onClick={confirm}>
                Confirmar pago
              </Button>
              <Button type="button" variant="secondary" className="w-full sm:w-fit" onClick={() => setPaying(false)}>
                Volver
              </Button>
            </>
          ) : (
            <Button type="button" className="w-full sm:w-fit" onClick={() => setPaying(true)}>
              Pagar con Mercado Pago
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
