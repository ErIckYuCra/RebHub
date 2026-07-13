export const AUTH_SELECTORS = {
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  submitButton: 'button[type="submit"]',
  loginTab: 'button:has-text("Iniciar sesión")',
  errorMessage: 'p.text-destructive',
  brandLogo: 'text=ReadHub',
} as const

export const NAV_SELECTORS = {
  navbar: 'header',
  homeLink: 'a[href="/home"]',
  chatLink: 'a[href="/chat"]',
  uploadLink: 'a[href="/upload"]',
  logoutButton: 'button[title="Cerrar sesión"]',
  userLabel: 'span.text-muted-foreground',
} as const

export const HOME_SELECTORS = {
  heading: 'h1:has-text("Artículos recientes")',
} as const
