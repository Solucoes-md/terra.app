function required(html, pattern, name) {
  const match = html.match(pattern)
  if (!match) throw new Error(`Política de privacidade: ${name} não encontrado no HTML de origem.`)
  return match[1].trim()
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function accessibleTables(html) {
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/g, table => {
    const head = table.match(/<thead>([\s\S]*?)<\/thead>/)
    if (!head) return table.replace(/<th>/g, '<th scope="row">')
    const labels = [...head[1].matchAll(/<th>([\s\S]*?)<\/th>/g)].map(match => match[1].replace(/<[^>]*>/g, ''))
    if (!labels.length) throw new Error('Tabela da política sem cabeçalhos de coluna.')
    return table
      .replace(/<thead>([\s\S]*?)<\/thead>/, (_, content) => `<thead>${content.replace(/<th>/g, '<th scope="col">')}</thead>`)
      .replace(/<tbody>([\s\S]*?)<\/tbody>/, (_, body) => `<tbody>${body.replace(/<tr>([\s\S]*?)<\/tr>/g, (_, row) => {
        const cells = [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)]
        if (cells.length !== labels.length) throw new Error('Tabela da política com número inesperado de células.')
        let column = 0
        return `<tr>${row.replace(/<td>/g, () => `<td data-label="${escapeAttribute(labels[column++])}">`)}</tr>`
      })}</tbody>`)
  })
}

const arrowLeft = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>'
const arrowDown = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 5v14m-6-6 6 6 6-6"/></svg>'
const arrowUp = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>'
const arrowDiagonal = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>'

export function renderPrivacy(html) {
  const main = required(html, /<main>([\s\S]*?)<\/main>/, 'conteúdo principal')
  const metadata = required(main, /<ul class="meta">([\s\S]*?)<\/ul>/, 'metadados')
  const summary = required(main, /<section class="summary">([\s\S]*?)<\/section>/, 'resumo')
  const footer = required(main, /<footer>([\s\S]*?)<\/footer>/, 'rodapé')
  const description = required(html, /<meta name="description" content="([^"]*)">/, 'descrição')
  const email = required(main, /href="mailto:([^"]+)"/, 'e-mail de privacidade')
  const content = main
    .replace(/<header>[\s\S]*?<\/header>/, '')
    .replace(/<section class="summary">[\s\S]*?<\/section>/, '')
    .replace(/<footer>[\s\S]*?<\/footer>/, '')
    .trim()
    .replaceAll('São Paulo (RS, Brasil)', 'São Paulo (SP, Brasil)')
  const chapters = [...content.matchAll(/<h2>(\d+)\.\s*([^<]+)<\/h2>/g)]
  if (!chapters.length || chapters.some((chapter, index) => Number(chapter[1]) !== index + 1)) {
    throw new Error('Os capítulos da política precisam ter numeração consecutiva a partir de 1.')
  }
  if (!content.startsWith(chapters[0][0])) throw new Error('Conteúdo inesperado antes do primeiro capítulo da política.')
  const links = chapters.map(([, number, title]) => `<li><a href="#secao-${number}"><span class="index-number" aria-hidden="true">${number.padStart(2, '0')}</span><span>${title}</span></a></li>`).join('\n')
  let chapterIndex = 0
  const article = accessibleTables(content
    .replace(/<h2>(\d+)\.\s*([^<]+)<\/h2>/g, (_, number, title) => `${chapterIndex++ ? '</section>\n' : ''}<section class="policy-chapter" aria-labelledby="secao-${number}"><h2 id="secao-${number}" tabindex="-1">${number}. ${title}</h2>`)
    .replace(/<h3>(\d+)\.(\d+)\s*([^<]+)<\/h3>/g, (_, chapter, number, title) => `<h3 id="secao-${chapter}-${number}" tabindex="-1">${chapter}.${number} ${title}</h3>`)
    + '\n</section>')
  const summaryContent = summary.replace('<h2>Resumo</h2>', '<h2 id="resumo-titulo">Resumo</h2>')
  const wordmark = '<span class="wordmark">terra<span class="wordmark-dot">.</span></span>'

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0D0E10">
  <meta name="description" content="${escapeAttribute(description)}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="Política de Privacidade — Terra">
  <meta property="og:description" content="${escapeAttribute(description)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <title>Política de Privacidade — Terra</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preload" href="/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/documentos/privacidade/styles.css">
  <!-- Gerado por scripts/prepare-documents.mjs a partir de public_html/privacidade/index.html do Atmosfera.
       Adaptações de apresentação, links locais, datas pendentes e correção de São Paulo (RS) para (SP).
       O conteúdo do projeto de origem deve ser atualizado antes de importar uma nova revisão. -->
