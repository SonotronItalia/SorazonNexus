import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

export const getImplicitPreference = (): Theme | null => {
  const mediaQuery = '(prefers-color-scheme: dark)'
  const mql = window.matchMedia(mediaQuery)
  const hasImplicitPreference = typeof mql.matches === 'boolean'

  if (hasImplicitPreference) {
    return mql.matches ? 'dark' : 'light'
  }

  return null
}

// Il tema vive fuori da React (attributo data-theme su <html> e localStorage):
// i componenti lo leggono con useSyncExternalStore e si aggiornano con questo evento.
const themeChangeEvent = 'sorazon-tema'

export const notifyThemeChange = () => window.dispatchEvent(new Event(themeChangeEvent))

export const subscribeTheme = (callback: () => void) => {
  window.addEventListener(themeChangeEvent, callback)
  return () => window.removeEventListener(themeChangeEvent, callback)
}

// Scelta salvata dal visitatore: 'light', 'dark' oppure 'auto' se non ha scelto
export const getThemePreference = (): string => {
  try {
    return window.localStorage.getItem(themeLocalStorageKey) ?? 'auto'
  } catch {
    return 'auto'
  }
}
