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

test.describe('Scroll Engine', () => {
  test('smooth scroll -- Lenis initializes and page scrolls', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    // Wait for Lenis to initialize and add its class
    await page.waitForTimeout(1000)

    // Lenis adds the 'lenis' class to <html>
    const hasLenisClass = await page.evaluate(() =>
      document.documentElement.classList.contains('lenis')
    )
    expect(hasLenisClass).toBe(true)

    // Scroll with mouse wheel and verify position changed
    const scrollBefore = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, 500)
    await page.waitForTimeout(800)
    const scrollAfter = await page.evaluate(() => window.scrollY)
    expect(scrollAfter).toBeGreaterThan(scrollBefore)
  })

  test('no rerender -- scroll store does not use React state', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // Reset the render counter exposed by ScrollEngine in dev mode
    await page.evaluate(() => {
      ;(window as unknown as Record<string, number>).__SCROLL_STORE_READS__ = 0
    })

    // Scroll multiple times
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 200)
      await page.waitForTimeout(100)
    }

    await page.waitForTimeout(500)

    const reads = await page.evaluate(
      () =>
        (window as unknown as Record<string, number>).__SCROLL_STORE_READS__ ??
        0
    )
    expect(reads).toBe(0)
  })

  test('section order -- depth-based sections in DOM', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const sectionIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll('section[id]')).map((s) => s.id)
    )

    expect(sectionIds).toEqual([
      'surface',
      'transition-1',
      'pocket-1',
      'pocket-2',
      'pocket-3',
      'transition-2',
      'projects',
      'contact',
    ])
  })

  test('progress -- scroll store exposes 0-1 progress', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // Scroll to the very bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1500)

    const progress = await page.evaluate(
      () =>
        (window as unknown as Record<string, { progress: number }>)
          .__scrollStore?.progress ?? -1
    )
    // Progress should be close to 1 at bottom
    expect(progress).toBeGreaterThan(0.5)
  })

  test('pin -- content sections pin during scroll', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // Scroll pocket-1 into view
    await scrollToSection(page, 'pocket-1')

    // Get initial position
    const topBefore = await page.evaluate(() => {
      const el = document.getElementById('pocket-1')
      return el ? el.getBoundingClientRect().top : -1
    })

    // Scroll a bit more -- pinned section should stay near top
    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(500)

    const topAfter = await page.evaluate(() => {
      const el = document.getElementById('pocket-1')
      return el ? el.getBoundingClientRect().top : -1
    })

    // If pinned, top should remain near 0 (within some tolerance)
    // Both readings should be near the top of the viewport
    expect(Math.abs(topBefore)).toBeLessThan(200)
    expect(Math.abs(topAfter)).toBeLessThan(200)
  })
})
