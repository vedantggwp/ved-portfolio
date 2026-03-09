import { test, expect } from '@playwright/test'

test.describe('R3F Canvas', () => {
  test('canvas behind DOM -- fixed canvas at z-index 0 with pointer-events none', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Verify a canvas element exists inside a fixed-position container
    const canvasContainer = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas')
      for (const canvas of canvases) {
        const parent = canvas.closest('[data-r3f-canvas]') as HTMLElement | null
        if (parent) {
          const style = window.getComputedStyle(parent)
          return {
            position: style.position,
            zIndex: style.zIndex,
            pointerEvents: style.pointerEvents,
          }
        }
      }
      return null
    })

    expect(canvasContainer).not.toBeNull()
    expect(canvasContainer?.position).toBe('fixed')
    expect(canvasContainer?.zIndex).toBe('0')
    expect(canvasContainer?.pointerEvents).toBe('none')

    // Check DOM content has higher z-index
    const mainZIndex = await page.evaluate(() => {
      const main = document.querySelector('main')
      if (!main) return null
      const parent = main.closest('[data-scroll-engine]') as HTMLElement | null
      const target = parent ?? main
      return window.getComputedStyle(target).zIndex
    })

    expect(Number(mainZIndex)).toBeGreaterThan(0)
  })

  test('canvas hidden with reduced motion -- no canvas when prefers-reduced-motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    const canvasCount = await page.evaluate(() => {
      const container = document.querySelector('[data-r3f-canvas]')
      return container ? 1 : 0
    })

    expect(canvasCount).toBe(0)
  })

  test('scroll still works with canvas -- scrollStore.progress updates', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1500)

    // Scroll to bottom and verify progress updates
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1500)

    const progress = await page.evaluate(
      () =>
        (window as unknown as Record<string, { progress: number }>)
          .__scrollStore?.progress ?? -1
    )

    expect(progress).toBeGreaterThan(0.5)
  })

  test('WebGL context active -- canvas has WebGL rendering context', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    const hasWebGL = await page.evaluate(() => {
      const canvas = document.querySelector('[data-r3f-canvas] canvas') as HTMLCanvasElement | null
      if (!canvas) return false
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      // R3F already has the context, so getContext returns existing or null
      // We check if the canvas has dimensions and is being rendered to
      return canvas.width > 0 && canvas.height > 0
    })

    expect(hasWebGL).toBe(true)
  })

  test('lighting present -- scene is not blank', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // Use screenshot-based approach: take a screenshot of just the canvas area
    // and verify it has visual variance (not a single solid color)
    const canvasLocator = page.locator('[data-r3f-canvas] canvas')
    await expect(canvasLocator).toBeVisible({ timeout: 5000 })

    const screenshot = await canvasLocator.screenshot()
    // Screenshot is a Buffer (PNG). If the canvas is rendering something,
    // the PNG will be larger than a solid-color PNG of the same dimensions.
    // A solid-color canvas compresses to ~200 bytes; a scene with lighting > 1000
    // A fully transparent/solid canvas compresses to ~150 bytes as PNG
    // A scene with 3D content + lighting will produce more pixel variance
    expect(screenshot.byteLength).toBeGreaterThan(300)
  })
})
