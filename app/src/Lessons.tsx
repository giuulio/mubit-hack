// Lessons: every lesson with its route and reason, and the context the model currently receives.
import { useEffect, useState } from 'react'
import { api, type Lesson, type Project } from './api'
import { Line } from './charts'
import { Glyph, RouteBadge } from './ui'

const order = ['active', 'pending', 'needs_rephrase', 'superseded', 'duplicate', 'rejected']

export function Lessons({ project }: { project: Project }) {
  const [message, setMessage] = useState('')
  useEffect(() => {
    api.message(project.id, 'example', 'routed').then((r) => setMessage(r.message)).catch(() => setMessage(''))
  }, [project])

  const lessons = [...project.lessons].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))
  const history = project.context_history.map((h) => h.tokens)
  const latest = history.at(-1) ?? 0

  return (
    <div className="split">
      <div className="card">
        {lessons.length ? (
          <table>
            <thead><tr><th>Route</th><th>Lesson</th><th>Tokens</th><th>Effect</th><th>Context</th></tr></thead>
            <tbody>{lessons.map((l) => <Row key={l.id} lesson={l} />)}</tbody>
          </table>
        ) : <div className="empty">No lessons yet</div>}
      </div>
      <div className="stack">
        <div className="card stack" style={{ gap: '0.5rem' }}>
          <div className="row"><h2 className="grow">Context</h2><span className="muted">{latest} tokens</span></div>
          <Line values={history} />
        </div>
        {project.examples.length ? (
          <div className="card stack" style={{ gap: '0.5rem' }}>
            <h3>Examples</h3>
            <div className="row wrap">{project.examples.map((e) => <Glyph key={e.id} svg={e.content} size="small" />)}</div>
          </div>
        ) : null}
        <div className="card stack" style={{ gap: '0.5rem' }}>
          <h3>Message</h3>
          <div className="mono" style={{ maxHeight: '20rem', overflow: 'auto' }}>{message}</div>
        </div>
      </div>
    </div>
  )
}

function Row({ lesson }: { lesson: Lesson }) {
  const effect = lesson.signals?.effect
  const inactive = lesson.status !== 'active'
  return (
    <tr style={{ opacity: inactive ? 0.5 : 1 }}>
      <td><RouteBadge route={lesson.route} /></td>
      <td>
        <div>{lesson.statement}</div>
        <div className="faint">{inactive ? lesson.status.replace('_', ' ') : lesson.reason}</div>
        {lesson.absorption ? <div className="faint">absorbed by adapter: {Math.round(lesson.absorption.share * 100)}% of {lesson.absorption.n}</div> : null}
      </td>
      <td className="muted">{lesson.signals?.tokens ?? '—'}</td>
      <td className="muted">{effect === undefined || effect === null ? '—' : `${Math.round(effect * 100)}%`}</td>
      <td>{lesson.status === 'active' ? <span className={`dot${lesson.in_context ? '' : ' off'}`} title={lesson.in_context ? 'in context' : lesson.expressible_as === 'parameter' ? 'in code' : 'retired'} /> : null}</td>
    </tr>
  )
}
