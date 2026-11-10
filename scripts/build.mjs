import { rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
// Limpar antes também do typecheck impede deploy acidental de um dist anterior.
await rm('dist', { recursive: true, force: true })
await rm('.generated', { recursive: true, force: true })
try {
  // 10/11/2026, issue #5: alertas preexistentes passavam pelo build sem bloquear publicação.
  if (!process.env.npm_execpath) throw new Error('Execute npm run build para incluir a auditoria de dependências.')
  const audit = spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'audit'], { stdio: 'inherit' })
  if (audit.status !== 0) throw new Error('Build cancelado: auditoria de dependências. Rode npm run audit e corrija os alertas.')
  for (const args of [['tsc', '-b'], ['vite', 'build']]) {
    const result = spawnSync(process.execPath, [`node_modules/${args[0] === 'tsc' ? 'typescript/bin/tsc' : 'vite/bin/vite.js'}`, ...args.slice(1)], { stdio: 'inherit' })
    if (result.status !== 0) throw new Error(`Build cancelado: ${args[0]}.`)
  }
} catch (error) {
  await rm('dist', { recursive: true, force: true })
  await rm('.generated', { recursive: true, force: true })
  console.error(error.message)
  process.exitCode = 1
}
