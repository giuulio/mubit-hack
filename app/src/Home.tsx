// Home: the thesis, the architecture, and the models built on the platform, each with its contexts.
import type { ProjectSummary } from './api'
import { go } from './routes'
import { Schematic } from './Schematic'
import { Button, Dot, Glyph, Icon } from './ui'

export function Home({ projects, create }: { projects: ProjectSummary[]; create: () => void }) {
  return (
    <div className="stack home" style={{ gap: '2.5rem' }}>
      <div className="stack hero">
        <h1 className="display-1">Rent what changes.<br />Own what lasts.</h1>
        <p className="lede">Hone routes every correction to <b className="ink-context">context</b>, <b className="ink-weights">weights</b> or <b className="ink-both">both</b>, on Mubit.</p>
        {projects[0] ? <div className="row"><Button kind="primary" onClick={() => go(projects[0].id)}>Open {projects[0].name} <Icon name="right" /></Button></div> : null}
      </div>

      <div className="schematic">
        <Schematic />
      </div>

      <div className="grid projects">
        {projects.map((p) => (
          <button key={p.id} className="project-card" onClick={() => go(p.id)}>
            <div className="row"><Icon name="model" size={15} /><h3 className="grow">{p.name}</h3><span className="faint">{p.domain}</span></div>
            <div className="row wrap" style={{ gap: '0.375rem' }}>{p.contexts.map((c) => <span key={c.id} className="chip"><Dot route="A" />{c.name}</span>)}</div>
            <div className="row samples">{p.samples.map((s, i) => <Glyph key={i} svg={s} size="small" />)}</div>
            <div className="row numbers">
              <span><b>{p.lessons}</b> lessons</span>
              <span><b>{p.training_calls}</b> kept</span>
              <span><b>{p.adapter ? p.adapter.version : '—'}</b> adapter</span>
            </div>
          </button>
        ))}
        <button className="project-card new" onClick={create}><Icon name="plus" /> New model</button>
      </div>
    </div>
  )
}
