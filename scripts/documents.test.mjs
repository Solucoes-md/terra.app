import { URL } from 'node:url'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { provenance, verifyDocument, adaptDocument } from './prepare-documents.mjs'

for (const [slug, entry] of Object.entries(provenance.documentos)) {
  test(`${slug}: aceita bytes canônicos; recusa hash divergente e fonte incompatível`, async () => {
    const html = await readFile(new URL(`../tests/fixtures/${slug}-source.html`, import.meta.url))
    const markdown = await readFile(new URL(`../tests/fixtures/${entry.fonte.split('/').pop()}`, import.meta.url))
    const manifest = { ...provenance }
    const generated = await readFile(new URL(`../public/documentos/${slug}/index.html`, import.meta.url), 'utf8')
    assert.equal(adaptDocument(slug, html.toString('utf8')), generated)
    assert.doesNotThrow(() => verifyDocument(slug, markdown, html, manifest))
    assert.throws(() => verifyDocument(slug, markdown, Buffer.concat([html, Buffer.from('alteração')]), manifest), /Hash divergente/)
    assert.throws(() => verifyDocument(slug, Buffer.concat([markdown, Buffer.from('alteração')]), html, manifest), /Hash divergente/)
    assert.throws(() => verifyDocument(slug, markdown, html, { ...manifest, aprovado_para_publicacao: true }), /Fonte incompatível/)
    assert.throws(() => verifyDocument(slug, markdown, html, { ...manifest, vigencia: '2026-11-09' }), /Fonte incompatível/)
    assert.throws(() => verifyDocument(slug, markdown, html, { ...manifest, documentos: {} }), /Fonte incompatível/)
  })
}
