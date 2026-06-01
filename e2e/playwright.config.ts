import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "npm --prefix ../frontend run dev -- --host 127.0.0.1 --port 3000",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120000
  },
  use: {
    baseURL: "http://localhost:3000",
    headless: true
  }
});
