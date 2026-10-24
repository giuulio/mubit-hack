// The A panel: Hone keeps the context up to date as lessons are confirmed. What every call rents, split by route; the
// style guide as it stands; and what is left once the adapter owns the B lessons.
import { useEffect, useState } from 'react'
import { api, type Lesson, type Project } from './api'
import { Line } from './charts'
import { fmt, perDay, routeColor } from './routes'
import { Fold, Glyph, RouteBadge } from './ui'

const tokens = (lessons: Lesson[]) => lessons.reduce((n, l) => n + (l.signals?.tokens ?? 0), 0)

export function Context({ project }: { project: Project }) {
  const [message, setMessage] = useState('')
  useEffect(() => {
    api.message(project.id, 'example', 'routed').then((r) => setMessage(r.message)).catch(() => setMessage(''))
  }, [project])

  const active = project.lessons.filter((l) => l.status === 'active')
  const rules = active.filter((l) => l.in_context && (l.route === 'A' || l.route === 'A∧B') && l.expressible_as !== 'parameter')
  const params = active.filter((l) => l.expressible_as === 'parameter' && l.parameter)
  const owned = active.filter((l) => l.route === 'B' && l.in_context)
  const examples = project.examples.filter((e) => owned.some((l) => l.id === e.lesson_id))
  const notes = active.filter((l) => l.route === 'note').length

  const total = project.context_history.at(-1)?.tokens ?? 0
  const ruleTokens = { A: tokens(rules.filter((l) => l.route === 'A')), 'A∧B': tokens(rules.filter((l) => l.route === 'A∧B')) }
  const ownedTokens = tokens(owned)
  const segments = [
    { label: 'Task prompt', tokens: Math.max(total - ruleTokens.A - ruleTokens['A∧B'] - ownedTokens, 0), color: 'var(--gray-50)' },
    { label: 'A rules', tokens: ruleTokens.A, color: routeColor.A },
    { label: 'A∧B rules', tokens: ruleTokens['A∧B'], color: routeColor['A∧B'] },
    { label: 'B examples', tokens: ownedTokens, color: routeColor.B },
  ].filter((s) => s.tokens > 0)
  const after = total - ownedTokens

  return (
    <div className="card stack">
      <div className="row">
        <RouteBadge route="A" />
        <h2 className="grow">Context</h2>
        <span className="faint">updated by Hone on every confirmed lesson</span>
      </div>

      <div className="stack" style={{ gap: '0.625rem' }}>
        <div className="row" style={{ alignItems: 'baseline' }}>
          <h3 className="grow">Every call</h3>
          <span className="display" style={{ fontSize: 'var(--xl)' }}>{fmt(total)}</span>
          <span className="muted">tokens</span>
        </div>
        <div className="split-bar" title={`${fmt(total)} tokens in context`}>
          {segments.map((s) => <div key={s.label} style={{ flexGrow: s.tokens, background: s.color }} />)}
        </div>
        {ownedTokens > 0 ? (
          <>
            <div className="split-bar after" style={{ width: `${(after / total) * 100}%` }}>
              {segments.filter((s) => s.label !== 'B examples').map((s) => <div key={s.label} style={{ flexGrow: s.tokens, background: s.color }} />)}
            </div>
            <span className="faint">
              <b style={{ color: 'var(--text)' }}>{fmt(after)}</b> once the adapter owns B, {Math.round((ownedTokens / total) * 100)}% fewer: projected until its absorption test passes
            </span>
          </>
        ) : null}
        <div className="legend">
          {segments.map((s) => (
            <span key={s.label} className="row" style={{ gap: '0.375rem' }}>
              <i className="swatch" style={{ background: s.color }} />
              <span className="muted">{s.label}</span>
              <span className="faint">{fmt(s.tokens)}</span>
            </span>
          ))}
        </div>
        <span className="faint">
          {perDay(total * project.calls_per_day)} input tokens a day at {fmt(project.calls_per_day)} calls
          {ownedTokens > 0 ? `, ${perDay(after * project.calls_per_day)} once B is owned` : ''}.
        </span>
      </div>

      <div className="stack" style={{ gap: '0.5rem' }}>
        <h3>Style guide, as Hone keeps it</h3>
        <ul className="rules">
          {rules.map((l) => <li key={l.id}><RouteBadge route={l.route} /><span>{l.statement}</span></li>)}
        </ul>
        {examples.length ? (
          <div className="row wrap">
            <RouteBadge route="B" />
            {examples.map((e) => <Glyph key={e.id} svg={e.content} size="small" title={e.concept} />)}
            <span className="faint">example icons, {fmt(ownedTokens)} tokens</span>
          </div>
        ) : null}
        {params.length ? (
          <div className="row wrap">
            <span className="faint">In code, 0 tokens:</span>
            {params.map((l) => <span key={l.id} className="chip">{l.parameter?.name}: {l.parameter?.value}</span>)}
          </div>
        ) : null}
        {notes ? <span className="faint">{notes} notes for single concepts are sent only when that concept is drawn.</span> : null}
      </div>

      {project.context_history.length > 1 ? (
        <div className="stack" style={{ gap: '0.25rem' }}>
          <h3>Tokens per call, lesson by lesson</h3>
          <Line values={project.context_history.map((h) => h.tokens)} width={640} height={64} />
        </div>
      ) : null}

      <Fold plain title={<h3>What the model receives</h3>}>
        <div className="mono" style={{ maxHeight: '24rem', overflow: 'auto' }}>{message}</div>
      </Fold>
    </div>
  )
}
