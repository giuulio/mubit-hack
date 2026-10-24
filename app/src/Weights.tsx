// The Weights block of the rail: what Mubit trains into the model's adapter, shared by every context of the model, so it
// reads the whole model rather than one context.
// Kept calls towards Mubit's training threshold and the adapter version; the lessons on their way in open on demand.
// Sending batches and recording versions live in the operator drawer.
import { useState } from 'react'
import type { Lesson } from './api'
import { clock, type View } from './routes'
import { Count, Dot, Glyph, Icon } from './ui'

// Mubit trains an adapter once a task has this many kept calls (HACKATHON.md).
export const THRESHOLD = 25

const newest = (a: Lesson, b: Lesson) => (b.confirmed ?? '').localeCompare(a.confirmed ?? '')

export function Weights({ project: { whole: project }, landed }: { project: View; landed: string | null }) {
  const [open, setOpen] = useState(false)
  const adapter = project.adapters.at(-1)
  const kept = project.training.reduce((n, b) => n + b.calls, 0)
  const trained = new Set(project.training.flatMap((b) => b.lessons_in_context ?? []))
  const owned = project.lessons.filter((l) => l.status === 'active' && l.route === 'B').sort(newest)
  const both = project.lessons.filter((l) => l.status === 'active' && l.route === 'A∧B')
  const arrived = [...owned, ...both].find((l) => l.id === landed)

  // Where a lesson stands on its way into the weights.
  const state = (l: Lesson) => {
    if (!l.in_context) return { text: 'owned', tip: 'Held by the adapter; dropped from the prompt' }
    if (l.absorption) return { text: `held ${Math.round(l.absorption.share * 100)}%`, tip: `Adapter alone, ${l.absorption.n} probes` }
    if (trained.has(l.id)) return { text: 'training', tip: 'In the context of a kept batch' }
    return { text: 'next batch', tip: 'Not yet in a kept batch' }
  }

  return (
    <section className="rail-block" id="dest-weights">
      <div className="rail-head">
        <h2 className="ink-weights grow"><span data-tip={`Shared by every context of ${project.name}; trained by Mubit from all their kept calls, free on every call`}>Weights</span></h2>
        <span className="mubit-tag">Mubit</span>
      </div>

      <div className="halves" style={{ gap: '0.75rem' }}>
        <div className="stack" style={{ gap: '0.125rem' }}>
          <span className="big"><Count value={kept} /></span>
          <span className="faint" data-tip={`Calls kept in full under an approved context; Mubit trains at ${THRESHOLD}`}>submitted calls</span>
        </div>
        <div className="stack" style={{ gap: '0.125rem' }}>
          <span className="big">{adapter?.version ?? '—'}</span>
          <span className="faint" data-tip="Recorded from the Mubit console">{adapter ? `${adapter.status} · ${clock(adapter.t)}` : kept >= THRESHOLD ? 'awaiting Mubit' : `${THRESHOLD - kept} to go`}</span>
        </div>
      </div>
      <p className="faint">Live icons use the base model + context. {adapter?.status === 'passed' ? 'A passing adapter is recorded; test it in Mubit Try models.' : 'No completed fine-tune is verified here.'} Status is manually recorded from the console.</p>
      {/* The bar spans the larger of kept calls and the threshold; the tick marks where Mubit starts training. */}
      <div className="progress"><div style={{ width: `${(kept / Math.max(kept, THRESHOLD)) * 100}%` }} /><i style={{ left: `${(THRESHOLD / Math.max(kept, THRESHOLD)) * 100}%` }} /></div>

      {arrived ? <div className="arrived" key={arrived.id}><Dot route={arrived.route} /><span className="clamp-2">{arrived.statement}</span></div> : null}

      <button className="more" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="grow">{owned.length} weights · {both.length} both</span>
        <span className={`chevron${open ? ' open' : ''}`}><Icon name="expand" size={14} /></span>
      </button>
      {open ? (
        <ul className="rules enter">
          {[...owned, ...both].map((l) => {
            const example = project.examples.find((e) => e.lesson_id === l.id)
            const s = state(l)
            return (
              <li key={l.id}>
                {example ? <Glyph svg={example.content} size="small" title={example.concept} /> : <Dot route={l.route} />}
                <span className="grow clamp-2" data-tip={l.statement.length > 70 ? l.statement : undefined}>{l.statement}</span>
                <span className="faint nowrap" data-tip={s.tip}>{s.text}</span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
