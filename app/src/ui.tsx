// Shared UI pieces. Interface icons come from reicon-react behind `Icon`, so they can be swapped for our own.
import type { ReactNode } from 'react'
import {
  ChartBar, Check, Copy, Cpu, Folder, Home, Layers, Message, Plus, Refresh, Scale, Send, Sparkles, ThumbsUp, X,
} from 'reicon-react'
import type { Route } from './api'

const icons = {
  generate: Sparkles, send: Send, approve: ThumbsUp, critique: Message, pick: Scale, check: Check, close: X,
  train: Cpu, chart: ChartBar, copy: Copy, project: Folder, plus: Plus, layers: Layers, loading: Refresh, home: Home,
}

export function Icon({ name, size = 16, spin = false }: { name: keyof typeof icons; size?: number; spin?: boolean }) {
  const Glyph = icons[name]
  return <Glyph size={size} className={spin ? 'spin' : undefined} />
}

export function Glyph({ svg, size = '' }: { svg: string | null; size?: '' | 'small' | 'large' }) {
  if (!svg) return <div className={`glyph ${size}`} />
  // An <img> data URI never runs scripts, so model-written SVG is safe to show.
  return <img className={`glyph ${size}`} alt="" src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} />
}

const routeColor: Record<Route, string> = { A: 'var(--blue)', 'A∧B': 'var(--purple)', B: 'var(--cranberry)', note: 'var(--gray-80)', rephrase: 'var(--orange)' }

export function RouteBadge({ route }: { route: Route | null }) {
  if (!route) return <span className="chip">…</span>
  return <span className="badge" style={{ background: routeColor[route], color: '#fff' }}>{route}</span>
}

export function Button({ children, onClick, kind = 'light', busy = false, disabled = false, small = false }: {
  children: ReactNode; onClick?: () => void; kind?: 'primary' | 'light' | 'ghost'; busy?: boolean; disabled?: boolean; small?: boolean
}) {
  return (
    <button className={`btn ${kind}${small ? ' small' : ''}`} onClick={onClick} disabled={busy || disabled}>
      {busy ? <Icon name="loading" spin /> : null}
      {children}
    </button>
  )
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="card stat">
      <span className="faint">{label}</span>
      <b>{value}</b>
      {sub ? <span className="faint">{sub}</span> : null}
    </div>
  )
}
