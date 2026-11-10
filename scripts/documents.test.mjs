import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, access, rm, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { generateDocuments, loadDocuments, githubBytes } from './prepare-documents.mjs'
import { fixtureSource } from './legal-fixture.mjs'

async function sandbox(run) {
  await mkdir('.generated/tests', { recursive: true })
  const path = await mkdtemp(resolve('.generated/tests/case-'))
  try { await run(path) } finally { await rm(path, { recursive: true, force: true }) }
}

test('main avança: uma revisão por conjunto; versão, redação e permalink acompanham', async () => {
  const first = await fixtureSource()
  const next = await fixtureSource({ commit: 'b'.repeat(40), revision: true })
  const a = await loadDocuments(first)
  const b = await loadDocuments(next)
  assert.notEqual(a.provenance.commit, b.provenance.commit)
  for (const slug of ['privacidade', 'termos', 'contato']) {
    assert.equal(b.provenance.documentos[slug].versao, '9.9')
    assert.match(b.pages[slug], /Revisão nova verificável/)
    assert.ok(b.pages[slug].includes(`/blob/${'b'.repeat(40)}/docs/legal/`))
    assert.ok(b.pages[slug].includes('Commit <code>'))
  }
  assert.equal(next.calls.filter(url => url.endsWith('/commits/main')).length, 1)
  assert.ok(next.calls.slice(1).every(url => url.endsWith(`?ref=${'b'.repeat(40)}`)))
})

for (const failure of ['rede', 'json', 'schema', 'hash-html', 'hash-markdown', 'versão']) {
  test(`falha fechada por ${failure}: sem conjunto anterior`, async () => sandbox(async destination => {
    const source = await fixtureSource({ mutate(manifest, files) {
      if (failure === 'schema') delete manifest.documentos.termos
      if (failure === 'hash-html') files['public_html/contato/index.html'] += 'adulterado'
      if (failure === 'hash-markdown') files['docs/legal/PRIVACIDADE.md'] += 'adulterado'
      if (failure === 'versão') manifest.documentos.termos.versao = 'inválida'
    } })
    if (failure === 'rede') source.fetcher = async () => { throw new Error('offline') }
    if (failure === 'json') source.fetcher = async () => new Response('não é JSON')
    await mkdir(destination, { recursive: true })
    await writeFile(resolve(destination, 'index.html'), 'antigo')
    await assert.rejects(generateDocuments(destination, source), /indisponível|JSON|Manifesto|Hash divergente/)
    await assert.rejects(access(destination), /ENOENT/)
  }))
}

test('API: timeout aborta; erro HTTP e redirecionamento são recusados', async () => {
  await assert.rejects(githubBytes('commits/main', { timeoutMs: 5, fetcher: async (_url, options) => {
    assert.equal(options.redirect, 'error')
    await new Promise((_, reject) => {
      options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true })
      // Mantém o event loop vivo até o timeout real do sinal.
      const timer = setTimeout(() => reject(new Error('timeout não abortou')), 1000)
      options.signal.addEventListener('abort', () => clearTimeout(timer), { once: true })
    })
  } }), /timeout/)
  await assert.rejects(githubBytes('commits/main', { fetcher: async () => new Response('', { status: 403 }) }), /HTTP 403/)
})

test('metadados aprovados futuros são espelhados sem congelar rascunho', async () => {
  const source = await fixtureSource({ mutate(manifest) { manifest.status = 'aprovado_para_publicacao'; manifest.aprovado_para_publicacao = true; manifest.vigencia = '2026-12-01' } })
  const result = await loadDocuments(source)
  assert.match(result.pages.privacidade, /Estado canônico: aprovado. Vigência: 2026-12-01/)
  assert.doesNotMatch(result.pages.privacidade, /publicação não autorizada/)
})

