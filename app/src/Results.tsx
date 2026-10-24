// Results: one concept through every configuration side by side, then the held-out evaluation. The adapter's answers
// come from Mubit's Try models and are pasted in through the operator drawer.
import { useState } from 'react'
import { api, waitFor, type Comparison, type EvalRow, type Project } from './api'
import { clock, describe, fmt, routeColor, routeInk, type Described } from './routes'
import { Button, Glyph, Head, Icon } from './ui'

type Props = { project: Project; reload: () => Promise<void>; notify: (text: string) => void }

const columns = ['frontier', 'frontier + full context', 'provider + routed context', 'adapter']
const score = (v: number | null) => (v === null ? '—' : v.toFixed(2))

export function Results({ project, reload, notify }: Props) {
  return (
    <div className="stack">
      <Compare project={project} reload={reload} notify={notify} />
      <Evaluation project={project} reload={reload} notify={notify} />
    </div>
  )
}

function Compare({ project, reload, notify }: Props) {
  const [concept, setConcept] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [latest, ...earlier] = [...(project.comparisons ?? [])].reverse()
  const submit = async () => {
    if (!concept.trim()) return
    setBusy(concept)
    setConcept('')
    try {
      await api.compare(project.id, concept)
      await reload()
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setBusy(null)
    }
  }
  return (
    <div className="card stack">
      <Head title="Compare" tip="One new concept through every configuration; not kept for training">
        <input className="input" style={{ width: '16rem' }} placeholder="heat pump" value={concept} onChange={(e) => setConcept(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <Button kind="primary" busy={busy !== null} disabled={!concept.trim()} onClick={submit}><Icon name="generate" /></Button>
      </Head>
      {busy ? <Row project={project} comparison={null} concept={busy} /> : latest ? <Row key={latest.id} project={project} comparison={latest} concept={latest.concept} /> : (
        <div className="empty">Any concept</div>
      )}
      {earlier.length ? (
        <table>
          <tbody>{(busy && latest ? [latest, ...earlier] : earlier).slice(0, 5).map((c) => (
            <tr key={c.id}>
              <td className="muted">{c.concept}</td>
              {columns.map((config) => <td key={config}><Glyph svg={c.outputs[config]?.content ?? null} size="small" title={`${c.concept}, ${describe(config).title}`} /></td>)}
              <td className="faint r">{clock(c.t)}</td>
            </tr>
          ))}</tbody>
        </table>
      ) : null}
    </div>
  )
}

function Row({ project, comparison, concept }: { project: Project; comparison: Comparison | null; concept: string }) {
  return (
    <div className="stack" style={{ gap: '0.5rem' }}>
      <h3>{concept}</h3>
      <div className="compare">
        {columns.map((config) => {
          const out = comparison?.outputs[config]
          const label = describe(config, out?.model ?? (config === 'provider + routed context' ? project.model : undefined))
          return (
            <div key={config} className="compare-cell enter" style={{ borderTopColor: label.route ? routeColor[label.route] : undefined }}>
              {comparison ? <Glyph svg={out?.content ?? null} size="large" title={`${concept}, ${label.title}`} /> : <div className="shimmer large" />}
              <Label {...label} />
              <span className="faint">
                {!out ? '—' : out.problems.length ? out.problems.join('; ') : `${out.input_tokens === null ? '—' : fmt(out.input_tokens)} tokens${out.seconds ? ` · ${out.seconds} s` : ''}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Label({ title, sub, model, route }: Described) {
  return (
    <div className="stack" style={{ gap: '0.125rem', alignItems: 'center' }}>
      <h3 className={route ? routeInk[route] : undefined} data-tip={sub}>{title}</h3>
      <span className="faint">{model}</span>
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

  // Each configuration, plus the previous routed context when there is one, so a change in the context shows as a change in score.
  type Line = Described & { key: string; row: EvalRow; icons: (string | null)[] }
  const line = (row: EvalRow, source: NonNullable<typeof evaluation>, key = row.config): Line => ({
    key, row, ...describe(row.config, row.model ?? (row.config === 'provider + routed context' ? project.model : undefined)),
    icons: (source.outputs[row.config] ?? []).slice(0, 8).map((o) => o.content),
  })
  const lines: Line[] = []
  if (evaluation) {
    for (const row of evaluation.rows) {
      const old = previous?.rows.find((r) => r.config === row.config)
      if (row.config === 'provider + routed context' && previous && old) {
        lines.push({ ...line(old, previous, 'previous'), title: 'Previous', sub: `routed context at ${clock(previous.t)}` })
      }
      lines.push(line(row, evaluation))
    }
  }
  const best = lines.reduce<Line | null>((b, l) => (l.row.style !== null && (b?.row.style ?? -1) < l.row.style ? l : b), null)

  return (
    <div className="card stack">
      <Head title="Held-out" tip="Concepts never used in training, scored 1–5 by a blind judge">
        {evaluation ? <span className="faint">n = {evaluation.concepts.length} · {clock(evaluation.t)}</span> : null}
        <Button busy={busy} onClick={evaluate} tip="Run the held-out evaluation"><Icon name="chart" /> Evaluate</Button>
      </Head>
      {evaluation ? (
        <table className="eval">
          <thead><tr><th /><th /><th className="r">Valid</th><th>Style</th><th className="r">Recognisable</th><th className="r">Tokens</th><th className="r">Seconds</th></tr></thead>
          <tbody>{lines.map((l) => (
            <tr key={l.key}>
              <td className="nowrap"><div className={l.route ? routeInk[l.route] : undefined} style={{ fontWeight: 600 }} data-tip={l.sub}>{l.title}</div><div className="faint">{l.model}</div></td>
              <td><div className="row" style={{ gap: '0.25rem' }}>{l.icons.map((svg, i) => <Glyph key={i} svg={svg} size="small" />)}</div></td>
              <td className="r">{l.row.valid}/{l.row.n}</td>
              <td className="score">
                <div className="row">
                  <div className="meter"><div style={{ width: `${((l.row.style ?? 0) / 5) * 100}%`, background: l.route ? routeColor[l.route] : 'var(--text-3)' }} /></div>
                  {l === best ? <b>{score(l.row.style)}</b> : <span>{score(l.row.style)}</span>}
                </div>
              </td>
              <td className="r">{score(l.row.recognisable)}</td>
              <td className="r">{l.row.input_tokens === null ? '—' : fmt(l.row.input_tokens)}</td>
              <td className="r">{l.row.seconds ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      ) : <div className="empty">Not run yet</div>}
    </div>
  )
}
