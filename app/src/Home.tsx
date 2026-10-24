// Home: the thesis, the architecture, what Hone adds on top of Mubit, and the projects built on the platform.
import type { ProjectSummary } from './api'
import { go, routeInfo } from './routes'
import { Schematic } from './Schematic'
import { Button, Glyph, Icon, RouteBadge } from './ui'

const roles = [
  { name: 'Mubit', route: 'B', text: 'Proxies every LLM call, groups calls into tasks and trains an adapter per task from the calls it keeps: the weights.' },
  { name: 'Hone', route: 'A', text: 'Updates the context automatically as each lesson is confirmed, decides which lessons Mubit should learn from, and measures every configuration.' },
] as const

export function Home({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="stack" style={{ gap: '1.5rem', maxWidth: '64rem' }}>
      <div className="stack" style={{ gap: '0.75rem', padding: '1rem 0 0.5rem' }}>
        <h1 style={{ fontSize: '2.75rem', lineHeight: 1.05 }}>Rent what changes.<br />Own what lasts.</h1>
        <p className="muted" style={{ fontSize: 'var(--lg)', margin: 0, maxWidth: '44rem' }}>
          Mubit trains a model's weights from its calls. Hone updates its context too, the moment a lesson is confirmed, and decides lesson by lesson what is worth moving into the weights.
        </p>
        {projects[0] ? <div className="row"><Button kind="primary" onClick={() => go(projects[0].id)}>Open {projects[0].name}</Button></div> : null}
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        <Schematic />
      </div>

      <div className="card halves" style={{ gap: '1.5rem' }}>
        {roles.map((r) => (
          <div key={r.name} className="stack" style={{ gap: '0.375rem' }}>
            <div className="row"><RouteBadge route={r.route} /><b className="display">{r.name}</b></div>
            <span className="muted">{r.text}</span>
          </div>
        ))}
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {(['A', 'A∧B', 'B'] as const).map((route) => (
          <div key={route} className="card stack" style={{ gap: '0.5rem' }}>
            <div className="row"><RouteBadge route={route} /><b style={{ fontSize: 'var(--sm)' }}>{routeInfo[route].title}</b></div>
            <span className="muted">{routeInfo[route].text}</span>
          </div>
        ))}
      </div>

      <div className="stack" style={{ gap: '0.75rem' }}>
        <h2>Projects</h2>
        <span className="muted">Each project is one recurring task with its own lessons, context and Mubit adapter. A domain plugin supplies the prompt, checks and judge.</span>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))' }}>
          {projects.map((p) => (
            <button key={p.id} className="card stack" style={{ textAlign: 'left', cursor: 'pointer', gap: '0.75rem' }} onClick={() => go(p.id)}>
              <div className="row"><Icon name="project" /><b className="grow display">{p.name}</b><span className="chip">{p.domain} plugin</span></div>
              <div className="row" style={{ minHeight: '2.25rem' }}>{p.samples.map((s, i) => <Glyph key={i} svg={s} size="small" />)}</div>
              <span className="faint">{p.lessons} lessons · {p.training_calls} training calls · adapter {p.adapter ? `${p.adapter.version} ${p.adapter.status}` : '—'}</span>
            </button>
          ))}
        </div>
      </div>

      <span className="faint">
        Fast writes, slow consolidation: after <a href="https://arxiv.org/abs/2608.22215" style={{ color: 'inherit' }}>dual-layer agentic memory</a> (Li et al., 2026).
      </span>
    </div>
  )
}
