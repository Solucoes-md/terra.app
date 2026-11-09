import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, join } from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import { renderPrivacy } from './render-privacy.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
export const provenance = JSON.parse(await readFile(new URL('./documents-source.json', import.meta.url), 'utf8'))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')

export function verifyDocument(slug, markdown, html, manifest) {
  const expected = provenance.documentos[slug]
  const actual = manifest.documentos?.[slug]
  if (manifest.status !== provenance.status || manifest.aprovado_para_publicacao !== false || manifest.vigencia !== null ||
      !actual || Object.keys(expected).some(key => actual[key] !== expected[key])) {
    throw new Error(`Fonte incompatível: ${slug}. Revise a proveniência antes de importar.`)
  }
  if (hash(markdown) !== expected.sha256_fonte || hash(html) !== expected.sha256_html) {
    throw new Error(`Hash divergente: ${slug}. Nenhum documento deve ser importado.`)
  }
}

export function adaptDocument(slug, original) {
  // Somente href muda: as URLs escritas no texto e os metadados permanecem canônicos.
  const local = original.replace(/href="(?:\.\.\/|https:\/\/sites\.google\.com\/view\/terra-live-wallpaper\/)(privacidade|termos|contato)\/?"/g,
    (_, target) => `href="../${target}/index.html"`)
  const sourceUrl = `${provenance.repository}/blob/${provenance.commit}/public_html/${slug}/index.html`
  const notice = `<aside aria-label="Estado editorial" style="padding:20px 24px;background:#202226;color:#f4f5f7;font:14px/1.7 system-ui,sans-serif">Documento de referência do aplicativo Terra. <span>Rascunho para revisão. Vigência pendente; publicação não autorizada.</span> <a href="/" style="color:inherit">Voltar ao site</a> · <a href="${sourceUrl}" style="color:inherit">Fonte do documento</a></aside>`
  return slug === 'privacidade'
    ? renderPrivacy(local).replace(`${provenance.repository}/blob/main/public_html/privacidade/index.html`, sourceUrl)
    : local.replace('<body>', `<body>${notice}`).replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>')
}

export async function prepareDocuments(source, destination = resolve(root, 'public/documentos')) {
  const manifest = JSON.parse(await readFile(resolve(source, 'docs/legal/manifesto-documentos.json'), 'utf8'))
  for (const [path, expected] of Object.entries(provenance.tooling)) {
    if (hash(await readFile(resolve(source, path))) !== expected) throw new Error(`Fonte incompatível: ${path}.`)
  }
  // Valide e renderize o conjunto inteiro antes da primeira gravação.
  const documents = await Promise.all(Object.entries(provenance.documentos).map(async ([slug, entry]) => {
    const markdown = await readFile(resolve(source, entry.fonte))
    const html = await readFile(resolve(source, 'public_html', slug, 'index.html'))
    verifyDocument(slug, markdown, html, manifest)
    return [slug, adaptDocument(slug, html.toString('utf8'))]
  }))
  for (const [slug, html] of documents) {
    await mkdir(join(destination, slug), { recursive: true })
    await writeFile(join(destination, slug, 'index.html'), html)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error('Informe o diretório do projeto Atmosfera na revisão fixada.')
  await prepareDocuments(resolve(process.argv[2]))
  console.log(`Documentos conferidos e importados de ${provenance.commit}; publicação não autorizada.`)
}
