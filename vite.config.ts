import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({ 
  // Базовый путь для GitHub Pages (project pages)
  // Для репозитория setcodes/skillCheck сайт будет доступен по /skillCheck/
  base: "/skillCheck/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
