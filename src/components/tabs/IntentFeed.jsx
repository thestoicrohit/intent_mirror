import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
} from 'recharts'
import { useApp } from '../../App'
import { getUsers } from '../../api'
import { Spinner } from '../../hooks/useApi'
import { SIGNAL_LABELS } from '../../data/signals'
import { USERS as LOCAL_USERS } from '../../data/users'
import NudgeModal from '../NudgeModal'

/* ── helpers ─────────────────────────────── */
function applyLocalFeedFilter(users, filter) {
  let out = [...users]
  if (filter === 'exit') out = out.filter(u => u.prediction === 'Churn' || u.prediction === 'Withdraw')
  if (filter === 'grow') out = out.filter(u => u.prediction === 'Upgrade')
  return out.sort((a, b) => b.urgency - a.urgency)
}

function buildUrgencyBuckets(users) {
  return [
    { label:'Critical',  range:'≥85',   count: users.filter(u => u.urgency >= 85).length, color:'#E0593A' },
    { label:'High',      range:'60–84', count: users.filter(u => u.urgency >= 60 && u.urgency < 85).length, color:'#D4A535' },
    { label:'Moderate',  range:'<60',   count: users.filter(u => u.urgency < 60).length, color:'#6ABFA0' },
  ]
}

function buildUrgencyLine(users) {
  // sparkline of urgency scores (sorted high-low) — top 12
  return [...users]
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, 12)
    .map((u, i) => ({ i, urgency: u.urgency, name: u.name.split(' ')[0] }))
}

/* ── persona + severity styles ──────────── */
const PERSONA_COLOR = {
  'Protector':     '#6ABFA0',
  'Optimizer':     '#5B9ED6',
  'Anxious Saver': '#D4A535',
  'Exiter':        '#E0593A',
}

const PREDICTION_COLOR = {
  'Churn':    '#E0593A',
  'Withdraw': '#D4A535',
  'Upgrade':  '#5B9ED6',
  'Renew':    '#6ABFA0',
}

function sevColor(u) {
  if (u >= 85) return '#E0593A'
  if (u >= 60) return '#D4A535'
  return '#6ABFA0'
}

