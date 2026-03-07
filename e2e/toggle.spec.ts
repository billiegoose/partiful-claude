import { test } from '@playwright/test'

test('toggle knob position off and on', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 200 })
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #1a1a1a; display: flex; gap: 48px; padding: 40px; align-items: center; }
        label { color: #ccc; font-family: sans-serif; font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .track {
          width: 48px; height: 24px; border-radius: 9999px;
          position: relative; display: block;
          outline: 2px solid red;
        }
        .track-off { background: #3f3f46; }
        .track-on  { background: #8b5cf6; }
        .knob {
          position: absolute; top: 2px;
          width: 20px; height: 20px; border-radius: 50%; background: white;
        }
        .knob-off { left: 2px; }
        .knob-on  { left: 26px; }
      </style>
    </head>
    <body>
      <label>Off<span class="track track-off"><span class="knob knob-off"></span></span></label>
      <label>On<span class="track track-on"><span class="knob knob-on"></span></span></label>
    </body>
    </html>
  `)
  await page.screenshot({ path: 'e2e/screenshots/toggle-states.png' })
})
