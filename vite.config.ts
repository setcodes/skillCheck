/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { execSync } from "node:child_process";
import pkg from "./package.json";

// Коммит сборки: в Docker .git недоступен, поэтому его передают через APP_COMMIT (deploy/vps-install.sh),
// локально берём из git. Без обоих — пустая строка, футер покажет только версию.
function buildCommit(): string {
  if (process.env.APP_COMMIT) return process.env.APP_COMMIT.slice(0, 7);
  try {
    return execSync("git rev-parse --short=7 HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
}

export default defineConfig(() => ({
  // Базовый путь настраивается через VITE_BASE (по умолчанию корень домена)
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(buildCommit()),
    __APP_BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
