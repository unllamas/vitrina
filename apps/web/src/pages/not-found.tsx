import { Link } from "@tanstack/react-router";
import { buttonClassName } from "@vitrina/ui/components/button";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-24">
      <h1 className="text-4xl font-light tracking-tight text-balance">No encontramos esa página</h1>
      <p className="text-muted">El kit que buscás no está en esta demo.</p>
      <Link to="/" className={buttonClassName("primary", "w-fit")}>
        Volver a pegar un link
      </Link>
    </div>
  );
}
