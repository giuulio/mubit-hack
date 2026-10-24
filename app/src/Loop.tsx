// Loop: the whole architecture on one screen. Feedback on generated icons becomes lessons; the router measures each one
// and sends it to context, weights or both; the lesson visibly lands in the card it was routed to.
import { useState } from 'react'
import { api, type Lesson, type Output, type Project } from './api'
import { Context } from './Context'
import { fly, shake } from './motion'
import { Router } from './Router'
import { destinations, routeColor, routeInfo, routeOn } from './routes'
import { Button, Glyph, Head, Icon } from './ui'
import { Weights } from './Weights'

type Props = { project: Project; focus: string | null; reload: () => Promise<void>; notify: (text: string) => void }

export function Loop({ project, focus, reload, notify }: Props) {
  const [busy, setBusy] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(focus)
  const [deciding, setDeciding] = useState<string | null>(null)
  const [landed, setLanded] = useState<string | null>(null)

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key)
    try {
      await fn()
      await reload()
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setBusy(null)
    }
  }

  const feedback = (key: string, body: Parameters<typeof api.feedback>[1]) =>
    run(key, async () => {
      const found = await api.feedback(project.id, body)
      if (!found.length) notify('No lesson found')
    })

  // Routing: the lesson moves into the decision card while it is measured, then flies to where it was routed.
  const route = async (lesson: Lesson, stability: string) => {
    setFocusId(lesson.id)
    setDeciding(lesson.id)
    setBusy('route')
    try {
      const routed = await api.confirm(project.id, lesson.id, stability)
      await reload()
      setDeciding(null)
      const chosen = routed.route
      const from = document.getElementById('verdict')
      if (!chosen || !from) return
      if (chosen === 'rephrase') return shake(document.getElementById('decision') ?? from)
      setLanded(routed.id)
      await Promise.all(destinations[chosen].map((d, i) => {
        const to = document.getElementById(`dest-${d}`)
        return to ? fly(from, to, routeInfo[chosen].title, routeColor[chosen], routeOn[chosen], i * 160) : undefined
      }))
      setTimeout(() => setLanded((l) => (l === routed.id ? null : l)), 2400)
    } catch (e) {
      notify(String(e instanceof Error ? e.message : e))
    } finally {
      setDeciding(null)
      setBusy(null)
    }
  }

  const decided = project.lessons.filter((l) => l.route && l.confirmed).sort((a, b) => (b.confirmed ?? '').localeCompare(a.confirmed ?? ''))
  // Until a lesson is picked, show the latest one with probe evidence: it shows the router's reasoning best.
  const shown = project.lessons.find((l) => l.id === focusId) ?? decided.find((l) => l.probe?.probes?.length) ?? decided[0] ?? null

  return (
    <div className="loop">
      <Feedback project={project} busy={busy} onFeedback={feedback} onGenerate={(concepts) => run('generate', () => api.generate(project.id, concepts))} />
      <span className="flow"><Icon name="right" /></span>
      <Router project={project} focus={shown} deciding={deciding} extracting={busy?.startsWith('feedback') ?? false} busy={busy !== null}
        onFocus={setFocusId} onRoute={route} onReject={(l) => run(`reject-${l.id}`, () => api.reject(project.id, l.id))} />
      <span className="flow"><Icon name="right" /></span>
      <div className="stack loop-col">
        <Context project={project} landed={landed} />
        <div className="flow-v">
          <span data-tip="Context makes the provider answer right; Mubit keeps those calls"><Icon name="down" size={14} /> train</span>
          <span data-tip="Once the adapter holds a lesson, it leaves the prompt"><Icon name="up" size={14} /> retire</span>
        </div>
        <Weights project={project} landed={landed} />
      </div>
    </div>
  )
}

