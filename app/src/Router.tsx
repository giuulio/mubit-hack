// The router: the decision at the centre of the loop. Lessons that extraction found wait as incoming; routing one
// measures its signals (tokens per call, effect on probes, stability, scope) and sends it to context, weights or both.
import { useState } from 'react'
import type { Lesson, Project } from './api'
import { Probes } from './Probes'
import { routeInfo } from './routes'
import { Button, Count, Dot, Glyph, Head, Icon, RouteBadge } from './ui'

type Props = {
  project: Project
  focus: Lesson | null
  deciding: string | null
  extracting: boolean
  busy: boolean
  onFocus: (id: string) => void
  onRoute: (lesson: Lesson, stability: string) => void
  onReject: (lesson: Lesson) => void
}

export function Router({ project, focus, deciding, extracting, busy, onFocus, onRoute, onReject }: Props) {
  const incoming = project.lessons.filter((l) => l.status === 'pending' && l.id !== deciding)
  const decided = project.lessons
    .filter((l) => l.route && l.confirmed && ['active', 'needs_rephrase'].includes(l.status))
    .sort((a, b) => (b.confirmed ?? '').localeCompare(a.confirmed ?? ''))

  return (
    <div className="card stack loop-col">
      <Head title="Router" tip="Measures each lesson, then sends it to context, weights or both">
        {incoming.length ? <span className="count">{incoming.length}</span> : null}
      </Head>

      {extracting || incoming.length ? (
        <div className="incoming">
          {extracting ? <div className="lesson enter faint row"><Icon name="loading" size={14} spin /> Extracting</div> : null}
          {incoming.map((l) => <Incoming key={l.id} lesson={l} busy={busy} onRoute={onRoute} onReject={onReject} />)}
        </div>
      ) : null}

      {focus ? <Decision key={focus.id} project={project} lesson={focus} measuring={deciding === focus.id} /> : (
        <div className="empty">Critique an icon</div>
      )}

      {decided.length ? (
        <div className="history">
          {decided.map((l) => (
            <button key={l.id} className={`history-row${focus?.id === l.id ? ' on' : ''}`} onClick={() => onFocus(l.id)}>
              <Dot route={l.route} />
              <span className="grow clamp">{l.statement}</span>
              <span className="faint">{l.route ? routeInfo[l.route].title : ''}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function Incoming({ lesson, busy, onRoute, onReject }: { lesson: Lesson; busy: boolean; onRoute: Props['onRoute']; onReject: Props['onReject'] }) {
  const [stability, setStability] = useState('permanent')
  return (
    <div className="lesson enter">
      <span>{lesson.statement}</span>
      <div className="row">
        <div className="seg" data-tip="Permanent lessons are tested on probes; temporary ones stay in context">
          {['permanent', 'temporary'].map((s) => (
            <button key={s} className={stability === s ? 'on' : ''} onClick={() => setStability(s)}>{s === 'permanent' ? 'Permanent' : 'For now'}</button>
          ))}
        </div>
        <span className="grow" />
        <button className="icon-btn" data-tip="Reject" aria-label="Reject" disabled={busy} onClick={() => onReject(lesson)}><Icon name="close" /></button>
        <Button small kind="primary" disabled={busy} onClick={() => onRoute(lesson, stability)}><Icon name="route" /> Route</Button>
      </div>
    </div>
  )
}

// What routing is doing while the effect test runs, so the wait explains itself on camera.
function measuring(lesson: Lesson) {
  if (lesson.scope === 'instance') return 'Saving note'
  if (lesson.expressible_as === 'parameter') return 'Applying in code'
  if (lesson.expressible_as === 'rule' || lesson.expressible_as === 'validator') return 'Testing on 3 probes'
  return 'Counting tokens'
}

// Probe wins over judged pairs, as on the probes grid; falls back to the stored share.
function effect(lesson: Lesson): string {
  const verdicts = lesson.probe?.verdicts ?? []
  if (verdicts.length) {
    const won = verdicts.filter((v) => v.verdict && v.verdict !== 'same' && v.verdict === v.lesson_side).length
    return `${won}/${verdicts.length}`
  }
  const share = lesson.signals?.effect
  if (share === undefined || share === null) return lesson.expressible_as === 'parameter' ? 'code' : '—'
  return `${Math.round(share * 100)}%`
}

function Decision({ project, lesson, measuring: busy }: { project: Project; lesson: Lesson; measuring: boolean }) {
  const source = project.outputs.find((o) => o.id === lesson.sources?.[0])
  const signals = [
    { label: 'Tokens', tip: 'Added to every call', value: lesson.signals?.tokens === undefined ? '—' : <Count value={lesson.signals.tokens} /> },
    { label: 'Effect', tip: 'Probes where a blind judge saw the lesson', value: effect(lesson) },
    { label: 'Stability', tip: 'Permanent or for now', value: lesson.signals?.stability === 'temporary' ? 'for now' : lesson.signals?.stability ?? '—' },
    { label: 'Scope', tip: 'Whole style, a family of icons, or one concept', value: lesson.scope ?? '—' },
  ]
  return (
    <div className={`decision${busy ? ' measuring' : ''}`} id="decision">
      {lesson.feedback ? (
        <div className="row source">
          {source ? <Glyph svg={source.content} size="small" title={source.concept} /> : null}
          <span className="faint clamp" data-tip={lesson.feedback}>“{lesson.feedback}”</span>
        </div>
      ) : null}
      <p className="statement">{lesson.statement}</p>
      <div className="signals">
        {signals.map((s) => (
          <div key={s.label} className="signal">
            <span className="faint" data-tip={s.tip}>{s.label}</span>
            <b>{busy ? <span className="shimmer" /> : s.value}</b>
          </div>
        ))}
      </div>
      {!busy && lesson.probe?.probes?.length ? <Probes lesson={lesson} /> : null}
      <div className="verdict-row" id="verdict">
        {busy ? (
          <span className="row muted"><Icon name="loading" size={14} spin /> {measuring(lesson)}</span>
        ) : (
          <>
            <Icon name="right" />
            <RouteBadge route={lesson.route} large tip={lesson.reason ?? undefined} />
          </>
        )}
      </div>
    </div>
  )
}
