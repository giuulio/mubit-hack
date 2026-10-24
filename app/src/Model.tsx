// Model: the slow path, in order. Training calls Mubit keeps, adapter versions from its console, adapter outputs from
// Try models, retiring B lessons the adapter has absorbed, and every configuration compared on held-out concepts.
import { useEffect, useState, type ReactNode } from 'react'
import { api, waitFor, type Lesson, type Project } from './api'
import { fmt } from './routes'
import { Button, Fold, Glyph, Icon, Stat } from './ui'

type Props = { project: Project; reload: () => Promise<void>; notify: (text: string) => void }
type Run = (key: string, fn: () => Promise<unknown>, done: string) => Promise<void>

const FRONTIER = 'claude-opus-5-5' // the frontier model in pipeline.evaluate

function describe(config: string, model: string): [string, string] {
  const labels: Record<string, [string, string]> = {
    frontier: [FRONTIER, 'no context'],
    'frontier + full context': [FRONTIER, 'every lesson in context'],
    'provider + routed context': [model, 'routed context'],
    adapter: ['Mubit adapter', 'no context'],
    'adapter + routed context': ['Mubit adapter', 'routed context'],
  }
  return labels[config] ?? [config, '']
}

const score = (v: number | null) => (v === null ? '—' : v.toFixed(2))

function Step({ n, children }: { n: number; children: ReactNode }) {
  return <h2 className="row grow"><span className="step">{n}</span>{children}</h2>
}

