// Model: training calls, adapter versions from the Mubit console, adapter outputs from Try models, and performance.
import { useEffect, useState } from 'react'
import { api, waitFor, type Lesson, type Project } from './api'
import { Bars } from './charts'
import { Button, Glyph, Icon, Stat } from './ui'

type Props = { project: Project; reload: () => Promise<void>; notify: (text: string) => void }

export function Model({ project, reload, notify }: Props) {
  const [busy, setBusy] = useState<string | null>(null)
  const [concepts, setConcepts] = useState<{ train: string[]; heldout: string[] }>({ train: [], heldout: [] })
  useEffect(() => { api.concepts(project.id).then(setConcepts).catch(() => undefined) }, [project.id])

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

  const evaluation = project.evals.at(-1)
  const adapter = project.adapters.at(-1)
  const contextTokens = project.context_history.at(-1)?.tokens ?? 0
  const calls = project.training.reduce((n, b) => n + b.calls, 0)
  const toRetire = project.lessons.filter((l) => l.status === 'active' && l.route === 'B' && l.in_context)

  return (
    <div className="stack">
      <div className="stats">
        <Stat label="Context" value={`${contextTokens}`} sub="tokens per call" />
        <Stat label="Training calls" value={calls} sub="25 kept trains an adapter" />
        <Stat label="Adapter" value={adapter ? adapter.version : '—'} sub={adapter?.status ?? 'none yet'} />
        <Stat label="Style" value={evaluation?.rows.find((r) => r.config.startsWith('adapter'))?.style ?? evaluation?.rows.at(-1)?.style ?? '—'} sub="judge score, 1–5" />
      </div>

      <div className="halves">
        <div className="card stack">
          <div className="row">
            <h2 className="grow">Train</h2>
            <Button kind="primary" busy={busy === 'train'} onClick={() => run('train', async () => waitFor(await api.train(project.id, 40)), 'Training calls sent')}>
              <Icon name="train" /> Send 40
            </Button>
          </div>
          {project.training.length ? (
            <table>
              <thead><tr><th>Batch</th><th>Calls</th><th>Valid</th><th>Context</th><th>Sent</th></tr></thead>
              <tbody>{project.training.map((b) => (
                <tr key={b.batch}><td>{b.batch}</td><td>{b.calls}</td><td>{b.valid}</td><td>{b.context_tokens}</td><td className="faint">{b.t.slice(11, 16)}</td></tr>
              ))}</tbody>
            </table>
          ) : <div className="empty">Calls under the current context, recorded for Mubit to train on</div>}
        </div>
        <AdapterLog project={project} run={run} busy={busy} />
      </div>

      <div className="card stack">
        <div className="row">
          <h2 className="grow">Performance</h2>
          {evaluation ? <span className="faint">{evaluation.t.slice(11, 16)} · {evaluation.concepts.length} held-out concepts</span> : null}
          <Button kind="primary" busy={busy === 'eval'} onClick={() => run('eval', async () => waitFor(await api.evaluate(project.id, 12)), 'Evaluation done')}>
            <Icon name="chart" /> Evaluate
          </Button>
        </div>
        {evaluation ? (
          <>
            <table>
              <thead><tr><th>Configuration</th><th>Valid</th><th>Style</th><th>Recognisable</th><th>Input tokens</th><th>Mubit runs</th><th>Seconds</th></tr></thead>
              <tbody>{evaluation.rows.map((r) => (
                <tr key={r.config}>
                  <td>{r.config}</td><td>{r.valid}/{r.n}</td><td>{r.style ?? '—'}</td><td>{r.recognisable ?? '—'}</td>
                  <td>{r.input_tokens ?? '—'}</td><td>{r.runs_per_call ?? '—'}</td><td>{r.seconds ?? '—'}</td>
                </tr>
              ))}</tbody>
            </table>
            <div className="halves">
              <Bars items={evaluation.rows.map((r) => ({ label: r.config, value: r.style }))} max={5} />
              <Bars items={evaluation.rows.map((r) => ({ label: r.config, value: r.input_tokens }))} max={Math.max(...evaluation.rows.map((r) => r.input_tokens ?? 0), 1)} format={(v) => `${Math.round(v)}`} />
            </div>
            {Object.entries(evaluation.outputs).map(([config, outputs]) => (
              <div key={config} className="row" style={{ gap: '0.75rem' }}>
                <span className="faint" style={{ width: '11rem', flex: 'none' }}>{config}</span>
                {outputs.slice(0, 8).map((o, i) => <Glyph key={i} svg={o.content} size="small" />)}
              </div>
            ))}
          </>
        ) : <div className="empty">Frontier, frontier with full context and the routed context on held-out concepts; adapter rows appear after importing its outputs</div>}
      </div>

      <TryModels project={project} concepts={concepts.heldout.slice(0, 12)} notify={notify} reload={reload} />
      {toRetire.map((l) => <Absorb key={l.id} project={project} lesson={l} probes={l.probe?.probes ?? concepts.train.slice(0, 3)} notify={notify} reload={reload} />)}
    </div>
  )
}