</head>
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <header class="legal-header">
    <nav class="legal-container legal-navigation" aria-label="Navegação principal">
      <a class="brand-link" href="/" aria-label="Terra, página inicial">${wordmark}</a>
      <a class="back-link" href="/">${arrowLeft}<span>Voltar ao site</span></a>
    </nav>
  </header>
  <main id="conteudo" tabindex="-1">
    <section class="policy-intro legal-container" aria-labelledby="policy-title">
      <p class="intro-label">Terra — Live Wallpaper</p>
      <h1 class="max-w-6xl" id="policy-title"><span>Política de</span> <span>Privacidade</span></h1>
      <p class="intro-description">Entenda quais dados o aplicativo trata<br class="desktop-break"> e como exercer seus direitos.</p>
      <div class="intro-actions">
        <a class="button" href="#politica">Ler a política${arrowDown}</a>
        <a class="button button-outline" href="mailto:${escapeAttribute(email)}">Falar sobre privacidade${arrowDiagonal}</a>
      </div>
      <ul class="policy-meta">${metadata}</ul>
      <aside class="publication-notice" aria-label="Vigência do documento">
        <span class="notice-mark" aria-hidden="true"></span>
        <div><p>Documento de referência do aplicativo Terra.</p><p>A vigência de lançamento ainda será definida pelo publicador.</p></div>
      </aside>
    </section>
    <div class="policy-layout legal-container">
      <aside class="policy-sidebar">
        <nav aria-labelledby="desktop-index-title">
          <h2 class="index-title" id="desktop-index-title">Neste documento</h2>
          <ol class="policy-index">${links}</ol>
          <a class="index-support" href="mailto:${escapeAttribute(email)}">Falar sobre seus dados${arrowDiagonal}</a>
        </nav>
      </aside>
      <div class="policy-reading">
        <details class="mobile-index">
          <summary>Índice da política<span class="index-toggle" aria-hidden="true"></span></summary>
          <nav aria-label="Índice da política"><ol class="policy-index">${links}</ol></nav>
        </details>
        <section class="summary" id="resumo" aria-labelledby="resumo-titulo">${summaryContent}</section>
        <article id="politica" tabindex="-1" aria-label="Texto completo da política de privacidade">${article}</article>
        <section class="contact-panel" aria-labelledby="contact-title">
          <h2 id="contact-title">Dúvidas sobre<br> seus dados?</h2>
          <p>Para pedidos, dúvidas ou reclamações sobre esta política, entre em contato.</p>
          <a href="mailto:${escapeAttribute(email)}">${email}${arrowDiagonal}</a>
        </section>
        <div class="reading-end"><span>Terra — Live Wallpaper</span><a href="#conteudo">Voltar ao início${arrowUp}</a></div>
      </div>
    </div>
  </main>
  <footer class="legal-footer legal-container">
    <div class="footer-brand"><a class="brand-link" href="/" aria-label="Terra, página inicial">${wordmark}</a><p>Cenário animado. Clima real.</p></div>
    <div class="footer-documents">${footer}<p><a href="https://github.com/gabzieg/atmosfera/blob/main/public_html/privacidade/index.html" target="_blank" rel="noopener noreferrer">Fonte do documento${arrowDiagonal}</a></p></div>
  </footer>
</body>
</html>
`
}
