// Routing: where each lesson went. A, the context Hone keeps up to date; B, the weights Mubit trains; and every lesson
// with the evidence behind its route.
import { useEffect, useState } from 'react'
import { api, type Lesson, type Project, type Route } from './api'
import { Context } from './Context'
import { Probes } from './Probes'
import { routeInfo } from './routes'
import { Head, Icon, RouteBadge } from './ui'
import { Weights } from './Weights'

const groups: Route[] = ['A', 'A∧B', 'B', 'note', 'rephrase']

type Props = { project: Project; focus: string | null; reload: () => Promise<void>; notify: (text: string) => void }

export function Routing({ project, focus, reload, notify }: Props) {
  const [open, setOpen] = useState<string | null>(focus)
  const [probes, setProbes] = useState<string[]>([])
  useEffect(() => { api.concepts(project.id).then((c) => setProbes(c.train.slice(0, 3))).catch(() => undefined) }, [project.id])
  useEffect(() => { if (focus) document.getElementById(`lesson-${focus}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }) }, [focus])

  const live = project.lessons.filter((l) => l.status === 'active' || l.status === 'needs_rephrase')
  const inactive = project.lessons.filter((l) => ['superseded', 'duplicate', 'rejected'].includes(l.status))
  const trained = new Set(project.training.flatMap((b) => b.lessons_in_context ?? []))
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id))

  return (
    <div className="stack">
      <div className="halves">
        <Context project={project} />
        <Weights project={project} probes={probes} reload={reload} notify={notify} />
      </div>

      <div className="card stack" style={{ gap: '0.5rem' }}>
        <Head title="Lessons" sub="Open one for its probes">
          <div className="row wrap">
            {groups.map((r) => {
              const n = live.filter((l) => l.route === r).length
              return n ? <span key={r} className="row" style={{ gap: '0.375rem' }}><RouteBadge route={r} /><span className="muted">{n}</span></span> : null
            })}
          </div>
        </Head>
        {live.length ? (
          <table>
            <thead><tr><th>Lesson</th><th className="r">Tokens</th><th className="r">Effect</th><th>Lives in</th></tr></thead>
            {groups.map((route) => {
              const lessons = live.filter((l) => l.route === route)
              if (!lessons.length) return null
              return (
                <tbody key={route}>
                  <tr className="group">
                    <td colSpan={4}>
                      <div className="row"><RouteBadge route={route} /><h3>{routeInfo[route].title}</h3><span className="faint">{lessons.length}</span></div>
                      <div className="sub" style={{ marginTop: '0.25rem' }}>{routeInfo[route].text}</div>
                    </td>
                  </tr>
                  {lessons.map((l, i) => <Row key={l.id} lesson={l} quote={l.feedback !== lessons[i - 1]?.feedback} trained={trained.has(l.id)} open={open === l.id} toggle={() => toggle(l.id)} />)}
                </tbody>
              )
            })}
          </table>
        ) : <div className="empty">No lessons yet</div>}
        {inactive.length ? (
          <details className="inactive">
            <summary className="faint">{inactive.length} inactive</summary>
            <table><tbody>{inactive.map((l) => (
              <tr key={l.id}><td className="muted">{l.statement}</td><td className="faint">{l.status}</td></tr>
            ))}</tbody></table>
          </details>
        ) : null}
      </div>
    </div>
  )
}

// Where a lesson lives now: code, the prompt, training calls, or the adapter's weights.
function where(lesson: Lesson, trained: boolean) {
  if (lesson.status === 'needs_rephrase') return 'nowhere'
  if (lesson.expressible_as === 'parameter') return 'code'
  if (lesson.route === 'B' && !lesson.in_context) return 'weights'
  if (lesson.route === 'A∧B' || lesson.route === 'B') return trained ? 'prompt · training' : 'prompt · to train'
  return 'prompt'
}

// `quote` shows the feedback a lesson came from once, not on every lesson extracted from it.
function Row({ lesson, quote, trained, open, toggle }: { lesson: Lesson; quote: boolean; trained: boolean; open: boolean; toggle: () => void }) {
  const effect = lesson.signals?.effect
  const evidence = Boolean(lesson.probe?.probes?.length)
  return (
    <>
      <tr id={`lesson-${lesson.id}`} className={[evidence ? 'clickable' : '', open ? 'open' : ''].join(' ').trim() || undefined} onClick={evidence ? toggle : undefined}>
        <td>
          <div>{lesson.statement}</div>
          {quote && lesson.feedback ? <div className="faint clamp">{lesson.signal}: “{lesson.feedback}”</div> : null}
        </td>
        <td className="r muted">{lesson.signals?.tokens ?? '—'}</td>
        <td className="r muted">{effect === undefined || effect === null ? '—' : `${Math.round(effect * 100)}%`}</td>
        <td className="nowrap">
          <span className="muted">{where(lesson, trained)}</span>
          {evidence ? <span className={`chevron${open ? ' open' : ''}`}><Icon name="expand" size={14} /></span> : null}
        </td>
      </tr>
      {open && (evidence || lesson.absorption) ? (
        <tr className="detail">
          <td colSpan={4}>
            <div className="stack" style={{ gap: '0.75rem', maxWidth: '28rem' }}>
              {lesson.absorption ? <span className="faint">Adapter alone: {Math.round(lesson.absorption.share * 100)}% of {lesson.absorption.n}</span> : null}
              <Probes lesson={lesson} />
            </div>
          </td>
        </tr>
      ) : null}
    </>
  )
}
