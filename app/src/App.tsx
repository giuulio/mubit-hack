// Shell: Hone is the platform; it holds projects, and each project has three pages that follow the architecture.
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, type Project, type ProjectSummary } from './api'
import { Home } from './Home'
import { Input } from './Input'
import { Results } from './Results'
import { Routing } from './Routing'
import { go, pages, readPlace, type Place } from './routes'
import { Button, Icon } from './ui'

export default function App() {
  const [place, setPlace] = useState<Place>(readPlace)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [naming, setNaming] = useState<string | null>(null)
  const [domains, setDomains] = useState<string[]>(['icons'])
  const [domain, setDomain] = useState('icons')
  const main = useRef<HTMLElement>(null)

  const notify = useCallback((text: string) => {
    setToast(text)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const loadProjects = useCallback(async () => setProjects(await api.projects()), [])

  const reload = useCallback(async () => {
    if (place.project) setProject(await api.project(place.project))
    await loadProjects()
  }, [place.project, loadProjects])

  useEffect(() => {
    const onHash = () => setPlace(readPlace())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  // A new page starts at the top; a lesson link scrolls to its lesson instead (Routing).
  useEffect(() => { if (!place.lesson) main.current?.scrollTo(0, 0) }, [place.project, place.page, place.lesson])
  useEffect(() => { loadProjects().catch((e) => notify(String(e))) }, [loadProjects, notify])
  useEffect(() => { api.domains().then(setDomains).catch(() => undefined) }, [])
  useEffect(() => {
    if (place.project) api.project(place.project).then(setProject).catch((e) => notify(String(e)))
  }, [place.project, notify])

  const create = async () => {
    if (!naming?.trim()) return
    try {
      const p = await api.create(naming.trim(), domain)
      setNaming(null)
      await loadProjects()
      go(p.id)
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    }
  }

  const page = pages.find((p) => p.id === place.page) ?? pages[0]
  const open = project && project.id === place.project ? project : null

  return (
    <div className="shell">
      <aside className="sidebar">
        <button className={`brand nav-item${place.project === null ? ' active' : ''}`} onClick={() => go(null)}><Icon name="layers" size={20} /> Hone</button>

        <span className="nav-label">Projects</span>
        {projects.map((p) => (
          <div key={p.id} className="stack" style={{ gap: '0.125rem' }}>
            <button className={`nav-item${p.id === place.project ? ' current' : ''}`} onClick={() => go(p.id)}>
              <Icon name="project" />
              <span className="grow">{p.name}</span>
              <span className="faint">{p.domain}</span>
            </button>
            {p.id === place.project ? (
              <div className="nav-pages">
                {pages.map((pg, i) => (
                  <button key={pg.id} className={`nav-item${pg.id === place.page ? ' active' : ''}`} onClick={() => go(p.id, pg.id)}>
                    <span className="step">{i + 1}</span>{pg.title}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
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

        <span className="grow" />
        <span className="faint" style={{ padding: '0 0.5rem' }}>Runs on Mubit</span>
      </aside>

      <main className="main" ref={main}>
        {open ? (
          <>
            <div className="header">
              <div className="grow stack" style={{ gap: '0.25rem' }}>
                <div className="row faint">
                  <button className="crumb" onClick={() => go(null)}>Projects</button>/
                  <button className="crumb" onClick={() => go(open.id)}>{open.name}</button>/
                  <span>{page.title}</span>
                </div>
                <h1>{page.title}</h1>
                <p className="lede">{page.text}</p>
              </div>
              <span className="chip">{open.domain} plugin</span>
              <span className="chip">{open.model} via Mubit</span>
            </div>
            {page.id === 'input' ? <Input project={open} reload={reload} notify={notify} /> : null}
            {page.id === 'routing' ? <Routing key={place.lesson ?? ''} project={open} focus={place.lesson} reload={reload} notify={notify} /> : null}
            {page.id === 'results' ? <Results project={open} reload={reload} notify={notify} /> : null}
          </>
        ) : place.project ? null : <Home projects={projects} />}
      </main>
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
