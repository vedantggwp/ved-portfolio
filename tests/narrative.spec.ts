import { test, expect } from '@playwright/test'

test.describe('Sticky Narrative', () => {
  test('narrative section contains 3 text layers (NAR-01)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const narrative = page.locator('section#narrative')
    await expect(narrative).toBeAttached()

    // Find the sticky viewport inside the 400vh track
    const viewport = narrative.locator('> div > div').first()
    await expect(viewport).toBeAttached()

    // Find all h2 patterns
    const patterns = viewport.locator('h2')
    await expect(patterns).toHaveCount(3)

    // Find all p descriptions
    const descriptions = viewport.locator('p')
    await expect(descriptions).toHaveCount(3)

    // Verify first pattern text
    await expect(patterns.nth(0)).toContainText('narrative')
    await expect(patterns.nth(0)).toContainText('build both')
  })

  test('text layers have correct Liquid Glass thematic colors (NAR-02)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const patterns = page.locator('section#narrative h2[class*="pattern"]')

    // Phase 0: Gold
    const color0 = await patterns.nth(0).evaluate((el) => (el as HTMLElement).style.color)
    expect(color0).toMatch(/rgb\(202,\s*138,\s*4\)/)

    // Phase 1: White
    const color1 = await patterns.nth(1).evaluate((el) => (el as HTMLElement).style.color)
    expect(color1).toMatch(/rgb\(250,\s*250,\s*249\)/)

    // Phase 2: Gold
    const color2 = await patterns.nth(2).evaluate((el) => (el as HTMLElement).style.color)
    expect(color2).toMatch(/rgb\(202,\s*138,\s*4\)/)
  })

  test('reduced motion shows text statically as a flex column (NAR-03)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const narrative = page.locator('section#narrative')
    await expect(narrative).toBeAttached()

    // Reduced motion doesn't use the sticky viewport; it uses static stacked layers
    const staticLayers = narrative.locator('div[class*="staticLayer"]')
    // There are 3 static layer wrappers
    await expect(staticLayers).toHaveCount(3)

    // Both should be at full opacity in reduced-motion mode via the staticLayer CSS class
    const layerOpacity = await staticLayers.nth(0).evaluate((el) => getComputedStyle(el).opacity)
    expect(parseFloat(layerOpacity)).toBe(1)
  })
})
