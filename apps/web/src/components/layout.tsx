import { Link, Outlet } from "@tanstack/react-router";

import { creditLabel } from "@/session.ts";
import { useSession } from "@/use-session.ts";

export function Layout() {
  const [session] = useSession();

  return (
    <div className="min-h-dvh overflow-x-clip">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 px-4">
          <Link to="/" className="inline-flex min-h-11 items-center text-base font-medium">
            Vitrina
          </Link>
          <div className="ml-auto flex flex-wrap items-center gap-x-4">
            <p className="inline-flex min-h-11 items-center text-sm">{creditLabel(session)}</p>
            <Link to="/registro" className="inline-flex min-h-11 items-center text-base">
              {session.registered ? "Tu cuenta" : "Crear cuenta"}
            </Link>
            <Link to="/pro" className="inline-flex min-h-11 items-center text-base">
              Plan Pro
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-8 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
