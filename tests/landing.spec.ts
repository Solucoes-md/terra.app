import { test, expect } from '@playwright/test'

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`layout e navegação em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('O clima muda.Sua tela também.')
    const heading = await page.locator('h1').evaluate(element => ({ height: element.getBoundingClientRect().height, lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight), overflow: element.scrollWidth > element.clientWidth }))
    expect(Math.round(heading.height / heading.lineHeight)).toBe(2)
    expect(heading.overflow).toBe(false)
    const gridComplete = await page.locator('.bento').evaluate(element => {
      const style = getComputedStyle(element)
      const columns = style.gridTemplateColumns.split(' ').map(Number.parseFloat)
      const rows = style.gridTemplateRows.split(' ').map(Number.parseFloat)
      const gap = Number.parseFloat(style.gap)
      const box = element.getBoundingClientRect()
      const cards = Array.from(element.children).map(card => card.getBoundingClientRect())
      let y = box.top
      for (const height of rows) {
        let x = box.left
        for (const width of columns) {
          const centerX = x + width / 2
          const centerY = y + height / 2
          if (cards.filter(card => centerX > card.left && centerX < card.right && centerY > card.top && centerY < card.bottom).length !== 1) return false
          x += width + gap
        }
        y += height + gap
      }
      return true
    })
    expect(gridComplete).toBe(true)
    const heroActions = page.locator('.hero-actions a')
    await expect(heroActions).toHaveCount(2)
    await heroActions.first().click()
    await expect(page).toHaveURL(/#demonstracao$/)
    await page.getByRole('button', { name: 'Chuva', exact: true }).click()
    await expect(page.locator('.stack-sun [data-testid="weather-preview"]')).toHaveAttribute('data-weather', 'rain')
    await page.getByRole('button', { name: 'Noite', exact: true }).click()
    await expect(page.locator('.stack-sun [data-testid="weather-preview"]')).toHaveAttribute('data-weather', 'night')
    await page.getByRole('button', { name: 'Jardim japonês', exact: true }).click()
    await expect(page.locator('#scene-jardim')).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('.stack-sun .preview-label')).toContainText('Jardim japonês')
    await page.locator('#scene-jardim').press('Home')
    await expect(page.locator('#scene-cabana')).toBeFocused()
    await expect(page.locator('#scene-cabana')).toHaveAttribute('aria-expanded', 'true')
    await page.locator('#scene-cabana').press('ArrowRight')
    await expect(page.locator('#scene-bruxa')).toBeFocused()
    await expect(page.locator('.stack-sun .preview-label')).toContainText('Casa da bruxa')
    const overflows = await page.evaluate(async () => {
      const failures = []
      for (let y = 0; y < document.documentElement.scrollHeight; y += 650) {
        window.scrollTo(0, y)
        await new Promise(resolve => requestAnimationFrame(resolve))
        if (document.documentElement.scrollWidth > window.innerWidth) failures.push(y)
      }
      return failures
    })
    expect(overflows).toEqual([])
    await page.locator('#convite').scrollIntoViewIfNeeded()
    expect(await page.locator('img').evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true)
    expect(errors).toEqual([])
  })
}

test('menu móvel e foco de teclado', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused()
  const menu = page.getByRole('button', { name: 'Abrir menu' })
  await menu.click()
  await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await menu.click()
  await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Cenários', exact: true }).click()
  await expect(page).toHaveURL(/#cenarios$/)
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
})

test('pausa, movimento reduzido e redimensionamento limpam o GSAP', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.locator('.stack-stage')).toHaveAttribute('data-stacked', 'true')
  await page.getByRole('button', { name: 'Pausar animações' }).click()
  await expect(page.locator('.app')).toHaveAttribute('data-motion', 'off')
  await expect(page.locator('.stack-stage')).not.toHaveAttribute('data-stacked', 'true')
  await page.getByRole('button', { name: 'Retomar animações' }).click()
  await expect(page.locator('.stack-stage')).toHaveAttribute('data-stacked', 'true')
  await page.setViewportSize({ width: 768, height: 1000 })
  await expect(page.locator('.stack-stage')).not.toHaveAttribute('data-stacked', 'true')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(page.locator('.stack-stage')).toHaveAttribute('data-stacked', 'true')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.app')).toHaveAttribute('data-motion', 'off')
  await expect(page.getByRole('button', { name: 'Movimento reduzido ativado' })).toBeDisabled()
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
})

test('URL configurada atualiza todos os CTAs de instalação', async ({ page }) => {
  const url = 'https://play.google.com/store/apps/details?id=com.terra.wallpaper'
  await page.route('**/src/content/site.ts*', async route => {
    const response = await route.fetch()
    const source = await response.text()
    expect(source).toContain('playStoreUrl: null')
    await route.fulfill({ response, body: source.replace('playStoreUrl: null', `playStoreUrl: ${JSON.stringify(url)}`) })
  })
  await page.goto('/')
  const buttons = page.getByRole('link', { name: 'Ver no Google Play' })
  await expect(buttons).toHaveCount(3)
  for (const button of await buttons.all()) {
    await expect(button).toHaveAttribute('href', url)
    await expect(button).toHaveAttribute('target', '_blank')
    await expect(button).toHaveAttribute('rel', 'noopener noreferrer')
  }
  await expect(page.getByRole('link', { name: 'Explorar cenários' })).toHaveAttribute('href', '#cenarios')
})

test('faixa tem controle de pausa próximo ao conteúdo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Pausar faixa', exact: true }).click()
  await expect(page.locator('.marquee-track')).toHaveCSS('animation-play-state', 'paused')
  await page.getByRole('button', { name: 'Retomar faixa', exact: true }).click()
  await expect(page.locator('.marquee-track')).toHaveCSS('animation-play-state', 'running')
})

test('documentos do rodapé têm destinos locais funcionais', async ({ page }) => {
  await page.goto('/')
  for (const [label, path] of [['Privacidade', 'privacidade'], ['Termos', 'termos'], ['Contato', 'contato']]) {
    await expect(page.getByRole('navigation', { name: 'Links do rodapé' }).getByRole('link', { name: label })).toHaveAttribute('href', `/documentos/${path}/index.html`)
    const response = await page.request.get(`/documentos/${path}/index.html`)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toContain('Documento de referência do aplicativo Terra')
    expect(html).not.toContain('[PREENCHER: data')
  }
})
