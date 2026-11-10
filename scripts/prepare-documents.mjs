import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, join } from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import { renderPrivacy } from './render-privacy.mjs'

export const repository = 'https://github.com/gabzieg/atmosfera'
export const documents = { privacidade: 'PRIVACIDADE', termos: 'TERMOS', contato: 'CONTATO' }
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)

export function validateManifest(manifest) {
  if (!isObject(manifest) || typeof manifest.aprovado_para_publicacao !== 'boolean' ||
      !['rascunho_para_revisao', 'aprovado_para_publicacao'].includes(manifest.status) ||
      !(manifest.vigencia === null || typeof manifest.vigencia === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(manifest.vigencia)) ||
      !isObject(manifest.documentos) || manifest.aprovado_para_publicacao !== (manifest.status === 'aprovado_para_publicacao') ||
      manifest.aprovado_para_publicacao && (typeof manifest.aprovacao_registro !== 'string' || !manifest.aprovacao_registro.trim())) throw new Error('Manifesto legal inválido: estado editorial incoerente.')
  for (const [slug, name] of Object.entries(documents)) {
    const entry = manifest.documentos[slug]
    if (!isObject(entry) || entry.fonte !== `docs/legal/${name}.md` || typeof entry.versao !== 'string' ||
        !/^\d+(?:\.\d+)+$/.test(entry.versao) || ![entry.sha256_fonte, entry.sha256_html].every(value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value))) {
      throw new Error(`Manifesto legal inválido: ${slug}.`)
    }
  }
  return manifest
}

export function verifyDocument(slug, markdown, html, manifest) {
  const entry = manifest.documentos[slug]
  if (hash(markdown) !== entry.sha256_fonte || hash(html) !== entry.sha256_html) throw new Error(`Hash divergente: ${slug}.`)

}

export function adaptDocument(slug, original, provenance) {
  const local = original.replace(/href="(?:\.\.\/|https:\/\/sites\.google\.com\/view\/terra-live-wallpaper\/)(privacidade|termos|contato)\/?"/g,
    (_, target) => `href="../${target}/index.html"`)
  const entry = provenance.documentos[slug]
  const sourceUrl = `${repository}/blob/${provenance.commit}/${entry.fonte}`
  const state = provenance.aprovado_para_publicacao
    ? `Estado canônico: aprovado. ${provenance.vigencia ? 'Vigência: ' + escape(provenance.vigencia) + '.' : 'Vigência pendente.'}`
    : `Rascunho para revisão. ${provenance.vigencia ? 'Vigência canônica: ' + escape(provenance.vigencia) + ';' : 'Vigência pendente;'} publicação não autorizada.`
  const notice = `<aside aria-label="Proveniência" style="overflow-wrap:anywhere;padding:20px 24px;background:#202226;color:#f4f5f7;font:14px/1.7 system-ui,sans-serif">Documento de referência do aplicativo Terra. <span>${state}</span><p>Versão ${entry.versao} · Commit <code>${provenance.commit}</code> · <a href="${sourceUrl}" style="color:inherit">Fonte canônica</a></p>${slug === 'privacidade' ? '' : '<a href="/" style="color:inherit">Voltar ao site</a>'}</aside>`
  if (slug !== 'privacidade') return local.replace('<body>', `<body>${notice}`).replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>')
  return renderPrivacy(local)
    .replace('<main id="conteudo"', `${notice}<main id="conteudo"`)
    .replace('Rascunho para revisão. Vigência pendente; publicação não autorizada.', state)
    .replace(`${repository}/blob/main/public_html/privacidade/index.html`, sourceUrl)
}

