import { readFile } from 'node:fs/promises'
import { URL } from 'node:url'

export async function legalRoutes() {
  // O servidor local e os testes executam as mesmas regras estáticas entregues ao Pages.
  const rules = (await readFile(new URL('../public/_redirects', import.meta.url), 'utf8')).trim().split('\n').map(line => line.split(/\s+/))
  const middleware = (request, response, next) => {
    const path = (request.url ?? '').split('?')[0]
    const rule = rules.find(([from]) => from === path)
    if (!rule) return next()
    response.statusCode = Number(rule[2])
    response.setHeader('Location', rule[1])
    response.end()
  }
  return {
    name: 'legal-short-urls',
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}
