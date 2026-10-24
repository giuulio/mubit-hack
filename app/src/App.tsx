// Shell: home and projects in the sidebar; each project has Studio, Lessons and Model views.
import { useCallback, useEffect, useState } from 'react'
import { api, type Project, type ProjectSummary } from './api'
import { Home } from './Home'
import { Lessons } from './Lessons'
import { Model } from './Model'
import { Studio } from './Studio'
import { Button, Icon } from './ui'

const tabs = ['Studio', 'Lessons', 'Model'] as const

export default function App() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [current, setCurrent] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [tab, setTab] = useState<(typeof tabs)[number]>('Studio')
  const [toast, setToast] = useState<string | null>(null)
  const [naming, setNaming] = useState<string | null>(null)
  const [domains, setDomains] = useState<string[]>(['icons'])
  const [domain, setDomain] = useState('icons')

  const notify = useCallback((text: string) => {
    setToast(text)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const loadProjects = useCallback(async () => {
    const list = await api.projects()
    setProjects(list)
  }, [])

  const reload = useCallback(async () => {
    if (current) setProject(await api.project(current))
    await loadProjects()
  }, [current, loadProjects])

  useEffect(() => { loadProjects().catch((e) => notify(String(e))) }, [loadProjects, notify])
  useEffect(() => { api.domains().then(setDomains).catch(() => undefined) }, [])
  useEffect(() => {
    if (current) api.project(current).then(setProject).catch((e) => notify(String(e)))
    else setProject(null)
  }, [current, notify])

  const create = async () => {
    if (!naming?.trim()) return
    try {
      const p = await api.create(naming.trim(), domain)
      setNaming(null)
      await loadProjects()
      setCurrent(p.id)
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <button className="brand nav-item" style={{ fontSize: 'var(--md)', color: 'var(--text)' }} onClick={() => setCurrent(null)}><Icon name="layers" size={20} /> Hone</button>
        <button className={`nav-item${current === null ? ' active' : ''}`} onClick={() => setCurrent(null)}><Icon name="home" /> Home</button>
        {projects.map((p) => (
          <button key={p.id} className={`nav-item${p.id === current ? ' active' : ''}`} onClick={() => setCurrent(p.id)}>
            <Icon name="project" />
            <span className="grow">{p.name}</span>
            <span className="faint">{p.domain}</span>
          </button>
        ))}
        {naming === null ? (
          <button className="nav-item" onClick={() => setNaming('')}><Icon name="plus" /> New project</button>
        ) : (
          <div className="row" style={{ padding: '0.25rem' }}>
            <input className="input grow" autoFocus placeholder="Name" value={naming} onChange={(e) => setNaming(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} />
            {domains.length > 1 ? (
              <select className="input" value={domain} onChange={(e) => setDomain(e.target.value)}>{domains.map((d) => <option key={d}>{d}</option>)}</select>
            ) : null}
            <Button small onClick={create}><Icon name="check" /></Button>
          </div>
        )}
      </aside>

      <main className="main">
        {project ? (
          <>
            <div className="header">
              <h1 className="grow">{project.name}</h1>
              <span className="chip">{project.domain}</span>
              <span className="chip">{project.model}</span>
            </div>
            <div className="tabs">
              {tabs.map((t) => <button key={t} className={`tab${t === tab ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
            </div>
            {tab === 'Studio' ? <Studio project={project} reload={reload} notify={notify} /> : null}
            {tab === 'Lessons' ? <Lessons project={project} /> : null}
            {tab === 'Model' ? <Model project={project} reload={reload} notify={notify} /> : null}
          </>
        ) : <Home projects={projects} open={setCurrent} create={() => setNaming('')} />}
      </main>
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
