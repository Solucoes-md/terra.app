import { test } from 'node:test'
import assert from 'node:assert/strict'
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

test('build recusa auditoria reprovada e remove artefato anterior antes de compilar', { timeout: 10000 }, async () => {
  await mkdir('.generated/audit-tests', { recursive: true })
  const directory = await mkdtemp(resolve('.generated/audit-tests/case-'))
  try {
    const auditCli = resolve(directory, 'audit-cli.mjs')
    await writeFile(auditCli, "process.stderr.write('audit-negado-controlado\\n');process.exit(23)\n")
    await mkdir(resolve(directory, 'dist'))
    await writeFile(resolve(directory, 'dist/index.html'), 'artefato anterior')
    await mkdir(resolve(directory, '.generated'))
    await writeFile(resolve(directory, '.generated/anterior.html'), 'documento antigo')
    // Compilador/bundler são a fronteira de subprocesso; não devem ser chamados após audit vermelho.
    await mkdir(resolve(directory, 'node_modules/typescript/bin'), { recursive: true })
    await mkdir(resolve(directory, 'node_modules/vite/bin'), { recursive: true })
    await writeFile(resolve(directory, 'node_modules/typescript/bin/tsc'), "process.stdout.write('compilador-executado\\n')\n")
    await writeFile(resolve(directory, 'node_modules/vite/bin/vite.js'), "const fs=require('node:fs');fs.mkdirSync('dist',{recursive:true});fs.writeFileSync('dist/index.html','build indevido')\n")
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('./build.mjs', import.meta.url))], {
      cwd: directory,
      env: { ...process.env, npm_execpath: auditCli },
      encoding: 'utf8', timeout: 5000,
    })
    assert.equal(result.error, undefined)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /audit-negado-controlado/)
    assert.doesNotMatch(result.stdout, /compilador-executado/)
    assert.match(result.stderr, /Build cancelado: auditoria de dependências/)
    await assert.rejects(access(resolve(directory, 'dist')), /ENOENT/)
    await assert.rejects(access(resolve(directory, '.generated')), /ENOENT/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
