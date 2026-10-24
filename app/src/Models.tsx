// Managing models and their contexts. A model's name is part of its fixed system prompt, so it is its Mubit task and
// cannot change; its display name and its contexts' names are in no prompt, so they can. Archiving hides a model or a context and keeps everything:
// the files are shared in git, and the Mubit task and kept calls live on Mubit, which has no delete API.
import { useState } from 'react'
import { api, type Project } from './api'
import { clock, labelOf } from './routes'
import { Button, Dot, Icon, Sheet } from './ui'

type Notify = (text: string) => void
const message = (e: unknown) => String(e instanceof Error ? e.message : e)

export function NewModel({ domains, close, created, notify }: { domains: string[]; close: () => void; created: (id: string, cid: string) => void; notify: Notify }) {
  const [name, setName] = useState('')
  const [context, setContext] = useState('')
  const [domain, setDomain] = useState(domains[0] ?? 'icons')
  const [busy, setBusy] = useState(false)
  const ready = name.trim() && context.trim()
  const create = async () => {
    if (!ready) return
    setBusy(true)
    try {
      const p = await api.create(name.trim(), domain, context.trim())
      created(p.id, p.contexts[0].id)
    } catch (e) {
      notify(message(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Sheet title="New model" close={close}>
      <div className="form" onKeyDown={(e) => e.key === 'Enter' && create()}>
        <label>
          <span>Name</span>
          <input className="input" autoFocus placeholder="Icon Master" value={name} onChange={(e) => setName(e.target.value)} />
          <small className="faint">Rename it any time; its Mubit task keeps this first name</small>
        </label>
        <label>
          <span>First context</span>
          <input className="input" placeholder="Smooth" value={context} onChange={(e) => setContext(e.target.value)} />
          <small className="faint">A look the model serves; add more later, all sharing its weights</small>
        </label>
        {domains.length > 1 ? (
          <label>
            <span>Domain</span>
            <select className="input" value={domain} onChange={(e) => setDomain(e.target.value)}>{domains.map((d) => <option key={d}>{d}</option>)}</select>
          </label>
        ) : null}
        <div className="row end"><Button onClick={close}>Cancel</Button><Button kind="primary" busy={busy} disabled={!ready} onClick={create}>Create</Button></div>
      </div>
    </Sheet>
  )
}

export function ModelSettings({ project, close, reload, notify, archived }: { project: Project; close: () => void; reload: () => Promise<void>; notify: Notify; archived: () => void }) {
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  const [label, setLabel] = useState(labelOf(project))
  const [confirming, setConfirming] = useState(false)
  const kept = project.training.reduce((n, b) => n + b.calls, 0)
  const adapter = project.adapters.at(-1)
  const inUse = project.contexts.filter((c) => !c.archived).length

  const act = async (fn: () => Promise<unknown>, done?: string) => {
    try {
      await fn()
      await reload()
      if (done) notify(done)
    } catch (e) {
      notify(message(e))
    }
  }
  const rename = () => renaming?.name.trim() && act(() => api.editContext(project.id, renaming.id, { name: renaming.name.trim() })).then(() => setRenaming(null))

  return (
    <Sheet title={labelOf(project)} close={close}>
      <div className="stack" style={{ gap: '1.5rem' }}>
        <div className="form">
          <label>
            <span>Name</span>
            <div className="row">
              <input className="input grow" value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && label.trim() && act(() => api.setLabel(project.id, label), 'Renamed')} />
              <Button disabled={!label.trim() || label.trim() === labelOf(project)} onClick={() => act(() => api.setLabel(project.id, label), 'Renamed')}>Save</Button>
            </div>
            <small className="faint"><Icon name="lock" size={12} /> Mubit task: {project.name}. It is in the system prompt, so it never changes</small>
          </label>
        </div>
        <div className="facts">
          <span><span className="faint">Domain</span>{project.domain}</span>
          <span><span className="faint">Provider</span>{project.model}</span>
          <span><span className="faint">Kept calls</span>{kept}</span>
          <span><span className="faint">Adapter</span>{adapter ? `${adapter.version} · ${adapter.status}` : '—'}</span>
        </div>

        <div className="stack" style={{ gap: '0.25rem' }}>
          <h3>Contexts</h3>
          {project.contexts.map((c) => (
            <div key={c.id} className={`setting-row${c.archived ? ' archived' : ''}`}>
              <Dot route={c.archived ? null : 'A'} />
              {renaming?.id === c.id ? (
                <input className="input grow small" autoFocus value={renaming.name} onChange={(e) => setRenaming({ id: c.id, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') rename(); if (e.key === 'Escape') setRenaming(null) }} />
              ) : <span className="grow">{c.name}</span>}
              <span className="faint">{project.lessons.filter((l) => l.context === c.id && l.status === 'active').length} lessons</span>
              {c.archived ? (
                <Button small onClick={() => act(() => api.editContext(project.id, c.id, { archived: false }), `${c.name} restored`)}>Restore</Button>
              ) : renaming?.id === c.id ? (
                <Button small kind="primary" onClick={rename}><Icon name="check" /></Button>
              ) : (
                <>
                  <Button small onClick={() => setRenaming({ id: c.id, name: c.name })}>Rename</Button>
                  <Button small disabled={inUse <= 1} tip={inUse <= 1 ? 'A model keeps at least one context' : 'Hide it; its lessons and outputs stay'}
                    onClick={() => act(() => api.editContext(project.id, c.id, { archived: true }), `${c.name} archived`)}>Archive</Button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="danger">
          {confirming ? (
            <>
              <span className="grow">Archive {labelOf(project)}? It leaves the sidebar; its file, Mubit task and {kept} kept calls stay.</span>
              <Button small onClick={() => setConfirming(false)}>Cancel</Button>
              <Button small kind="primary" onClick={() => act(() => api.archive(project.id, true), `${labelOf(project)} archived`).then(archived)}>Archive</Button>
            </>
          ) : (
            <>
              <span className="grow faint">Created {project.created?.slice(0, 10)} · {clock(project.created)}</span>
              <Button small onClick={() => setConfirming(true)}>Archive model</Button>
            </>
          )}
        </div>
      </div>
    </Sheet>
  )
}
