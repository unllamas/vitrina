import { createRootRoute, createRoute, createRouter, notFound, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/fraunces/latin-500.css";
import "@fontsource/newsreader/latin-500.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/source-sans-3/latin-400.css";

import { Layout } from "@/components/layout.tsx";
import { loadKit } from "@/fixture.ts";
import { HomePage } from "@/pages/home.tsx";
import { KitPage } from "@/pages/kit.tsx";
import { NotFoundPage } from "@/pages/not-found.tsx";
import { ProPage } from "@/pages/pro.tsx";
import { RegistroPage } from "@/pages/registro.tsx";
import { isVariantId, type VariantId } from "@/variants.ts";
import "@/styles.css";

const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const registroRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/registro",
  component: RegistroPage,
});

const proRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pro",
  component: ProPage,
});

const kitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kit/$kitId",
  validateSearch: (search: Record<string, unknown>): { link?: string; ajuste?: Exclude<VariantId, "base"> } => {
    const link = typeof search.link === "string" && search.link.length > 0 && search.link.length <= 4000 ? search.link : undefined;
    const ajuste = typeof search.ajuste === "string" && isVariantId(search.ajuste) && search.ajuste !== "base" ? search.ajuste : undefined;
    return { link, ajuste };
  },
  loader: ({ params }) => {
    const kit = loadKit(params.kitId);
    if (!kit) throw notFound();
    return kit;
  },
  component: KitPage,
});

const routeTree = rootRoute.addChildren([homeRoute, registroRoute, proRoute, kitRoute]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultNotFoundComponent: NotFoundPage,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("No está el nodo raíz");

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
