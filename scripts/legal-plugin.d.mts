import type { Plugin } from 'vite'
export function legalPlugin(options?: { fetcher?: typeof fetch; timeoutMs?: number }): Promise<Plugin>
