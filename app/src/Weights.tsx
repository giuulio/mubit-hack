// The B panel: Mubit trains the weights. Training calls it keeps, adapter versions from its console, and retiring
// B lessons from the context once the adapter holds them without it.
import { useState } from 'react'
import { api, waitFor, type Lesson, type Project } from './api'
import { fmt } from './routes'
import { Button, Glyph, Head, Icon, Stat } from './ui'

type Props = { project: Project; probes: string[]; reload: () => Promise<void>; notify: (text: string) => void }

export function Weights({ project, probes, reload, notify }: Props) {
  const [busy, setBusy] = useState<string | null>(null)
  const [version, setVersion] = useState('')
  const [status, setStatus] = useState('passed')

  const run = async (key: string, fn: () => Promise<unknown>, done: string) => {
    setBusy(key)
    try {
      await fn()
      await reload()
      notify(done)
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setBusy(null)
    }
  }

  const adapter = project.adapters.at(-1)
  const calls = project.training.reduce((n, b) => n + b.calls, 0)
  const valid = project.training.reduce((n, b) => n + b.valid, 0)
  const owned = project.lessons.filter((l) => l.status === 'active' && l.route === 'B')

  return (
    <div className="card stack">
      <Head route="B" title="Weights" sub="Trained by Mubit" />

      <div className="stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Stat label="Kept calls" value={calls} sub={calls ? `${valid}/${calls} valid · trains at 25` : 'trains at 25'} />
        <Stat label="Adapter" value={adapter?.version ?? '—'} sub={adapter ? `${adapter.status} · ${adapter.t.slice(11, 16)}` : 'none yet'} />
      </div>

      <div className="stack" style={{ gap: '0.5rem' }}>
        <div className="row">
          <div className="grow">
            <h3>Training calls</h3>
            <span className="faint">Kept in full; previews and probes are not</span>
          </div>
          <Button small kind="primary" busy={busy === 'train'} onClick={() => run('train', async () => waitFor(await api.train(project.id, 40)), 'Sent')}>
            <Icon name="train" /> Send 40
          </Button>
        </div>
        {project.training.length ? (
          <table>
            <thead><tr><th>Batch</th><th className="r">Calls</th><th className="r">Valid</th><th className="r">Context</th><th className="r">Lessons</th><th>Sent</th></tr></thead>
            <tbody>{project.training.map((b) => (
              <tr key={b.batch}>
                <td>{b.batch}</td><td className="r">{b.calls}</td><td className="r">{b.valid}</td><td className="r">{fmt(b.context_tokens)}</td>
                <td className="r">{b.lessons_in_context?.length ?? '—'}</td><td className="faint">{b.t.slice(11, 16)}</td>
              </tr>
            ))}</tbody>
          </table>
        ) : null}
      </div>

      <div className="stack" style={{ gap: '0.5rem' }}>
        <div>
          <h3>Adapter versions</h3>
          <span className="faint">From the Mubit console</span>
        </div>
        <div className="row">
          <input className="input grow" placeholder="v1" value={version} onChange={(e) => setVersion(e.target.value)} />
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {['training', 'passed', 'below target', 'prompt only', 'failed'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <Button busy={busy === 'adapter'} disabled={!version.trim()} onClick={() => run('adapter', () => api.adapter(project.id, version, status), 'Recorded')}><Icon name="plus" /></Button>
        </div>
        {project.adapters.length ? (
          <table><tbody>{[...project.adapters].reverse().map((a, i) => (
            <tr key={i}><td>{a.version}</td><td>{a.status}</td><td className="faint">{a.t.slice(11, 16)}</td></tr>
          ))}</tbody></table>
        ) : null}
      </div>

      {owned.length ? (
        <div className="stack" style={{ gap: '0.25rem' }}>
          <h3>Retire</h3>
          <span className="faint">Holds in 2 of 3 probes without it → leaves the prompt</span>
          <div>{owned.map((l) => <Absorb key={l.id} project={project} lesson={l} probes={l.probe?.probes ?? probes} notify={notify} reload={reload} />)}</div>
        </div>
      ) : null}
    </div>
  )
}

// Absorption test for a B lesson: adapter outputs from Try models on its probes, without the lesson in context.
function Absorb({ project, lesson, probes, notify, reload }: { project: Project; lesson: Lesson; probes: string[]; notify: (t: string) => void; reload: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [pasted, setPasted] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const example = project.examples.find((e) => e.lesson_id === lesson.id)
  const copy = async (concept: string) => {
    const { message } = await api.message(project.id, concept, 'routed', lesson.id)
    await navigator.clipboard.writeText(message)
    notify('Copied')
  }
  const test = async () => {
    setBusy(true)
    try {
      const result = await api.absorb(project.id, lesson.id, Object.entries(pasted).filter(([, v]) => v.trim()).map(([concept, content]) => ({ concept, content })))
      await reload()
      notify(result.retired ? 'Retired from context' : 'Not absorbed yet')
    } finally {
      setBusy(false)
    }
  }
  const state = !lesson.in_context ? 'retired' : lesson.absorption ? `held ${Math.round(lesson.absorption.share * 100)}%` : 'in prompt'
  return (
    <div className="lesson">
      <div className="row">
        {example ? <Glyph svg={example.content} size="small" title={example.concept} /> : null}
        <span className="grow clamp">{lesson.statement}</span>
        <span className="faint nowrap">{lesson.signals?.tokens ?? '—'} tokens</span>
        <span className="chip">{state}</span>
        {lesson.in_context ? <Button small onClick={() => setOpen(!open)}>Test</Button> : null}
      </div>
      {open ? (
        <div className="stack" style={{ gap: '0.75rem' }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))' }}>
            {probes.map((c) => (
              <div key={c} className="tile" style={{ alignItems: 'stretch' }}>
                <div className="row">
                  <span className="muted grow">{c}</span>
                  <button className="icon-btn" title="Copy message without this lesson" onClick={() => copy(c)}><Icon name="copy" /></button>
                  <Glyph svg={pasted[c]?.includes('<svg') ? pasted[c] : null} size="small" />
                </div>
                <textarea className="input mono" placeholder="SVG from Try models" value={pasted[c] ?? ''} onChange={(e) => setPasted({ ...pasted, [c]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="row"><span className="grow" /><Button kind="primary" busy={busy} onClick={test}><Icon name="check" /> Test</Button></div>
        </div>
      ) : null}
    </div>
  )
}
