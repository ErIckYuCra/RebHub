import type { Page } from '@playwright/test'
import { AUTH_SELECTORS } from '../selectors/auth.selectors'
import type { TestUser } from '../fixtures/users'

export async function login(page: Page, user: TestUser) {
  await page.goto('/login')
  await page.waitForSelector(AUTH_SELECTORS.emailInput)
  await page.fill(AUTH_SELECTORS.emailInput, user.email)
  await page.fill(AUTH_SELECTORS.passwordInput, user.password)
  await page.click(AUTH_SELECTORS.submitButton)
}

export async function logout(page: Page) {
  const { NAV_SELECTORS } = await import('../selectors/auth.selectors')
  await page.click(NAV_SELECTORS.logoutButton)
}
