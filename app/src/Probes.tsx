// The effect test behind a route: probe concepts drawn without and with the lesson, and where the judge saw its effect.
import type { Lesson } from './api'
import { Glyph, Icon } from './ui'

export function Probes({ lesson }: { lesson: Lesson }) {
  const { probes, with: withLesson, without, verdicts = [] } = lesson.probe ?? {}
  if (!probes?.length || !withLesson || !without) return null
  let pair = 0
  const columns = probes.map((concept, i) => {
    const judged = withLesson[i] && without[i] ? verdicts[pair++] : undefined
    const result = !judged?.verdict ? null : judged.verdict === 'same' ? 'same' : judged.verdict === judged.lesson_side ? 'won' : 'lost'
    return { concept, with: withLesson[i] ?? null, without: without[i] ?? null, result }
  })
  const won = columns.filter((c) => c.result === 'won').length

  return (
    <div className="probes" style={{ gridTemplateColumns: `4rem repeat(${columns.length}, 1fr)` }}>
      <span />
      {columns.map((c) => <span key={c.concept} className="faint probe-concept">{c.concept}</span>)}
      <span className="faint">Without</span>
      {columns.map((c) => <Glyph key={c.concept} svg={c.without} size="small" title={`${c.concept}, without the lesson`} />)}
      <span className="faint">With</span>
      {columns.map((c) => <Glyph key={c.concept} svg={c.with} size="small" title={`${c.concept}, with the lesson`} />)}
      <span />
      {columns.map((c) => (
        <span key={c.concept} className={`verdict ${c.result ?? ''}`}>
          {c.result === 'won' ? <Icon name="check" size={14} /> : c.result === 'same' ? 'same' : c.result ? <Icon name="close" size={14} /> : '—'}
        </span>
      ))}
      <span className="faint probe-summary">Blind judge: {won} of {pair}</span>
    </div>
  )
}
