import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { build, preview } from 'vite'
import react from '@vitejs/plugin-react'
import { legalPlugin } from './legal-plugin.mjs'
import { legalRoutes } from './legal-routes.mjs'
import { fixtureSource } from './legal-fixture.mjs'

test('artefato e preview offline: três HTMLs, regras Pages, 301 real e ausência de fallback SPA', { timeout: 30000 }, async () => {
  await mkdir('.generated/tests', { recursive: true })
  const destination = await mkdtemp(resolve('.generated/tests/build-'))
  let server
  try {
    const fixture = await fixtureSource()
    await build({ configFile: false, plugins: [react(), await legalPlugin(fixture)], logLevel: 'silent', build: { outDir: destination, emptyOutDir: true } })
    assert.equal(await readFile(resolve(destination, '_redirects'), 'utf8'), await readFile('public/_redirects', 'utf8'))
    assert.equal(JSON.parse(await readFile(resolve(destination, 'documentos/provenance.json'), 'utf8')).commit, 'a'.repeat(40))
    server = await preview({ configFile: false, appType: 'mpa', plugins: [await legalRoutes()], build: { outDir: destination }, preview: { host: '127.0.0.1', port: 0 } })
    const address = server.httpServer.address()
    const origin = `http://127.0.0.1:${address.port}`
    for (const slug of ['privacidade', 'termos', 'contato']) {
      const response = await fetch(`${origin}/${slug}`, { redirect: 'manual' })
      assert.equal(response.status, 301)
      assert.equal(response.headers.get('location'), `/documentos/${slug}/index.html`)
      const page = await fetch(`${origin}/${slug}`)
      assert.equal(page.status, 200)
      assert.match(await page.text(), /Estado canônico: aprovado/)
    }
    assert.equal((await fetch(`${origin}/documentos/inexistente/index.html`)).status, 404)
    assert.equal((await fetch(`${origin}/documentos/privacidade/styles.css`)).status, 200)
    assert.equal(fixture.calls.length, 8) // Preview não consultou main novamente.
  } finally {
    if (server) await new Promise((done, reject) => server.httpServer.close(error => error ? reject(error) : done()))
    await rm(destination, { recursive: true, force: true })
  }
})
