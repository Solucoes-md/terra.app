import { rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
// Limpar antes também do typecheck impede deploy acidental de um dist anterior.
await rm('dist', { recursive: true, force: true })
await rm('.generated', { recursive: true, force: true })
try {
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
