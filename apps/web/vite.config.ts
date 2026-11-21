import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { type Connect, defineConfig, loadEnv, type Plugin } from "vite";

import { handleBusinessRequest } from "./src/places/handle-business-request.ts";

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
      if (!raw.startsWith("/api/business")) {
        next();
        return;
      }
      const url = new URL(raw, "http://localhost");
      void handleBusinessRequest(url, apiKey)
        .then((response) => response.text())
        .then((body) => {
          res.statusCode = 200;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.setHeader("cache-control", "no-store");
          res.end(body);
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
