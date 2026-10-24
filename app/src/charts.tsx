// Minimal inline SVG charts, so the interface needs no chart library.

export function Line({ values, height = 96 }: { values: number[]; height?: number }) {
  if (values.length < 2) return <div className="empty">—</div>
  const width = 320
  const max = Math.max(...values) * 1.1 || 1
  const x = (i: number) => (i / (values.length - 1)) * (width - 8) + 4
  const y = (v: number) => height - 4 - (v / max) * (height - 8)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img">
      <path d={d} fill="none" stroke="var(--text)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill="var(--text)" />)}
    </svg>
  )
}

export function Bars({ items, max, format = (v) => v.toFixed(1) }: { items: { label: string; value: number | null }[]; max: number; format?: (v: number) => string }) {
  return (
    <div className="stack" style={{ gap: '0.5rem' }}>
      {items.map((item) => (
        <div key={item.label} className="row">
          <span className="faint" style={{ width: '11rem', flex: 'none' }}>{item.label}</span>
          <div className="grow" style={{ background: 'var(--bg-2)', borderRadius: 4, height: 10 }}>
            <div style={{ width: `${((item.value ?? 0) / max) * 100}%`, background: 'var(--text)', height: '100%', borderRadius: 4 }} />
          </div>
          <span className="faint" style={{ width: '3.5rem', textAlign: 'right' }}>{item.value === null ? '—' : format(item.value)}</span>
        </div>
      ))}
    </div>
  )
}
