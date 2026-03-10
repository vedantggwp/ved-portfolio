import { test, expect } from '@playwright/test'

test.describe('Surface Layer', () => {
  test('provocation text visible in surface section (SURF-01)', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const surface = page.locator('section#surface')

    // Two provocation lines exist
    const line1 = surface.locator('p[data-line="1"]')
    const line2 = surface.locator('p[data-line="2"]')
    await expect(line1).toBeAttached()
    await expect(line2).toBeAttached()

    // Verify exact couplet text
    await expect(line1).toHaveText(
      'The closer you look at one thing,'
    )
    await expect(line2).toHaveText(
      'the more it resembles everything else.'
    )

    // Font family is NOT DM Serif Display or Inter (uses provocation font)
    const fontFamily = await line1.evaluate((el) =>
      getComputedStyle(el).fontFamily
    )
    expect(fontFamily).not.toMatch(/^Inter/)
    expect(fontFamily).not.toMatch(/DM Serif Display/)
    expect(fontFamily).toMatch(/Instrument Serif/i)
  })

  test('scroll-linked fade-out on provocation (SURF-02)', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for entrance animations to complete (line2 has 1s delay + 2.5s duration)
    await page.waitForTimeout(4000)

    const container = page.locator('[aria-label="Provocation"]')
    await expect(container).toBeAttached()

    // Verify initial opacity is 1 (after entrance animation completes)
    const initialOpacity = await container.evaluate(
      (el) => getComputedStyle(el).opacity
    )
    expect(parseFloat(initialOpacity)).toBeGreaterThanOrEqual(0.9)

    // Scroll well past the surface section to trigger fade-out
    await page.evaluate(() => {
      window.scrollTo(0, window.innerHeight * 2)
    })
    await page.waitForTimeout(1500)

    // After scrolling past surface, opacity should be near 0
    const scrolledOpacity = await container.evaluate(
      (el) => el.style.opacity || getComputedStyle(el).opacity
    )
    expect(parseFloat(scrolledOpacity)).toBeLessThanOrEqual(0.15)
  })

  test('surface section contains only provocation (SURF-03)', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const surface = page.locator('section#surface')

    // No name, title, or bio text
    const textContent = await surface.evaluate((el) =>
      el.textContent?.toLowerCase() ?? ''
    )
    expect(textContent).not.toMatch(/\bved\b/)
    expect(textContent).not.toMatch(/\bdeveloper\b/)
    expect(textContent).not.toMatch(/\bengineer\b/)

    // No CTA buttons or links (except skip links which are outside #surface)
    const buttons = surface.locator('button')
    await expect(buttons).toHaveCount(0)
    const links = surface.locator('a')
    await expect(links).toHaveCount(0)
  })

  test('reduced motion shows static text (A11Y-RM)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Both lines should be immediately visible at full opacity
    const line1 = page.locator('section#surface p[data-line="1"]')
    const line2 = page.locator('section#surface p[data-line="2"]')
    await expect(line1).toBeAttached()
    await expect(line2).toBeAttached()

    // Check opacity is 1 (no animation, static display)
    const line1Opacity = await line1.evaluate(
      (el) => getComputedStyle(el).opacity
    )
    expect(parseFloat(line1Opacity)).toBe(1)

    const line2Opacity = await line2.evaluate(
      (el) => getComputedStyle(el).opacity
    )
    expect(parseFloat(line2Opacity)).toBe(1)

    // Verify no active CSS animation
    const line1Animation = await line1.evaluate(
      (el) => getComputedStyle(el).animationName
    )
    expect(line1Animation).toBe('none')
  })
})
