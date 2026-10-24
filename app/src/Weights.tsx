// The Weights card: what Mubit trains into the adapter. Kept calls towards Mubit's training threshold, the adapter
// version, and the lessons on their way into the weights. Sending batches and recording versions live in the operator drawer.
import type { Lesson, Project } from './api'
import { clock } from './routes'
import { Count, Dot, Glyph, Head } from './ui'

// Mubit trains an adapter once a task has this many kept calls (HACKATHON.md).
export const THRESHOLD = 25

const newest = (a: Lesson, b: Lesson) => (b.confirmed ?? '').localeCompare(a.confirmed ?? '')

export function Weights({ project, landed }: { project: Project; landed: string | null }) {
  const adapter = project.adapters.at(-1)
  const kept = project.training.reduce((n, b) => n + b.calls, 0)
  const trained = new Set(project.training.flatMap((b) => b.lessons_in_context ?? []))
  const owned = project.lessons.filter((l) => l.status === 'active' && l.route === 'B').sort(newest)
  const both = project.lessons.filter((l) => l.status === 'active' && l.route === 'A∧B')

  // Where a lesson stands on its way into the weights.
  const state = (l: Lesson) => {
    if (l.route === 'B' && !l.in_context) return { text: 'owned', tip: 'Held by the adapter; dropped from the prompt' }
    if (l.absorption) return { text: `held ${Math.round(l.absorption.share * 100)}%`, tip: `Adapter alone, ${l.absorption.n} probes` }
    if (trained.has(l.id)) return { text: 'training', tip: 'In the context of a kept batch' }
    return { text: 'next batch', tip: 'Not yet in a kept batch' }
  }

  return (
    <div className="card stack dest" id="dest-weights">
      <Head route="B" title="Weights" tip="Trained by Mubit from kept calls; free on every call">
        <span className="mubit-tag">Mubit</span>
      </Head>

      <div className="halves" style={{ gap: '1rem' }}>
        <div className="stack" style={{ gap: '0.375rem' }}>
          <span className="faint" data-tip={`Calls kept in full under an approved context; Mubit trains at ${THRESHOLD}`}>Kept calls</span>
          <span className="big"><Count value={kept} /></span>
          {/* The bar spans the larger of kept calls and the threshold; the tick marks where Mubit starts training. */}
          <div className="progress"><div style={{ width: `${(kept / Math.max(kept, THRESHOLD)) * 100}%` }} /><i style={{ left: `${(THRESHOLD / Math.max(kept, THRESHOLD)) * 100}%` }} /></div>
        </div>
        <div className="stack" style={{ gap: '0.375rem' }}>
          <span className="faint" data-tip="Recorded from the Mubit console">Adapter</span>
          <span className="big">{adapter?.version ?? '—'}</span>
          <span className="faint">{adapter ? `${adapter.status} · ${clock(adapter.t)}` : kept >= THRESHOLD ? 'awaiting Mubit' : `${THRESHOLD - kept} calls to go`}</span>
        </div>
      </div>

      <ul className="rules">
        {owned.map((l) => {
          const example = project.examples.find((e) => e.lesson_id === l.id)
          const s = state(l)
          return (
            <li key={l.id} className={l.id === landed ? 'enter landed' : undefined}>
              {example ? <Glyph svg={example.content} size="small" title={example.concept} /> : <Dot route={l.route} />}
              <span className="grow clamp-2" data-tip={l.statement.length > 90 ? l.statement : undefined}>{l.statement}</span>
              <span className="chip" data-tip={s.tip}>{s.text}</span>
            </li>
          )
        })}
        {/* Both lessons are listed in full on the Context card; here they are one row. */}
        {both.length ? (
          <li key={`both-${both.length}`} className={both.some((l) => l.id === landed) ? 'enter landed' : undefined}>
            <Dot route="A∧B" />
            <span className="grow" data-tip={both.map((l) => `• ${l.statement}`).join('\n')}><b>{both.length}</b> <span className="muted">Both lessons</span></span>
            <span className="chip">{both.filter((l) => trained.has(l.id)).length}/{both.length} training</span>
          </li>
        ) : null}
      </ul>
    </div>
  )
}
