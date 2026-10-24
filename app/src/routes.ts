// Shared definitions for the views: lesson routes, project pages and their URLs, configuration labels, number formats.
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

// A project's pages follow the architecture: input, routing to context and weights, results.
export const pages = [
  { id: 'input', title: 'Input', text: 'Feedback on outputs becomes atomic lessons.' },
  { id: 'routing', title: 'Routing', text: 'Hone updates the context (A) at once; Mubit trains the weights (B) from calls made under it.' },
  { id: 'results', title: 'Results', text: 'The same concepts through raw models, context only, weights only and both.' },
] as const
export type Page = (typeof pages)[number]['id']

// Where the interface is, kept in the URL hash (#/project/page/lesson) so a refresh stays put.
export type Place = { project: string | null; page: Page; lesson: string | null }

export function readPlace(): Place {
  const [project = '', page = '', lesson = ''] = window.location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent)
  return { project: project || null, page: pages.some((p) => p.id === page) ? (page as Page) : 'input', lesson: lesson || null }
}

export function go(project: string | null, page: Page = 'input', lesson: string | null = null) {
  window.location.hash = project ? `/${[project, page, lesson].filter(Boolean).map((s) => encodeURIComponent(s as string)).join('/')}` : '/'
}

// Configurations in the whiteboard's terms: raw frontier, frontier with context, A only, B only, A and B.
const FRONTIER = 'claude-opus-5-5' // pipeline.FRONTIER, for evaluations recorded before rows carried their model

export function describe(config: string, model?: string): { title: string; sub: string; model: string } {
  const labels: Record<string, [string, string, string]> = {
    frontier: ['Raw frontier', 'no context', FRONTIER],
    'frontier + full context': ['Frontier + context', 'every lesson in the prompt', FRONTIER],
    'provider + routed context': ['A · context', 'routed context, no fine-tuning', model ?? ''],
    adapter: ['B · weights', 'fine-tuned adapter, no context', 'Mubit adapter'],
    'adapter + routed context': ['A + B', 'fine-tuned adapter, routed context', 'Mubit adapter'],
  }
  const [title, sub, fallback] = labels[config] ?? [config, '', '']
  return { title, sub, model: model && model !== 'adapter' ? model : fallback }
}

export const fmt = (n: number) => n.toLocaleString('en-GB')

// Tokens a day, compact: 6,560,000 → "6.6M".
export const perDay = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : `${n}`)
