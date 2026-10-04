import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'

const source = process.argv[2]
if (!source) throw new Error('Informe o diretório do projeto Atmosfera.')
for (const document of ['privacidade', 'termos', 'contato']) {
  const original = await readFile(resolve(source, 'public_html', document, 'index.html'), 'utf8')
  const banner = `<aside style="padding:20px 24px;background:#202226;color:#f4f5f7;border-bottom:1px solid #9a9ea5;font:14px/1.7 system-ui,sans-serif;text-align:center">Documento de referência do aplicativo Terra. A vigência de lançamento ainda será definida pelo publicador. <a href="/" style="color:#fff;text-decoration:underline">Voltar ao site</a> · <a href="https://github.com/gabzieg/atmosfera/blob/main/public_html/${document}/index.html" style="color:#fff;text-decoration:underline">Fonte do documento</a></aside>`
  const html = original
    .replace(/<body([^>]*)>/, `<body$1>${banner}`)
    .replace(/\[PREENCHER: data[^\]]*\]/g, 'A confirmar no lançamento no Google Play')
    .replace(/https:\/\/terra-livewallpaper\.pages\.dev\/(privacidade|termos|contato)\//g, '/documentos/$1/index.html')
    .replace(/href="\.\.\/(privacidade|termos|contato)\/"/g, 'href="../$1/index.html"')
  const destination = resolve('public/documentos', document)
  await mkdir(destination, { recursive: true })
  await writeFile(join(destination, 'index.html'), html)
  console.log(`Documento local: ${document}`)
}