/* ════════════════════════════════════════
   COMPONENT
════════════════════════════════════════ */
export default function IntentFeed() {
  const { t, c } = useApp()
  const [filter,    setFilter]    = useState('all')
  const [allUsers,  setAllUsers]  = useState(LOCAL_USERS.map(u => ({ ...u, nudgesSent: 0 })))
  const [loading,   setLoading]   = useState(true)
  const [nudgeUser, setNudgeUser] = useState(null)

  const fetchUsers = async (f = filter) => {
    setLoading(true)
    try {
      const apiFilter = f === 'exit' ? 'churn' : f === 'grow' ? 'upgrade' : 'all'
      const res = await getUsers({ filter: apiFilter, sort: 'urgency' })
      setAllUsers(res.users)
    } catch {
      setAllUsers(LOCAL_USERS.map(u => ({ ...u, nudgesSent: 0 })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])
  const handleFilter = (f) => { setFilter(f); fetchUsers(f) }

  const users        = useMemo(() => applyLocalFeedFilter(allUsers, filter), [allUsers, filter])
  const urgencyBuckets = useMemo(() => buildUrgencyBuckets(allUsers), [allUsers])
  const urgencyLine    = useMemo(() => buildUrgencyLine(allUsers), [allUsers])

  const criticalCount = urgencyBuckets[0].count
  const avgUrgency    = allUsers.length
    ? Math.round(allUsers.reduce((s, u) => s + u.urgency, 0) / allUsers.length)
    : 0

  const FILTERS = [
    { key:'all',  label: t.feedFilterAll  },
    { key:'exit', label: t.feedFilterExit },
    { key:'grow', label: t.feedFilterGrow },
  ]

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: c.text }}>{t.feedTitle}</h2>
          <p className="text-sm mt-0.5" style={{ color: c.accent2 }}>{t.feedSubtitle}</p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => handleFilter(f.key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter===f.key ? c.accent2 : c.card,
                color:      filter===f.key ? '#BDD1BD' : c.textDim,
                border:     filter===f.key ? `1px solid ${c.accent2}` : `1px solid ${c.border}`,
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Urgency distribution bar chart */}
        <div className="col-span-5 rounded-2xl p-5" style={{ background: c.card, border:`1px solid ${c.border}` }}>
          <div className="text-sm font-bold mb-0.5" style={{ color: c.text }}>Urgency Distribution</div>
          <div className="text-xs mb-4" style={{ color: c.accent2 }}>Users by intent urgency tier</div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={urgencyBuckets} barSize={44}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fill: c.accent2, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: c.accent2, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: c.cardAlt, border:`1px solid ${c.borderStrong}`, borderRadius:8, fontSize:11 }}
                  formatter={(v, _, p) => [`${v} users`, p.payload.label]}
                />
                <Bar dataKey="count" radius={[6,6,0,0]}
                  label={{ position:'top', style:{ fill:c.textMuted, fontSize:11, fontWeight:700 } }}>
                  {urgencyBuckets.map((b, i) => <Cell key={i} fill={b.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top urgency sparkline */}
        <div className="col-span-4 rounded-2xl p-5" style={{ background: c.card, border:`1px solid ${c.border}` }}>
          <div className="text-sm font-bold mb-0.5" style={{ color: c.text }}>Live Urgency Trend</div>
          <div className="text-xs mb-4" style={{ color: c.accent2 }}>Top 12 users by urgency score</div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={urgencyLine} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <XAxis dataKey="i" hide />
                <YAxis domain={[0, 100]} tick={{ fill: c.accent2, fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: c.cardAlt, border:`1px solid ${c.borderStrong}`, borderRadius:6, fontSize:11 }}
                  formatter={(v, _, p) => [`${v}%`, p.payload.name || 'Urgency']}
                />
                <Line type="monotone" dataKey="urgency" stroke="#E0593A" strokeWidth={2.5}
                  dot={{ fill:'#E0593A', r:3, strokeWidth:0 }} activeDot={{ r:5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick-stat mini cards */}
        <div className="col-span-3 flex flex-col gap-3">
          {[
            { label:'Critical alerts',   value: criticalCount,  color:'#E0593A', sub:'urgency ≥ 85', icon:'🔴' },
            { label:'Avg urgency score', value: avgUrgency+'%', color:'#D4A535', sub:'across feed',   icon:'📊' },
            { label:'Users tracked',     value: allUsers.length,color:'#6ABFA0', sub:'in this window', icon:'👥' },
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

      {/* ── Feed rows ── */}
      {loading ? <Spinner c={c} /> : (
        <div className="space-y-2">
          {users.map((u) => {
            const personaColor = PERSONA_COLOR[u.persona] || c.accent
            const predColor    = PREDICTION_COLOR[u.prediction] || c.textMuted
            const severity     = sevColor(u.urgency)
            const timeLabel    = u.detectedHrsAgo === 1 ? `1 ${t.hrAgo}` : `${u.detectedHrsAgo} ${t.hrsAgo}`
            const topSignal    = SIGNAL_LABELS[u.signals?.[0]] || u.signals?.[0] || 'Signal detected'

            return (
              <div key={u.id}
                className="flex items-center gap-4 rounded-xl px-5 py-3.5 relative overflow-hidden hover:brightness-110 transition-all"
                style={{ background: c.card, border:`1px solid ${c.border}` }}>

                {/* Severity left bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: severity }} />

                {/* Urgency badge */}
                <div className="shrink-0 w-13 h-12 rounded-xl flex flex-col items-center justify-center px-2"
                  style={{ background:`${severity}15`, border:`1px solid ${severity}35` }}>
                  <span className="text-sm font-bold leading-none" style={{ color: severity }}>{u.urgency}</span>
                  <span className="text-[9px] mt-0.5" style={{ color: c.accent2 }}>URGENCY</span>
                </div>

                {/* Urgency mini-bar */}
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div className="w-1.5 rounded-full" style={{ height: 36, background: c.border, position:'relative', overflow:'hidden' }}>
                    <div className="absolute bottom-0 w-full rounded-full"
                      style={{ height:`${u.urgency}%`, background: severity }} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm" style={{ color: c.text }}>{u.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background:`${personaColor}18`, color:personaColor, border:`1px solid ${personaColor}35` }}>
                      {u.persona}
                    </span>
                    <span className="text-xs" style={{ color: c.accent2 }}>{t.detectedAgo} {timeLabel}</span>
                    {u.nudgesSent > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background:`${c.accent}18`, color:c.accent }}>
                        {u.nudgesSent} nudge{u.nudgesSent>1?'s':''} sent
                      </span>
                    )}
                  </div>
                  <div className="text-xs truncate" style={{ color: c.textDim }}>
                    {topSignal} · {u.fdAmount} · {u.daysLeft}d left · {u.city}
                  </div>
                </div>

                {/* FD + prediction badge */}
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold font-mono mb-1" style={{ color: c.textMuted }}>{u.fdAmount}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background:`${predColor}18`, color:predColor, border:`1px solid ${predColor}35` }}>
                    {u.prediction}
                  </span>
                </div>

                {/* Send nudge */}
                <button onClick={() => setNudgeUser(u)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110"
                  style={{ background: c.cardAlt, color: c.text, border:`1px solid ${c.borderStrong}` }}>
                  {t.sendNudge}
                </button>
              </div>
            )
          })}
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
