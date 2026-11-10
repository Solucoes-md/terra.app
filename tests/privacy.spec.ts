import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { approveFixture } from '../scripts/legal-fixture.mjs'

const privacyPath = '/documentos/privacidade/index.html'

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`privacidade: leitura e recursos em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    const failedResources: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    page.on('requestfailed', request => failedResources.push(request.url()))
    page.on('response', response => { if (response.status() >= 400) failedResources.push(response.url()) })
    const response = await page.goto(privacyPath)
    expect(response?.status()).toBe(200)
    await page.evaluate(() => document.fonts.ready)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de Privacidade')
    const title = await page.locator('h1').evaluate(element => ({
      lines: element.getBoundingClientRect().height / Number.parseFloat(getComputedStyle(element).lineHeight),
      overflow: element.scrollWidth > element.clientWidth,
    }))
    expect(Math.round(title.lines)).toBe(2)
    expect(title.overflow).toBe(false)
    await expect(page.locator('.policy-chapter')).toHaveCount(12)
    await expect(page.locator('.policy-meta')).toContainText('1.22')
    await expect(page.locator('.policy-meta')).toContainText('8 de novembro de 2026')
    await expect(page.locator('.policy-meta')).toContainText('2026-12-01')
    await expect(page.locator('#politica')).toContainText('São Paulo, SP')
    await expect(page.locator('body')).not.toContainText('[PREENCHER:')
    if (width >= 1024) {
      await expect(page.locator('.policy-sidebar')).toBeVisible()
      await expect(page.locator('.mobile-index')).toBeHidden()
    } else {
      await expect(page.locator('.policy-sidebar')).toBeHidden()
      await expect(page.locator('.mobile-index summary')).toBeVisible()
    }
    expect(await page.evaluate(() => document.fonts.check('16px Geist'))).toBe(true)
    const failures = await page.evaluate(async () => {
      const overflows: number[] = []
      for (let y = 0; y < document.documentElement.scrollHeight; y += 800) {
        window.scrollTo({ top: y, behavior: 'instant' })
        await new Promise(resolve => requestAnimationFrame(resolve))
        if (document.documentElement.scrollWidth > window.innerWidth) overflows.push(y)
      }
      const tables = Array.from(document.querySelectorAll('.table-wrap')).filter(table => table.scrollWidth > table.clientWidth + 1)
      return { overflows, tables: tables.length }
    })
    expect(failures).toEqual({ overflows: [], tables: 0 })
    expect(errors).toEqual([])
    expect(failedResources).toEqual([])
    for (const [label, document] of [['Termos', 'termos'], ['Contato', 'contato']]) {
      const link = page.getByRole('contentinfo').getByRole('link', { name: label, exact: true })
      const documentResponse = await page.request.get(await link.evaluate(element => (element as HTMLAnchorElement).href))
      expect(documentResponse.status()).toBe(200)
      expect(await documentResponse.text()).toContain('<main>')
      await expect(link).toHaveAttribute('href', `../${document}/index.html`)
    }
  })
}

test('privacidade: índice móvel, âncoras e retorno com teclado', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(privacyPath)
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
  await expect(skip).toBeFocused()
  await skip.press('Enter')
  await expect(page.locator('#conteudo')).toBeFocused()
  const summary = page.locator('.mobile-index summary')
  await summary.focus()
  await summary.press('Enter')
  await expect(page.locator('.mobile-index')).toHaveAttribute('open', '')
  const index = page.getByRole('navigation', { name: 'Índice da política' })
  await expect(index.getByRole('link')).toHaveCount(12)
  const rights = index.getByRole('link', { name: 'Direitos do titular e prazos de atendimento', exact: true })
  await rights.focus()
  await rights.press('Enter')
  await expect(page).toHaveURL(/#secao-10$/)
  await expect(page.locator('#secao-10')).toBeFocused()
  expect(await page.locator('#secao-10').evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThan(78)
  await summary.focus()
  await summary.press('Space')
  await expect(page.locator('.mobile-index')).not.toHaveAttribute('open', '')
  await expect(page.locator('.mobile-index nav')).toBeHidden()
  await expect(page.locator('.contact-panel a')).toHaveAttribute('href', 'mailto:suporteterrabr@gmail.com')
  const back = page.getByRole('link', { name: 'Voltar ao site', exact: true })
  await back.focus()
  await back.press('Enter')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('O clima muda.Sua tela também.')
})

test('privacidade: todos os capítulos e links funcionam sem JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width: 375, height: 812 } })
  const page = await context.newPage()
  try {
    await page.goto(`http://127.0.0.1:5173${privacyPath}`)
    await expect(page.locator('.policy-chapter')).toHaveCount(12)
    await page.locator('.mobile-index summary').click()
    const links = page.getByRole('navigation', { name: 'Índice da política' }).getByRole('link')
    await expect(links).toHaveCount(12)
    for (let chapter = 1; chapter <= 12; chapter++) {
      await expect(links.nth(chapter - 1)).toHaveAttribute('href', `#secao-${chapter}`)
      await expect(page.locator(`#secao-${chapter}`)).toBeAttached()
    }
    await links.last().click()
    await expect(page).toHaveURL(/#secao-12$/)
    await expect(page.locator('#secao-12')).toBeInViewport()
    await page.getByRole('link', { name: 'Voltar ao início', exact: true }).click()
    await expect(page).toHaveURL(/#conteudo$/)
    await expect(page.locator('h1')).toBeInViewport()
    await page.getByRole('link', { name: 'Ler a política', exact: true }).click()
    await expect(page).toHaveURL(/#politica$/)
  } finally {
    await context.close()
  }
})

