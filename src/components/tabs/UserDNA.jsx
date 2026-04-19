import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area,
} from 'recharts'
import { useApp } from '../../App'
import { COHORT_DATA } from '../../data/personas'
import { SIGNALS } from '../../data/signals'
import { getAnalytics } from '../../api'

/* ── Helpers ─────────────────────────── */
const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)

/* ── Distinct palette per persona ────── */
const PERSONA_PALETTE = {
  'Protector':     { color:'#6ABFA0', bg:'rgba(106,191,160,0.08)', border:'rgba(106,191,160,0.30)', bar:'#6ABFA0' },
  'Optimizer':     { color:'#5B9ED6', bg:'rgba(91,158,214,0.08)',  border:'rgba(91,158,214,0.30)',  bar:'#5B9ED6' },
  'Anxious Saver': { color:'#D4A535', bg:'rgba(212,165,53,0.08)',  border:'rgba(212,165,53,0.30)',  bar:'#D4A535' },
  'Exiter':        { color:'#E0593A', bg:'rgba(224,89,58,0.08)',   border:'rgba(224,89,58,0.30)',   bar:'#E0593A' },
}

const PERSONA_META = {
  'Protector':     { icon:'🛡️', tagline:'Long tenors, high trust. Rarely checks the app.', stat:'Avg. FD: 24 mo', action:'Rate highlight + safety signal', trend:[30800,31000,31100,31150,31200,31200] },
  'Optimizer':     { icon:'📊', tagline:'Rate-hunters. Reinvests frequently, short tenors.', stat:'Avg. FD: 9 mo', action:'Performance data + product variety', trend:[9100,9200,9300,9400,9450,9500] },
  'Anxious Saver': { icon:'😰', tagline:'Visits often, never commits. Checks insurance.', stat:'Avg. FD: 12 mo', action:'Reassurance + DICGC safety nudge', trend:[5800,5900,5950,6000,6000,6000] },
  'Exiter':        { icon:'🚪', tagline:'Declining sessions. FD maturing. At-risk.', stat:'Avg. FD: 6 mo', action:'Immediate personal intervention', trend:[3200,3300,3400,3450,3480,3500] },
}

/* ── Signal config ──────────────────── */
const SIG_META = {
  early_withdrawal: { color:'#E0593A', risk:'HIGH',        riskBg:'rgba(224,89,58,0.12)',  icon:'⚠️',  label:'Early Withdrawal' },
  safety_check:     { color:'#D4A535', risk:'MEDIUM',      riskBg:'rgba(212,165,53,0.12)', icon:'🔒',  label:'Safety Check' },
  rate_compare:     { color:'#6ABFA0', risk:'MEDIUM',      riskBg:'rgba(106,191,160,0.12)',icon:'📊',  label:'Rate Compare' },
  mf_browse:        { color:'#5B9ED6', risk:'OPPORTUNITY', riskBg:'rgba(91,158,214,0.12)', icon:'📈',  label:'MF Browse' },
  stocks_search:    { color:'#9B7DD4', risk:'OPPORTUNITY', riskBg:'rgba(155,125,212,0.12)',icon:'🚀',  label:'Stock Search' },
  no_login_30d:     { color:'#CC3A2C', risk:'CRITICAL',    riskBg:'rgba(204,58,44,0.12)',  icon:'💤',  label:'Inactive 30d' },
}

const RISK_COLOR = { CRITICAL:'#CC3A2C', HIGH:'#E0593A', MEDIUM:'#D4A535', OPPORTUNITY:'#5B9ED6' }

const TOTAL_USERS = 50000

const MONTHS = ['Nov','Dec','Jan','Feb','Mar','Apr']

