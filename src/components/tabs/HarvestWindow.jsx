import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area,
} from 'recharts'
import { useApp } from '../../App'
import { getUsers } from '../../api'
import { Spinner } from '../../hooks/useApi'
import { USERS as LOCAL_USERS } from '../../data/users'
import NudgeModal from '../NudgeModal'

/* ── helpers ─────────────────────────────── */
function applyLocalFilter(users, filter) {
  let out = [...users]
  if (filter === 'churn')   out = out.filter(u => u.prediction === 'Churn' || u.prediction === 'Withdraw')
  if (filter === 'upgrade') out = out.filter(u => u.prediction === 'Upgrade')
  if (filter === 'renew')   out = out.filter(u => u.prediction === 'Renew')
  return out.sort((a, b) => b.riskScore - a.riskScore)
}

function computeCounts(users) {
  return {
    churn:   users.filter(u => u.prediction === 'Churn' || u.prediction === 'Withdraw').length,
    upgrade: users.filter(u => u.prediction === 'Upgrade').length,
    renew:   users.filter(u => u.prediction === 'Renew').length,
  }
}

function buildMaturityBuckets(users) {
  return [
    { label:'≤ 7d',   users: users.filter(u => u.daysLeft <= 7).length,                    color:'#E05A3A', fill:'rgba(224,90,58,0.8)',   urgency:'Critical' },
    { label:'8–14d',  users: users.filter(u => u.daysLeft >= 8  && u.daysLeft <= 14).length, color:'#D4A853', fill:'rgba(212,168,83,0.8)',   urgency:'High'     },
    { label:'15–21d', users: users.filter(u => u.daysLeft >= 15 && u.daysLeft <= 21).length, color:'#85B093', fill:'rgba(133,176,147,0.8)',  urgency:'Medium'   },
    { label:'22–30d', users: users.filter(u => u.daysLeft >= 22).length,                    color:'#568F7C', fill:'rgba(86,143,124,0.8)',   urgency:'Low'      },
  ]
}

function buildRiskTrendData(users) {
  // Show last 7 urgency-sorted scores as a mini trend
  return users.slice(0, 10).map((u, i) => ({ i, score: u.riskScore }))
}

/* ── styles ──────────────────────────────── */
const PERSONA_STYLE = {
  'Protector':     { color:'#6ABFA0', bg:'rgba(106,191,160,0.12)', border:'rgba(106,191,160,0.3)' },
  'Optimizer':     { color:'#5B9ED6', bg:'rgba(91,158,214,0.12)',  border:'rgba(91,158,214,0.3)'  },
  'Anxious Saver': { color:'#D4A535', bg:'rgba(212,165,53,0.12)',  border:'rgba(212,165,53,0.3)'  },
  'Exiter':        { color:'#E0593A', bg:'rgba(224,89,58,0.12)',   border:'rgba(224,89,58,0.3)'   },
}
const PREDICTION_STYLE = {
  'Renew':    { color:'#6ABFA0', bg:'rgba(106,191,160,0.12)', border:'rgba(106,191,160,0.3)' },
  'Upgrade':  { color:'#5B9ED6', bg:'rgba(91,158,214,0.12)',  border:'rgba(91,158,214,0.3)'  },
  'Withdraw': { color:'#D4A535', bg:'rgba(212,165,53,0.12)',  border:'rgba(212,165,53,0.3)'  },
  'Churn':    { color:'#E0593A', bg:'rgba(224,89,58,0.12)',   border:'rgba(224,89,58,0.3)'   },
}

function daysColor(d) {
  if (d <= 7)  return '#E0593A'
  if (d <= 14) return '#D4A535'
  if (d <= 21) return '#6ABFA0'
  return '#5B9ED6'
}

