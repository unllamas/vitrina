import { Link, Outlet } from "@tanstack/react-router";

export function Layout() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center px-4">
          <Link to="/" className="inline-flex min-h-11 items-center text-base font-medium">
            Vitrina
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
