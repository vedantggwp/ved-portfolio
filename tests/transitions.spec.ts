import { test, expect, type Page } from '@playwright/test'

/** Scroll a section into view by its ID. */
async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await page.evaluate((id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, sectionId)
  // Allow ScrollTrigger to process the position change
  await page.waitForTimeout(500)
}

test.describe('Phase 6: Transitions', () => {
  test('transition-1 flash overlay present (TRAN-01)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const section = page.locator('section#transition-1')
    await expect(section).toBeAttached()

    const flash = section.locator('[data-transition-flash]')
    await expect(flash).toBeAttached()
  })


  test('reduced motion hides transition overlays', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // TransitionFlash should be hidden (display: none via .static)
    const flash = page.locator(
      'section#transition-1 [data-transition-flash]'
    )
    await expect(flash).toBeAttached()
    const flashDisplay = await flash.evaluate(
      (el) => getComputedStyle(el).display
    )
    expect(flashDisplay).toBe('none')

  })

  test('particle field renders during transition-1 (TRAN-02)', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Scroll to transition-1
    await scrollToSection(page, 'transition-1')
    await page.waitForTimeout(1000)

    // Canvas should show visual activity
    const canvasLocator = page.locator('[data-r3f-canvas] canvas')
    await expect(canvasLocator).toBeVisible({ timeout: 5000 })

    const screenshot = await canvasLocator.screenshot()
    // Scene with particles + monolith produces non-trivial pixel data
    expect(screenshot.byteLength).toBeGreaterThan(300)
  })


  test('transition-1 amber flash peaks at midpoint', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // Scroll to transition-1
    await scrollToSection(page, 'transition-1')

    // Manually set sectionProgress to 0.5 to verify flash peaks
    await page.evaluate(() => {
      const store = (
        window as unknown as Record<string, { sectionProgress: number; section: string }>
      ).__scrollStore
      if (store) {
        store.section = 'transition-1'
        store.sectionProgress = 0.5
      }
    })

    // Give rAF one frame to process
    await page.waitForTimeout(100)

    const flash = page.locator(
      'section#transition-1 [data-transition-flash]'
    )
    const opacity = await flash.evaluate(
      (el) => (el as HTMLElement).style.opacity
    )

    // At midpoint (0.5), Gaussian should produce ~1.0 opacity
    expect(parseFloat(opacity)).toBeGreaterThan(0.9)
  })
})
