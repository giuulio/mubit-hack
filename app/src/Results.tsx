// Results: one concept through every configuration side by side, then the held-out evaluation. Adapters run only in
// Mubit's Try models, so their outputs are pasted in from there.
import { useEffect, useState } from 'react'
import { api, waitFor, type Comparison, type EvalRow, type Project } from './api'
import { describe, fmt } from './routes'
import { Button, Fold, Glyph, Icon } from './ui'

type Props = { project: Project; reload: () => Promise<void>; notify: (text: string) => void }

const columns = ['frontier', 'frontier + full context', 'provider + routed context', 'adapter']
const score = (v: number | null) => (v === null ? '—' : v.toFixed(2))

const copyMessage = async (project: Project, concept: string, mode: 'bare' | 'routed', notify: (t: string) => void) => {
  const { message } = await api.message(project.id, concept, mode)
  await navigator.clipboard.writeText(message)
  notify('Message copied: paste it into Try models')
}

export function Results({ project, reload, notify }: Props) {
  return (
    <div className="stack">
      <Compare project={project} reload={reload} notify={notify} />
      <Evaluation project={project} reload={reload} notify={notify} />
      <TryModels project={project} reload={reload} notify={notify} />
    </div>
  )
}

function Compare({ project, reload, notify }: Props) {
  const [concept, setConcept] = useState('')
  const [busy, setBusy] = useState(false)
  const [latest, ...earlier] = [...(project.comparisons ?? [])].reverse()
  const submit = async () => {
    if (!concept.trim()) return
    setBusy(true)
    try {
      await api.compare(project.id, concept)
      setConcept('')
      await reload()
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="card stack">
      <div className="row">
        <h2 className="grow">Prompt a bespoke icon</h2>
        <span className="faint">every configuration on one concept; nothing here is kept for training</span>
      </div>
      <div className="row">
        <input className="input grow" placeholder="Any concept: heat pump, sourdough starter, tide chart…" value={concept} onChange={(e) => setConcept(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <Button kind="primary" busy={busy} disabled={!concept.trim()} onClick={submit}><Icon name="generate" /> Compare</Button>
      </div>
      {latest ? <Row key={latest.id} project={project} comparison={latest} reload={reload} notify={notify} /> : (
        <div className="empty">Name a concept the project has never seen. The raw frontier, the frontier with every lesson, the routed context and the fine-tuned adapter draw it side by side.</div>
      )}
      {earlier.length ? (
        <table>
          <thead><tr><th>Earlier</th>{columns.map((c) => <th key={c}>{describe(c).title}</th>)}<th /></tr></thead>
          <tbody>{earlier.slice(0, 5).map((c) => (
            <tr key={c.id}>
              <td>{c.concept}</td>
              {columns.map((config) => <td key={config}><Glyph svg={c.outputs[config]?.content ?? null} size="small" title={`${c.concept}, ${describe(config).title}`} /></td>)}
              <td className="faint r">{c.t.slice(11, 16)}</td>
            </tr>
          ))}</tbody>
        </table>
      ) : null}
    </div>
  )
}

function Row({ project, comparison, reload, notify }: Props & { comparison: Comparison }) {
  return (
    <div className="stack" style={{ gap: '0.5rem' }}>
      <div className="row"><b className="display grow">{comparison.concept}</b><span className="faint">{comparison.t.slice(11, 16)}</span></div>
      <div className="compare">
        {columns.map((config) => {
          const out = comparison.outputs[config]
          const label = describe(config, out?.model ?? (config === 'provider + routed context' ? project.model : undefined))
          if (!out && config === 'adapter') return <AdapterCell key={config} project={project} comparison={comparison} label={label} reload={reload} notify={notify} />
          return (
            <div key={config} className={`compare-cell${config === 'adapter' ? ' owned' : ''}`}>
              <Glyph svg={out?.content ?? null} size="large" title={`${comparison.concept}, ${label.title}`} />
              <Label {...label} />
              <span className="faint">
                {!out ? '—' : out.problems.length ? out.problems.join('; ') : `${out.input_tokens === null ? '—' : fmt(out.input_tokens)} tokens in${out.seconds ? `, ${out.seconds} s` : ''}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Label({ title, sub, model }: { title: string; sub: string; model: string }) {
  return (
    <div className="stack" style={{ gap: '0.125rem', alignItems: 'center' }}>
      <b style={{ fontSize: 'var(--sm)' }}>{title}</b>
      <span className="faint">{model}</span>
      <span className="faint">{sub}</span>
    </div>
  )
}

function AdapterCell({ project, comparison, label, reload, notify }: Props & { comparison: Comparison; label: { title: string; sub: string; model: string } }) {
  const [text, setText] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const save = async () => {
    if (!text) return
    setBusy(true)
    try {
      await api.compareAdapter(project.id, comparison.id, text)
      await reload()
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="compare-cell owned">
      <div className="glyph large empty-glyph" />
      <Label {...label} />
      <span className="faint">Adapters run only in Mubit's Try models.</span>
      {text === null ? (
        <div className="row">
          <Button small onClick={() => copyMessage(project, comparison.concept, 'bare', notify)}><Icon name="copy" /> Copy message</Button>
          <Button small onClick={() => setText('')}>Paste output</Button>
        </div>
      ) : (
        <>
          <textarea className="input mono" autoFocus placeholder="Paste the SVG from Try models" value={text} onChange={(e) => setText(e.target.value)} />
          <Button small kind="primary" busy={busy} disabled={!text.includes('<svg')} onClick={save}>Add</Button>
        </>
      )}
    </div>
  )
}

function Evaluation({ project, reload, notify }: Props) {
  const [busy, setBusy] = useState(false)
  const evaluation = project.evals.at(-1)
  const previous = project.evals.at(-2)
  const evaluate = async () => {
    setBusy(true)
    try {
      await waitFor(await api.evaluate(project.id, 12))
      await reload()
      notify('Evaluation done')
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setBusy(false)
    }
  }

  // The whiteboard's baselines: raw frontier, frontier with context, the previous routed configuration, A only, B only, A + B.
  type Line = { key: string; row: EvalRow; title: string; sub: string; model: string; icons: (string | null)[] }
  const line = (row: EvalRow, source: NonNullable<typeof evaluation>, key = row.config): Line => ({
    key, row, ...describe(row.config, row.model ?? (row.config === 'provider + routed context' ? project.model : undefined)),
    icons: (source.outputs[row.config] ?? []).slice(0, 8).map((o) => o.content),
  })
  const lines: Line[] = []
  if (evaluation) {
    for (const row of evaluation.rows) {
      const old = previous?.rows.find((r) => r.config === row.config)
      if (row.config === 'provider + routed context' && previous && old) {
        lines.push({ ...line(old, previous, 'previous'), title: 'Previous context', sub: `routed context at ${previous.t.slice(11, 16)}` })
      }
      lines.push(line(row, evaluation))
    }
  }
  const best = lines.reduce<Line | null>((b, l) => (l.row.style !== null && (b?.row.style ?? -1) < l.row.style ? l : b), null)

  return (
    <div className="card stack">
      <div className="row">
        <h2 className="grow">Held-out evaluation</h2>
        {evaluation ? <span className="faint">{evaluation.concepts.length} concepts never corrected; blind judge, 1–5; {evaluation.t.slice(11, 16)}</span> : null}
        <Button kind="primary" busy={busy} onClick={evaluate}><Icon name="chart" /> Evaluate</Button>
      </div>
      {evaluation ? (
        <table>
          <thead><tr><th>Configuration</th><th>Held-out icons</th><th className="r">Valid</th><th className="r">Style</th><th className="r">Recognisable</th><th className="r">Input tokens</th><th className="r">Seconds</th></tr></thead>
          <tbody>{lines.map((l) => (
            <tr key={l.key}>
              <td className="nowrap"><div>{l.title}</div><div className="faint">{l.model}, {l.sub}</div></td>
              <td><div className="row" style={{ gap: '0.25rem' }}>{l.icons.map((svg, i) => <Glyph key={i} svg={svg} size="small" />)}</div></td>
              <td className="r">{l.row.valid}/{l.row.n}</td>
              <td className="r">{l === best ? <b>{score(l.row.style)}</b> : score(l.row.style)}</td>
              <td className="r">{score(l.row.recognisable)}</td>
              <td className="r">{l.row.input_tokens === null ? '—' : fmt(l.row.input_tokens)}</td>
              <td className="r">{l.row.seconds ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      ) : <div className="empty">The frontier with no context and with every lesson, against the routed context, on concepts never corrected. Adapter rows appear after adding its outputs below.</div>}
    </div>
  )
}

// Adapter outputs for the held-out set, pasted from Try models; they are scored at the next evaluation.
function TryModels({ project, reload, notify }: Props) {
  const [concepts, setConcepts] = useState<string[]>([])
  const [mode, setMode] = useState<'bare' | 'routed'>('bare')
  const config = mode === 'bare' ? 'adapter' : 'adapter + routed context'
  const [pasted, setPasted] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  useEffect(() => { api.concepts(project.id).then((c) => setConcepts(c.heldout.slice(0, 12))).catch(() => undefined) }, [project.id])
  useEffect(() => {
    const saved = project.imports[config] ?? []
    setPasted(Object.fromEntries(saved.map((i) => [i.concept, i.content ?? ''])))
  }, [project, config])

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
    <Fold title={<><h2>Adapter outputs for the held-out set</h2><span className="faint">from Try models</span></>}
      aside={<span className="faint">{imported('adapter')} without context, {imported('adapter + routed context')} with</span>}>
      <div className="row">
        <span className="faint grow">Copy each message into Try models and paste the SVG it returns. They are scored at the next evaluation.</span>
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
              <button className="icon-btn" title="Copy message for Try models" onClick={() => copyMessage(project, c, mode, notify)}><Icon name="copy" /></button>
              <Glyph svg={pasted[c]?.includes('<svg') ? pasted[c] : null} size="small" />
            </div>
            <textarea className="input mono" placeholder="Paste SVG" value={pasted[c] ?? ''} onChange={(e) => setPasted({ ...pasted, [c]: e.target.value })} />
          </div>
        ))}
      </div>
    </Fold>
  )
}
