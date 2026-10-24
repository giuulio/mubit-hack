// Routes in the interface's words, and number formatting shared by the views.
import type { Route } from './api'

export const routeColor: Record<Route, string> = { A: 'var(--blue)', 'A∧B': 'var(--purple)', B: 'var(--cranberry)', note: 'var(--gray-80)', rephrase: 'var(--orange)' }

// Where a lesson ends up (ARCHITECTURE.md, "Routing rules").
export const routeInfo: Record<Route, { title: string; text: string }> = {
  A: { title: 'Context or code', text: 'Parameters code applies at zero tokens, and lessons marked for now: instant and editable.' },
  'A∧B': { title: 'Context and weights', text: 'Stable, effective and cheap to state: trained into the adapter and kept in the prompt.' },
  B: { title: 'Weights', text: 'Stable but costly to state, like example icons: trained into the adapter, then retired from the prompt.' },
  note: { title: 'Notes', text: 'One concept only: sent only when that concept is drawn.' },
  rephrase: { title: 'Rephrase', text: 'Changed fewer than half the probes in context, so the weights have nothing correct to learn yet.' },
}

export const fmt = (n: number) => n.toLocaleString('en-GB')

// Tokens a day, compact: 6,560,000 → "6.6M".
export const perDay = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : `${n}`)
