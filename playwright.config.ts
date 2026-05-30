import { defineConfig, devices } from "@playwright/test";

const E2E_PORT = process.env.PLAYWRIGHT_PORT ?? "3005";
const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  timeout: 90_000,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "on-first-retry",
    navigationTimeout: 90_000,
    actionTimeout: 20_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev:e2e",
    url: E2E_BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_DIST_DIR: process.env.NEXT_DIST_DIR ?? ".next-e2e",
      NEXT_PUBLIC_PARABLE_DEV_GUEST: process.env.NEXT_PUBLIC_PARABLE_DEV_GUEST ?? "1",
      /** Simulated live chat + discovery theatre on /streamers (see `streamers-sim-config.ts`). */
      NEXT_PUBLIC_STREAMERS_SIM_CHAT: process.env.NEXT_PUBLIC_STREAMERS_SIM_CHAT ?? "1",
      PARABLE_E2E_DEMO_DISCOVERY: process.env.PARABLE_E2E_DEMO_DISCOVERY ?? "1",
    },
  },
});
