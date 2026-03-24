import { test, expect } from '@playwright/test'

test.describe('Scaffold @smoke', () => {
  test('dark background and fonts (FOUND-01)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Assert dark background
    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    )
    expect(bgColor).toBe('rgb(18, 16, 14)') // #12100E

    // Assert body font-family contains Jost or sans-serif fallback
    const bodyFont = await page.evaluate(() =>
      getComputedStyle(document.body).fontFamily
    )
    expect(bodyFont).toMatch(/Jost|system-ui|sans-serif/)

    // Assert h2 uses Bodoni Moda or serif fallback
    const h2 = page.locator('h2').first()
    await expect(h2).toBeAttached()
    const h2Font = await h2.evaluate((el) =>
      getComputedStyle(el).fontFamily
    )
    expect(h2Font).toMatch(/Bodoni Moda|Georgia|serif/)
  })

  test('SSR safe - no hydration errors (FOUND-06)', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const hydrationErrors = consoleErrors.filter(
      (msg) =>
        msg.toLowerCase().includes('hydration') ||
        msg.toLowerCase().includes('mismatch')
    )
    expect(hydrationErrors).toHaveLength(0)
  })

  test('all sections rendered', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const expectedIds = [
      'surface',
      'transition-1',
      'narrative',
      'projects',
      'contact',
    ]

    const sections = page.locator('section')
    await expect(sections).toHaveCount(5)

    const ids = await sections.evaluateAll((els) =>
      els.map((el) => el.id)
    )
    expect(ids).toEqual(expectedIds)
  })
})
