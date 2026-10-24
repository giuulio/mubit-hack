// The B panel: Mubit trains the weights. Training calls it keeps, adapter versions from its console, and retiring
// B lessons from the context once the adapter holds them without it.
import { useState } from 'react'
import { api, waitFor, type Lesson, type Project } from './api'
import { fmt } from './routes'
import { Button, Glyph, Icon, RouteBadge } from './ui'

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
      <div className="row">
        <RouteBadge route="B" />
        <h2 className="grow">Weights</h2>
        <span className="faint">trained by Mubit</span>
      </div>

      <div className="stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="stat">
          <span className="faint">Kept for training</span>
          <b>{calls}</b>
          <span className="faint">{calls ? `${valid}/${calls} valid; Mubit trains from 25` : 'Mubit trains from 25 kept calls'}</span>
        </div>
        <div className="stat">
          <span className="faint">Adapter</span>
          <b>{adapter?.version ?? '—'}</b>
          <span className="faint">{adapter ? `${adapter.status}, ${adapter.t.slice(11, 16)}` : calls ? 'none recorded from the console yet' : 'none yet'}</span>
        </div>
      </div>

      <div className="stack" style={{ gap: '0.5rem' }}>
        <div className="row">
          <h3 className="grow">Training calls</h3>
          <Button small kind="primary" busy={busy === 'train'} onClick={() => run('train', async () => waitFor(await api.train(project.id, 40)), 'Training calls sent')}>
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

      <div className="stack" style={{ gap: '0.5rem' }}>
        <h3>Adapter versions</h3>
        <span className="faint">Recorded from the Mubit console with their test result.</span>
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

      {owned.length ? (
        <div className="stack" style={{ gap: '0.25rem' }}>
          <h3>Retire from context</h3>
          <span className="faint">The adapter draws each B lesson's probes without it. If it holds in two of three, the lesson leaves the prompt and every call gets cheaper.</span>
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
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))' }}>
            {probes.map((c) => (
              <div key={c} className="tile" style={{ alignItems: 'stretch' }}>
                <div className="row">
                  <span className="muted grow">{c}</span>
                  <button className="icon-btn" title="Copy message without this lesson, for Try models" onClick={() => copy(c)}><Icon name="copy" /></button>
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