// Origem e caminhos são constantes; nenhum URL remoto recebido do manifesto é seguido.
export async function githubBytes(path, { fetcher = globalThis.fetch, timeoutMs = 15000 } = {}) {
  const url = `https://api.github.com/repos/gabzieg/atmosfera/${path}`
  let response
  try {
    response = await fetcher(url, { headers: { Accept: 'application/vnd.github.raw+json' }, redirect: 'error', signal: AbortSignal.timeout(timeoutMs) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = Buffer.from(await response.arrayBuffer())
    if (data.length > 2_000_000) throw new Error('resposta excede limite')
    return data
  } catch (error) {
    throw new Error(`Fonte legal indisponível (${path.split('?')[0]}): ${error.name === 'TimeoutError' ? 'timeout' : error.message}. Build cancelado.`, { cause: error })
  }
}

export function validatePin(pin) {
  if (pin === null) return null
  if (!isObject(pin) || Object.keys(pin).sort().join(',') !== 'approvalUrl,manifestSha256,sourceCommit' ||
      typeof pin.sourceCommit !== 'string' || !/^[a-f0-9]{40}$/.test(pin.sourceCommit) ||
      typeof pin.manifestSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(pin.manifestSha256) ||
      typeof pin.approvalUrl !== 'string' || !/^https:\/\/[^\s]+$/.test(pin.approvalUrl)) throw new Error('Registro de aprovação inválido.')
  const url = new URL(pin.approvalUrl)
  if (url.username || url.password) throw new Error('Registro de aprovação inválido: URL com credencial.')
  return pin
}

async function readPin() {
  try { return validatePin(JSON.parse(await readFile(new URL('./legal-approved.json', import.meta.url), 'utf8'))) }
  catch (error) { if (error.code === 'ENOENT') return null; throw error }
}

export async function loadDocuments({ fetcher, timeoutMs, approvedPin } = {}) {
  const read = path => githubBytes(path, { fetcher, timeoutMs })
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const parse = bytes => JSON.parse(decoder.decode(bytes))
  const mainCommit = parse(await read('commits/main'))?.sha
  if (typeof mainCommit !== 'string' || !/^[a-f0-9]{40}$/.test(mainCommit)) throw new Error('Revisão canônica inválida.')
  async function revision(commit, expectedManifestHash) {
    const bytes = await read(`contents/docs/legal/manifesto-documentos.json?ref=${commit}`)
    if (expectedManifestHash && hash(bytes) !== expectedManifestHash) throw new Error('Hash divergente: manifesto aprovado.')
    const manifest = validateManifest(parse(bytes))
    const pages = {}
    const entries = {}
    for (const [slug, name] of Object.entries(documents)) {
      const markdown = await read(`contents/docs/legal/${name}.md?ref=${commit}`)
      const html = await read(`contents/public_html/${slug}/index.html?ref=${commit}`)
      verifyDocument(slug, markdown, html, manifest)
      entries[slug] = Object.fromEntries(['fonte', 'versao', 'sha256_fonte', 'sha256_html'].map(key => [key, manifest.documentos[slug][key]]))
      pages[slug] = decoder.decode(html)
    }
    return { manifest, manifestSha256: hash(bytes), pages, entries }
  }
  // Uma falha de leitura/integridade da main nunca chega à seleção do pin.
  let selected = await revision(mainCommit)
  let commit = mainCommit
  let approvalUrl = null
  if (!selected.manifest.aprovado_para_publicacao) {
    const pin = approvedPin === undefined ? await readPin() : validatePin(approvedPin)
    if (!pin) throw new Error(`Publicação bloqueada: main ${mainCommit} é rascunho e não há revisão explicitamente aprovada em scripts/legal-approved.json.`)
    commit = pin.sourceCommit
    selected = await revision(commit, pin.manifestSha256)
    if (!selected.manifest.aprovado_para_publicacao) throw new Error('Publicação bloqueada: revisão fixada não está aprovada.')
    approvalUrl = pin.approvalUrl
  }
  const provenance = { repository, mainCommit, commit, manifestSha256: selected.manifestSha256, approvalUrl, status: selected.manifest.status, aprovado_para_publicacao: selected.manifest.aprovado_para_publicacao, vigencia: selected.manifest.vigencia, documentos: selected.entries }
  return { provenance, pages: Object.fromEntries(Object.entries(selected.pages).map(([slug, html]) => [slug, adaptDocument(slug, html, provenance)])) }
}

export async function generateDocuments(destination, options) {
  await rm(destination, { recursive: true, force: true })
  try {
    const result = await loadDocuments(options)
    for (const [slug, html] of Object.entries(result.pages)) {
      await mkdir(join(destination, slug), { recursive: true })
      await writeFile(join(destination, slug, 'index.html'), html)
    }
    await writeFile(join(destination, 'provenance.json'), JSON.stringify(result.provenance, null, 2) + '\n')
    return result
  } catch (error) {
    await rm(destination, { recursive: true, force: true })
    throw error
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await generateDocuments(resolve('.generated/documentos'))
  console.log(`Documentos canônicos: ${result.provenance.commit}`)
}
