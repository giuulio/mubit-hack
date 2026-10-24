// Shared definitions for the views: lesson routes, project pages and their URLs, configuration labels, number formats.
import type { Route } from './api'

export const routeColor: Record<Route, string> = { A: 'var(--blue)', 'A∧B': 'var(--purple)', B: 'var(--cranberry)', note: 'var(--gray-80)', rephrase: 'var(--orange)' }

// Text colour classes for titles that belong to a route (styles.css, "Route inks").
export const routeInk: Partial<Record<Route, string>> = { A: 'ink-a', 'A∧B': 'ink-ab', B: 'ink-b' }

// Where a lesson ends up (ARCHITECTURE.md, "Routing rules").
export const routeInfo: Record<Route, { title: string; text: string }> = {
  A: { title: 'Context or code', text: 'Instant and editable. Parameters run in code.' },
  'A∧B': { title: 'Context and weights', text: 'Cheap and stable: trained, and kept in the prompt.' },
  B: { title: 'Weights', text: 'Costly to state: trained, then dropped from the prompt.' },
  note: { title: 'Notes', text: 'One concept only.' },
  rephrase: { title: 'Rephrase', text: 'No effect in context, so nothing to train.' },
}

// A project's pages follow the architecture: input, routing to context and weights, results.
export const pages = [
  { id: 'input', title: 'Input', text: 'Feedback becomes lessons.' },
  { id: 'routing', title: 'Routing', text: 'Each lesson goes to context (A), weights (B) or both.' },
  { id: 'results', title: 'Results', text: 'Same concepts, every configuration.' },
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

export type Described = { title: string; sub: string; model: string; route?: Route }

export function describe(config: string, model?: string): Described {
  const labels: Record<string, [string, string, string, Route?]> = {
    frontier: ['Raw frontier', 'no context', FRONTIER],
    'frontier + full context': ['Frontier + context', 'all lessons', FRONTIER],
    'provider + routed context': ['A · context', 'routed context', model ?? '', 'A'],
    adapter: ['B · weights', 'fine-tuned', 'Mubit adapter', 'B'],
    'adapter + routed context': ['A + B', 'fine-tuned + routed context', 'Mubit adapter', 'A∧B'],
  }
  const [title, sub, fallback, route] = labels[config] ?? [config, '', '']
  return { title, sub, model: model && model !== 'adapter' ? model : fallback, route }
}

export const fmt = (n: number) => n.toLocaleString('en-GB')

// Tokens a day, compact: 6,560,000 → "6.6M".
export const perDay = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : `${n}`)
