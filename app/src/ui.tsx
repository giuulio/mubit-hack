// Shared UI pieces. Interface icons come from reicon-react behind `Icon`, so they can be swapped for our own.
import type { ReactNode } from 'react'
import {
  ChartBar, Check, ChevronDown, Copy, Cpu, Folder, Home, Layers, Message, Plus, Refresh, Scale, Send, Sparkles, ThumbsUp, X,
} from 'reicon-react'
import type { Route } from './api'
import { routeColor } from './routes'

const icons = {
  generate: Sparkles, send: Send, approve: ThumbsUp, critique: Message, pick: Scale, check: Check, close: X,
  train: Cpu, chart: ChartBar, copy: Copy, project: Folder, plus: Plus, layers: Layers, loading: Refresh, home: Home,
  expand: ChevronDown,
}

export function Icon({ name, size = 16, spin = false }: { name: keyof typeof icons; size?: number; spin?: boolean }) {
  const Glyph = icons[name]
  return <Glyph size={size} className={spin ? 'spin' : undefined} />
}

export function Glyph({ svg, size = '', title }: { svg: string | null; size?: '' | 'small' | 'large'; title?: string }) {
  if (!svg) return <div className={`glyph empty-glyph ${size}`} title={title} />
  // An <img> data URI never runs scripts, so model-written SVG is safe to show.
  return <img className={`glyph ${size}`} alt={title ?? ''} title={title} src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} />
}

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

// A collapsible card for workflow forms that the story does not need on screen by default.
export function Fold({ title, aside, children }: { title: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <details className="card fold">
      <summary className="row">
        <span className="grow row">{title}</span>
        {aside}
        <span className="chevron"><Icon name="expand" /></span>
      </summary>
      <div className="stack" style={{ marginTop: '1rem' }}>{children}</div>
    </details>
  )
}
