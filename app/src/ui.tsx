// Shared UI pieces. Interface icons come from reicon-react behind `Icon`, so they can be swapped for our own.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowDown, ArrowRight, ArrowUp, ChartBar, Check, ChevronDown, ChevronRight, Code, Copy, Cpu, Eye, Folder, Home, Layers, Message, Plus,
  Refresh, Route as RouteIcon, Scale, Send, Settings, Sparkles, ThumbsUp, X,
} from 'reicon-react'
import type { Route } from './api'
import { routeColor, routeInfo, routeInk, routeOn } from './routes'

const icons = {
  generate: Sparkles, send: Send, approve: ThumbsUp, critique: Message, pick: Scale, check: Check, close: X,
  train: Cpu, chart: ChartBar, copy: Copy, project: Folder, plus: Plus, layers: Layers, loading: Refresh, home: Home,
  expand: ChevronDown, next: ChevronRight, route: RouteIcon, operator: Settings, prompt: Code, eye: Eye,
  right: ArrowRight, down: ArrowDown, up: ArrowUp,
}
export type IconName = keyof typeof icons

export function Icon({ name, size = 16, spin = false }: { name: IconName; size?: number; spin?: boolean }) {
  const Glyph = icons[name]
  return <Glyph size={size} className={spin ? 'spin' : undefined} />
}

export function Glyph({ svg, size = '', title }: { svg: string | null; size?: '' | 'small' | 'large'; title?: string }) {
  if (!svg) return <div className={`glyph empty-glyph ${size}`} title={title} />
  // An <img> data URI never runs scripts, so model-written SVG is safe to show.
  return <img className={`glyph ${size}`} alt={title ?? ''} title={title} src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} />
}

// A route in plain words, in its colour; the tooltip says what the destination means.
export function RouteBadge({ route, large = false, tip }: { route: Route | null; large?: boolean; tip?: string }) {
  if (!route) return <span className="chip">…</span>
  return <span className={`badge${large ? ' large' : ''}`} data-tip={tip ?? routeInfo[route].tip} style={{ background: routeColor[route], color: routeOn[route] }}>{routeInfo[route].title}</span>
}

// A small coloured dot standing for a route, for dense lists.
export function Dot({ route }: { route: Route | null }) {
  return <i className="dot" style={{ background: route ? routeColor[route] : 'var(--text-3)' }} />
}

// A card's title with actions on the right. What the card means lives in a tooltip on the title, not in a subtitle.
export function Head({ title, tip, route, children }: { title: ReactNode; tip?: string; route?: Route; children?: ReactNode }) {
  return (
    <div className="head">
      <h2 className={`grow ${route ? routeInk[route] ?? '' : ''}`}><span data-tip={tip}>{title}</span></h2>
      {children}
    </div>
  )
}

export function Button({ children, onClick, kind = 'light', busy = false, disabled = false, small = false, tip }: {
  children: ReactNode; onClick?: () => void; kind?: 'primary' | 'light'; busy?: boolean; disabled?: boolean; small?: boolean; tip?: string
}) {
  return (
    <button className={`btn ${kind}${small ? ' small' : ''}`} onClick={onClick} disabled={busy || disabled} data-tip={tip} aria-label={tip}>
      {busy ? <Icon name="loading" spin /> : null}
      {children}
    </button>
  )
}

export function Stat({ label, value, sub, tip }: { label: string; value: ReactNode; sub?: ReactNode; tip?: string }) {
  return (
    <div className="stat">
      <span className="faint" data-tip={tip}>{label}</span>
      <b>{value}</b>
      {sub ? <span className="faint">{sub}</span> : null}
    </div>
  )
}

// A collapsible section, used inside the operator drawer.
export function Fold({ title, aside, open = false, children }: { title: ReactNode; aside?: ReactNode; open?: boolean; children: ReactNode }) {
  return (
    <details className="fold" open={open}>
      <summary className="row">
        <h3 className="grow">{title}</h3>
        {aside}
        <span className="chevron"><Icon name="expand" /></span>
      </summary>
      <div className="stack" style={{ marginTop: '0.75rem' }}>{children}</div>
    </details>
  )
}

// A number that counts to its new value, so a change in tokens or calls reads as movement.
export function Count({ value, format = (n) => n.toLocaleString('en-GB') }: { value: number; format?: (n: number) => string }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = from.current
    if (start === value) return
    const began = performance.now()
    let frame = 0
    const step = (now: number) => {
      const k = Math.min((now - began) / 700, 1)
      const eased = 1 - (1 - k) ** 3
      setShown(Math.round(start + (value - start) * eased))
      if (k < 1) frame = requestAnimationFrame(step)
      else from.current = value
    }
    frame = requestAnimationFrame(step)
    return () => { cancelAnimationFrame(frame); from.current = value }
  }, [value])
  return <>{format(shown)}</>
}
