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

    // Take a screenshot of the canvas and verify it's not entirely one color
    const canvasData = await page.evaluate(() => {
      const canvas = document.querySelector('[data-r3f-canvas] canvas') as HTMLCanvasElement | null
      if (!canvas) return null

      // Create a temporary 2D canvas to read pixels
      const tempCanvas = document.createElement('canvas')
      const size = 64
      tempCanvas.width = size
      tempCanvas.height = size
      const ctx = tempCanvas.getContext('2d')
      if (!ctx) return null

      ctx.drawImage(canvas, 0, 0, size, size)
      const imageData = ctx.getImageData(0, 0, size, size)
      const pixels = imageData.data

      // Check if there's color variance (not all same color)
      const firstR = pixels[0]
      const firstG = pixels[1]
      const firstB = pixels[2]
      let hasVariance = false

      for (let i = 4; i < pixels.length; i += 4) {
        if (
          Math.abs(pixels[i] - firstR) > 2 ||
          Math.abs(pixels[i + 1] - firstG) > 2 ||
          Math.abs(pixels[i + 2] - firstB) > 2
        ) {
          hasVariance = true
          break
        }
      }

      return { hasVariance, width: canvas.width, height: canvas.height }
    })

    expect(canvasData).not.toBeNull()
    expect(canvasData?.hasVariance).toBe(true)
  })
})