export function Model({ project, reload, notify }: Props) {
  const [busy, setBusy] = useState<string | null>(null)
  const [concepts, setConcepts] = useState<{ train: string[]; heldout: string[] }>({ train: [], heldout: [] })
  useEffect(() => { api.concepts(project.id).then(setConcepts).catch(() => undefined) }, [project.id])

  const run: Run = async (key, fn, done) => {
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
  const rows = evaluation?.rows ?? []
  const best = rows.reduce<(typeof rows)[number] | null>((b, r) => (r.style !== null && (b?.style ?? -1) < r.style ? r : b), null)
  const frontier = rows.find((r) => r.config === 'frontier')
  const adapter = project.adapters.at(-1)
  const total = project.context_history.at(-1)?.tokens ?? 0
  const owned = project.lessons.filter((l) => l.status === 'active' && l.route === 'B')
  const ownedTokens = owned.filter((l) => l.in_context).reduce((n, l) => n + (l.signals?.tokens ?? 0), 0)
  const calls = project.training.reduce((n, b) => n + b.calls, 0)
  const valid = project.training.reduce((n, b) => n + b.valid, 0)

  return (
    <div className="stack">
      <div className="stats">
        <Stat label="Context per call" value={fmt(total)} sub={ownedTokens ? `tokens; ${fmt(total - ownedTokens)} once the adapter owns B` : 'tokens'} />
        <Stat label="Kept for training" value={calls} sub={calls ? `${valid}/${calls} valid; Mubit trains from 25` : 'Mubit trains from 25 kept calls'} />
        <Stat label="Adapter" value={adapter?.version ?? '—'} sub={adapter ? `${adapter.status}, ${adapter.t.slice(11, 16)}` : calls ? 'training on Mubit' : 'none yet'} />
        <Stat label="Style on held-out concepts" value={score(best?.style ?? null)} sub={best && frontier && best !== frontier ? `${describe(best.config, project.model).join(', ')}; frontier ${score(frontier.style)}` : 'blind judge, 1–5'} />
      </div>

      <div className="halves">
        <div className="card stack">
          <div className="row">
            <Step n={1}>Train</Step>
            <Button kind="primary" busy={busy === 'train'} onClick={() => run('train', async () => waitFor(await api.train(project.id, 40)), 'Training calls sent')}>
              <Icon name="train" /> Send 40
            </Button>
          </div>
          <span className="faint">Calls under the approved context, recorded in full so Mubit can keep them. Previews, probes and judges are recorded as metadata only.</span>
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
        <AdapterLog project={project} run={run} busy={busy} />
      </div>

      <TryModels project={project} concepts={concepts.heldout.slice(0, 12)} notify={notify} reload={reload} />

      {owned.length ? (
        <div className="card stack">
          <Step n={4}>Retire</Step>
          <span className="faint">The adapter draws each B lesson's probes without it in context. If it holds in two of three, the lesson leaves the prompt and every call gets cheaper.</span>
          <div>{owned.map((l) => <Absorb key={l.id} project={project} lesson={l} probes={l.probe?.probes ?? concepts.train.slice(0, 3)} notify={notify} reload={reload} />)}</div>
        </div>
      ) : null}

      <div className="card stack">
        <div className="row">
          <Step n={5}>Evaluate</Step>
          {evaluation ? <span className="faint">{evaluation.concepts.length} held-out concepts, never corrected; blind judge; {evaluation.t.slice(11, 16)}</span> : null}
          <Button kind="primary" busy={busy === 'eval'} onClick={() => run('eval', async () => waitFor(await api.evaluate(project.id, 12)), 'Evaluation done')}>
            <Icon name="chart" /> Evaluate
          </Button>
        </div>
        {evaluation ? (
          <table>
            <thead><tr><th>Configuration</th><th>Held-out icons</th><th className="r">Valid</th><th className="r">Style</th><th className="r">Recognisable</th><th className="r">Input tokens</th><th className="r">Seconds</th></tr></thead>
            <tbody>{rows.map((r) => {
              const [name, sub] = describe(r.config, project.model)
              return (
                <tr key={r.config}>
                  <td className="nowrap"><div>{name}</div><div className="faint">{sub}</div></td>
                  <td><div className="row" style={{ gap: '0.25rem' }}>{(evaluation.outputs[r.config] ?? []).slice(0, 8).map((o, i) => <Glyph key={i} svg={o.content} size="small" title={o.concept} />)}</div></td>
                  <td className="r">{r.valid}/{r.n}</td>
                  <td className="r">{r === best ? <b>{score(r.style)}</b> : score(r.style)}</td>
                  <td className="r">{score(r.recognisable)}</td>
                  <td className="r">{r.input_tokens === null ? '—' : fmt(r.input_tokens)}</td>
                  <td className="r">{r.seconds ?? '—'}</td>
                </tr>
              )
            })}</tbody>
          </table>
        ) : <div className="empty">The frontier with no context and with every lesson, against the routed context, on concepts never corrected. Adapter rows appear after importing its outputs.</div>}
      </div>
    </div>
  )
}

function AdapterLog({ project, run, busy }: { project: Project; run: Run; busy: string | null }) {
  const [version, setVersion] = useState('')
  const [status, setStatus] = useState('passed')
  return (
    <div className="card stack">
      <Step n={2}>Adapter</Step>
      <span className="faint">Versions Mubit trains from the kept calls, recorded from its console with their test result.</span>
      <div className="row">
        <input className="input grow" placeholder="Version, e.g. v1" value={version} onChange={(e) => setVersion(e.target.value)} />
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
  const imported = (key: string) => project.imports[key]?.length ?? 0
  return (
    <Fold title={<><span className="step">3</span><h2>Adapter outputs</h2><span className="faint">from Try models, the only place an adapter runs</span></>}
      aside={<span className="faint">{imported('adapter')} without context, {imported('adapter + routed context')} with</span>}>
      <div className="row">
        <span className="faint grow">Copy each held-out message into Try models and paste the SVG it returns.</span>
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
    </Fold>
  )
}

// Absorption test for a B lesson: adapter outputs on its probes without the lesson in context.
function Absorb({ project, lesson, probes, notify, reload }: { project: Project; lesson: Lesson; probes: string[]; notify: (t: string) => void; reload: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [pasted, setPasted] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const example = project.examples.find((e) => e.lesson_id === lesson.id)
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
  const state = !lesson.in_context ? 'retired' : lesson.absorption ? `held in ${Math.round(lesson.absorption.share * 100)}%` : 'in prompt'
  return (
    <div className="lesson">
      <div className="row">
        {example ? <Glyph svg={example.content} size="small" title={example.concept} /> : null}
        <span className="grow clamp" style={{ fontSize: 'var(--sm)' }}>{lesson.statement}</span>
        <span className="faint nowrap">{lesson.signals?.tokens ?? '—'} tokens</span>
        <span className="chip">{state}</span>
        {lesson.in_context ? <Button small onClick={() => setOpen(!open)}>Test</Button> : null}
      </div>
      {open ? (
        <div className="stack" style={{ gap: '0.75rem' }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))' }}>
            {probes.map((c) => (
              <div key={c} className="tile" style={{ alignItems: 'stretch' }}>
                <div className="row">
                  <span className="muted grow">{c}</span>
                  <button className="icon-btn" title="Copy message without this lesson" onClick={() => copy(c)}><Icon name="copy" /></button>
                  <Glyph svg={pasted[c]?.includes('<svg') ? pasted[c] : null} size="small" />
                </div>
                <textarea className="input mono" placeholder="Paste SVG" value={pasted[c] ?? ''} onChange={(e) => setPasted({ ...pasted, [c]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="row"><span className="grow" /><Button kind="primary" busy={busy} onClick={test}><Icon name="check" /> Test absorption</Button></div>
        </div>
      ) : null}
    </div>
  )
}
