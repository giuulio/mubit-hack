// What every call rents in context, split by route, and what is left once the adapter owns the B lessons.
import type { Lesson, Project } from './api'
import { Line } from './charts'
import { fmt, perDay, routeColor } from './routes'

const tokens = (lessons: Lesson[]) => lessons.reduce((n, l) => n + (l.signals?.tokens ?? 0), 0)

export function ContextSplit({ project }: { project: Project }) {
  const active = project.lessons.filter((l) => l.status === 'active')
  const total = project.context_history.at(-1)?.tokens ?? 0
  const rules = tokens(active.filter((l) => l.route === 'A' && l.in_context))
  const both = tokens(active.filter((l) => l.route === 'A∧B' && l.in_context))
  const owned = tokens(active.filter((l) => l.route === 'B' && l.in_context))
  const retired = tokens(active.filter((l) => l.route === 'B' && !l.in_context))
  const segments = [
    { label: 'Task prompt', tokens: Math.max(total - rules - both - owned, 0), color: 'var(--gray-50)' },
    { label: 'A rules', tokens: rules, color: routeColor.A },
    { label: 'A∧B rules', tokens: both, color: routeColor['A∧B'] },
    { label: 'B examples', tokens: owned, color: routeColor.B },
  ].filter((s) => s.tokens > 0)
  const after = total - owned
  const params = active.filter((l) => l.expressible_as === 'parameter').length
  const notes = active.filter((l) => l.route === 'note').length

  return (
    <div className="card stack" style={{ gap: '0.875rem' }}>
      <div className="row" style={{ alignItems: 'baseline' }}>
        <h2 className="grow">Every call</h2>
        <span className="display" style={{ fontSize: 'var(--xl)' }}>{fmt(total)}</span>
        <span className="muted">tokens</span>
      </div>
      <div className="split-bar" title={`${fmt(total)} tokens in context`}>
        {segments.map((s) => <div key={s.label} style={{ flexGrow: s.tokens, background: s.color }} />)}
      </div>
      {owned > 0 ? (
        <div className="stack" style={{ gap: '0.375rem' }}>
          <div className="split-bar after" style={{ width: `${(after / total) * 100}%` }}>
            {segments.filter((s) => s.label !== 'B examples').map((s) => <div key={s.label} style={{ flexGrow: s.tokens, background: s.color }} />)}
          </div>
          <span className="faint">
            <b style={{ color: 'var(--text)' }}>{fmt(after)}</b> once the adapter owns B, {Math.round((owned / total) * 100)}% fewer: projected until its absorption test passes
          </span>
        </div>
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
        {owned > 0 ? `, ${perDay(after * project.calls_per_day)} once B is owned` : ''}
        {retired > 0 ? `; ${fmt(retired)} tokens already retired into the adapter` : ''}.
        {' '}{params} parameters live in code at 0 tokens; {notes} notes are sent only with their concept.
      </span>
      {project.context_history.length > 1 ? (
        <div className="stack" style={{ gap: '0.25rem' }}>
          <span className="faint">Tokens per call, lesson by lesson</span>
          <Line values={project.context_history.map((h) => h.tokens)} height={72} />
        </div>
      ) : null}
    </div>
  )
}
