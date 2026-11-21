import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { type Connect, defineConfig, loadEnv, type Plugin } from "vite";

import { handleBusinessRequest } from "./src/places/handle-business-request.ts";
import { proxyPlacePhoto } from "./src/places/photo-proxy.ts";

function placesKey(mode: string): string | undefined {
  const dirs = [fileURLToPath(new URL(".", import.meta.url)), fileURLToPath(new URL("../..", import.meta.url))];
  for (const dir of dirs) {
    const key = loadEnv(mode, dir, "").GOOGLE_PLACES_API_KEY;
    if (key) return key;
  }
  return process.env.GOOGLE_PLACES_API_KEY;
}

/** Misma ruta que la Pages Function, para `bun run dev` y `vite preview`. */
function businessApi(apiKey: string | undefined): Plugin {
  const attach = (middlewares: Connect.Server) => {
    middlewares.use((req, res, next) => {
      const raw = req.url ?? "";
      const url = new URL(raw, "http://localhost");
      const handled = url.pathname === "/api/business-photo" || url.pathname === "/api/business";
      if (!handled) {
        next();
        return;
      }
      const pending =
        url.pathname === "/api/business-photo"
          ? proxyPlacePhoto(url.searchParams.get("name") ?? "", apiKey)
          : handleBusinessRequest(url, apiKey);
      void pending
        .then(async (response) => {
          res.statusCode = response.status;
          const type = response.headers.get("content-type");
          if (type) res.setHeader("content-type", type);
          const cache = response.headers.get("cache-control");
          if (cache) res.setHeader("cache-control", cache);
          res.end(Buffer.from(await response.arrayBuffer()));
        })
        .catch((error: unknown) => {
          next(error);
        });
    });
  };
  return {
    name: "vitrina-business-api",
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), businessApi(placesKey(mode))],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
}));
