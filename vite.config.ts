import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { legalRoutes } from './scripts/legal-routes.mjs'
import { legalPlugin } from './scripts/legal-plugin.mjs'

export default defineConfig(async ({ command, isPreview }) => ({
  plugins: [react(), await legalRoutes(), ...(isPreview ? [] : [await legalPlugin()])],
  appType: command === 'serve' && isPreview ? 'mpa' as const : 'spa' as const,
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
}))
