// The operator drawer: the hand-driven steps behind the demo, kept off camera. Sending training calls, recording adapter
// versions from the Mubit console, and pasting adapter outputs from Try models, since adapters cannot be called by model ID.
import { useEffect, useState } from 'react'
import { api, waitFor, type Lesson, type Project } from './api'
import { clock, fmt } from './routes'
import { Button, Fold, Glyph, Icon } from './ui'

type Props = { project: Project; reload: () => Promise<void>; notify: (text: string) => void; close: () => void }

const copyMessage = async (project: Project, concept: string, mode: 'bare' | 'routed', notify: (t: string) => void, without?: string) => {
  const { message } = await api.message(project.id, concept, mode, without)
  await navigator.clipboard.writeText(message)
  notify('Copied')
}

export function Operator({ project, reload, notify, close }: Props) {
  const [busy, setBusy] = useState<string | null>(null)
  const [version, setVersion] = useState('')
  const [status, setStatus] = useState('passed')
  const [probes, setProbes] = useState<string[]>([])
  useEffect(() => { api.concepts(project.id).then((c) => setProbes(c.train.slice(0, 3))).catch(() => undefined) }, [project.id])

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

  const owned = project.lessons.filter((l) => l.status === 'active' && l.route === 'B')
  const comparison = project.comparisons?.at(-1)

  return (
    <aside className="drawer">
      <div className="row">
        <h2 className="grow">Operator</h2>
        <span className="faint">O</span>
        <button className="icon-btn" aria-label="Close" onClick={close}><Icon name="close" /></button>
      </div>

      <Fold title="Training calls" open aside={<span className="faint">{project.training.reduce((n, b) => n + b.calls, 0)} kept</span>}>
        <div className="row">
          <span className="faint grow">Kept in full under the approved context</span>
          <Button small kind="primary" busy={busy === 'train'} onClick={() => run('train', async () => waitFor(await api.train(project.id, 40)), 'Sent')}>
            <Icon name="train" /> Send 40
          </Button>
        </div>
        {project.training.length ? (
          <table>
            <thead><tr><th>Batch</th><th className="r">Calls</th><th className="r">Valid</th><th className="r">Context</th><th>Sent</th></tr></thead>
            <tbody>{project.training.map((b) => (
              <tr key={b.batch}><td>{b.batch}</td><td className="r">{b.calls}</td><td className="r">{b.valid}</td><td className="r">{fmt(b.context_tokens)}</td><td className="faint">{clock(b.t)}</td></tr>
            ))}</tbody>
          </table>
        ) : null}
      </Fold>

      <Fold title="Adapter version" aside={<span className="faint">{project.adapters.at(-1)?.version ?? 'none'}</span>}>
        <div className="row">
          <input className="input grow" placeholder="v1" value={version} onChange={(e) => setVersion(e.target.value)} />
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {['training', 'passed', 'below target', 'prompt only', 'failed'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <Button busy={busy === 'adapter'} disabled={!version.trim()} onClick={() => run('adapter', () => api.adapter(project.id, version, status), 'Recorded')}><Icon name="plus" /></Button>
        </div>
        {project.adapters.length ? (
          <table><tbody>{[...project.adapters].reverse().map((a, i) => (
            <tr key={i}><td>{a.version}</td><td>{a.status}</td><td className="faint">{clock(a.t)}</td></tr>
          ))}</tbody></table>
        ) : null}
      </Fold>

      {owned.length ? (
        <Fold title="Retire" aside={<span className="faint">holds in 2 of 3 → leaves the prompt</span>}>
          {owned.map((l) => <Absorb key={l.id} project={project} lesson={l} probes={l.probe?.probes ?? probes} notify={notify} reload={reload} />)}
        </Fold>
      ) : null}

      {comparison ? <ComparePaste key={comparison.id} project={project} notify={notify} reload={reload} /> : null}

      <HeldOut project={project} reload={reload} notify={notify} />
    </aside>
  )
}

// Absorption test for a Weights lesson: adapter outputs from Try models on its probes, without the lesson in context.
function Absorb({ project, lesson, probes, notify, reload }: { project: Project; lesson: Lesson; probes: string[]; notify: (t: string) => void; reload: () => Promise<void> }) {
  const [pasted, setPasted] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const example = project.examples.find((e) => e.lesson_id === lesson.id)
  const test = async () => {
    setBusy(true)
    try {
      const result = await api.absorb(project.id, lesson.id, Object.entries(pasted).filter(([, v]) => v.trim()).map(([concept, content]) => ({ concept, content })))
      await reload()
      notify(result.retired ? 'Retired from context' : 'Not absorbed yet')
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="stack" style={{ gap: '0.5rem' }}>
      <div className="row">
        {example ? <Glyph svg={example.content} size="small" title={example.concept} /> : null}
        <span className="grow clamp">{lesson.statement}</span>
        <span className="chip">{!lesson.in_context ? 'retired' : lesson.absorption ? `held ${Math.round(lesson.absorption.share * 100)}%` : 'in prompt'}</span>
      </div>
      {lesson.in_context ? (
        <>
          <Pastes concepts={probes} pasted={pasted} setPasted={setPasted} copy={(c) => copyMessage(project, c, 'routed', notify, lesson.id)} />
          <div className="row"><span className="grow" /><Button small kind="primary" busy={busy} onClick={test}><Icon name="check" /> Test</Button></div>
        </>
      ) : null}
    </div>
  )
}

// The adapter's answer for the latest comparison on Results.
function ComparePaste({ project, notify, reload }: { project: Project; notify: (t: string) => void; reload: () => Promise<void> }) {
  const comparison = project.comparisons!.at(-1)!
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    try {
      await api.compareAdapter(project.id, comparison.id, text)
      await reload()
      setText('')
      notify('Added')
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setBusy(false)
    }
  }
  const done = Boolean(comparison.outputs.adapter)
  return (
    <Fold title={`Compare: ${comparison.concept}`} aside={<span className="faint">{done ? 'adapter added' : 'adapter missing'}</span>}>
      <Pastes concepts={[comparison.concept]} pasted={{ [comparison.concept]: text }} setPasted={(p) => setText(p[comparison.concept] ?? '')}
        copy={(c) => copyMessage(project, c, 'bare', notify)} />
      <div className="row"><span className="grow" /><Button small kind="primary" busy={busy} disabled={!text.includes('<svg')} onClick={save}>Add</Button></div>
    </Fold>
  )
}

// Adapter outputs for the held-out set, pasted from Try models; they are scored at the next evaluation.
function HeldOut({ project, reload, notify }: { project: Project; reload: () => Promise<void>; notify: (t: string) => void }) {
  const [concepts, setConcepts] = useState<string[]>([])
  const [mode, setMode] = useState<'bare' | 'routed'>('bare')
  const config = mode === 'bare' ? 'adapter' : 'adapter + routed context'
  const saved = JSON.stringify(project.imports[config] ?? [])
  const fields = (json: string) => Object.fromEntries((JSON.parse(json) as { concept: string; content: string | null }[]).map((i) => [i.concept, i.content ?? '']))
  const [pasted, setPasted] = useState<Record<string, string>>(() => fields(saved))
  const [shown, setShown] = useState(saved)
  const [busy, setBusy] = useState(false)
  useEffect(() => { api.concepts(project.id).then((c) => setConcepts(c.heldout.slice(0, 12))).catch(() => undefined) }, [project.id])
  // Reset the fields only when the saved imports change, so polling never clears what is being typed.
  if (shown !== saved) {
    setShown(saved)
    setPasted(fields(saved))
  }

  const save = async () => {
    setBusy(true)
    try {
      await api.importOutputs(project.id, config, Object.entries(pasted).filter(([, v]) => v.trim()).map(([concept, content]) => ({ concept, content })))
      await reload()
      notify('Saved')
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setBusy(false)
    }
  }
  const imported = (key: string) => project.imports[key]?.length ?? 0
  return (
    <Fold title="Held-out adapter outputs" aside={<span className="faint">{imported('adapter')} bare · {imported('adapter + routed context')} routed</span>}>
      <div className="row">
        <div className="seg">
          <button className={mode === 'bare' ? 'on' : ''} onClick={() => setMode('bare')}>No context</button>
          <button className={mode === 'routed' ? 'on' : ''} onClick={() => setMode('routed')}>Routed context</button>
        </div>
        <span className="grow" />
        <Button small kind="primary" busy={busy} onClick={save}>Save</Button>
      </div>
      <Pastes concepts={concepts} pasted={pasted} setPasted={setPasted} copy={(c) => copyMessage(project, c, mode, notify)} />
    </Fold>
  )
}

// One field per concept: copy the message for Try models, paste the SVG it returns, see it drawn.
function Pastes({ concepts, pasted, setPasted, copy }: { concepts: string[]; pasted: Record<string, string>; setPasted: (p: Record<string, string>) => void; copy: (concept: string) => void }) {
  return (
    <div className="stack" style={{ gap: '0.5rem' }}>
      {concepts.map((c) => (
        <div key={c} className="paste">
          <div className="row">
            <span className="muted grow">{c}</span>
            <button className="icon-btn" data-tip="Copy message for Try models" aria-label="Copy message for Try models" onClick={() => copy(c)}><Icon name="copy" /></button>
            <Glyph svg={pasted[c]?.includes('<svg') ? pasted[c] : null} size="small" />
          </div>
          <textarea className="input mono" placeholder="SVG from Try models" value={pasted[c] ?? ''} onChange={(e) => setPasted({ ...pasted, [c]: e.target.value })} />
        </div>
      ))}
    </div>
  )
}
