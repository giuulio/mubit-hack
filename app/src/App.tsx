// Shell: Hone is the platform. It holds models, each one Mubit task with its fine-tuned adapter; a model holds contexts
// that share its weights (smooth, sharp, pixel icons). Each context has the Loop, where feedback is routed, and Results.
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, type Project, type ProjectSummary } from './api'
import { Home } from './Home'
import { Loop } from './Loop'
import { ModelSettings, NewModel } from './Models'
import { MubitStrip } from './Mubit'
import { Operator } from './Operator'
import { Results } from './Results'
import { go, live, pages, readPlace, view, type Place } from './routes'
import { applyTheme, type Theme } from './theme'
import { Button, Dot, Icon } from './ui'

// How often the open model is refetched, so the Mubit strip follows changes made elsewhere (CLI, teammates).
const POLL_MS = 4000

export default function App() {
  const [place, setPlace] = useState<Place>(readPlace)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [settings, setSettings] = useState(false)
  const [newContext, setNewContext] = useState<string | null>(null)
  const [domains, setDomains] = useState<string[]>(['icons'])
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
  // The model list also refreshes on every change of model, so models created from the CLI or by teammates appear.
  useEffect(() => { loadProjects().catch((e) => notify(String(e))) }, [loadProjects, notify, place.project])
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

  const open = project && project.id === place.project ? project : null
  const current = open ? view(open, place.context) : null
  const models = projects.filter((p) => !p.archived)
  const archived = projects.filter((p) => p.archived)

  const addContext = async () => {
    if (!open || !newContext?.trim()) return
    try {
      const c = await api.addContext(open.id, newContext.trim())
      setNewContext(null)
      await reload()
      go(open.id, c.id)
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    }
  }

  const restore = async (id: string) => {
    try {
      await api.archive(id, false)
      await loadProjects()
      go(id)
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => go(null)}><span className="mark"><Icon name="layers" size={15} /></span><span className="wordmark">Hone</span></button>

        <div className="row nav-label"><span className="grow">Models</span><button className="icon-btn tiny" aria-label="New model" data-tip="New model" onClick={() => setCreating(true)}><Icon name="plus" size={14} /></button></div>
        {models.map((p) => (
          <div key={p.id} className="stack" style={{ gap: '0.125rem' }}>
            <div className="nav-row">
              <button className={`nav-item grow${p.id === place.project ? ' current' : ''}`} onClick={() => go(p.id)}>
                <Icon name="model" size={15} />
                <span className="grow">{p.name}</span>
              </button>
              {p.id === place.project ? <button className="icon-btn tiny" aria-label="Model settings" data-tip="Model settings" onClick={() => setSettings(true)}><Icon name="operator" size={14} /></button> : null}
            </div>
            {p.id === place.project && open && current ? (
              <div className="nav-pages">
                {live(open).map((c) => (
                  <button key={c.id} className={`nav-item${c.id === current.cid ? ' active' : ''}`} onClick={() => go(open.id, c.id, place.page)}><Dot route="A" />{c.name}</button>
                ))}
                {newContext === null ? (
                  <button className="nav-item faint-item" onClick={() => setNewContext('')} data-tip="A new look on the same model: shares its weights, starts with its model-wide lessons"><Icon name="plus" size={14} /> Context</button>
                ) : (
                  <div className="row" style={{ padding: '0.125rem 0' }}>
                    <input className="input grow small" autoFocus placeholder="Sharp" value={newContext} onChange={(e) => setNewContext(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addContext(); if (e.key === 'Escape') setNewContext(null) }} />
                    <Button small onClick={addContext}><Icon name="check" /></Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ))}
        {!models.length ? <button className="nav-item faint-item" onClick={() => setCreating(true)}><Icon name="plus" /> New model</button> : null}

        <span className="grow" />
        {archived.length ? (
          <details className="archived-list">
            <summary className="nav-item faint-item"><span className="grow">Archived</span><span>{archived.length}</span></summary>
            {archived.map((p) => (
              <div key={p.id} className="row nav-row" style={{ paddingLeft: '0.5rem' }}>
                <span className="grow faint">{p.name}</span>
                <button className="btn small light" onClick={() => restore(p.id)}>Restore</button>
              </div>
            ))}
          </details>
        ) : null}
        {open ? <button className={`nav-item faint-item${operator ? ' active' : ''}`} onClick={() => setOperator(!operator)}><Icon name="operator" size={15} /> <span className="grow">Operator</span><kbd>O</kbd></button> : null}
      </aside>

      <main className="main" ref={main}>
        <div className={`topbar${current ? '' : ' bare'}`}>
          {current ? (
            <h1 className="title">
              <button className="model-name" onClick={() => setSettings(true)} data-tip="Model settings">{current.name}</button>
              <span className="slash">/</span>
              <span className="ink-context">{current.contextName}</span>
            </h1>
          ) : null}
          {current ? (
            <nav className="tabs">
              {pages.map((pg) => (
                <button key={pg.id} className={pg.id === place.page ? 'on' : ''} onClick={() => go(current.id, current.cid, pg.id)}><Icon name={pg.icon} size={15} />{pg.title}</button>
              ))}
            </nav>
          ) : null}
          {current ? <MubitStrip project={current.whole} /> : null}
          <button className="icon-btn theme" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Day' : 'Night'} data-tip={theme === 'dark' ? 'Day' : 'Night'}>
            <Icon name={theme === 'dark' ? 'day' : 'night'} />
          </button>
        </div>
        {current ? (
          <>
            {place.page === 'loop' ? <Loop key={`${current.id}/${current.cid}`} project={current} reload={reload} notify={notify} /> : null}
            {place.page === 'results' ? <Results key={`${current.id}/${current.cid}`} project={current} reload={reload} notify={notify} /> : null}
          </>
        ) : place.project ? null : <Home projects={models} create={() => setCreating(true)} />}
      </main>
      {current && operator ? <Operator project={current} reload={reload} notify={notify} close={() => setOperator(false)} /> : null}
      {creating ? (
        <NewModel domains={domains} notify={notify} close={() => setCreating(false)}
          created={async (id, cid) => { setCreating(false); await loadProjects(); go(id, cid) }} />
      ) : null}
      {open && settings ? (
        <ModelSettings project={open} reload={reload} notify={notify} close={() => setSettings(false)}
          archived={() => { setSettings(false); go(null) }} />
      ) : null}
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
