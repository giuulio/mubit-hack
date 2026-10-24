// The Context card: what Hone puts in every prompt, updated the moment a lesson is routed. Tokens per call split by
// where each lesson lives, what is left once the weights hold the Weights lessons, and the rules themselves.
import { useEffect, useState } from 'react'
import { api, type Lesson, type Project } from './api'
import { Spark } from './charts'
import { fmt, perDay, routeColor } from './routes'
import { Count, Dot, Glyph, Head, Icon } from './ui'

const tokens = (lessons: Lesson[]) => lessons.reduce((n, l) => n + (l.signals?.tokens ?? 0), 0)
const newest = (a: Lesson, b: Lesson) => (b.confirmed ?? '').localeCompare(a.confirmed ?? '')

export function Context({ project, landed }: { project: Project; landed: string | null }) {
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
    <div className="card stack dest" id="dest-context">
      <Head route="A" title="Context" tip="Updated by Hone instantly; paid on every call">
        <button className={`icon-btn${showPrompt ? ' on' : ''}`} data-tip="Prompt" aria-label="Prompt" onClick={() => setShowPrompt(!showPrompt)}><Icon name="prompt" /></button>
      </Head>

      <div className="stack" style={{ gap: '0.5rem' }}>
        <div className="row" style={{ alignItems: 'baseline' }}>
          <span className="big" data-tip={`${perDay(total * project.calls_per_day)} tokens a day at ${fmt(project.calls_per_day)} calls`}><Count value={total} /></span>
          <span className="muted grow">tokens / call</span>
          <span data-tip="Tokens per call over time"><Spark values={project.context_history.map((h) => h.tokens)} color="var(--context)" /></span>
        </div>
        <div className="split-bar">
          {segments.map((s) => <div key={s.label} style={{ flexGrow: s.tokens, background: s.color }} data-tip={`${s.label}: ${fmt(s.tokens)}`} />)}
        </div>
        <div className="legend">
          {segments.map((s) => <span key={s.label}><i className="dot" style={{ background: s.color }} />{s.label} <b>{fmt(s.tokens)}</b></span>)}
        </div>
        {ownedTokens > 0 ? (
          <div className="row">
            <div className="split-bar after" style={{ width: `${(after / total) * 100}%` }}>
              {segments.filter((s) => s.label !== 'Weights').map((s) => <div key={s.label} style={{ flexGrow: s.tokens, background: s.color }} />)}
            </div>
            <span className="faint nowrap" data-tip="Once the adapter holds the Weights lessons; projected">{fmt(after)} · −{Math.round((ownedTokens / total) * 100)}%</span>
          </div>
        ) : null}
      </div>

      {showPrompt ? <div className="mono prompt">{prompt || '…'}</div> : null}

      <ul className="rules">
        {rules.map((l) => (
          <li key={l.id} className={l.id === landed ? 'enter landed' : undefined}><Dot route={l.route} /><span className="clamp-2" data-tip={l.statement.length > 90 ? l.statement : undefined}>{l.statement}</span></li>
        ))}
      </ul>

      {examples.length || params.length || notes ? (
        <div className="row wrap" style={{ gap: '0.375rem' }}>
          {examples.map((e) => <span key={e.id} className={`example${e.lesson_id === landed ? ' enter landed' : ''}`}><Glyph svg={e.content} size="small" title={`${e.concept}: example`} /></span>)}
          {params.map((l) => <span key={l.id} className={`chip${l.id === landed ? ' enter landed' : ''}`} data-tip="Applied in code: 0 tokens"><Icon name="prompt" size={12} />{l.parameter?.name}: {l.parameter?.value}</span>)}
          {notes ? <span className="chip" data-tip="Single-concept notes, sent only for their concept">+{notes} notes</span> : null}
        </div>
      ) : null}
    </div>
  )
}
