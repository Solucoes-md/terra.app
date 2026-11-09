import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const localChrome = process.platform === 'win32' ? join(process.env.PROGRAMFILES ?? 'C:\\Program Files', 'Google/Chrome/Application/chrome.exe') : undefined

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? (localChrome && existsSync(localChrome) ? localChrome : undefined) },
    trace: 'retain-on-failure',
  },
  webServer: { command: 'node scripts/test-server.mjs', url: 'http://127.0.0.1:5173', reuseExistingServer: false, timeout: 30000 },
})
