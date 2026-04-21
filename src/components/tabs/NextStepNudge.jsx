import { useApp } from '../../App'
import { PRODUCTS, RISK_SPECTRUM } from '../../data/products'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar,
} from 'recharts'

/* New palette aligned to the teal/navy theme */
const PRODUCT_PALETTE = {
  debt_mf:     { color:'#6ABFA0', glow:'rgba(106,191,160,0.15)', border:'rgba(106,191,160,0.3)', badge:'Low'       },
  hybrid_fund: { color:'#D4A535', glow:'rgba(212,165,53,0.15)',  border:'rgba(212,165,53,0.3)',  badge:'Medium'    },
  index_fund:  { color:'#5B9ED6', glow:'rgba(91,158,214,0.15)',  border:'rgba(91,158,214,0.3)',  badge:'Med–High'  },
  digital_gold:{ color:'#C4A535', glow:'rgba(196,165,53,0.15)',  border:'rgba(196,165,53,0.3)',  badge:'Medium'    },
}

const SPECTRUM_COLORS = ['#6ABFA0','#4CA88A','#C4A535','#D4A535','#5B9ED6','#E0593A']

const PRODUCT_COUNTS = { debt_mf:9500, hybrid_fund:6000, index_fund:5200, digital_gold:4800 }

/* Interest chart data */
const INTEREST_DATA = [
  { name:'Debt MF',  users:9500,  color:'#6ABFA0' },
  { name:'Hybrid',   users:6000,  color:'#D4A535' },
  { name:'Index',    users:5200,  color:'#5B9ED6' },
  { name:'D. Gold',  users:4800,  color:'#C4A535' },
]

const TOTAL_BEYOND_FD = 14600

/* Radial chart for upgrade readiness */
const READINESS_DATA = [
  { name:'Strongly Ready', value:31, fill:'#6ABFA0' },
  { name:'Exploring',      value:52, fill:'#5B9ED6' },
  { name:'Hesitant',       value:17, fill:'#D4A535' },
]

