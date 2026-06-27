import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 15000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3100',
    headless: true,
  },
  webServer: {
    command: 'pnpm dev',
    port: 3100,
    reuseExistingServer: true,
    timeout: 10000,
  },
})
