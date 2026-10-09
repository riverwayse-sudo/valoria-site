const { test, expect } = require('@playwright/test')
const AxeBuilder = require('@axe-core/playwright').default

test('homepage exposes an operable Valoria support assistant', async ({ page }) => {
  const runtimeErrors = []
  page.on('pageerror', error => runtimeErrors.push(error.message))

  await page.goto('/')
  const launcher = page.getByRole('button', { name: 'Chat with Valoria' })
  await expect(launcher).toBeVisible()
  await launcher.click()

  await expect(page.getByText(/Welcome to Valoria Institute/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ask Valoria' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Report an issue' })).toBeVisible()
  expect(runtimeErrors).toEqual([])
})

test('support assistant surface has no serious or critical automated accessibility violations', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Chat with Valoria' }).click()
  await expect(page.getByText(/Welcome to Valoria Institute/)).toBeVisible()

  const results = await new AxeBuilder({ page })
    .include('#valoria-support-assistant')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  const blocking = results.violations.filter(issue => ['serious', 'critical'].includes(issue.impact))
  expect(blocking, blocking.map(issue => `${issue.id}: ${issue.help}`).join('\n')).toEqual([])
})

test('support APIs reject invalid requests without attempting email delivery', async ({ request }) => {
  const chat = await request.post('/api/support/chat', { data: { messages: [] } })
  expect(chat.status()).toBe(400)

  const report = await request.post('/api/support/report', {
    data: { category: 'website', summary: '', details: '', email: '' },
  })
  expect(report.status()).toBe(400)
})

test('support assistant closes with Escape and restores launcher focus', async ({ page }) => {
  await page.goto('/')
  const launcher = page.getByRole('button', { name: 'Chat with Valoria' })
  await launcher.click()
  await expect(page.getByText(/Welcome to Valoria Institute/)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('region', { name: 'Valoria website assistant' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Chat with Valoria' })).toBeFocused()
})

test('guided VALU answers work without an external AI credential', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Chat with Valoria' }).click()
  await page.getByLabel('Your message').fill('How does VALU work?')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText(/15-question Snapshot/)).toBeVisible()
})
