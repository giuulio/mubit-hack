// Home: what Hone does, the architecture, and the example projects.
import type { ProjectSummary } from './api'
import { Schematic } from './Schematic'
import { Button, Glyph, Icon } from './ui'

const steps = [
  { icon: 'critique', title: 'Extract', text: 'Feedback becomes atomic lessons.' },
  { icon: 'pick', title: 'Route', text: 'Context, weights, or both, by measured cost and effect.' },
  { icon: 'chart', title: 'Measure', text: 'Frontier, context only, weights only, both: compared on held-out work.' },
] as const

export function Home({ projects, open, create }: { projects: ProjectSummary[]; open: (id: string) => void; create: () => void }) {
  return (
    <div className="stack" style={{ gap: '1.5rem', maxWidth: '64rem' }}>
      <div className="stack" style={{ gap: '0.75rem', padding: '1rem 0 0.5rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Hone</h1>
        <p className="muted" style={{ fontSize: 'var(--lg)', margin: 0, maxWidth: '40rem' }}>
          The end-to-end platform for bespoke Mubit models. Every lesson lands in context instantly; the ones worth keeping move into the weights.
        </p>
        <div className="row">
          {projects[0] ? <Button kind="primary" onClick={() => open(projects[0].id)}>Open {projects[0].name}</Button> : null}
          <Button onClick={create}><Icon name="plus" /> New project</Button>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        <Schematic />
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {steps.map((s) => (
          <div key={s.title} className="card stack" style={{ gap: '0.375rem' }}>
            <div className="row"><Icon name={s.icon} /><b style={{ fontSize: 'var(--sm)' }}>{s.title}</b></div>
            <span className="muted">{s.text}</span>
          </div>
        ))}
      </div>

      {projects.length ? (
        <div className="stack" style={{ gap: '0.75rem' }}>
          <h3>Projects</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))' }}>
            {projects.map((p) => (
              <button key={p.id} className="card stack" style={{ textAlign: 'left', cursor: 'pointer', gap: '0.75rem' }} onClick={() => open(p.id)}>
                <div className="row"><b className="grow">{p.name}</b><span className="chip">{p.domain}</span></div>
                <div className="row" style={{ minHeight: '2.25rem' }}>{p.samples.map((s, i) => <Glyph key={i} svg={s} size="small" />)}</div>
                <span className="faint">{p.lessons} lessons · {p.training_calls} training calls · adapter {p.adapter ? `${p.adapter.version} ${p.adapter.status}` : '—'}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <span className="faint">
        Fast writes, slow consolidation: after <a href="https://arxiv.org/abs/2608.22215" style={{ color: 'inherit' }}>dual-layer agentic memory</a> (Li et al., 2026), on Mubit.
      </span>
    </div>
  )
}
