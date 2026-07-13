import { test, expect } from '@playwright/test'
import { TEST_USERS } from './fixtures/users'
import { AUTH_SELECTORS, NAV_SELECTORS, HOME_SELECTORS } from './selectors/auth.selectors'
import { login, logout } from './helpers/auth.helpers'

const user = TEST_USERS.writer

test.describe('Flujo de autenticación — ReadHub', () => {
  test('redirige a /login al acceder a la raíz sin sesión', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('muestra la página de login con formulario de acceso', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator(AUTH_SELECTORS.brandLogo).first()).toBeVisible()
    await expect(page.locator(AUTH_SELECTORS.emailInput)).toBeVisible()
    await expect(page.locator(AUTH_SELECTORS.passwordInput)).toBeVisible()
    await expect(page.locator(AUTH_SELECTORS.submitButton)).toBeVisible()
  })

  test('inicia sesión con credenciales válidas y redirige al dashboard', async ({ page }) => {
    await login(page, user)
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 })
  })

  test('muestra el heading "Artículos recientes" después del login', async ({ page }) => {
    await login(page, user)
    await expect(page.locator(HOME_SELECTORS.heading)).toBeVisible({ timeout: 10000 })
  })

  test('carga la información del usuario en la barra de navegación', async ({ page }) => {
    await login(page, user)
    await page.waitForURL(/\/home/, { timeout: 10000 })
    const userLabel = page.locator(NAV_SELECTORS.userLabel).first()
    await expect(userLabel).toContainText(user.username, { timeout: 8000 })
  })

  test('muestra la navegación principal después del login', async ({ page }) => {
    await login(page, user)
    await page.waitForURL(/\/home/, { timeout: 10000 })
    await expect(page.locator(NAV_SELECTORS.chatLink)).toBeVisible()
    await expect(page.locator(NAV_SELECTORS.uploadLink)).toBeVisible()
    await expect(page.locator(NAV_SELECTORS.logoutButton)).toBeVisible()
  })

  test('cierra sesión y regresa a /login', async ({ page }) => {
    await login(page, user)
    await page.waitForURL(/\/home/, { timeout: 10000 })
    await logout(page)
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.fill(AUTH_SELECTORS.emailInput, 'noexiste@readhub.com')
    await page.fill(AUTH_SELECTORS.passwordInput, 'ClaveInvalida123!')
    await page.click(AUTH_SELECTORS.submitButton)
    await expect(page.locator(AUTH_SELECTORS.errorMessage)).toBeVisible({ timeout: 8000 })
  })

  test('protege /home sin sesión activa — redirige a /login', async ({ page }) => {
    await page.goto('/home')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })
})