test('privacidade: redimensionamento, foco visível e movimento reduzido', async ({ page }) => {
  await page.goto(privacyPath)
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page.locator('.policy-sidebar')).toHaveCSS('position', 'sticky')
  const index = page.locator('.policy-sidebar').getByRole('link', { name: 'Alterações e histórico editorial', exact: true })
  await index.focus()
  await expect(index).toBeFocused()
  expect(await index.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto')
  await page.setViewportSize({ width: 768, height: 900 })
  await expect(page.locator('.policy-sidebar')).toBeHidden()
  await expect(page.locator('.mobile-index summary')).toBeVisible()
  await page.locator('.mobile-index summary').click()
  await page.setViewportSize({ width: 1024, height: 900 })
  await expect(page.locator('.policy-sidebar')).toBeVisible()
  await expect(page.locator('.mobile-index')).toBeHidden()
  await expect(page.locator('.policy-chapter')).toHaveCount(12)
})

test('privacidade: impressão contém texto completo e tabelas com cabeçalhos', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(privacyPath)
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.legal-header')).toBeHidden()
  await expect(page.locator('.mobile-index')).toBeHidden()
  await expect(page.locator('.intro-actions')).toBeHidden()
  await expect(page.locator('.contact-panel')).toBeHidden()
  await expect(page.locator('.summary')).toBeVisible()
  await expect(page.locator('.policy-meta')).toBeVisible()
  await expect(page.locator('.policy-chapter')).toHaveCount(12)
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  for (const header of await page.locator('thead').all()) await expect(header).toHaveCSS('display', 'table-header-group')
  expect(await page.locator('table:not(.kv) td').first().evaluate(element => getComputedStyle(element, '::before').display)).toBe('none')
})

test('privacidade: importação acompanha novos metadados e contato sem perder o texto', async ({ page }) => {
  const original = await readFile('tests/fixtures/privacidade-source.html', 'utf8')
  const { renderPrivacy } = await import('../scripts/render-privacy.mjs')
  const source = original
    .replaceAll('suporteterrabr@gmail.com', 'novo-contato@example.com')
    .replace('Versão da política:</strong> 1.22', 'Versão da política:</strong> 1.2')
    .replaceAll('8 de novembro de 2026', '4 de outubro de 2026')
    .replace('<h2>10. Direitos do titular e prazos de atendimento</h2>', '<h2>10. Seus direitos atualizados</h2>')
  await page.setContent(renderPrivacy(source))
  await expect(page.locator('.policy-chapter')).toHaveCount(12)
  await expect(page.locator('.policy-meta')).toContainText('1.2')
  await expect(page.locator('.policy-meta')).toContainText('4 de outubro de 2026')
  await expect(page.locator('.intro-actions a').last()).toHaveAttribute('href', 'mailto:novo-contato@example.com')
  await expect(page.locator('.contact-panel a')).toHaveAttribute('href', 'mailto:novo-contato@example.com')
  await expect(page.locator('.policy-sidebar a[href="#secao-10"]')).toContainText('Seus direitos atualizados')
  const actualSummary = (await page.locator('.summary').textContent() ?? '').replace(/\s+/g, ' ').trim()
  await page.setContent(source)
  expect(actualSummary).toBe((await page.locator('.summary').textContent() ?? '').replace(/\s+/g, ' ').trim())
})

