// The Context block of the rail: what Hone puts in every prompt for this context, updated the moment a lesson is routed.
// Numbers first (tokens per call, split by route, what is left once the weights hold the Weights lessons); the rules
// open on demand, and the full prompt opens in a sheet.
import { useEffect, useState } from 'react'
import { api, type Lesson, type Project } from './api'
import { Spark } from './charts'
import { fmt, perDay, routeColor } from './routes'
import { Count, Dot, Glyph, Icon, Sheet } from './ui'

const tokens = (lessons: Lesson[]) => lessons.reduce((n, l) => n + (l.signals?.tokens ?? 0), 0)
const newest = (a: Lesson, b: Lesson) => (b.confirmed ?? '').localeCompare(a.confirmed ?? '')

export function Context({ project, landed }: { project: Project; landed: string | null }) {
  const [open, setOpen] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [prompt, setPrompt] = useState('')
  // Refetch only when the context changes, not on every poll.
  const version = project.context_history.length
  useEffect(() => {
    if (showPrompt) api.message(project.id, 'example', 'routed').then((r) => setPrompt(r.message)).catch(() => setPrompt(''))
  }, [project.id, version, showPrompt])

  const active = project.lessons.filter((l) => l.status === 'active')
  const rules = active.filter((l) => l.in_context && (l.route === 'A' || l.route === 'A∧B') && l.expressible_as !== 'parameter').sort(newest)
  const params = active.filter((l) => l.expressible_as === 'parameter' && l.parameter)
  const owned = active.filter((l) => l.route === 'B' && l.in_context)
  const examples = project.examples.filter((e) => owned.some((l) => l.id === e.lesson_id))
  const notes = active.filter((l) => l.route === 'note').length
  const arrived = active.find((l) => l.id === landed && l.route !== 'B')

  const total = project.context_history.at(-1)?.tokens ?? 0
  const ruleTokens = { A: tokens(rules.filter((l) => l.route === 'A')), 'A∧B': tokens(rules.filter((l) => l.route === 'A∧B')) }
  const ownedTokens = tokens(owned)
  const segments = [
    { label: 'Task', tokens: Math.max(total - ruleTokens.A - ruleTokens['A∧B'] - ownedTokens, 0), color: 'var(--gray-50)' },
    { label: 'Context', tokens: ruleTokens.A, color: routeColor.A },
    { label: 'Both', tokens: ruleTokens['A∧B'], color: routeColor['A∧B'] },
    { label: 'Weights', tokens: ownedTokens, color: routeColor.B },
  ].filter((s) => s.tokens > 0)
  const after = total - ownedTokens

  return (
    <section className="rail-block" id="dest-context">
      <div className="rail-head">
        <h2 className="ink-context grow"><span data-tip="This context only: updated instantly, paid on every call">Context</span></h2>
        <button className="icon-btn" data-tip="Prompt" aria-label="Prompt" onClick={() => setShowPrompt(true)}><Icon name="prompt" /></button>
      </div>

      <div className="row" style={{ alignItems: 'baseline' }}>
        <span className="big" data-tip={`${perDay(total * project.calls_per_day)} tokens a day at ${fmt(project.calls_per_day)} calls`}><Count value={total} /></span>
        <span className="faint grow">tokens / call</span>
        <span data-tip="Tokens per call over time"><Spark values={project.context_history.map((h) => h.tokens)} width={64} height={24} color="var(--context)" /></span>
      </div>
      <div className="split-bar">
        {segments.map((s) => <div key={s.label} style={{ flexGrow: s.tokens, background: s.color }} data-tip={`${s.label}: ${fmt(s.tokens)}`} />)}
      </div>
      {ownedTokens > 0 ? (
        <div className="row">
          <div className="split-bar after" style={{ width: `${(after / total) * 100}%` }}>
            {segments.filter((s) => s.label !== 'Weights').map((s) => <div key={s.label} style={{ flexGrow: s.tokens, background: s.color }} />)}
          </div>
          <span className="faint nowrap" data-tip="Once the adapter holds the Weights lessons; projected">{fmt(after)}</span>
        </div>
      ) : null}

      {arrived ? <div className="arrived" key={arrived.id}><Dot route={arrived.route} /><span className="clamp-2">{arrived.statement}</span></div> : null}

      <button className="more" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="grow">{rules.length} rules · {params.length} in code{notes ? ` · ${notes} notes` : ''}</span>
        <span className={`chevron${open ? ' open' : ''}`}><Icon name="expand" size={14} /></span>
      </button>
      {open ? (
        <div className="stack enter" style={{ gap: '0.5rem' }}>
          <ul className="rules">
            {rules.map((l) => <li key={l.id}><Dot route={l.route} /><span className="clamp-2" data-tip={l.statement.length > 70 ? l.statement : undefined}>{l.statement}</span></li>)}
          </ul>
          <div className="row wrap" style={{ gap: '0.375rem' }}>
            {examples.map((e) => <span key={e.id} className="example"><Glyph svg={e.content} size="small" title={`${e.concept}: example`} /></span>)}
            {params.map((l) => <span key={l.id} className="chip" data-tip="Applied in code: 0 tokens">{l.parameter?.name}: {l.parameter?.value}</span>)}
          </div>
        </div>
      ) : null}

      {showPrompt ? (
        <Sheet title="Prompt" close={() => setShowPrompt(false)}>
          <div className="mono">{prompt || '…'}</div>
        </Sheet>
      ) : null}
    </section>
  )
}
