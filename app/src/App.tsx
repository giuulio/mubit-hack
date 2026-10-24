// Shell: Hone is the platform. It holds models, each a fine-tuned Mubit adapter; a model holds contexts that share its
// weights (smooth, sharp, pixel icons). Each context has the Loop, where feedback is routed, and Results.
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, type Project, type ProjectSummary } from './api'
import { Home } from './Home'
import { Loop } from './Loop'
import { MubitStrip } from './Mubit'
import { Operator } from './Operator'
import { Results } from './Results'
import { contextName, go, pages, readPlace, type Place } from './routes'
import { applyTheme, type Theme } from './theme'
import { Button, Dot, Icon } from './ui'

// How often the open model is refetched, so the Mubit strip follows changes made elsewhere (CLI, teammates).
const POLL_MS = 4000

export default function App() {
  const [place, setPlace] = useState<Place>(readPlace)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [naming, setNaming] = useState<string | null>(null)
  const [domains, setDomains] = useState<string[]>(['icons'])
  const [domain, setDomain] = useState('icons')
  const [operator, setOperator] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme as Theme) ?? 'light')
  const main = useRef<HTMLElement>(null)
  const last = useRef('')

  const notify = useCallback((text: string) => {
    setToast(text)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const loadProjects = useCallback(async () => setProjects(await api.projects()), [])

  // Replace the project only when it changed, so polling does not re-render the page every few seconds.
  const fetchProject = useCallback(async (id: string) => {
    const next = await api.project(id)
    const text = JSON.stringify(next)
    if (text !== last.current) {
      last.current = text
      setProject(next)
    }
  }, [])

  const reload = useCallback(async () => {
    if (place.project) await fetchProject(place.project)
    await loadProjects()
  }, [place.project, fetchProject, loadProjects])

  useEffect(() => {
    const onHash = () => setPlace(readPlace())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => { main.current?.scrollTo(0, 0) }, [place.project, place.page])
  useEffect(() => { loadProjects().catch((e) => notify(String(e))) }, [loadProjects, notify])
  useEffect(() => { api.domains().then(setDomains).catch(() => undefined) }, [])
  useEffect(() => {
    if (!place.project) return
    const id = place.project
    fetchProject(id).catch((e) => notify(String(e)))
    const timer = setInterval(() => fetchProject(id).catch(() => undefined), POLL_MS)
    return () => clearInterval(timer)
  }, [place.project, fetchProject, notify])

  // O toggles the operator drawer, Escape closes it; typing in a field never does.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
      if (e.key === 'Escape') setOperator(false)
      else if (!typing && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === 'o') setOperator((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

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

  const open = project && project.id === place.project ? project : null

  return (
    <div className="shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => go(null)}><span className="mark"><Icon name="layers" size={15} /></span><span className="wordmark">Hone</span></button>

        <span className="nav-label">Models</span>
        {projects.map((p) => (
          <div key={p.id} className="stack" style={{ gap: '0.125rem' }}>
            <button className={`nav-item${p.id === place.project ? ' current' : ''}`} onClick={() => go(p.id)}>
              <Icon name="model" size={15} />
              <span className="grow">{p.name}</span>
            </button>
            {p.id === place.project && open ? (
              <div className="nav-pages">
                <button className="nav-item active" onClick={() => go(p.id)}><Dot route="A" />{contextName(open)}</button>
                <button className="nav-item faint-item" disabled data-tip="More contexts per model arrive with the backend pass"><Icon name="plus" size={14} /> Context</button>
              </div>
            ) : null}
          </div>
        ))}
        {naming === null ? (
          <button className="nav-item faint-item" onClick={() => setNaming('')}><Icon name="plus" /> New model</button>
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
        {open ? <button className={`nav-item faint-item${operator ? ' active' : ''}`} onClick={() => setOperator(!operator)}><Icon name="operator" size={15} /> <span className="grow">Operator</span><kbd>O</kbd></button> : null}
      </aside>

      <main className="main" ref={main}>
        <div className="topbar">
          <div className="topbar-side">
            {open ? <h1 className="title"><span className="model-name">{open.name}</span><span className="slash">/</span><span className="ink-context">{contextName(open)}</span></h1> : null}
          </div>
          {open ? (
            <nav className="tabs">
              {pages.map((pg) => (
                <button key={pg.id} className={pg.id === place.page ? 'on' : ''} onClick={() => go(open.id, pg.id)}><Icon name={pg.icon} size={15} />{pg.title}</button>
              ))}
            </nav>
          ) : null}
          <div className="topbar-side end">
            {open ? <MubitStrip project={open} /> : null}
            <button className="icon-btn theme" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Day' : 'Night'} data-tip={theme === 'dark' ? 'Day' : 'Night'}>
              <Icon name={theme === 'dark' ? 'day' : 'night'} />
            </button>
          </div>
        </div>
        {open ? (
          <>
            {place.page === 'loop' ? <Loop key={open.id} project={open} focus={place.lesson} reload={reload} notify={notify} /> : null}
            {place.page === 'results' ? <Results project={open} reload={reload} notify={notify} /> : null}
          </>
        ) : place.project ? null : <Home projects={projects} />}
      </main>
      {open && operator ? <Operator project={open} reload={reload} notify={notify} close={() => setOperator(false)} /> : null}
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
