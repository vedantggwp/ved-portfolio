import { test, expect, type Page } from '@playwright/test'

/** Scroll a section into view by its ID. */
async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await page.evaluate((id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, sectionId)
  await page.waitForTimeout(500)
}

test.describe('Phase 7: Deep Layer + Floor', () => {
  test('projects section contains project cards (DEEP-01)', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // Scroll to projects to trigger LazySection mount
    await scrollToSection(page, 'projects')

    const section = page.locator('section#projects')
    await expect(section).toBeAttached()

    // Should have 4 project cards
    const cards = section.locator('[data-project-card]')
    await expect(cards.first()).toBeAttached({ timeout: 5000 })
    const count = await cards.count()
    expect(count).toBe(4)
  })

  test('project cards have frame, title, description (DEEP-02)', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    await scrollToSection(page, 'projects')

    // Check NeuroEdge card
    const neuroedge = page.locator('[data-project-card="neuroedge"]')
    await expect(neuroedge).toBeAttached({ timeout: 5000 })

    const frame = neuroedge.locator('[data-project-frame]')
    await expect(frame).toContainText('invisible')

    const title = neuroedge.locator('[data-project-title]')
    await expect(title).toContainText('NeuroEdge')

    const desc = neuroedge.locator('[data-project-description]')
    await expect(desc).toContainText('neuromarketing')
  })

  test('all four projects are showcased (DEEP-04)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    await scrollToSection(page, 'projects')
    await page.waitForTimeout(500)

    for (const id of [
      'neuroedge',
      'springpod-simulator',
      'fraudshield',
      'scrollwise',
    ]) {
      const card = page.locator(`[data-project-card="${id}"]`)
      await expect(card).toBeAttached({ timeout: 5000 })
    }
  })

  test('floor section displays contact message (FLOR-01)', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // Scroll to contact section
    await scrollToSection(page, 'contact')

    const floor = page.locator('[data-floor-section]')
    await expect(floor).toBeAttached({ timeout: 5000 })

    const headline = page.locator('[data-floor-headline]')
    await expect(headline).toContainText("gone deep")
  })

  test('floor has contact links (FLOR-02)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    await scrollToSection(page, 'contact')

    const email = page.locator('[data-floor-link="email"]')
    await expect(email).toBeAttached({ timeout: 5000 })

    const github = page.locator('[data-floor-link="github"]')
    await expect(github).toBeAttached()

    const linkedin = page.locator('[data-floor-link="linkedin"]')
    await expect(linkedin).toBeAttached()
  })

  test('reduced motion shows projects statically', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    await scrollToSection(page, 'projects')

    const card = page.locator('[data-project-card="neuroedge"]')
    await expect(card).toBeAttached({ timeout: 5000 })

    const opacity = await card.evaluate(
      (el) => getComputedStyle(el).opacity
    )
    expect(parseFloat(opacity)).toBe(1)
  })
})
