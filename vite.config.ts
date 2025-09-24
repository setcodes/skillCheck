import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command }) => ({
  // В продакшене используем базовый путь для GitHub Pages,
  // локально оставляем корень для корректной работы dev-сервера.
  base: command === "build" ? "/skillCheck/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