function Feedback({ project, busy, onFeedback, onGenerate }: {
  project: Project; busy: string | null; onFeedback: (key: string, body: Parameters<typeof api.feedback>[1]) => Promise<void>; onGenerate: (concepts: string[]) => Promise<void>
}) {
  const [concepts, setConcepts] = useState('')
  const [taste, setTaste] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [critique, setCritique] = useState<{ id: string; text: string } | null>(null)
  const [drawing, setDrawing] = useState<string[]>([])

  const generate = async () => {
    const list = concepts.split(',').map((c) => c.trim()).filter(Boolean)
    if (!list.length) return
    setDrawing(list)
    setConcepts('')
    await onGenerate(list)
    setDrawing([])
  }
  const sendTaste = () => taste.trim() && onFeedback('feedback-taste', { signal: 'direction', text: taste }).then(() => setTaste(''))
  const sendCritique = () => critique?.text.trim() && onFeedback('feedback-critique', { signal: 'critique', output_id: critique.id, text: critique.text }).then(() => setCritique(null))
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s.slice(-1), id]))
  const byId = (id: string) => project.outputs.find((o) => o.id === id)

  // The latest drawing of each concept, newest first: a redraw after a critique replaces its tile.
  const seen = new Set<string>()
  const outputs = [...project.outputs].reverse().filter((o) => !seen.has(o.concept) && seen.add(o.concept)).slice(0, 24)

  return (
    <div className="card stack loop-col">
      <Head title="Feedback" tip="Generate icons, then critique, approve or pick" />
      <div className="stack" style={{ gap: '0.5rem' }}>
        <div className="row">
          <input className="input grow" placeholder="bell, camera, leaf" value={concepts} onChange={(e) => setConcepts(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && generate()} />
          <Button kind="primary" busy={busy === 'generate'} disabled={!concepts.trim() || busy !== null} onClick={generate} tip="Draw these concepts"><Icon name="generate" /></Button>
        </div>
        <div className="row">
          <input className="input grow" placeholder="Taste: thin, rounded, organic" value={taste} onChange={(e) => setTaste(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendTaste()} />
          <Button busy={busy === 'feedback-taste'} disabled={!taste.trim() || busy !== null} onClick={sendTaste} tip="Give a direction"><Icon name="send" /></Button>
        </div>
        {critique ? (
          <div className="row enter">
            <Glyph svg={byId(critique.id)?.content ?? null} size="small" />
            <input className="input grow" autoFocus placeholder={`What's off with ${byId(critique.id)?.concept ?? 'this'}?`} value={critique.text} onChange={(e) => setCritique({ ...critique, text: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && sendCritique()} />
            <Button kind="primary" busy={busy === 'feedback-critique'} disabled={!critique.text.trim()} onClick={sendCritique}><Icon name="send" /></Button>
            <button className="icon-btn" aria-label="Cancel" onClick={() => setCritique(null)}><Icon name="close" /></button>
          </div>
        ) : null}
        {selected.length === 2 ? (
          <div className="row enter">
            <span className="muted grow">Better?</span>
            {selected.map((id, i) => (
              <button key={id} className="btn light" style={{ height: 'auto', padding: '0.375rem' }} disabled={busy !== null}
                onClick={() => onFeedback('feedback-pick', { signal: 'pick', chosen_id: id, rejected_id: selected[1 - i] }).then(() => setSelected([]))}>
                <Glyph svg={byId(id)?.content ?? null} size="small" />
              </button>
            ))}
            <button className="icon-btn" aria-label="Cancel" onClick={() => setSelected([])}><Icon name="close" /></button>
          </div>
        ) : null}
      </div>

      <div className="grid">
        {drawing.map((c) => <div key={`drawing-${c}`} className="tile drawing"><div className="shimmer" /><span className="faint">{c}</span></div>)}
        {outputs.map((o) => (
          <Tile key={o.id} output={o} selected={selected.includes(o.id)} critiqued={critique?.id === o.id} busy={busy === `feedback-approve-${o.id}`}
            onSelect={() => toggle(o.id)}
            onApprove={() => onFeedback(`feedback-approve-${o.id}`, { signal: 'critique', output_id: o.id, text: 'Good example of the style, more like this.' })}
            onCritique={() => setCritique({ id: o.id, text: '' })} />
        ))}
      </div>
      {!outputs.length && !drawing.length ? <div className="empty">Draw a few concepts</div> : null}
    </div>
  )
}

function Tile({ output, selected, critiqued, busy, onSelect, onApprove, onCritique }: {
  output: Output; selected: boolean; critiqued: boolean; busy: boolean; onSelect: () => void; onApprove: () => void; onCritique: () => void
}) {
  return (
    <div className={`tile enter${selected || critiqued ? ' selected' : ''}`} onClick={onSelect}>
      {output.problems.length ? <span className="problem" title={output.problems.join('; ')} /> : null}
      <Glyph svg={output.content} />
      <span className="faint clamp">{output.concept}</span>
      <div className="actions" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" data-tip="Approve as example" aria-label="Approve as example" onClick={onApprove} disabled={busy}>{busy ? <Icon name="loading" spin /> : <Icon name="approve" />}</button>
        <button className="icon-btn" data-tip="Critique" aria-label="Critique" onClick={onCritique}><Icon name="critique" /></button>
        <button className={`icon-btn${selected ? ' on' : ''}`} data-tip="Pick between two" aria-label="Pick between two" onClick={onSelect}><Icon name="pick" /></button>
      </div>
    </div>
  )
}
