import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { generateDocuments } from './prepare-documents.mjs'

export async function legalPlugin(options) {
  const result = await generateDocuments(resolve('.generated/documentos'), options)
  console.log(`Documentos canônicos: ${result.provenance.commit}`)
  const middleware = (request, response, next) => {
    const path = (request.url ?? '').split('?')[0]
    if (!path.startsWith('/documentos/')) return next()
    const slug = path.match(/^\/documentos\/(privacidade|termos|contato)\/(?:index.html)?$/)?.[1]
    if (slug) {
      response.setHeader('Content-Type', 'text/html; charset=utf-8')
      response.end(result.pages[slug])
    } else if (path === '/documentos/privacidade/styles.css') {
      readFile(resolve('public/documentos/privacidade/styles.css')).then(css => {
        response.setHeader('Content-Type', 'text/css')
        response.end(css)
      }, next)
    } else {
      response.statusCode = 404
      response.end('Documento não encontrado')
    }
  }
  return {
    name: 'canonical-legal-documents',
    configureServer(server) { server.middlewares.use(middleware) },
    generateBundle() {
      for (const [slug, html] of Object.entries(result.pages)) this.emitFile({ type: 'asset', fileName: `documentos/${slug}/index.html`, source: html })
      this.emitFile({ type: 'asset', fileName: 'documentos/provenance.json', source: JSON.stringify(result.provenance, null, 2) + '\n' })
    },
  }
}
