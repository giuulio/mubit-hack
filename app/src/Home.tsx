// Home: my models, side by side, and the recent work on them. The thesis and the architecture live on About.
import { useEffect, useState } from 'react'
import { api, type Activity, type ProjectSummary } from './api'
import { go, labelOf } from './routes'
import { Button, Dot, Glyph, Icon, RouteBadge, type IconName } from './ui'

// A timestamp as people say it: the time for today, the day and month otherwise.
function when(t: string | undefined) {
  if (!t) return '—'
  const date = new Date(t.replace(/([+-]\d\d)(\d\d)$/, '$1:$2'))
  if (Number.isNaN(date.getTime())) return t.slice(11, 16)
  return date.toDateString() === new Date().toDateString()
    ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const kinds: Record<Exclude<Activity['kind'], 'lesson'>, IconName> = { training: 'train', adapter: 'model', evaluation: 'chart', compare: 'generate', context: 'plus' }

export function Home({ projects, create }: { projects: ProjectSummary[]; create: () => void }) {
  const [activity, setActivity] = useState<Activity[] | null>(null)
  useEffect(() => { api.activity(10).then(setActivity).catch(() => setActivity([])) }, [projects])

  const contexts = projects.reduce((n, p) => n + p.contexts.length, 0)
  const kept = projects.reduce((n, p) => n + p.training_calls, 0)

  return (
    <div className="home">
      <header className="page-head">
        <div className="grow stack" style={{ gap: '0.375rem' }}>
          <h1>My models</h1>
          <p className="muted">{projects.length} models · {contexts} contexts · {kept} kept calls</p>
        </div>
        <Button kind="primary" onClick={create}><Icon name="plus" /> New model</Button>
      </header>

      <div className="model-grid">
        {projects.map((p) => (
          <button key={p.id} className="model-card" onClick={() => go(p.id)}>
            <div className="samples">{p.samples.length ? p.samples.slice(0, 6).map((s, i) => <Glyph key={i} svg={s} size="small" />) : <span className="faint">No outputs yet</span>}</div>
            <div className="stack" style={{ gap: '0.5rem' }}>
              <div className="row"><h3 className="grow">{labelOf(p)}</h3><span className="faint">{p.domain}</span></div>
              <div className="row wrap" style={{ gap: '0.375rem' }}>{p.contexts.map((c) => <span key={c.id} className="chip"><Dot route="A" />{c.name}</span>)}</div>
            </div>
            <div className="numbers">
              <span><b>{p.lessons}</b> lessons</span>
              <span><b>{p.training_calls}</b> kept</span>
              <span><b>{p.adapter ? p.adapter.version : '—'}</b> adapter</span>
              <span className="grow r">{when(p.updated)}</span>
            </div>
          </button>
        ))}
      </div>

      <section className="stack" style={{ gap: '0.75rem' }}>
        <h2>Recent work</h2>
        {activity === null ? <div className="empty">…</div> : activity.length ? (
          <ul className="activity">
            {activity.map((a, i) => (
              <li key={i}>
                <button onClick={() => go(a.model, a.context)}>
                  <span className="mark-cell">{a.kind === 'lesson' ? <RouteBadge route={a.route ?? null} /> : <span className="kind"><Icon name={kinds[a.kind]} size={14} /></span>}</span>
                  <span className="grow clamp">{a.text}</span>
                  <span className="faint nowrap">{a.label}{a.context_name ? ` / ${a.context_name}` : ''}</span>
                  <span className="faint nowrap when">{when(a.t)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <div className="empty">Nothing yet: open a model and give it feedback</div>}
      </section>
    </div>
  )
}