test('gera somente proveniência pública mínima e HTMLs completos', async () => sandbox(async destination => {
  const result = await generateDocuments(destination, await fixtureSource())
  for (const slug of Object.keys(result.pages)) assert.equal(await readFile(resolve(destination, slug, 'index.html'), 'utf8'), result.pages[slug])
  const saved = JSON.parse(await readFile(resolve(destination, 'provenance.json'), 'utf8'))
  assert.deepEqual(Object.keys(saved).sort(), ['approvalUrl', 'aprovado_para_publicacao', 'commit', 'documentos', 'mainCommit', 'manifestSha256', 'repository', 'status', 'vigencia'])
}))

async function pinnedSource({ mainMutation, pinMutation, pinApproved = true } = {}) {
  const main = await fixtureSource({ approved: false, mutate: mainMutation })
  const pinned = await fixtureSource({ commit: 'c'.repeat(40), approved: pinApproved })
  const approvedPin = { sourceCommit: 'c'.repeat(40), manifestSha256: pinned.manifestSha256, approvalUrl: 'https://example.com/aceite-publico-simulado' }
  pinMutation?.(approvedPin)
  const fetcher = url => url.includes(`ref=${'c'.repeat(40)}`) ? pinned.fetcher(url) : main.fetcher(url)
  return { fetcher, approvedPin, main, pinned }
}

test('main rascunho usa somente SHA/hash explicitamente aprovado; null bloqueia', async () => {
  const source = await pinnedSource()
  const result = await loadDocuments(source)
  assert.equal(result.provenance.commit, 'c'.repeat(40))
  assert.equal(result.provenance.mainCommit, 'a'.repeat(40))
  assert.equal(result.provenance.approvalUrl, source.approvedPin.approvalUrl)
  assert.ok(source.pinned.calls.every(url => url.includes(`ref=${'c'.repeat(40)}`)))
  await assert.rejects(loadDocuments({ ...source, approvedPin: null }), /não há revisão explicitamente aprovada/)
})

for (const failure of ['pin-hash', 'pin-rascunho', 'pin-schema', 'main-hash', 'main-rede']) {
  test(`${failure}: recusa sem reutilizar saída nem fallback de falha`, async () => sandbox(async destination => {
    const source = await pinnedSource({
      pinApproved: failure !== 'pin-rascunho',
      pinMutation(pin) {
        if (failure === 'pin-hash') pin.manifestSha256 = '0'.repeat(64)
        if (failure === 'pin-schema') pin.extra = 'não permitido'
      },
      mainMutation(_manifest, files) { if (failure === 'main-hash') files['docs/legal/TERMOS.md'] += 'adulterado' },
    })
    if (failure === 'main-rede') source.fetcher = async () => { throw new Error('offline') }
    await writeFile(resolve(destination, 'anterior.html'), 'antigo')
    await assert.rejects(generateDocuments(destination, source), /Hash divergente|não está aprovada|aprovação inválido|indisponível/)
    await assert.rejects(access(destination), /ENOENT/)
    if (failure.startsWith('main-')) assert.equal(source.pinned.calls.length, 0)
  }))
}

test('aprovado sem registro de aceite falha; vigência null aprovada é preservada', async () => {
  const invalid = await fixtureSource({ mutate(manifest) { manifest.aprovacao_registro = '  ' } })
  await assert.rejects(loadDocuments(invalid), /Manifesto legal inválido/)
  const source = await fixtureSource({ mutate(manifest) { manifest.vigencia = null } })
  const result = await loadDocuments(source)
  assert.equal(result.provenance.vigencia, null)
  for (const html of Object.values(result.pages)) {
    assert.match(html, /Estado canônico: aprovado. Vigência pendente./)
    assert.doesNotMatch(html, /publicação não autorizada/)
  }
})

test('MD editorial aceito pode conter rascunho; estado público vem do HTML canônico e manifesto', async () => {
  const source = await fixtureSource()
  const result = await loadDocuments(source)
  assert.equal(result.provenance.status, 'aprovado_para_publicacao')
  assert.match(result.pages.privacidade, /Documento aprovado para publicação/)
  assert.doesNotMatch(result.pages.privacidade, /ainda não aprovado para publicação definitiva/)
})
