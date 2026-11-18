export type Pt = { label: string; v: number }

export function LineChart({ pts }: { pts: Pt[] }) {
  const max = Math.ceil(Math.max(1, ...pts.map(p => p.v)) / 3) * 3, dots = pts.length <= 10, every = Math.ceil(pts.length / 8)
  const x = (i: number) => pts.length < 2 ? 270 : 50 + i * 460 / (pts.length - 1)
  const y = (v: number) => 200 - v / max * 162
  return (
    <svg viewBox="0 0 540 240" role="img" className="w-full h-auto block" aria-label={`Biểu đồ đường: ${pts.map(p => `${p.label} ${p.v}`).join(', ')}`}>
      {[0, 1, 2, 3].map(i => <g key={i}>
        <line x1="30" x2="510" y1={200 - i * 54} y2={200 - i * 54} stroke="#ECEDF0" />
        <text x="22" y={204 - i * 54} fontSize="11" fill="#6B7280" textAnchor="end">{max * i / 3}</text>
      </g>)}
      <polyline points={pts.map((p, i) => `${x(i)},${y(p.v)}`).join(' ')} fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinejoin="round" />
      {pts.map((p, i) => <g key={i}>
        {(dots || p.v > 0) && <circle cx={x(i)} cy={y(p.v)} r={dots ? 4.5 : 3} fill="#fff" stroke="#4F46E5" strokeWidth="2" />}
        {(dots || p.v > 0) && <text x={x(i)} y={y(p.v) - 12} fontSize="12" fontWeight="600" fill="#111827" textAnchor="middle">{p.v}</text>}
        {i % every === 0 && <text x={x(i)} y="226" fontSize="11" fill="#4B5563" textAnchor="middle">{p.label}</text>}
      </g>)}
    </svg>
  )
}