function DaysBar({ days, c }) {
  const pct = Math.round((days / 30) * 100)
  const color = daysColor(days)
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm w-8" style={{ color }}>{days}d</span>
      <div className="w-20 h-1.5 rounded-full" style={{ background: c.border }}>
        <div className="h-full rounded-full" style={{ width:`${pct}%`, background: color }} />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   COMPONENT
════════════════════════════════════════ */
export default function HarvestWindow() {
  const { t, c } = useApp()
  const [filter,    setFilter]    = useState('all')
  const [allUsers,  setAllUsers]  = useState(LOCAL_USERS.map(u => ({ ...u, nudgesSent:0 })))
  const [loading,   setLoading]   = useState(true)
  const [nudgeUser, setNudgeUser] = useState(null)

  const fetchUsers = async (f = filter) => {
    setLoading(true)
    try {
      const [filtered, all] = await Promise.all([
        getUsers({ filter: f, sort: 'risk' }),
        getUsers({ sort: 'risk' }),
      ])
      setAllUsers(all.users)
    } catch {
      setAllUsers(LOCAL_USERS.map(u => ({ ...u, nudgesSent: 0 })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleFilter = (f) => { setFilter(f); fetchUsers(f) }

  /* Derived data */
  const filteredUsers = useMemo(() => applyLocalFilter(allUsers, filter), [allUsers, filter])
  const counts        = useMemo(() => computeCounts(allUsers), [allUsers])
  const buckets       = useMemo(() => buildMaturityBuckets(allUsers), [allUsers])
  const riskTrend     = useMemo(() => buildRiskTrendData([...allUsers].sort((a,b) => b.riskScore - a.riskScore)), [allUsers])

  const FILTERS = [
    { key:'all',     label: t.filterAll    },
    { key:'churn',   label: t.filterChurn  },
    { key:'upgrade', label: t.filterUpgrade },
    { key:'renew',   label: t.filterRenew  },
  ]

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: c.text }}>{t.harvestTitle}</h2>
          <p className="text-sm mt-0.5" style={{ color: c.accent2 }}>{t.harvestSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
          style={{ background:`${c.accent}12`, border:`1px solid ${c.border}`, color:c.textMuted }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background:c.accent }} />
          {allUsers.length} FDs tracked
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Maturity timeline bar chart */}
        <div className="col-span-7 rounded-2xl p-5" style={{ background: c.card, border:`1px solid ${c.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold" style={{ color: c.text }}>FD Maturity Timeline</div>
              <div className="text-xs mt-0.5" style={{ color: c.accent2 }}>Users by days until maturity</div>
            </div>
            <div className="flex gap-3">
              {buckets.map(b => (
                <div key={b.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: b.color }} />
                  <span className="text-[10px]" style={{ color: c.textDim }}>{b.urgency}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buckets} barSize={40}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fill: c.accent2, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: c.accent2, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: c.cardAlt, border:`1px solid ${c.borderStrong}`, borderRadius:8, fontSize:11 }}
                  formatter={(v, _, props) => [`${v} users`, props.payload.urgency]}
                />
                <Bar dataKey="users" radius={[6,6,0,0]}
                  label={{ position:'top', style:{ fill:c.textMuted, fontSize:11, fontWeight:700 } }}>
                  {buckets.map((b, i) => (
                    <Cell key={i} fill={b.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Bucket stat pills */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {buckets.map(b => (
              <div key={b.label} className="rounded-xl px-3 py-2 text-center"
                style={{ background:`${b.color}12`, border:`1px solid ${b.color}30` }}>
                <div className="text-lg font-bold" style={{ color: b.color }}>{b.users}</div>
                <div className="text-[10px] mt-0.5" style={{ color: c.textDim }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk score trend + summary */}
        <div className="col-span-5 flex flex-col gap-4">
          {/* Risk trend mini chart */}
          <div className="rounded-2xl p-4 flex-1" style={{ background: c.card, border:`1px solid ${c.border}` }}>
            <div className="text-sm font-bold mb-0.5" style={{ color: c.text }}>Top Risk Scores</div>
            <div className="text-xs mb-3" style={{ color: c.accent2 }}>Highest risk users this window</div>
            <div style={{ height: 100 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#E05A3A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#E05A3A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis hide />
                  <YAxis domain={[0, 100]} tick={{ fill: c.accent2, fontSize: 9 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: c.cardAlt, border:`1px solid ${c.borderStrong}`, borderRadius:6, fontSize:11 }}
                    formatter={(v) => [`${v}%`, 'Risk']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#E05A3A" strokeWidth={2}
                    fill="url(#riskGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary stat cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label:'Withdraw / Churn', count: counts.churn,   color:'#E0593A', icon:'⚠' },
              { label:'Upgrade Ready',    count: counts.upgrade, color:'#5B9ED6', icon:'↑' },
              { label:'Will Renew',       count: counts.renew,   color:'#6ABFA0', icon:'↻' },
            ].map(m => (
              <div key={m.label} className="rounded-xl px-3 py-3 text-center"
                style={{ background: c.card, border:`1px solid ${m.color}35` }}>
                <div className="text-base mb-0.5" style={{ color: m.color }}>{m.icon}</div>
                <div className="text-xl font-bold" style={{ color: m.color }}>{m.count}</div>
                <div className="text-[10px] mt-0.5 leading-tight" style={{ color: c.textDim }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => handleFilter(f.key)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: filter === f.key ? c.accent2 : c.card,
              color:      filter === f.key ? '#BDD1BD' : c.textDim,
              border:     filter === f.key ? `1px solid ${c.accent2}` : `1px solid ${c.border}`,
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <Spinner c={c} />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${c.border}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: c.cardAlt, borderBottom:`1px solid ${c.border}` }}>
                {[t.colUser, t.colAmount, t.colDays, t.colPersona, t.colPrediction, t.colRisk, t.colAction].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-bold tracking-widest"
                    style={{ color: c.accent2 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => {
                const ps = PERSONA_STYLE[u.persona]       || PERSONA_STYLE['Protector']
                const pr = PREDICTION_STYLE[u.prediction] || PREDICTION_STYLE['Renew']
                return (
                  <tr key={u.id}
                    style={{ background: i%2===0 ? c.rowEven : c.rowOdd, borderBottom:`1px solid ${c.border}` }}
                    className="hover:brightness-110 transition-all">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm" style={{ color: c.text }}>{u.name}</div>
                      <div className="text-xs" style={{ color: c.accent2 }}>{u.city}</div>
                      {u.nudgesSent > 0 && (
                        <div className="text-[10px] mt-0.5" style={{ color: c.textDim }}>
                          {u.nudgesSent} nudge{u.nudgesSent > 1 ? 's' : ''} sent
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: c.textMuted }}>{u.fdAmount}</td>
                    <td className="px-4 py-3"><DaysBar days={u.daysLeft} c={c} /></td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{ background:ps.bg, color:ps.color, border:`1px solid ${ps.border}` }}>
                        {u.persona}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{ background:pr.bg, color:pr.color, border:`1px solid ${pr.border}` }}>
                        {u.prediction}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-sm"
                          style={{ color: u.riskScore>75 ? c.danger : u.riskScore>50 ? c.warning : c.accent }}>
                          {u.riskScore}%
                        </div>
                        <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: c.border }}>
                          <div className="h-full rounded-full"
                            style={{ width:`${u.riskScore}%`,
                              background: u.riskScore>75 ? c.danger : u.riskScore>50 ? c.warning : c.accent }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setNudgeUser(u)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                        style={{ background: c.cardAlt, color: c.text, border:`1px solid ${c.borderStrong}` }}>
                        {t.sendNudge}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {nudgeUser && (
        <NudgeModal user={nudgeUser}
          onClose={() => setNudgeUser(null)}
          onSent={() => fetchUsers()}
        />
      )}
    </div>
  )
}
