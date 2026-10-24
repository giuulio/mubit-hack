// Studio: give taste, generate, react to outputs, confirm the lessons the router extracts.
import { useState } from 'react'
import { api, type Lesson, type Output, type Project } from './api'
import { Button, Glyph, Icon, RouteBadge } from './ui'

type Props = { project: Project; reload: () => Promise<void>; notify: (text: string) => void }

export function Studio({ project, reload, notify }: Props) {
  const [direction, setDirection] = useState('')
  const [concepts, setConcepts] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [critique, setCritique] = useState<{ id: string; text: string } | null>(null)

  const run = async (key: string, fn: () => Promise<unknown>, done?: string) => {
    setBusy(key)
    try {
      await fn()
      await reload()
      if (done) notify(done)
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setBusy(null)
    }
  }

  const sendFeedback = (key: string, body: Parameters<typeof api.feedback>[1]) =>
    run(key, async () => {
      const found = await api.feedback(project.id, body)
      if (!found.length) notify('No lesson found')
    })

  const outputs = [...project.outputs].reverse().slice(0, 24)
  const pending = project.lessons.filter((l) => l.status === 'pending')
  const routed = project.lessons.filter((l) => l.route && l.status !== 'pending').slice(-4).reverse()
  const byId = (id: string) => project.outputs.find((o) => o.id === id)

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s.slice(-1), id]))

  return (
    <div className="split">
      <div className="stack">
        <div className="card row">
          <input className="input grow" placeholder="Taste: thin, rounded, organic…" value={direction} onChange={(e) => setDirection(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && direction.trim() && sendFeedback('direction', { signal: 'direction', text: direction }).then(() => setDirection(''))} />
          <Button kind="primary" busy={busy === 'direction'} disabled={!direction.trim()} onClick={() => sendFeedback('direction', { signal: 'direction', text: direction }).then(() => setDirection(''))}>
            <Icon name="send" />
          </Button>
        </div>
        <div className="card row">
          <input className="input grow" placeholder="Concepts: bell, camera, leaf…" value={concepts} onChange={(e) => setConcepts(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && concepts.trim() && run('generate', () => api.generate(project.id, concepts.split(',')))} />
          <Button kind="primary" busy={busy === 'generate'} disabled={!concepts.trim()} onClick={() => run('generate', () => api.generate(project.id, concepts.split(',')))}>
            <Icon name="generate" /> Generate
          </Button>
        </div>

        {selected.length === 2 ? (
          <div className="card row">
            <span className="muted grow">Which is better?</span>
            {selected.map((id, i) => (
              <button key={id} className="btn light" style={{ height: 'auto', padding: '0.5rem' }} disabled={busy === 'pick'}
                onClick={() => sendFeedback('pick', { signal: 'pick', chosen_id: id, rejected_id: selected[1 - i] }).then(() => setSelected([]))}>
                <Glyph svg={byId(id)?.content ?? null} size="small" />
              </button>
            ))}
            <button className="icon-btn" onClick={() => setSelected([])}><Icon name="close" /></button>
          </div>
        ) : null}

        {outputs.length ? (
          <div className="grid">
            {outputs.map((o) => (
              <Tile key={o.id} output={o} selected={selected.includes(o.id)} busy={busy === o.id}
                onSelect={() => toggle(o.id)}
                onApprove={() => sendFeedback(o.id, { signal: 'critique', output_id: o.id, text: 'Good example of the style, more like this.' })}
                onCritique={() => setCritique({ id: o.id, text: '' })} />
            ))}
          </div>
        ) : <div className="card empty">Generate a few concepts to start.</div>}

        {critique ? (
          <div className="card row">
            <Glyph svg={byId(critique.id)?.content ?? null} size="small" />
            <input className="input grow" autoFocus placeholder="What's off?" value={critique.text} onChange={(e) => setCritique({ ...critique, text: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && critique.text.trim() && sendFeedback(critique.id, { signal: 'critique', output_id: critique.id, text: critique.text }).then(() => setCritique(null))} />
            <Button kind="primary" busy={busy === critique.id} disabled={!critique.text.trim()} onClick={() => sendFeedback(critique.id, { signal: 'critique', output_id: critique.id, text: critique.text }).then(() => setCritique(null))}>
              <Icon name="send" />
            </Button>
            <button className="icon-btn" onClick={() => setCritique(null)}><Icon name="close" /></button>
          </div>
        ) : null}
      </div>

      <div className="stack">
        <div className="card">
          <h2>Lessons</h2>
          {pending.length ? pending.map((l) => <Pending key={l.id} lesson={l} project={project} run={run} busy={busy} />) : <div className="empty">No pending lessons</div>}
        </div>
        {routed.length ? (
          <div className="card">
            <h3>Routed</h3>
            {routed.map((l) => (
              <div key={l.id} className="lesson">
                <div className="row"><RouteBadge route={l.route} /><span className="grow" style={{ fontSize: 'var(--sm)' }}>{l.statement}</span></div>
                <span className="faint">{l.reason}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Tile({ output, selected, busy, onSelect, onApprove, onCritique }: { output: Output; selected: boolean; busy: boolean; onSelect: () => void; onApprove: () => void; onCritique: () => void }) {
  return (
    <div className={`tile${selected ? ' selected' : ''}`} onClick={onSelect} title={output.problems.join('; ')}>
      <Glyph svg={output.content} />
      <span className="faint">{output.concept}</span>
      <div className="actions" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" onClick={onApprove} disabled={busy}>{busy ? <Icon name="loading" spin /> : <Icon name="approve" />}</button>
        <button className="icon-btn" onClick={onCritique}><Icon name="critique" /></button>
        <button className={`icon-btn${selected ? ' on' : ''}`} onClick={onSelect}><Icon name="pick" /></button>
      </div>
    </div>
  )
}

function Pending({ lesson, project, run, busy }: { lesson: Lesson; project: Project; run: (key: string, fn: () => Promise<unknown>, done?: string) => Promise<void>; busy: string | null }) {
  const [stability, setStability] = useState('permanent')
  const key = `confirm-${lesson.id}`
  return (
    <div className="lesson">
      <span style={{ fontSize: 'var(--sm)' }}>{lesson.statement}</span>
      <div className="row wrap">
        <span className="chip">{lesson.scope}</span>
        <span className="chip">{lesson.expressible_as}</span>
        {lesson.relation && lesson.relation !== 'new' ? <span className="chip">{lesson.relation} {lesson.related_to}</span> : null}
      </div>
      <div className="row">
        <div className="seg">
          {['permanent', 'temporary'].map((s) => (
            <button key={s} className={stability === s ? 'on' : ''} onClick={() => setStability(s)}>{s === 'permanent' ? 'Permanent' : 'For now'}</button>
          ))}
        </div>
        <span className="grow" />
        <button className="icon-btn" disabled={busy === key} onClick={() => run(`reject-${lesson.id}`, () => api.reject(project.id, lesson.id))}><Icon name="close" /></button>
        <Button small kind="primary" busy={busy === key} onClick={() => run(key, () => api.confirm(project.id, lesson.id, stability), 'Lesson routed')}>
          <Icon name="check" />
        </Button>
      </div>
    </div>
  )
}
