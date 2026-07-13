import { motion } from 'framer-motion'

interface Props {
  value: number
  max: number
  label: string
  sublabel: string
  accent?: string
}

export function ProgressRing({ value, max, label, sublabel, accent = '#0f766e' }: Props) {
  const size = 196
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const ratio = max <= 0 ? 0 : Math.min(Math.max(value / max, 0), 1.15)
  const offset = c * (1 - Math.min(ratio, 1))

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(20,42,38,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeContent: 'center',
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div className="eyebrow">{label}</div>
        <motion.div
          className="stat-num"
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '2.4rem', marginTop: 4 }}
        >
          {Math.round(value)}
        </motion.div>
        <div className="hint" style={{ marginTop: 2 }}>
          {sublabel}
        </div>
      </div>
    </div>
  )
}
