// Shared UI pieces. Interface icons come from reicon-react behind `Icon`, so they can be swapped for our own.
import type { ReactNode } from 'react'
import {
  ChartBar, Check, ChevronDown, ChevronRight, Copy, Cpu, Folder, Home, Layers, Message, Plus, Refresh, Scale, Send, Sparkles, ThumbsUp, X,
} from 'reicon-react'
import type { Route } from './api'
import { routeColor, routeInk } from './routes'

const icons = {
  generate: Sparkles, send: Send, approve: ThumbsUp, critique: Message, pick: Scale, check: Check, close: X,
  train: Cpu, chart: ChartBar, copy: Copy, project: Folder, plus: Plus, layers: Layers, loading: Refresh, home: Home,
  expand: ChevronDown, next: ChevronRight,
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

// A card's title, a one-line subtitle under it, and actions on the right. A route colours the title.
export function Head({ title, sub, route, children }: { title: ReactNode; sub?: ReactNode; route?: Route; children?: ReactNode }) {
  return (
    <div className="head">
      <div className="grow">
        <div className="title">
          {route ? <RouteBadge route={route} /> : null}
          <h2 className={route ? routeInk[route] : undefined}>{title}</h2>
        </div>
        {sub ? <p className="sub">{sub}</p> : null}
      </div>
      {children}
    </div>
  )
}

export function Button({ children, onClick, kind = 'light', busy = false, disabled = false, small = false }: {
  children: ReactNode; onClick?: () => void; kind?: 'primary' | 'light'; busy?: boolean; disabled?: boolean; small?: boolean
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
    <div className="stat">
      <span className="faint">{label}</span>
      <b>{value}</b>
      {sub ? <span className="faint">{sub}</span> : null}
    </div>
  )
}

// A collapsible section for forms the story does not need on screen by default.
export function Fold({ title, sub, aside, plain = false, children }: { title: ReactNode; sub?: ReactNode; aside?: ReactNode; plain?: boolean; children: ReactNode }) {
  return (
    <details className={plain ? 'fold' : 'card fold'}>
      <summary className="head" style={{ alignItems: 'center' }}>
        <div className="grow">
          {plain ? <h3>{title}</h3> : <h2>{title}</h2>}
          {sub ? <p className="sub">{sub}</p> : null}
        </div>
        {aside}
        <span className="chevron"><Icon name="expand" /></span>
      </summary>
      <div className="stack" style={{ marginTop: '1rem' }}>{children}</div>
    </details>
  )
}
