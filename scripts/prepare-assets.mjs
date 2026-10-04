import sharp from 'sharp'
import { mkdir, writeFile, copyFile, readFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'

const source = process.argv[2]
if (!source) throw new Error('Informe o diretório de origem: node scripts/prepare-assets.mjs "D:\\Git repos\\atmosfera"')
const root = resolve(source, 'android-app/app/src/main/assets/atmosfera/cenas')
const destination = resolve('public/images')
const items = [
  ['cabana', 'pixel'], ['bruxa', 'clay'], ['lavanda', 'aqua'], ['esfinge', 'vangogh'], ['jardim', 'ukiyoe'],
]
await mkdir(destination, { recursive: true })
const manifest = []
for (const [id, art] of items) {
  const path = join(root, id, art, 'fundo.png')
  const input = await readFile(path)
  const metadata = await sharp(input).metadata()
  for (const width of [480, 960, 1440]) {
    // Pixel art usa nearest-neighbour; o aumento mantém a dimensão declarada no srcset.
    const buffer = await sharp(input).resize({ width, kernel: id === 'cabana' ? 'nearest' : 'lanczos3' })
      .webp({ quality: 82, effort: 6 }).toBuffer()
    await writeFile(join(destination, `${id}-${width}.webp`), buffer)
    manifest.push({ scene: id, sourceArt: art, width, bytes: buffer.length })
  }
  console.log(`${id}: ${metadata.width}×${metadata.height} → três tamanhos WebP`)
}
await writeFile(join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
await mkdir(resolve('public/fonts'), { recursive: true })
await copyFile(resolve('node_modules/@fontsource-variable/geist/LICENSE'), resolve('public/fonts/Geist-OFL.txt'))
await copyFile(resolve('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'), resolve('public/fonts/geist-latin-wght-normal.woff2'))
console.log(`Imagens: ${Math.round(manifest.reduce((sum, item) => sum + item.bytes, 0) / 1024)} KiB no total`)