for (const slug of ['privacidade', 'termos', 'contato']) {
  test(`${slug}: redação completa e links locais preservados sem JavaScript`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
    const page = await context.newPage()
    try {
      const original = approveFixture(await readFile(`tests/fixtures/${slug}-source.html`, 'utf8'))
      await page.setContent(original)
      const sourceMetadata = await page.locator('.meta').textContent()
      const sourceSummary = await page.locator('.summary').textContent()
      const sourceFooter = await page.locator('footer').textContent()
      const expected = await page.locator('main').evaluate(element => {
        if (element.querySelector('h1')?.textContent?.startsWith('Política')) {
          element.querySelector('header')?.remove()
          element.querySelector('.summary')?.remove()
          element.querySelector('footer')?.remove()
        }
        return element.textContent ?? ''
      })
      await page.goto(`/documentos/${slug}/index.html`)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
      const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()
      expect(normalize(await page.locator(slug === 'privacidade' ? '.policy-meta' : '.meta').textContent() ?? '')).toBe(normalize(sourceMetadata ?? ''))
      expect(normalize(await page.locator('.summary').textContent() ?? '')).toBe(normalize(sourceSummary ?? ''))
      if (slug === 'privacidade') expect(normalize(await page.locator('.footer-documents').evaluate(element => {
        const clone = element.cloneNode(true) as HTMLElement
        clone.lastElementChild?.remove()
        return clone.textContent
      }) ?? '')).toBe(normalize(sourceFooter ?? ''))
      const text = await page.locator(slug === 'privacidade' ? '#politica' : 'main').textContent()
      expect(normalize(text ?? '')).toBe(normalize(expected))
      await expect(page.getByRole('complementary', { name: 'Proveniência' })).toContainText('Estado canônico: aprovado. Vigência: 2026-12-01.')
      for (const link of await page.locator('a[href]').all()) {
        const href = await link.getAttribute('href') ?? ''
        if (href.startsWith('#')) {
          await expect(page.locator(href)).toBeAttached()
        } else if (!/^[a-z]+:/i.test(href)) {
          const url = new URL(href, page.url())
          expect((await page.request.get(url.href)).status()).toBe(200)
          expect(url.pathname === '/' || /^\/documentos\/(privacidade|termos|contato)\/index.html$/.test(url.pathname)).toBe(true)
        }
      }
      expect(await page.locator('script').count()).toBe(0)
    } finally {
      await context.close()
    }
  })
}

test('documentos: proveniência por revisão e rota inexistente sem fallback da landing', async ({ page }) => {
  for (const slug of ['privacidade', 'termos', 'contato']) {
    await page.goto(`/documentos/${slug}/index.html`)
    const provenance = page.getByRole('complementary', { name: 'Proveniência' })
    await expect(provenance).toContainText('a'.repeat(40))
    await expect(provenance.getByRole('link', { name: 'Fonte canônica' })).toHaveAttribute('href', new RegExp(`/blob/${'a'.repeat(40)}/docs/legal/`))
  }
  const response = await page.request.get('/documentos/inexistente/index.html')
  expect(response.status()).toBe(404)
  expect(await response.text()).not.toContain('O clima muda')
})

for (const slug of ['privacidade', 'termos', 'contato']) {
  test(`${slug}: URL curta redireciona permanentemente ao documento, sem landing`, async ({ page }) => {
    const response = await page.request.get(`/${slug}`, { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers().location).toBe(`/documentos/${slug}/index.html`)
    await page.goto(`/${slug}`)
    await expect(page).toHaveURL(new RegExp(`/documentos/${slug}/index.html$`))
    await expect(page.getByRole('complementary', { name: 'Proveniência' })).toContainText('Estado canônico: aprovado.')
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('O clima muda.Sua tela também.')
  })
}
