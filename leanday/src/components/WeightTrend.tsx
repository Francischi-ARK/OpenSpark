import type { WeightLog } from '../lib/types'

/** Simple 7-day weight sparkline — trend over daily noise. */
export function WeightTrend({ weights }: { weights: WeightLog[] }) {
  const points = [...weights]
    .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))
    .slice(-7)

  if (points.length === 0) {
    return <p className="hint">连续记录后，这里会显示 7 日趋势。</p>
  }

  if (points.length === 1) {
    return (
      <p className="hint">
        已有 {points[0].kg} kg。再记几天后，趋势会比单日波动更有参考价值。
      </p>
    )
  }

  const values = points.map((p) => p.kg)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(max - min, 0.4)
  const w = 320
  const h = 96
  const pad = 10

  const coords = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (values.length - 1)
    const y = h - pad - ((v - min) / span) * (h - pad * 2)
    return `${x},${y}`
  })

  const delta = values[values.length - 1] - values[0]
  const deltaText =
    Math.abs(delta) < 0.05
      ? '近几日基本持平'
      : delta < 0
        ? `近 ${points.length} 次称重约下降 ${Math.abs(delta).toFixed(1)} kg`
        : `近 ${points.length} 次称重约上升 ${delta.toFixed(1)} kg`

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="体重趋势">
        <polyline
          fill="none"
          stroke="rgba(15,118,110,0.25)"
          strokeWidth="2"
          points={`${pad},${h - pad} ${w - pad},${h - pad}`}
        />
        <polyline
          fill="none"
          stroke="#0f766e"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={coords.join(' ')}
        />
        {coords.map((c, i) => {
          const [x, y] = c.split(',').map(Number)
          return <circle key={points[i].id} cx={x} cy={y} r="4" fill="#0f766e" />
        })}
      </svg>
      <div className="row" style={{ marginTop: 4 }}>
        <strong>{values[values.length - 1]} kg</strong>
        <span className="hint">{deltaText}</span>
      </div>
      <p className="hint" style={{ marginTop: 6 }}>
        淡化单日水分波动；连续 2–3 周后再按趋势微调预算。
      </p>
    </div>
  )
}
