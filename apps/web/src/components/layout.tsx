import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { buttonClassName } from "@vitrina/ui/components/button";

export function Layout() {
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5">
          <Link to="/" className="inline-flex min-h-11 items-center text-lg font-medium tracking-tight">
            Vitrina
          </Link>
          <NavCta />
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function NavCta() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname.startsWith("/kit/")) {
    return (
      <a href="#ajuste" className={buttonClassName("primary")}>
        Pedir ajuste
      </a>
    );
  }
  if (pathname === "/") {
    return (
      <a href="#armar" className={buttonClassName("primary")}>
        Armar el kit
      </a>
    );
  }
  return (
    <Link to="/" className={buttonClassName("primary")}>
      Armar el kit
    </Link>
  );
}
