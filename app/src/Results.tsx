// Results: one concept in every context of the model and every configuration (the styles grid), which configuration
// should serve this context (the serving ladder), and this context's held-out evaluation. The adapter's answers come from
// Mubit's Try models and are pasted in through the operator drawer.
import { useState } from 'react'
import { api, waitFor, type Comparison, type EvalRow, type Serving } from './api'
import { clock, describe, fmt, live, routeColor, routeInk, type Described, type View } from './routes'
import { Button, Dot, Glyph, Head, Icon } from './ui'

type Props = { project: View; reload: () => Promise<void>; notify: (text: string) => void }

// Columns of the styles grid after the shared raw provider: what changes from one to the next is the context, then the model.
const ladder = ['provider + routed context', 'adapter', 'adapter + routed context']
const score = (v: number | null) => (v === null ? '—' : v.toFixed(2))

export function Results({ project, reload, notify }: Props) {
  return (
    <div className="stack results">
      <Styles project={project} reload={reload} notify={notify} />
      <ServingLadder project={project} />
      <Evaluation project={project} reload={reload} notify={notify} />
    </div>
  )
}

function Cell({ out, title }: { out: Comparison['outputs'][string] | undefined; title: string }) {
  return (
    <div className="style-cell enter">
      <Glyph svg={out?.content ?? null} size="large" title={title} />
      <span className="faint">
        {!out ? '—' : out.problems.length ? out.problems.join('; ') : `${out.input_tokens === null ? '—' : fmt(out.input_tokens)} tokens${out.seconds ? ` · ${out.seconds} s` : ''}`}
      </span>
    </div>
  )
}

