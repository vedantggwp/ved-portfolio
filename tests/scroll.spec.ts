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
      'narrative',
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

  test('variable -- different scroll distances per section type', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // Scroll to surface section and measure its scroll end distance
    const surfaceEnd = await page.evaluate(() => {
      const el = document.getElementById('surface')
      if (!el) return 0
      // GSAP ScrollTrigger creates pin-spacer with height proportional to end value
      const pinSpacer = el.closest('.pin-spacer') as HTMLElement | null
      return pinSpacer ? pinSpacer.offsetHeight : el.offsetHeight
    })

    // Scroll to narrative and measure its scroll distance
    await scrollToSection(page, 'narrative')
    const narrativeEnd = await page.evaluate(() => {
      const el = document.getElementById('narrative')
      if (!el) return 0
      const pinSpacer = el.closest('.pin-spacer') as HTMLElement | null
      return pinSpacer ? pinSpacer.offsetHeight : el.offsetHeight
    })

    // Narrative (400vh) should require more scroll distance than surface (100vh + pin)
    expect(narrativeEnd).toBeGreaterThan(surfaceEnd)
  })

  test('membrane -- transition resistance function produces correct values', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // Test the getTransitionResistance function exposed on window
    const results = await page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>
      const getResistance = win.__getTransitionResistance as (
        p: number,
        d: number,
        id: string
      ) => number

      if (!getResistance) return null

      return {
        // Non-transition section returns 1 (no resistance)
        nonTransition: getResistance(0.5, 1, 'surface'),
        // Transition-1 mid-build descending: should be < 1
        t1MidDesc: getResistance(0.4, 1, 'transition-1'),
        // Transition-1 ascending: should have less resistance than descending
        t1MidAsc: getResistance(0.4, -1, 'transition-1'),
        // Transition-1 release phase: should be closer to 1 (the "pop")
        t1Release: getResistance(0.95, 1, 'transition-1'),
      }
    })

    expect(results).not.toBeNull()
    if (!results) return

    // Non-transition: no resistance
    expect(results.nonTransition).toBe(1)
    // Transition-1 descending build: resistance applied (< 1)
    expect(results.t1MidDesc).toBeLessThan(1)
    // Ascending has less resistance than descending (value closer to 1)
    expect(results.t1MidAsc).toBeGreaterThan(results.t1MidDesc)
    // Release phase should be closer to 1 (popping through)
    expect(results.t1Release).toBeGreaterThan(results.t1MidDesc)
  })

  test('lazy -- sections mount children when approaching viewport', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // Surface section should NOT have a LazySection wrapper (always loaded)
    const surfaceLazy = await page.evaluate(() => {
      const surface = document.getElementById('surface')
      return surface?.querySelector('[data-lazy-mounted]') !== null
    })
    expect(surfaceLazy).toBe(false)

    // Nearby sections should have mounted due to 200% rootMargin
    // (within 2 viewports of the top)
    const transition1Mounted = await page.evaluate(() => {
      const section = document.getElementById('transition-1')
      const lazy = section?.querySelector('[data-lazy-mounted]')
      return lazy !== null
    })
    expect(transition1Mounted).toBe(true)

    // Far-away sections should NOT yet be mounted
    const contactMounted = await page.evaluate(() => {
      const section = document.getElementById('contact')
      const lazy = section?.querySelector('[data-lazy-mounted]')
      return lazy !== null
    })
    expect(contactMounted).toBe(false)

    // Scroll towards projects section
    await scrollToSection(page, 'projects')

    // After scrolling, projects should now be mounted
    const projectsMounted = await page.evaluate(() => {
      const section = document.getElementById('projects')
      const lazy = section?.querySelector('[data-lazy-mounted]')
      return lazy !== null
    })
    expect(projectsMounted).toBe(true)
  })

  test('pin -- content sections pin during scroll', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // Scroll narrative into view
    await scrollToSection(page, 'narrative')

    // Get initial position of the sticky viewport inside narrative
    const topBefore = await page.evaluate(() => {
      // The DOM is section#narrative -> div.track -> div.stickyViewport
      const el = document.querySelector('#narrative > div > div')
      return el ? el.getBoundingClientRect().top : -1
    })

    // Scroll a bit more -- sticky viewport should stay near top
    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(500)

    const topAfter = await page.evaluate(() => {
      const el = document.querySelector('#narrative > div > div')
      return el ? el.getBoundingClientRect().top : -1
    })

    // If perfectly sticky, it should remain exactly at 0
    expect(Math.abs(topBefore)).toBeLessThan(50)
    expect(Math.abs(topAfter)).toBeLessThan(50)
  })
})
