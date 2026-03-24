import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('reduced motion - CSS kills animations (A11Y-01)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Inject a test element with CSS animation to verify the override
    const duration = await page.evaluate(() => {
      const el = document.createElement('div')
      el.style.animation = 'spin 2s linear infinite'
      document.body.appendChild(el)
      const computed = getComputedStyle(el).animationDuration
      document.body.removeChild(el)
      return computed
    })

    // Browsers may format 0.01ms as "0.01ms" or scientific notation "1e-05s"
    // Parse to number and compare: 0.01ms = 0.00001s
    const ms = duration.endsWith('ms')
      ? parseFloat(duration)
      : parseFloat(duration) * 1000
    expect(ms).toBeLessThanOrEqual(0.01)
  })

  test('keyboard navigation (A11Y-02)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Tab to first focusable element (skip link)
    await page.keyboard.press('Tab')

    // Skip link should become visible when focused
    const firstSkipLink = page.locator('.skip-link').first()
    await expect(firstSkipLink).toBeFocused()

    const topValue = await firstSkipLink.evaluate((el) =>
      getComputedStyle(el).top
    )
    // When focused, skip-link should have top: 16px (not -100%)
    expect(parseInt(topValue, 10)).toBeGreaterThanOrEqual(0)

    // Tab to second skip link
    await page.keyboard.press('Tab')
    const secondSkipLink = page.locator('.skip-link').nth(1)
    await expect(secondSkipLink).toBeFocused()
  })

  test('ARIA landmarks (A11Y-03)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // surface has role="banner"
    const surface = page.locator('section#surface')
    await expect(surface).toHaveAttribute('role', 'banner')

    // contact has role="contentinfo"
    const contact = page.locator('section#contact')
    await expect(contact).toHaveAttribute('role', 'contentinfo')

    // Narrative section has label
    const narrativeSection = page.locator('section#narrative')
    const narrativeLabel = await narrativeSection.getAttribute('aria-label')
    expect(narrativeLabel).toBeTruthy()

    // Transition sections have role="presentation"
    for (const id of ['transition-1']) {
      const section = page.locator(`section#${id}`)
      await expect(section).toHaveAttribute('role', 'presentation')
    }

    // Non-transition sections have visually-hidden h2 headings
    const nonTransitionIds = [
      'surface',
      'narrative',
      'projects',
      'contact',
    ]
    for (const id of nonTransitionIds) {
      const heading = page.locator(`section#${id} h2.visually-hidden`)
      await expect(heading).toBeAttached()
    }
  })

  test('skip links (A11Y-04)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Tab to first skip link ("Skip to projects")
    await page.keyboard.press('Tab')
    const firstLink = page.locator('.skip-link').first()
    await expect(firstLink).toBeFocused()
    await expect(firstLink).toHaveText('Skip to projects')

    // Activate the skip link
    await page.keyboard.press('Enter')

    // Focus should now be on #projects section
    const focusedId = await page.evaluate(() => document.activeElement?.id)
    expect(focusedId).toBe('projects')

    // Test second skip link: focus it directly via click, then activate
    const secondLink = page.locator('.skip-link').nth(1)
    await secondLink.focus()
    await expect(secondLink).toBeFocused()
    await expect(secondLink).toHaveText('Skip to contact')

    // Activate the skip link
    await page.keyboard.press('Enter')

    const focusedId2 = await page.evaluate(() => document.activeElement?.id)
    expect(focusedId2).toBe('contact')
  })

  test('contrast meets WCAG AA (A11Y-05)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Helper to calculate relative luminance
    const contrastData = await page.evaluate(() => {
      function luminance(r: number, g: number, b: number): number {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          const s = c / 255
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
      }

      function parseRgb(color: string): [number, number, number] {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        if (!match) return [0, 0, 0]
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
      }

      function contrastRatio(
        c1: [number, number, number],
        c2: [number, number, number]
      ): number {
        const l1 = luminance(...c1)
        const l2 = luminance(...c2)
        const lighter = Math.max(l1, l2)
        const darker = Math.min(l1, l2)
        return (lighter + 0.05) / (darker + 0.05)
      }

      const bodyStyle = getComputedStyle(document.body)
      const bgRgb = parseRgb(bodyStyle.backgroundColor)
      const textRgb = parseRgb(bodyStyle.color)
      const textContrast = contrastRatio(bgRgb, textRgb)

      // Get accent color from CSS custom property
      const accentHex =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-accent')
          .trim() || '#C4964A'
      // Parse hex to RGB
      const accentR = parseInt(accentHex.slice(1, 3), 16)
      const accentG = parseInt(accentHex.slice(3, 5), 16)
      const accentB = parseInt(accentHex.slice(5, 7), 16)
      const accentRgb: [number, number, number] = [accentR, accentG, accentB]
      const accentContrast = contrastRatio(bgRgb, accentRgb)

      return { textContrast, accentContrast }
    })

    // White on dark: should be well above 4.5:1
    expect(contrastData.textContrast).toBeGreaterThanOrEqual(4.5)

    // Amber on dark: should be at least 4.5:1 (expected ~7.36:1)
    expect(contrastData.accentContrast).toBeGreaterThanOrEqual(4.5)
  })

  test('focus styles (A11Y-06)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Tab to a skip link to trigger focus
    await page.keyboard.press('Tab')

    const skipLink = page.locator('.skip-link').first()
    await expect(skipLink).toBeFocused()

    const outlineStyle = await skipLink.evaluate((el) => {
      const style = getComputedStyle(el)
      return {
        outlineStyle: style.outlineStyle,
        outlineColor: style.outlineColor,
        outlineWidth: style.outlineWidth,
      }
    })

    // Outline should be visible (not "none")
    expect(outlineStyle.outlineStyle).not.toBe('none')

    // Outline color should be gold: rgba(202, 138, 4, 0.6)
    // The browser usually computes rgba exactly as provided
    expect(outlineStyle.outlineColor).toBe('rgba(202, 138, 4, 0.6)')

    // Outline width should be 2px
    expect(outlineStyle.outlineWidth).toBe('2px')
  })
})