function Styles({ project, notify, reload }: Props) {
  const whole = project.whole
  const contexts = live(whole)
  const groups = [...new Set((whole.comparisons ?? []).filter((c) => c.group).map((c) => c.group as string))].reverse()
  const [chosen, setChosen] = useState<string | null>(null)
  const [concept, setConcept] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const group = chosen ?? groups[0] ?? null
  const rows = (whole.comparisons ?? []).filter((c) => c.group === group)
  const shown = busy ?? rows[0]?.concept ?? null

  const submit = async () => {
    if (!concept.trim()) return
    setBusy(concept.trim())
    setConcept('')
    try {
      await api.compareStyles(whole.id, concept.trim())
      setChosen(null)
      await reload()
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setBusy(null)
    }
  }

  const head = (config: string) => {
    const d = describe(config, config === 'provider' || config === 'provider + routed context' ? whole.model : undefined)
    return <div className="style-head"><span className={d.route ? routeInk[d.route] : undefined} data-tip={d.sub}>{d.title}</span><span className="faint">{d.model}</span></div>
  }

  return (
    <section className="stack section">
      <Head title="Raw model vs Hone" tip="One concept in every context of the model, through each configuration; nothing here is kept for training">
        <div className="row">
          <input className="input" style={{ width: '16rem' }} placeholder="heat pump" value={concept} onChange={(e) => setConcept(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <Button kind="primary" busy={busy !== null} disabled={!concept.trim()} onClick={submit} tip="Draw it in every context and configuration"><Icon name="generate" /></Button>
        </div>
      </Head>
      <p className="muted">Same concept and provider model: raw has only the icon task prompt; Hone adds learned rules, examples and code parameters. Both use base weights. Adapter columns require separate outputs from Mubit Try models.</p>
      <table><thead><tr><th>Configuration</th><th>Learned context</th><th>Fine-tuned weights</th></tr></thead><tbody><tr><td>Raw model</td><td>None</td><td>No</td></tr><tr><td>Hone</td><td>Rules, examples + parameters</td><td>No</td></tr><tr><td>Adapter</td><td>None</td><td>Requires verified Mubit output</td></tr><tr><td>Adapter + context</td><td>Routed context</td><td>Requires verified Mubit output</td></tr></tbody></table>
      {shown ? (
        <div className="styles-grid" style={{ gridTemplateRows: `auto repeat(${contexts.length}, auto)` }}>
          <div className="style-corner"><h3>{shown}</h3>{rows[0] ? <span className="faint">{clock(rows[0].t)}</span> : null}</div>
          {head('provider')}
          {ladder.map((c) => <div key={c}>{head(c)}</div>)}
          {/* The raw provider uses no context, so one drawing stands for every row. */}
          <div className="style-shared" style={{ gridRow: `2 / span ${contexts.length}` }}>
            {busy ? <div className="shimmer large" /> : <Cell out={rows[0]?.outputs.provider} title={`${shown}, raw provider`} />}
          </div>
          {contexts.map((c) => {
            const row = rows.find((r) => r.context === c.id)
            return (
              <div key={c.id} className={`style-row${c.id === project.cid ? ' current' : ''}`}>
                <div className="style-name"><Dot route="A" />{c.name}</div>
                {ladder.map((config) => (
                  <div key={config}>
                    {busy ? <div className="style-cell"><div className="shimmer large" /></div>
                      : config.startsWith('adapter') && !row?.outputs[config]
                        ? <div className="style-cell"><div className="glyph large empty-glyph" /><span className="faint">No verified output yet</span></div>
                        : <Cell out={row?.outputs[config]} title={`${shown}, ${c.name}, ${describe(config).title}`} />}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      ) : <div className="empty">One concept, every context</div>}
      {groups.length > 1 ? (
        <div className="row wrap" style={{ gap: '0.375rem' }}>
          <span className="faint">Earlier</span>
          {groups.slice(0, 8).map((g) => {
            const name = whole.comparisons?.find((c) => c.group === g)?.concept
            return <button key={g} className={`chip pick${g === group ? ' on' : ''}`} onClick={() => setChosen(g)}>{name}</button>
          })}
        </div>
      ) : null}
    </section>
  )
}

// The ladder for this context, cheapest first, from its latest evaluation: which rung passes against the frontier with
// context, and which one serves. Mubit's task rules route live calls; this is what they should serve.
function ServingLadder({ project }: { project: View }) {
  const serving: Serving | null | undefined = project.evals.at(-1)?.serving
  return (
    <section className="stack section">
      <Head title="Serving" tip="Cheapest first: a rung serves when its style is within a quarter point of the frontier with context and it has at most one more invalid output" />
      {serving ? (
        <>
          <div className="serving">
            {serving.checks.map((check) => {
              const d = describe(check.config, check.config === 'provider + routed context' ? project.model : undefined)
              const serves = check.config === serving.config
              return (
                <div key={check.config} className={`rung ${check.status}${serves ? ' serves' : ''}`}>
                  <div className="row"><span className={`grow ${d.route ? routeInk[d.route] ?? '' : ''}`} style={{ fontWeight: 600 }}>{d.title}</span>{serves ? <span className="badge" style={{ background: 'var(--weights)' }}>serves</span> : null}</div>
                  <span className="faint">{d.model}</span>
                  {check.status === 'missing' ? (
                    <span className="muted">{check.config.startsWith('adapter') ? 'No adapter version yet' : 'Not evaluated'}</span>
                  ) : (
                    <div className="rung-numbers">
                      <span><b>{check.style?.toFixed(2)}</b> style</span>
                      <span><b>{check.valid}/{check.n}</b> valid</span>
                      <span><b>{check.input_tokens == null ? '—' : fmt(check.input_tokens)}</b> tokens</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <span className="faint">{serving.reason}</span>
        </>
      ) : <div className="empty">Run the held-out evaluation for a serving decision</div>}
    </section>
  )
}

function Evaluation({ project, reload, notify }: Props) {
  const [busy, setBusy] = useState(false)
  const evaluation = project.evals.at(-1)
  const previous = project.evals.at(-2)
  const evaluate = async () => {
    setBusy(true)
    try {
      await waitFor(await api.evaluate(project.id, project.cid, 12))
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
    <section className="stack section">
      <Head title="Held-out" tip="Concepts never used in training, scored 1–5 by a blind judge">
        <div className="row">
          {evaluation ? <span className="faint">n = {evaluation.concepts.length} · {clock(evaluation.t)}</span> : null}
          <Button small busy={busy} onClick={evaluate} tip="Run the held-out evaluation"><Icon name="chart" /> Evaluate</Button>
        </div>
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
    </section>
  )
}
