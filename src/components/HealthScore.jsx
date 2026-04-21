import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { useApp } from '../App'
import { getAnalytics } from '../api'
import { useApi } from '../hooks/useApi'

const SPARKLINE = [{ v:68},{v:70},{v:69},{v:71},{v:70},{v:72},{v:74}]

export default function HealthScore() {
  const { t, c } = useApp()
  const { data } = useApi(getAnalytics)  // non-blocking; falls back to static

  const score = data?.healthScore ?? 74

  return (
    <div className="flex items-center gap-8">

      {/* Score block */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="rounded-2xl px-5 py-3 relative overflow-hidden"
          style={{ background: c.card, border:`1px solid ${c.accent}40` }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:`radial-gradient(circle at top right, ${c.accent}18 0%, transparent 70%)` }} />
          <div className="text-[10px] font-bold tracking-widest mb-1 relative" style={{ color: c.accent2 }}>
            PLATFORM HEALTH
          </div>
          <div className="flex items-end gap-2 relative">
            <span className="font-black leading-none" style={{ fontSize: 56, color: c.accent }}>{score}</span>
            <div className="pb-1">
              <div className="text-xs font-bold" style={{ color: c.accent }}>/ 100</div>
              <div className="text-xs font-semibold" style={{ color:'#6ABFA0' }}>{t.healthDelta}</div>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div style={{ width: 110, height: 52 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SPARKLINE}>
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor={c.accent} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={c.accent} stopOpacity={1} />
                </linearGradient>
              </defs>
              <Line type="monotone" dataKey="v" stroke="url(#sparkGrad)" strokeWidth={2.5} dot={false} />
              <Tooltip
                contentStyle={{ background: c.cardAlt, border:`1px solid ${c.borderStrong}`, borderRadius:6, fontSize:11 }}
                itemStyle={{ color: c.accent }}
                labelFormatter={() => ''}
                formatter={(v) => [v, 'Score']}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bullets */}
      <div className="flex flex-col gap-2">
        {[
          { color:'#6ABFA0', text: t.bullet1 },
          { color:'#85B093', text: t.bullet2 },
          { color:'#E0593A', text: t.bullet3 },
        ].map(({ color, text }) => (
          <div key={text} className="flex items-center gap-2.5 text-sm">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <span style={{ color: c.textMuted }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Live nudge counter */}
      <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-xs"
        style={{ background: c.card, border:`1px solid ${c.border}` }}>
        <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: c.accent }} />
        <span style={{ color: c.textMuted }}>
          <span className="font-bold" style={{ color: c.accent }}>
            {data ? data.nudgesSent : '—'}
          </span>{' '}nudges sent today
        </span>
      </div>
    </div>
  )
}
