import { defineConfig, devices } from "@playwright/test";

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
    baseURL: "http://localhost:3003",
    trace: "on-first-retry",
    navigationTimeout: 90_000,
    actionTimeout: 20_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev:turbo",
    url: "http://localhost:3003",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_PARABLE_DEV_GUEST: process.env.NEXT_PUBLIC_PARABLE_DEV_GUEST ?? "1",
    },
  },
});