function AdapterLog({ project, run, busy }: { project: Project; run: (key: string, fn: () => Promise<unknown>, done: string) => Promise<void>; busy: string | null }) {
  const [version, setVersion] = useState('')
  const [status, setStatus] = useState('passed')
  return (
    <div className="card stack">
      <h2>Adapter</h2>
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
      ) : <div className="empty">Versions from the Mubit console</div>}
    </div>
  )
}

// Paste adapter outputs from Mubit's Try models; they are scored at the next evaluation.
function TryModels({ project, concepts, notify, reload }: { project: Project; concepts: string[]; notify: (t: string) => void; reload: () => Promise<void> }) {
  const [mode, setMode] = useState<'bare' | 'routed'>('bare')
  const config = mode === 'bare' ? 'adapter' : 'adapter + routed context'
  const [pasted, setPasted] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const saved = project.imports[config] ?? []
    setPasted(Object.fromEntries(saved.map((i) => [i.concept, i.content ?? ''])))
  }, [project, config])

  const copy = async (concept: string) => {
    const { message } = await api.message(project.id, concept, mode)
    await navigator.clipboard.writeText(message)
    notify('Message copied')
  }
  const save = async () => {
    setBusy(true)
    try {
      await api.importOutputs(project.id, config, Object.entries(pasted).filter(([, v]) => v.trim()).map(([concept, content]) => ({ concept, content })))
      await reload()
      notify('Adapter outputs saved')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="card stack">
      <div className="row">
        <h2 className="grow">Adapter outputs</h2>
        <div className="seg">
          <button className={mode === 'bare' ? 'on' : ''} onClick={() => setMode('bare')}>No context</button>
          <button className={mode === 'routed' ? 'on' : ''} onClick={() => setMode('routed')}>Routed context</button>
        </div>
        <Button kind="primary" busy={busy} onClick={save}>Save</Button>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))' }}>
        {concepts.map((c) => (
          <div key={c} className="tile" style={{ alignItems: 'stretch' }}>
            <div className="row">
              <span className="muted grow">{c}</span>
              <button className="icon-btn" title="Copy message for Try models" onClick={() => copy(c)}><Icon name="copy" /></button>
              <Glyph svg={pasted[c]?.includes('<svg') ? pasted[c] : null} size="small" />
            </div>
            <textarea className="input mono" placeholder="Paste SVG" value={pasted[c] ?? ''} onChange={(e) => setPasted({ ...pasted, [c]: e.target.value })} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Absorption test for a B lesson: adapter outputs on its probes without the lesson in context.
function Absorb({ project, lesson, probes, notify, reload }: { project: Project; lesson: Lesson; probes: string[]; notify: (t: string) => void; reload: () => Promise<void> }) {
  const [pasted, setPasted] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const copy = async (concept: string) => {
    const { message } = await api.message(project.id, concept, 'routed', lesson.id)
    await navigator.clipboard.writeText(message)
    notify('Message copied')
  }
  const test = async () => {
    setBusy(true)
    try {
      const result = await api.absorb(project.id, lesson.id, Object.entries(pasted).filter(([, v]) => v.trim()).map(([concept, content]) => ({ concept, content })))
      await reload()
      notify(result.retired ? 'Absorbed: removed from context' : 'Not absorbed yet')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="card stack">
      <div className="row">
        <h2 className="grow">Absorbed? <span className="muted">{lesson.statement}</span></h2>
        <Button kind="primary" busy={busy} onClick={test}><Icon name="check" /> Test</Button>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))' }}>
        {probes.map((c) => (
          <div key={c} className="tile" style={{ alignItems: 'stretch' }}>
            <div className="row">
              <span className="muted grow">{c}</span>
              <button className="icon-btn" onClick={() => copy(c)}><Icon name="copy" /></button>
            </div>
            <textarea className="input mono" placeholder="Paste SVG" value={pasted[c] ?? ''} onChange={(e) => setPasted({ ...pasted, [c]: e.target.value })} />
          </div>
        ))}
      </div>
    </div>
  )
}
