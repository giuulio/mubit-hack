// Lessons: where each lesson lives (code, prompt or weights), what every call pays for it, and the evidence behind each route.
import { useEffect, useState } from 'react'
import { api, type Lesson, type Project, type Route } from './api'
import { ContextSplit } from './ContextSplit'
import { Probes } from './Probes'
import { routeInfo } from './routes'
import { Fold, Glyph, Icon, RouteBadge } from './ui'

const groups: Route[] = ['A', 'A∧B', 'B', 'note', 'rephrase']

export function Lessons({ project }: { project: Project }) {
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  useEffect(() => {
    api.message(project.id, 'example', 'routed').then((r) => setMessage(r.message)).catch(() => setMessage(''))
  }, [project])

  const live = project.lessons.filter((l) => l.status === 'active' || l.status === 'needs_rephrase')
  const inactive = project.lessons.filter((l) => ['superseded', 'duplicate', 'rejected'].includes(l.status))
  const trained = new Set(project.training.flatMap((b) => b.lessons_in_context ?? []))
  const lessonOf = (id: string) => project.lessons.find((l) => l.id === id)
  const examples = project.examples.filter((e) => lessonOf(e.lesson_id)?.status === 'active')
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id))

  return (
    <div className="split wide">
      <div className="card" style={{ paddingTop: '0.25rem' }}>
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
                      <div className="row"><RouteBadge route={route} /><b>{routeInfo[route].title}</b><span className="faint">{lessons.length}</span></div>
                      <div className="faint" style={{ marginTop: '0.25rem' }}>{routeInfo[route].text}</div>
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
            <summary className="faint">{inactive.length} superseded, duplicate or rejected</summary>
            <table><tbody>{inactive.map((l) => (
              <tr key={l.id}><td className="muted">{l.statement}</td><td className="faint">{l.status}</td></tr>
            ))}</tbody></table>
          </details>
        ) : null}
      </div>

      <div className="stack">
        <ContextSplit project={project} />
        {examples.length ? (
          <div className="card stack" style={{ gap: '0.75rem' }}>
            <h3>Examples</h3>
            {(['B', 'note'] as const).map((route) => {
              const shown = examples.filter((e) => lessonOf(e.lesson_id)?.route === route)
              return shown.length ? (
                <div key={route} className="stack" style={{ gap: '0.375rem' }}>
                  <span className="row faint"><RouteBadge route={route} />{route === 'B' ? 'in every call until the adapter owns them' : 'sent only with their concept'}</span>
                  <div className="row wrap">{shown.map((e) => <Glyph key={e.id} svg={e.content} size="small" title={e.concept} />)}</div>
                </div>
              ) : null
            })}
          </div>
        ) : null}
        <Fold title={<h3>What the model receives</h3>}>
          <div className="mono" style={{ maxHeight: '24rem', overflow: 'auto' }}>{message}</div>
        </Fold>
      </div>
    </div>
  )
}

// Where a lesson lives now: code, the prompt, training, or the adapter's weights.
function where(lesson: Lesson, trained: boolean) {
  if (lesson.status === 'needs_rephrase') return 'nowhere yet'
  if (lesson.expressible_as === 'parameter') return 'code'
  if (lesson.route === 'B' && !lesson.in_context) return 'weights'
  if (lesson.route === 'A∧B' || lesson.route === 'B') return trained ? 'prompt · in training calls' : 'prompt · to train'
  return 'prompt'
}

// `quote` shows the feedback a lesson came from once, not on every lesson extracted from it.
function Row({ lesson, quote, trained, open, toggle }: { lesson: Lesson; quote: boolean; trained: boolean; open: boolean; toggle: () => void }) {
  const effect = lesson.signals?.effect
  const evidence = Boolean(lesson.probe?.probes?.length)
  return (
    <>
      <tr className={evidence ? 'clickable' : undefined} onClick={evidence ? toggle : undefined}>
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
      {open ? (
        <tr className="detail">
          <td colSpan={4}>
            <div className="stack" style={{ gap: '0.75rem', maxWidth: '28rem' }}>
              <span className="faint">{lesson.reason}</span>
              {lesson.absorption ? <span className="faint">Adapter without the lesson: follows it in {Math.round(lesson.absorption.share * 100)}% of {lesson.absorption.n}</span> : null}
              <Probes lesson={lesson} />
            </div>
          </td>
        </tr>
      ) : null}
    </>
  )
}
