import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium text-balance">No encontramos esa página</h1>
      <p className="text-muted">El kit que buscás no está en esta demo.</p>
      <Link to="/" className="inline-flex min-h-11 items-center text-base font-medium underline">
        Volver a pegar un link
      </Link>
    </div>
  );
}
