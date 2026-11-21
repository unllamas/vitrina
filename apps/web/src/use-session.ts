import { useCallback, useEffect, useState } from "react";

import { readSession, SESSION_EVENT, type Session, writeSession } from "./session.ts";

/** Lee la cuenta de sessionStorage y se entera si otra pantalla la cambia. */
export function useSession(): [Session, (next: Session) => void] {
  const [session, setSession] = useState<Session>(() => readSession());

  useEffect(() => {
    const sync = () => setSession(readSession());
    window.addEventListener(SESSION_EVENT, sync);
    return () => window.removeEventListener(SESSION_EVENT, sync);
  }, []);

  const update = useCallback((next: Session) => {
    writeSession(next);
    setSession(next);
  }, []);

  return [session, update];
}
