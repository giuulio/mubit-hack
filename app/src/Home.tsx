// Home: the thesis, the architecture, what Hone adds on top of Mubit, and the example projects.
import type { ProjectSummary } from './api'
import { routeInfo } from './routes'
import { Schematic } from './Schematic'
import { Button, Glyph, RouteBadge } from './ui'

const roles = [
  { name: 'Mubit', text: 'Proxies every LLM call, groups calls into tasks and trains an adapter per task from the calls it keeps.' },
  { name: 'Hone', text: 'Decides what Mubit learns from: one task per project, previews and probes never kept, training calls only under an approved context. Then measures every configuration.' },
]

export function Home({ projects, open }: { projects: ProjectSummary[]; open: (id: string) => void }) {
  return (
    <div className="stack" style={{ gap: '1.5rem', maxWidth: '64rem' }}>
      <div className="stack" style={{ gap: '0.75rem', padding: '1rem 0 0.5rem' }}>
        <h1 style={{ fontSize: '2.75rem', lineHeight: 1.05 }}>Rent what changes.<br />Own what lasts.</h1>
        <p className="muted" style={{ fontSize: 'var(--lg)', margin: 0, maxWidth: '42rem' }}>
          Hone is the end-to-end platform for bespoke Mubit models. Every lesson from feedback lands in context instantly; the ones worth keeping move into the weights.
        </p>
        {projects[0] ? <div className="row"><Button kind="primary" onClick={() => open(projects[0].id)}>Open {projects[0].name}</Button></div> : null}
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        <Schematic />
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {(['A', 'A∧B', 'B'] as const).map((route) => (
          <div key={route} className="card stack" style={{ gap: '0.5rem' }}>
            <div className="row"><RouteBadge route={route} /><b style={{ fontSize: 'var(--sm)' }}>{routeInfo[route].title}</b></div>
            <span className="muted">{routeInfo[route].text}</span>
          </div>
        ))}
      </div>

      <div className="card halves" style={{ gap: '1.5rem' }}>
        {roles.map((r) => (
          <div key={r.name} className="stack" style={{ gap: '0.375rem' }}>
            <b className="display">{r.name}</b>
            <span className="muted">{r.text}</span>
          </div>
        ))}
      </div>

      {projects.length ? (
        <div className="stack" style={{ gap: '0.75rem' }}>
          <h3>Projects</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))' }}>
            {projects.map((p) => (
              <button key={p.id} className="card stack" style={{ textAlign: 'left', cursor: 'pointer', gap: '0.75rem' }} onClick={() => open(p.id)}>
                <div className="row"><b className="grow display">{p.name}</b><span className="chip">{p.domain}</span></div>
                <div className="row" style={{ minHeight: '2.25rem' }}>{p.samples.map((s, i) => <Glyph key={i} svg={s} size="small" />)}</div>
                <span className="faint">{p.lessons} lessons · {p.training_calls} training calls · adapter {p.adapter ? `${p.adapter.version} ${p.adapter.status}` : '—'}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <span className="faint">
        Fast writes, slow consolidation: after <a href="https://arxiv.org/abs/2608.22215" style={{ color: 'inherit' }}>dual-layer agentic memory</a> (Li et al., 2026).
      </span>
    </div>
  )
}
