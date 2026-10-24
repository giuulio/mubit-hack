// Day and night: the viewer's choice is remembered in this browser; without one, the system setting decides.
export type Theme = 'light' | 'dark'

const KEY = 'hone-theme'

export function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage can be unavailable (private windows); the system setting still applies.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Not remembered, but still applied for this visit.
  }
}
