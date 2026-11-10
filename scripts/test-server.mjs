import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { legalRoutes } from './legal-routes.mjs'
import { legalPlugin } from './legal-plugin.mjs'
import { fixtureSource } from './legal-fixture.mjs'
const source = await fixtureSource()
const server = await createServer({ configFile: false, plugins: [react(), await legalRoutes(), await legalPlugin(source)], server: { host: '127.0.0.1', port: 5173, strictPort: true } })
await server.listen()
