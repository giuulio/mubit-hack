// Shared definitions for the views: lesson routes, project pages and their URLs, configuration labels, number formats.
import type { Route } from './api'

// Route colours come from mubit.ai's palette, made more vivid (styles.css, "Route colours").
export const routeColor: Record<Route, string> = { A: 'var(--context)', 'A∧B': 'var(--both)', B: 'var(--weights)', note: 'var(--gray-80)', rephrase: 'var(--rephrase)' }

// Text on a route's colour: dark on amber, white on the rest.
export const routeOn: Record<Route, string> = { A: '#fff', 'A∧B': 'rgb(21, 21, 21)', B: '#fff', note: '#fff', rephrase: '#fff' }

// Text colour classes for titles that belong to a route (styles.css, "Route inks").
export const routeInk: Partial<Record<Route, string>> = { A: 'ink-context', 'A∧B': 'ink-both', B: 'ink-weights' }

// Where a lesson ends up, in plain words (ARCHITECTURE.md, "Routing rules"); the API keeps the whiteboard's letters.
export const routeInfo: Record<Route, { title: string; tip: string }> = {
  A: { title: 'Context', tip: 'Instant and editable; parameters run in code' },
  'A∧B': { title: 'Both', tip: 'Cheap and stable: in the prompt now, trained into the weights' },
  B: { title: 'Weights', tip: 'Costly to state: trained, then dropped from the prompt' },
  note: { title: 'Note', tip: 'One concept only' },
  rephrase: { title: 'Rephrase', tip: 'No effect in context, so nothing to train' },
}

// Where a routed lesson lands on the Loop page: the Context card, the Weights card, or both.
export const destinations: Record<Route, ('context' | 'weights')[]> = { A: ['context'], 'A∧B': ['context', 'weights'], B: ['weights'], note: ['context'], rephrase: [] }

// A project has two pages: the loop where feedback is routed, and the results that compare configurations.
export const pages = [
  { id: 'loop', title: 'Loop', icon: 'route' },
  { id: 'results', title: 'Results', icon: 'chart' },
] as const
export type Page = (typeof pages)[number]['id']

// Where the interface is, kept in the URL hash (#/project/page/lesson) so a refresh stays put.
export type Place = { project: string | null; page: Page; lesson: string | null }

export function readPlace(): Place {
  const [project = '', page = '', lesson = ''] = window.location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent)
  return { project: project || null, page: pages.some((p) => p.id === page) ? (page as Page) : 'loop', lesson: lesson || null }
}

export function go(project: string | null, page: Page = 'loop', lesson: string | null = null) {
  window.location.hash = project ? `/${[project, page, lesson].filter(Boolean).map((s) => encodeURIComponent(s as string)).join('/')}` : '/'
}

// Configurations, named by what changes between them: the raw model, every lesson in the prompt, the routed context,
// the fine-tuned adapter.
const FRONTIER = 'claude-opus-5-5' // pipeline.FRONTIER, for evaluations recorded before rows carried their model

export type Described = { title: string; sub: string; model: string; route?: Route }

export function describe(config: string, model?: string): Described {
  const labels: Record<string, [string, string, string, Route?]> = {
    frontier: ['Raw model', 'no lessons', FRONTIER],
    'frontier + full context': ['All lessons', 'every lesson in the prompt', FRONTIER],
    'provider + routed context': ['Routed', 'routed context', model ?? '', 'A'],
    adapter: ['Adapter', 'fine-tuned, no prompt', 'Mubit adapter', 'B'],
    'adapter + routed context': ['Adapter + context', 'fine-tuned + routed context', 'Mubit adapter', 'A∧B'],
  }
  const [title, sub, fallback, route] = labels[config] ?? [config, '', '']
  return { title, sub, model: model && model !== 'adapter' ? model : fallback, route }
}

export const fmt = (n: number) => n.toLocaleString('en-GB')

// Tokens a day, compact: 6,560,000 → "6.6M".
export const perDay = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : `${n}`)

// Clock time from an API timestamp: "2026-10-24T19:12:01+0100" → "19:12".
export const clock = (t: string | undefined) => (t ? t.slice(11, 16) : '—')
