import { useApp } from '../App'
import { getAnalytics } from '../api'
import { useApi } from '../hooks/useApi'

/* Static fallback values — shown when backend is unreachable */
const FALLBACK = {
  churnRisk: 847, harvestWindow: 340, highIntent: 2341,
  retentionRate: 74, beyondFD: 14600,
}

export default function MetricsBar() {
  const { t, c } = useApp()
  const { data, loading } = useApi(getAnalytics)   // non-blocking; never shows error

  /* During first load show skeleton, then always show data (live or fallback) */
  const d = data ?? FALLBACK

  if (loading && !data) return (
    <div className="grid grid-cols-5 gap-3">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="rounded-xl px-4 py-3 animate-pulse"
          style={{ background: c.card, border: `1px solid ${c.border}`, height: 76 }} />
      ))}
    </div>
  )

  const METRICS = [
    { labelKey:'churnRisk',     subKey:'churnSub',     value: d.churnRisk.toLocaleString(),        color:'#E0593A', accent:'rgba(224,89,58,0.12)'   },
    { labelKey:'harvestWindow', subKey:'harvestSub',    value: d.harvestWindow.toString(),          color:'#D4A535', accent:'rgba(212,165,53,0.12)'  },
    { labelKey:'highIntent',    subKey:'highIntentSub', value: d.highIntent.toLocaleString(),       color:'#6ABFA0', accent:'rgba(106,191,160,0.12)' },
    { labelKey:'retention',     subKey:'retentionSub',  value: d.retentionRate + '%',               color:'#BDD1BD', accent:'rgba(189,209,189,0.08)' },
    { labelKey:'beyondFD',      subKey:'beyondFDSub',   value: (d.beyondFD/1000).toFixed(1) + 'k', color:'#9B7DD4', accent:'rgba(155,125,212,0.12)' },
  ]

  return (
    <div className="grid grid-cols-5 gap-3">
      {METRICS.map(({ labelKey, subKey, value, color, accent }) => (
        <div key={labelKey}
          className="rounded-2xl px-5 py-4 transition-all hover:brightness-110 relative overflow-hidden"
          style={{ background: c.card, border:`1px solid ${color}30` }}>
          {/* subtle colored glow top-right */}
          <div className="absolute top-0 right-0 w-16 h-16 -translate-y-4 translate-x-4 rounded-full pointer-events-none"
            style={{ background: accent, filter:'blur(14px)' }} />
          <div className="text-[10px] font-bold tracking-widest mb-2 relative" style={{ color }}>
            {t[labelKey]}
          </div>
          <div className="text-3xl font-bold leading-none relative" style={{ color }}>{value}</div>
          <div className="text-xs mt-1.5 relative" style={{ color: c.textDim }}>{t[subKey]}</div>
        </div>
      ))}
    </div>
  )
}
