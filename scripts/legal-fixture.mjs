import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { URL } from 'node:url'
import { documents } from './prepare-documents.mjs'

// Somente testes importam esta fonte. Não há seletor de fixture no build de produção.
export async function fixtureSource({ commit = 'a'.repeat(40), revision = false, approved = true, mutate } = {}) {
  const manifest = { status: approved ? 'aprovado_para_publicacao' : 'rascunho_para_revisao', aprovado_para_publicacao: approved, vigencia: approved ? '2026-12-01' : null, aprovacao_registro: approved ? 'https://example.com/aceite-simulado' : null, documentos: {} }
  const files = {}
  const sha = bytes => createHash('sha256').update(bytes).digest('hex')
  for (const [slug, name] of Object.entries(documents)) {
    let markdown = await readFile(new URL(`../tests/fixtures/${name}.md`, import.meta.url), 'utf8')
    let html = await readFile(new URL(`../tests/fixtures/${slug}-source.html`, import.meta.url), 'utf8')
    if (approved) html = approveFixture(html)
    if (revision) {
      markdown = markdown.replace(/(\*\*Versão[^*]*:\*\* )([\d.]+)/, '$19.9').replace('## Resumo', '## Resumo\n\nRevisão nova verificável.')
      html = html.replace(/(<strong>Versão[^<]*<\/strong> )([\d.]+)/, '$19.9').replace('<h2>Resumo</h2>', '<h2>Resumo</h2><p>Revisão nova verificável.</p>')
    }
    const versao = markdown.match(/\*\*Versão[^*]*:\*\* ([\d.]+)/)[1]
    manifest.documentos[slug] = { fonte: `docs/legal/${name}.md`, versao, sha256_fonte: sha(markdown), sha256_html: sha(html) }
    files[`docs/legal/${name}.md`] = markdown
    files[`public_html/${slug}/index.html`] = html
  }
  mutate?.(manifest, files)
  files['docs/legal/manifesto-documentos.json'] = JSON.stringify(manifest)
  const calls = []
  const fetcher = async url => {
    calls.push(url)
    if (url === 'https://api.github.com/repos/gabzieg/atmosfera/commits/main') return new Response(JSON.stringify({ sha: commit }))
    const parsed = new URL(url)
    if (parsed.origin !== 'https://api.github.com' || parsed.searchParams.get('ref') !== commit) throw new Error('Origem/revisão não permitida')
    const path = parsed.pathname.replace('/repos/gabzieg/atmosfera/contents/', '')
    return new Response(files[path] ?? '', { status: path in files ? 200 : 404 })
  }
  return { fetcher, calls, manifest, manifestSha256: sha(JSON.stringify(manifest)) }
}

export function approveFixture(text) {
  return text.replaceAll('Documento em revisão; ainda não aprovado para publicação definitiva.', 'Documento aprovado para publicação.')
    .replace(/(\*\*Vigência:\*\* )[^\n]+/, '$12026-12-01')
    .replace(/(<strong>Vigência:<\/strong> )[^<]+/, '$12026-12-01')
}
