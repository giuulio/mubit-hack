// Home: the thesis, the architecture, what Hone adds on top of Mubit, and the projects built on the platform.
import type { ProjectSummary } from './api'
import { go, routeInfo } from './routes'
import { Schematic } from './Schematic'
import { Button, Glyph, Head, Icon } from './ui'

const roles = [
  { name: 'Hone', route: 'A', text: 'Updates context automatically. Routes lessons. Measures results.' },
  { name: 'Mubit', route: 'B', text: 'Proxies calls. Trains an adapter per task.' },
] as const

export function Home({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="stack" style={{ gap: '1.5rem', maxWidth: '64rem' }}>
      <div className="stack" style={{ gap: '0.75rem', padding: '1rem 0 0.5rem' }}>
        <h1 className="display-1">Rent what changes.<br />Own what lasts.</h1>
        <p className="lede" style={{ maxWidth: '40rem' }}>Mubit trains the weights. Hone updates the context instantly, and decides what moves into the weights.</p>
        {projects[0] ? <div className="row"><Button kind="primary" onClick={() => go(projects[0].id)}>Open {projects[0].name}</Button></div> : null}
      </div>

      <div className="card">
        <Schematic />
      </div>

      <div className="halves">
        {roles.map((r) => (
          <div key={r.name} className="card"><Head route={r.route} title={r.name} sub={r.text} /></div>
        ))}
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {(['A', 'A∧B', 'B'] as const).map((route) => (
          <div key={route} className="card"><Head route={route} title={routeInfo[route].title} sub={routeInfo[route].text} /></div>
        ))}
      </div>

      <div className="stack" style={{ gap: '0.75rem' }}>
        <Head title="Projects" sub="One recurring task each: its own lessons, context and adapter." />
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))' }}>
          {projects.map((p) => (
            <button key={p.id} className="card stack" style={{ textAlign: 'left', cursor: 'pointer', gap: '0.75rem' }} onClick={() => go(p.id)}>
              <div className="row"><Icon name="project" /><h3 className="grow">{p.name}</h3><span className="chip">{p.domain} plugin</span></div>
              <div className="row" style={{ minHeight: '2.25rem' }}>{p.samples.map((s, i) => <Glyph key={i} svg={s} size="small" />)}</div>
              <span className="faint">{p.lessons} lessons · {p.training_calls} training calls · {p.adapter ? `adapter ${p.adapter.version}, ${p.adapter.status}` : 'no adapter yet'}</span>
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
