import { createRootRoute, createRoute, createRouter, notFound, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Layout } from "@/components/layout.tsx";
import { loadKit } from "@/fixture.ts";
import { HomePage } from "@/pages/home.tsx";
import { KitPage } from "@/pages/kit.tsx";
import { NotFoundPage } from "@/pages/not-found.tsx";
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

const kitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kit/$kitId",
  validateSearch: (search: Record<string, unknown>): { link?: string } => {
    return typeof search.link === "string" && search.link.length > 0 && search.link.length <= 500 ? { link: search.link } : {};
  },
  loader: ({ params }) => {
    const kit = loadKit(params.kitId);
    if (!kit) throw notFound();
    return kit;
  },
  component: KitPage,
});

const routeTree = rootRoute.addChildren([homeRoute, kitRoute]);

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
