import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 4,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || "https://dev.d38xhy2j6p9ei8.amplifyapp.com" },
  reporter: "list",
});