/* Micro sparkline inside persona cards */
function PersonaSparkline({ trend, color }) {
  const data = trend.map((v, i) => ({ i, v }))
  return (
    <div style={{ width: '100%', height: 36 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false}
            fill={`url(#sg-${color.replace('#','')})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/* Donut slice custom label — hidden (legend handles it) */
const RADIAN = Math.PI / 180
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, pct, name }) {
  if (pct < 5) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 10, fontWeight: 700 }}>
      {pct}%
    </text>
  )
}

/* Radar data builder from signals */
function buildRadarData(signals) {
  return signals.map(s => ({
    signal: SIG_META[s.key]?.label || s.key,
    score:  Math.round((s.count / TOTAL_USERS) * 100),
    color:  SIG_META[s.key]?.color || '#568F7C',
  }))
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function UserDNA() {
  const { t, lang, c } = useApp()
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    getAnalytics()
      .then(d => setAnalytics(d))
      .catch(() => { /* silent — use fallback */ })
      .finally(() => setLoading(false))
  }, [])

  /* ── Build data from API or local fallback ── */
  const personaBreakdown = analytics?.personaBreakdown ?? {
    Protector: 31200, Optimizer: 9500, 'Anxious Saver': 6000, Exiter: 3500,
  }
  const total = Object.values(personaBreakdown).reduce((a, b) => a + b, 0)

  const personas = Object.entries(personaBreakdown).map(([key, count]) => ({
    key, count,
    pct: Math.round((count / total) * 100),
    ...PERSONA_META[key],
  }))

  const signalCounts = analytics?.signalCounts ?? {}
  const signals = SIGNALS.map(s => ({ ...s, count: signalCounts[s.key] ?? s.count }))

  const donutData = personas.map(p => ({
    name: p.key, value: p.count, color: PERSONA_PALETTE[p.key]?.color,
  }))

  const radarData = buildRadarData(signals)

  /* Stacked cohort data with correct colors */
  const stackedCohort = COHORT_DATA.map(row => ({ ...row }))

  /* ── Skeleton ── */
  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="rounded-2xl p-5 animate-pulse h-52"
            style={{ background: c.card, border:`1px solid ${c.border}` }} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">

      {/* ══ HEADER ══ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: c.text }}>{t.dnaTitle}</h2>
          <p className="text-sm mt-0.5" style={{ color: c.accent2 }}>{t.dnaSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{ background:`${c.accent}12`, border:`1px solid ${c.border}`, color:c.textMuted }}>
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: c.accent }} />
          Live — {total.toLocaleString()} users classified
        </div>
      </div>

      {/* ══ ROW 1: Donut + Persona Cards ══ */}
      <div className="grid grid-cols-12 gap-6">

        {/* Donut chart */}
        <div className="col-span-4 rounded-2xl p-5 flex flex-col"
          style={{ background: c.card, border:`1px solid ${c.border}` }}>
          <div className="text-sm font-semibold mb-1" style={{ color: c.text }}>Persona Share</div>
          <div className="text-xs mb-4" style={{ color: c.accent2 }}>Distribution across {(total/1000).toFixed(1)}k users</div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%"
                  innerRadius={52} outerRadius={80}
                  paddingAngle={3} dataKey="value"
                  labelLine={false}
                  label={(props) => <CustomLabel {...props} pct={Math.round(props.value/total*100)} />}>
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: c.cardAlt, border:`1px solid ${c.borderStrong}`, borderRadius:8, fontSize:11 }}
                  formatter={(v, name) => [fmt(v) + ' users', name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="space-y-2 mt-2">
            {personas.map(p => {
              const pal = PERSONA_PALETTE[p.key]
              return (
                <div key={p.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: pal.color }} />
                    <span className="text-xs" style={{ color: c.textMuted }}>{p.key}</span>
                  </div>
                  <span className="text-xs font-semibold font-mono" style={{ color: pal.color }}>{p.pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 2×2 Persona Cards */}
        <div className="col-span-8 grid grid-cols-2 gap-4">
          {personas.map((p) => {
            const pal = PERSONA_PALETTE[p.key]
            return (
              <div key={p.key}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:brightness-105 relative overflow-hidden"
                style={{ background: c.card, border:`1px solid ${pal.border}` }}>
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 pointer-events-none"
                  style={{ background: pal.bg, filter:'blur(20px)' }} />

                {/* Top row */}
                <div className="flex items-start justify-between relative">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ background: pal.bg, border:`1px solid ${pal.border}` }}>
                      {p.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight" style={{ color: c.text }}>{p.key}</div>
                      <div className="text-xs" style={{ color: pal.color }}>{p.stat}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold leading-none" style={{ color: pal.color }}>{p.pct}%</div>
                    <div className="text-[10px] mt-0.5" style={{ color: c.textDim }}>{fmt(p.count)} users</div>
                  </div>
                </div>

                {/* Sparkline */}
                <PersonaSparkline trend={p.trend} color={pal.color} />

                {/* Tagline */}
                <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>{p.tagline}</p>

                {/* Recommended action */}
                <div className="rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5"
                  style={{ background: pal.bg, color: pal.color }}>
                  <span>→</span> {p.action}
                </div>

                {/* Drift warning for Exiter */}
                {p.key === 'Exiter' && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: c.warning }}>
                    <span>⚠</span>
                    <span>Optimizer → Exiter drift: +14 this week</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ══ DRIFT ALERT ══ */}
      <div className="flex items-center gap-4 rounded-2xl px-6 py-4"
        style={{ background:`${c.warning}0D`, border:`1px solid ${c.warning}40` }}>
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <div className="text-sm font-bold" style={{ color: c.warning }}>{t.driftTitle}</div>
          <div className="text-xs mt-0.5" style={{ color: c.textDim }}>{t.driftDesc}</div>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-full font-semibold shrink-0"
          style={{ background:`${c.warning}20`, color:c.warning, border:`1px solid ${c.warning}40` }}>
          14 users shifted
        </div>
      </div>

      {/* ══ ROW 2: Signals + Radar ══ */}
      <div className="grid grid-cols-2 gap-6">

        {/* Signal cards */}
        <div>
          <div className="text-sm font-bold mb-1" style={{ color: c.text }}>{t.signalsTitle}</div>
          <p className="text-xs mb-4" style={{ color: c.accent2 }}>{t.signalsSub}</p>
          <div className="space-y-3">
            {signals.map((s) => {
              const m     = SIG_META[s.key] || {}
              const label = lang === 'HI' ? s.labelHi : s.label
              const pct   = Math.round((s.count / TOTAL_USERS) * 100)
              return (
                <div key={s.key} className="rounded-xl p-3.5 transition-all hover:brightness-105"
                  style={{ background: c.card, border:`1px solid ${c.border}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{m.icon}</span>
                      <span className="text-xs font-medium" style={{ color: c.text }}>{label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: m.riskBg, color: RISK_COLOR[m.risk] || m.color }}>
                        {m.risk}
                      </span>
                      <span className="text-xs font-bold font-mono" style={{ color: m.color }}>{fmt(s.count)}</span>
                    </div>
                  </div>
                  {/* Segmented progress bar */}
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: c.border }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width:`${pct}%`, background:`linear-gradient(90deg, ${m.color}88, ${m.color})` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px]" style={{ color: c.textDim }}>{pct}% of users</span>
                    <span className="text-[10px]" style={{ color: c.textDim }}>{TOTAL_USERS.toLocaleString()} total</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Radar chart */}
        <div>
          <div className="text-sm font-bold mb-1" style={{ color: c.text }}>Signal Strength Radar</div>
          <p className="text-xs mb-4" style={{ color: c.accent2 }}>Behavioral signal intensity across platform</p>
          <div className="rounded-2xl p-4" style={{ background: c.card, border:`1px solid ${c.border}` }}>
            <div style={{ height: 270 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <PolarGrid stroke={c.border} />
                  <PolarAngleAxis dataKey="signal"
                    tick={{ fill: c.accent2, fontSize: 9, fontWeight: 600 }} />
                  <Radar name="Signal %" dataKey="score"
                    stroke={c.accent} strokeWidth={2}
                    fill={c.accent} fillOpacity={0.18}
                    dot={{ fill: c.accent, r: 3, strokeWidth: 0 }}
                  />
                  <Tooltip
                    contentStyle={{ background: c.cardAlt, border:`1px solid ${c.borderStrong}`, borderRadius:8, fontSize:11 }}
                    formatter={(v) => [`${v}%`, 'Penetration']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Signal intensity legend */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {signals.map(s => {
                const m = SIG_META[s.key] || {}
                return (
                  <div key={s.key} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                    <span className="text-[10px] truncate" style={{ color: c.textDim }}>{m.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ ROW 3: Cohort chart (full width) ══ */}
      <div className="rounded-2xl p-6" style={{ background: c.card, border:`1px solid ${c.border}` }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-sm font-bold" style={{ color: c.text }}>{t.cohortTitle}</div>
            <p className="text-xs mt-0.5" style={{ color: c.accent2 }}>6-month persona distribution across 50k users</p>
          </div>
          <div className="flex gap-3">
            {personas.map(p => (
              <div key={p.key} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: PERSONA_PALETTE[p.key]?.color }} />
                <span className="text-xs" style={{ color: c.textMuted }}>{p.key}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedCohort} barSize={28} barGap={3}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: c.accent2, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: c.accent2, fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => (v/1000).toFixed(0)+'k'} width={32} />
              <Tooltip
                contentStyle={{ background: c.cardAlt, border:`1px solid ${c.borderStrong}`, borderRadius:8, fontSize:11 }}
                itemStyle={{ color: c.textMuted }}
                formatter={(v, name) => [fmt(v) + ' users', name]}
              />
              <Bar dataKey="Protector"     stackId="s" fill={PERSONA_PALETTE['Protector'].bar}     radius={[0,0,0,0]} />
              <Bar dataKey="Optimizer"     stackId="s" fill={PERSONA_PALETTE['Optimizer'].bar}     radius={[0,0,0,0]} />
              <Bar dataKey="Anxious Saver" stackId="s" fill={PERSONA_PALETTE['Anxious Saver'].bar} radius={[0,0,0,0]} />
              <Bar dataKey="Exiter"        stackId="s" fill={PERSONA_PALETTE['Exiter'].bar}        radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══ ROW 4: Engagement + Risk Matrix ══ */}
      <div className="grid grid-cols-3 gap-4">
        {/* Engagement score cards */}
        {[
          { label:'Avg. Session Depth',  value:'4.2 pages', delta:'+0.8 vs last mo', color:'#6ABFA0' },
          { label:'Days to Decision',    value:'8.3 days',  delta:'-1.2 faster',     color:'#5B9ED6' },
          { label:'Nudge Response Rate', value:'31.4%',     delta:'+4% this week',   color:'#D4A535' },
          { label:'Renewal Conversion',  value:'74%',       delta:'+3pts this month',color:'#6ABFA0' },
          { label:'Upgrade Pipeline',    value:'14.6k',     delta:'Ready to act',    color:'#5B9ED6' },
          { label:'Churn Prevented',     value:'847',       delta:'This cycle',      color:'#9B7DD4' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl px-4 py-3.5 hover:brightness-105 transition-all"
            style={{ background: c.card, border:`1px solid ${m.color}28` }}>
            <div className="text-[10px] font-bold tracking-widest mb-1.5" style={{ color: m.color }}>{m.label.toUpperCase()}</div>
            <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[10px] mt-1" style={{ color: c.textDim }}>{m.delta}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
