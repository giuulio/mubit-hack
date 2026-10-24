// Minimal inline SVG charts, so the interface needs no chart library.

// A sparkline: how a value moved over time, with the latest point marked.
export function Spark({ values, width = 120, height = 32, color = 'var(--text)' }: { values: number[]; width?: number; height?: number; color?: string }) {
  if (values.length < 2) return null
  const max = Math.max(...values) * 1.1 || 1
  const x = (i: number) => (i / (values.length - 1)) * (width - 6) + 3
  const y = (v: number) => height - 3 - (v / max) * (height - 6)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const end = values.length - 1
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" className="spark">
      <path d={`${d}L${x(end)} ${height}L${x(0)} ${height}Z`} fill={color} fillOpacity="0.08" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(end)} cy={y(values[end])} r="2.5" fill={color} />
    </svg>
  )
}
