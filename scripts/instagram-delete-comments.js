/**
 * Instagram comment batch-deletion console script.
 *
 * WARNING: Runs on instagram.com only. Paste into the browser DevTools console
 * while on the Instagram comments activity page — not inside PARABLE.
 *
 * @see src/lib/tools/instagram-comment-deletion.ts
 * @see src/app/tools/instagram-comment-cleaner/page.tsx
 */
;(async function () {
  const DELETION_BATCH_SIZE = 3
  const DELAY_BETWEEN_ACTIONS_MS = 1000
  const DELAY_BETWEEN_CHECKBOX_CLICKS_MS = 300
  const MAX_RETRIES = 60

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const waitForElement = async (selector, timeout = 30000) => {
    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector)
      if (element) return element
      await delay(100)
    }
    throw new Error(`Element with selector "${selector}" not found within ${timeout}ms`)
  }

  const clickElement = async (element) => {
    if (!element) throw new Error('Element not found')
    element.click()
  }

  const waitForSelectButton = async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const buttonCount = document.querySelectorAll('[role="button"]')?.length
      if (buttonCount > 1) return
      await delay(1000)
    }
    throw new Error('Select button not found after maximum retries')
  }

  const deleteSelectedComments = async () => {
    try {
      const deleteButton = await waitForElement('[aria-label="Delete"]')
      await clickElement(deleteButton)
      await delay(DELAY_BETWEEN_ACTIONS_MS)
      const confirmButton = await waitForElement('button[tabindex="0"]')
      await clickElement(confirmButton)
    } catch (error) {
      console.error('Error during comment deletion:', error.message)
    }
  }

  const deleteActivity = async () => {
    try {
      while (true) {
        const [, selectButton] = document.querySelectorAll('[role="button"]')
        if (!selectButton) throw new Error('Select button not found')

        await clickElement(selectButton)
        await delay(DELAY_BETWEEN_ACTIONS_MS)

        const checkboxes = document.querySelectorAll('[aria-label="Toggle checkbox"]')
        if (checkboxes.length === 0) {
          console.log('No more comments to delete')
          break
        }

        for (let i = 0; i < Math.min(DELETION_BATCH_SIZE, checkboxes.length); i++) {
          await clickElement(checkboxes[i])
          await delay(DELAY_BETWEEN_CHECKBOX_CLICKS_MS)
        }

        await delay(DELAY_BETWEEN_ACTIONS_MS)
        await deleteSelectedComments()
        await delay(DELAY_BETWEEN_ACTIONS_MS)
        await waitForSelectButton()
        await delay(DELAY_BETWEEN_ACTIONS_MS)
      }
    } catch (error) {
      console.error('Error in deleteActivity:', error.message)
    }
  }

  try {
    await deleteActivity()
    console.log('Activity deletion completed')
  } catch (error) {
    console.error('Fatal error:', error.message)
  }
})()