export default function NextStepNudge() {
  const { t, lang, c } = useApp()

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: c.text }}>{t.nudgeTitle}</h2>
          <p className="text-sm mt-0.5" style={{ color: c.accent2 }}>{t.nudgeSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{ background:`${c.accent}12`, border:`1px solid ${c.border}`, color:c.textMuted }}>
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background:c.accent }} />
          {TOTAL_BEYOND_FD.toLocaleString()} users showing beyond-FD signals
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Product interest bar chart */}
        <div className="col-span-6 rounded-2xl p-5" style={{ background: c.card, border:`1px solid ${c.border}` }}>
          <div className="text-sm font-bold mb-0.5" style={{ color: c.text }}>Product Interest Pipeline</div>
          <div className="text-xs mb-4" style={{ color: c.accent2 }}>Users actively exploring each product</div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INTEREST_DATA} barSize={40}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: c.accent2, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: c.accent2, fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => (v/1000).toFixed(0)+'k'} />
                <Tooltip
                  contentStyle={{ background: c.cardAlt, border:`1px solid ${c.borderStrong}`, borderRadius:8, fontSize:11 }}
                  formatter={(v) => [`${v.toLocaleString()} users`, 'Exploring']}
                />
                <Bar dataKey="users" radius={[6,6,0,0]}
                  label={{ position:'top', style:{ fill: c.textMuted, fontSize:11, fontWeight:700 },
                    formatter: v => (v/1000).toFixed(1)+'k' }}>
                  {INTEREST_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upgrade readiness radial */}
        <div className="col-span-3 rounded-2xl p-5" style={{ background: c.card, border:`1px solid ${c.border}` }}>
          <div className="text-sm font-bold mb-0.5" style={{ color: c.text }}>Upgrade Readiness</div>
          <div className="text-xs mb-2" style={{ color: c.accent2 }}>% of beyond-FD users</div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius={28} outerRadius={72}
                data={READINESS_DATA} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={4} background={{ fill: c.border }} />
                <Tooltip
                  contentStyle={{ background: c.cardAlt, border:`1px solid ${c.borderStrong}`, borderRadius:8, fontSize:11 }}
                  formatter={(v, name) => [`${v}%`, name]}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-1">
            {READINESS_DATA.map(r => (
              <div key={r.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: r.fill }} />
                  <span className="text-[10px]" style={{ color: c.textDim }}>{r.name}</span>
                </div>
                <span className="text-[10px] font-bold" style={{ color: r.fill }}>{r.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick KPI column */}
        <div className="col-span-3 flex flex-col gap-3">
          {[
            { label:'Avg CTR on nudges', value:'31.4%',  color:'#6ABFA0', icon:'📩' },
            { label:'Beyond-FD ready',   value:'14.6k',  color:'#5B9ED6', icon:'🚀' },
            { label:'Upgrades this mo.', value:'1,340',  color:'#D4A535', icon:'↑'  },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-3 flex items-center gap-3 flex-1"
              style={{ background: c.card, border:`1px solid ${s.color}35` }}>
              <span className="text-xl shrink-0">{s.icon}</span>
              <div>
                <div className="text-xl font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] mt-0.5" style={{ color: c.textDim }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Product cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {PRODUCTS.map((p) => {
          const pal     = PRODUCT_PALETTE[p.key] || { color: c.accent, glow: `${c.accent}15`, border: c.border }
          const name    = lang === 'HI' ? p.nameHi    : p.name
          const horizon = lang === 'HI' ? p.horizonHi : p.horizon
          const bestFor = lang === 'HI' ? p.bestForHi : p.bestFor
          const desc    = lang === 'HI' ? p.descriptionHi : p.description
          const count   = PRODUCT_COUNTS[p.key] || 0
          const pct     = Math.round((count / TOTAL_BEYOND_FD) * 100)

          return (
            <div key={p.key}
              className="rounded-2xl p-5 flex flex-col transition-all hover:brightness-110 relative overflow-hidden"
              style={{ background: c.card, border:`1px solid ${pal.border}` }}>
              {/* Glow */}
              <div className="absolute top-0 right-0 w-20 h-20 -translate-y-6 translate-x-6 rounded-full pointer-events-none"
                style={{ background: pal.glow, filter:'blur(18px)' }} />

              {/* Header */}
              <div className="flex items-start justify-between mb-3 relative">
                <span className="text-2xl">{p.icon}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background:`${pal.color}20`, color:pal.color, border:`1px solid ${pal.border}` }}>
                  {pal.badge} risk
                </span>
              </div>

              {/* Name + desc */}
              <div className="font-bold text-base mb-1.5" style={{ color: c.text }}>{name}</div>
              <p className="text-xs leading-relaxed flex-1 mb-3" style={{ color: c.textDim }}>{desc}</p>

              {/* Meta rows */}
              <div className="space-y-1.5 mb-4 py-3 rounded-xl px-3"
                style={{ background:`${pal.color}08`, border:`1px solid ${pal.border}` }}>
                <div className="flex justify-between text-xs">
                  <span style={{ color: c.accent2 }}>Horizon</span>
                  <span className="font-medium" style={{ color: c.textMuted }}>{horizon}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: c.accent2 }}>Best for</span>
                  <span className="font-medium" style={{ color: pal.color }}>{bestFor}</span>
                </div>
              </div>

              {/* Interest bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] mb-1">
                  <span style={{ color: c.textDim }}>{count.toLocaleString()} users exploring</span>
                  <span style={{ color: pal.color }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: c.border }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width:`${pct}%`, background:`linear-gradient(90deg, ${pal.color}99, ${pal.color})` }} />
                </div>
              </div>

              {/* CTA */}
              <button className="w-full py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                style={{ background:`${pal.color}20`, color:pal.color, border:`1px solid ${pal.border}` }}>
                {t.learnMore}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Risk spectrum ── */}
      <div className="rounded-2xl p-5" style={{ background: c.card, border:`1px solid ${c.border}` }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-sm font-bold" style={{ color: c.text }}>{t.riskSpectrum}</div>
            <div className="text-xs mt-0.5" style={{ color: c.accent2 }}>From capital-safe to high-growth</div>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: c.accent2 }}>
            <span>← {t.riskSafe}</span>
            <div className="w-24 h-1.5 rounded-full"
              style={{ background:'linear-gradient(90deg, #6ABFA0, #D4A535, #E0593A)' }} />
            <span>{t.riskHigh} →</span>
          </div>
        </div>
        <div className="flex items-stretch gap-2">
          {RISK_SPECTRUM.map((item, i) => {
            const label = lang === 'HI' ? item.labelHi : item.label
            const col   = SPECTRUM_COLORS[i]
            const heights = [48, 56, 64, 72, 80, 92]
            return (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-lg flex items-end justify-center pb-1 transition-all hover:brightness-110"
                  style={{ height: heights[i], background:`${col}22`, border:`1px solid ${col}40` }}>
                  <span className="text-[10px] font-bold" style={{ color: col }}>{i + 1}</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: col, opacity: 0.7 + i * 0.06 }} />
                <span className="text-xs font-semibold text-center" style={{ color: c.textMuted }}>{label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── SEBI disclaimer ── */}
      <div className="rounded-xl px-4 py-3 text-xs leading-relaxed"
        style={{ background:`${c.accent}08`, color:c.textDim, border:`1px solid ${c.border}` }}>
        {t.sebiNote}
      </div>
    </div>
  )
}
