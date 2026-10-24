// Home: the thesis, the architecture, and the projects built on the platform.
import type { ProjectSummary } from './api'
import { go } from './routes'
import { Schematic } from './Schematic'
import { Button, Glyph, Icon } from './ui'

export function Home({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className="stack home" style={{ gap: '1.75rem' }}>
      <div className="stack" style={{ gap: '0.875rem', padding: '1.5rem 0 0' }}>
        <h1 className="display-1">Rent what changes.<br />Own what lasts.</h1>
        <p className="lede">Hone routes every correction to <b className="ink-context">context</b>, <b className="ink-weights">weights</b> or <b className="ink-both">both</b>, on Mubit.</p>
        {projects[0] ? <div className="row"><Button kind="primary" onClick={() => go(projects[0].id)}>Open {projects[0].name} <Icon name="right" /></Button></div> : null}
      </div>

      <div className="card schematic">
        <Schematic />
      </div>

      <div className="grid projects">
        {projects.map((p) => (
          <button key={p.id} className="card project-card" onClick={() => go(p.id)}>
            <div className="row"><h3 className="grow">{p.name}</h3><span className="faint">{p.domain}</span></div>
            <div className="row samples">{p.samples.map((s, i) => <Glyph key={i} svg={s} size="small" />)}</div>
            <div className="row numbers">
              <span><b>{p.lessons}</b> lessons</span>
              <span><b>{p.training_calls}</b> kept</span>
              <span><b>{p.adapter ? p.adapter.version : '—'}</b> adapter</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
