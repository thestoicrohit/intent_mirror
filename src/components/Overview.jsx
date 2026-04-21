/**
 * Intent Mirror — Overview Dashboard
 * Real fintech ops dashboard: KPI strip, live feed, risk table, charts.
 * All visible at once — no tabs required.
 */
import { useState, useEffect, useRef } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'
import { useApp } from '../App'
import { USERS } from '../data/users'

/* ── Mini stock data for Overview ──────────────────────── */
const MINI_STOCKS = [
  { symbol:'RELIANCE', price:2847.50, pct:+0.83 },
  { symbol:'TCS',      price:3912.80, pct:-0.47 },
  { symbol:'HDFCBANK', price:1623.45, pct:+0.79 },
  { symbol:'INFY',     price:1478.20, pct:-0.56 },
  { symbol:'ICICIBANK',price:1198.60, pct:+0.83 },
  { symbol:'SBIN',     price:812.30,  pct:-0.51 },
  { symbol:'BAJFINANCE',price:7234.50,pct:+1.18 },
  { symbol:'MARUTI',   price:11240.00,pct:+1.41 },
]

/* ── Helpers ──────────────────────────────────────────── */
const fmt  = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
const PERSONA_COLOR = {
  Exiter: '#E05A3A', 'Anxious Saver': '#D4A535',
  Optimizer: '#5B9ED6', Protector: '#6ABFA0',
}
const PRED_COLOR = { Churn:'#E05A3A', Withdraw:'#D4A535', Upgrade:'#5B9ED6', Renew:'#6ABFA0' }

/* ── Risk area chart data (7-day simulated trend) ─────── */
const RISK_TREND = [
  { day: 'Mon', churn: 29, withdraw: 18, upgrade: 12, renew: 41 },
  { day: 'Tue', churn: 32, withdraw: 21, upgrade: 14, renew: 33 },
  { day: 'Wed', churn: 27, withdraw: 19, upgrade: 16, renew: 38 },
  { day: 'Thu', churn: 38, withdraw: 24, upgrade: 11, renew: 27 },
  { day: 'Fri', churn: 41, withdraw: 22, upgrade: 18, renew: 19 },
  { day: 'Sat', churn: 35, withdraw: 20, upgrade: 20, renew: 25 },
  { day: 'Today', churn: 44, withdraw: 26, upgrade: 17, renew: 13 },
]

/* ── Signal breakdown bar data ────────────────────────── */
const SIGNAL_DATA = [
  { sig: 'Safety Check',    count: 1068, color: '#6ABFA0' },
  { sig: 'Rate Compare',    count: 756,  color: '#5B9ED6' },
  { sig: 'Early Withdraw',  count: 612,  color: '#E05A3A' },
  { sig: 'MF Browse',       count: 418,  color: '#9B8FD6' },
  { sig: 'Support Ticket',  count: 312,  color: '#D4A535' },
  { sig: 'Competitor',      count: 287,  color: '#E05A8A' },
  { sig: 'Stocks Search',   count: 196,  color: '#56C4C4' },
  { sig: 'No Login 30d',    count: 164,  color: '#E0593A' },
]

/* ── KPI Card ─────────────────────────────────────────── */
function KPICard({ label, value, sub, subColor, delta, color, accent, c }) {
  return (
    <div style={{
      background: c.card, border: `1px solid ${c.border}`,
      borderRadius: 12, padding: '16px 20px', flex: 1, minWidth: 140,
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 10, color: c.textDim, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: -1, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: subColor || c.textMuted, marginTop: 5 }}>
          {sub}
        </div>
      )}
      {delta && (
        <div style={{
          fontSize: 10, marginTop: 6, padding: '2px 8px', borderRadius: 20,
          display: 'inline-block',
          background: delta.startsWith('+') ? 'rgba(106,191,160,0.12)' : 'rgba(224,89,58,0.10)',
          color: delta.startsWith('+') ? '#6ABFA0' : '#E05A3A',
          fontWeight: 700,
        }}>{delta}</div>
      )}
    </div>
  )
}

/* ── Live Feed Item ───────────────────────────────────── */
function FeedItem({ user, c, onNudge }) {
  const col = PRED_COLOR[user.prediction] || c.accent
  const urgencyLabel = user.daysLeft <= 3 ? '🔴 Critical' : user.daysLeft <= 7 ? '🟡 Urgent' : '🟢 Watch'
  return (
    <div style={{
      padding: '10px 14px',
      borderBottom: `1px solid ${c.border}`,
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer', transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = `rgba(86,143,124,0.06)`}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Risk dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: col, flexShrink: 0,
        boxShadow: user.riskScore > 80 ? `0 0 6px ${col}` : 'none',
      }} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{user.name}</span>
          <span style={{ fontSize: 9, color: c.textDim }}>{user.city}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 4,
            background: `${col}18`, color: col, fontWeight: 700,
          }}>{user.prediction}</span>
          <span style={{ fontSize: 9, color: c.textDim }}>{urgencyLabel}</span>
        </div>
      </div>

      {/* Amount + days */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{user.fdAmount}</div>
        <div style={{ fontSize: 10, color: user.daysLeft <= 7 ? '#E05A3A' : c.textDim }}>{user.daysLeft}d left</div>
      </div>

      {/* Nudge btn */}
      <button onClick={() => onNudge(user)} style={{
        background: `${c.accent}18`, border: `1px solid ${c.border}`,
        borderRadius: 6, padding: '3px 8px', fontSize: 9,
        color: c.accent, cursor: 'pointer', fontWeight: 700,
        flexShrink: 0, letterSpacing: 0.3,
      }}>NUDGE</button>
    </div>
  )
}

/* ── Main Overview Component ──────────────────────────── */
export default function Overview({ onNudge }) {
  const { c, isDark } = useApp()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Sort users by urgency
  const topRisk    = [...USERS].sort((a, b) => b.riskScore - a.riskScore).slice(0, 10)
  const criticals  = USERS.filter(u => u.daysLeft <= 7).length
  const upgrades   = USERS.filter(u => u.prediction === 'Upgrade').length

  const personaPie = [
    { name: 'Protector',     value: 31200, color: '#6ABFA0' },
    { name: 'Optimizer',     value: 9500,  color: '#5B9ED6' },
    { name: 'Anxious Saver', value: 6000,  color: '#D4A535' },
    { name: 'Exiter',        value: 3500,  color: '#E05A3A' },
  ]

  const tooltipStyle = {
    background: c.cardAlt, border: `1px solid ${c.border}`,
    borderRadius: 8, color: c.text, fontSize: 11,
  }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Page header ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: c.text, letterSpacing: -0.5 }}>
            Operations Overview
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: c.textDim }}>
            FintechX Bank · 50,000 monitored accounts · Updated real-time
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: c.text, fontVariantNumeric: 'tabular-nums' }}>
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: 10, color: c.textDim }}>
            {time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KPICard label="Platform Health"   value="74"   sub="↑ +3 pts this week"  subColor="#6ABFA0" color={c.accent}   c={c} />
        <KPICard label="Churn Risk"        value="847"  sub="Users at risk today"  delta="+12% vs last week" color="#E05A3A"  c={c} />
        <KPICard label="Harvest Window"    value="340"  sub="FDs maturing in 30d" delta="+23 this week"     color="#D4A535"  c={c} />
        <KPICard label="Retention Rate"    value="74%"  sub="+3 pts this month"   delta="+3pts"             color="#6ABFA0"  c={c} />
        <KPICard label="Beyond-FD Ready"   value="14.6k" sub="Exploring MF / Gold" delta="+487 this week"   color="#5B9ED6"  c={c} />
        <KPICard label="Critical (≤7d)"    value={criticals} sub="Need action today" delta="⚡ Act now"      color="#E05A3A"  c={c} />
      </div>

      {/* ── Main grid ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

        {/* LEFT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Intent trend chart */}
          <div style={{
            background: c.card, border: `1px solid ${c.border}`,
            borderRadius: 14, padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>Weekly Intent Distribution</div>
                <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>Customer signals by predicted outcome</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[['Churn','#E05A3A'],['Withdraw','#D4A535'],['Upgrade','#5B9ED6'],['Renew','#6ABFA0']].map(([l,col]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: c.textDim }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: col }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={RISK_TREND} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: c.textDim }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: c.textDim }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="churn"    stackId="1" stroke="#E05A3A" fill="rgba(224,89,58,0.15)"   strokeWidth={2} />
                <Area type="monotone" dataKey="withdraw" stackId="1" stroke="#D4A535" fill="rgba(212,165,53,0.15)"  strokeWidth={2} />
                <Area type="monotone" dataKey="upgrade"  stackId="1" stroke="#5B9ED6" fill="rgba(91,158,214,0.15)"  strokeWidth={2} />
                <Area type="monotone" dataKey="renew"    stackId="1" stroke="#6ABFA0" fill="rgba(106,191,160,0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top at-risk table */}
          <div style={{
            background: c.card, border: `1px solid ${c.border}`,
            borderRadius: 14, overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 20px', borderBottom: `1px solid ${c.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>High-Risk Customer Board</div>
                <div style={{ fontSize: 11, color: c.textDim, marginTop: 1 }}>Sorted by risk score · Model-predicted</div>
              </div>
              <span style={{
                fontSize: 9, padding: '3px 9px', borderRadius: 4,
                background: 'rgba(224,89,58,0.12)', color: '#E05A3A',
                fontWeight: 800, letterSpacing: 0.5, border: '1px solid rgba(224,89,58,0.2)',
              }}>🤖 ML SCORED</span>
            </div>

            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr 80px 80px 90px 80px 80px',
              padding: '8px 20px',
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
              borderBottom: `1px solid ${c.border}`,
            }}>
              {['#','CUSTOMER','FD AMT','DAYS','PERSONA','RISK','ACTION'].map(h => (
                <div key={h} style={{ fontSize: 9, color: c.textDim, fontWeight: 700, letterSpacing: 1 }}>{h}</div>
              ))}
            </div>

            {/* Table rows */}
            {topRisk.map((user, idx) => {
              const rCol = user.riskScore >= 80 ? '#E05A3A' : user.riskScore >= 50 ? '#D4A535' : '#6ABFA0'
              const pCol = PERSONA_COLOR[user.persona] || c.accent
              return (
                <div key={user.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr 80px 80px 90px 80px 80px',
                  padding: '10px 20px',
                  borderBottom: idx < topRisk.length - 1 ? `1px solid ${c.border}` : 'none',
                  background: idx % 2 === 0 ? c.rowEven : c.rowOdd,
                  alignItems: 'center',
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = `rgba(86,143,124,0.07)`}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? c.rowEven : c.rowOdd}
                >
                  <span style={{ fontSize: 10, color: c.textDim, fontWeight: 600 }}>{idx + 1}</span>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{user.name}</div>
                    <div style={{ fontSize: 10, color: c.textDim }}>{user.city}</div>
                  </div>

                  <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{user.fdAmount}</span>

                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: user.daysLeft <= 3 ? '#E05A3A' : user.daysLeft <= 7 ? '#D4A535' : c.textMuted,
                  }}>{user.daysLeft}d</span>

                  <span style={{
                    fontSize: 9, padding: '2px 7px', borderRadius: 4,
                    background: `${pCol}14`, color: pCol,
                    fontWeight: 700, display: 'inline-block',
                  }}>{user.persona}</span>

                  {/* Risk score bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ flex: 1, height: 4, background: c.border, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${user.riskScore}%`, height: '100%', background: rCol, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: rCol, minWidth: 24 }}>{user.riskScore}</span>
                  </div>

                  <button onClick={() => onNudge(user)} style={{
                    background: `${c.accent}14`, border: `1px solid ${c.border}`,
                    borderRadius: 6, padding: '3px 10px', fontSize: 9,
                    color: c.accent, cursor: 'pointer', fontWeight: 700,
                    letterSpacing: 0.3,
                  }}>NUDGE</button>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Persona donut */}
          <div style={{
            background: c.card, border: `1px solid ${c.border}`,
            borderRadius: 14, padding: '16px 18px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 12 }}>Persona Breakdown</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={personaPie} cx={50} cy={50} innerRadius={28} outerRadius={50}
                    dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270}>
                    {personaPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {personaPie.map(p => (
                  <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: c.textMuted }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: c.text }}>{fmt(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live intent feed */}
          <div style={{
            background: c.card, border: `1px solid ${c.border}`,
            borderRadius: 14, overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 14px', borderBottom: `1px solid ${c.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>Live Intent Feed</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6ABFA0', boxShadow: '0 0 4px #6ABFA0' }} />
                <span style={{ fontSize: 9, color: '#6ABFA0', fontWeight: 700 }}>LIVE</span>
              </div>
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {[...USERS].sort((a, b) => b.urgency - a.urgency).slice(0, 12).map(user => (
                <FeedItem key={user.id} user={user} c={c} onNudge={onNudge} />
              ))}
            </div>
          </div>

          {/* Signal breakdown */}
          <div style={{
            background: c.card, border: `1px solid ${c.border}`,
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 12 }}>Signal Frequency Today</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={SIGNAL_DATA} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: c.textDim }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="sig" tick={{ fontSize: 9, fill: c.textDim }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={10}>
                  {SIGNAL_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>

      {/* ── Bottom harvest strip ──────────────────────── */}
      <div style={{
        background: c.card, border: `1px solid ${c.border}`,
        borderRadius: 14, overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 20px', borderBottom: `1px solid ${c.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>
            ⚡ Critical Harvest — FDs Maturing This Week
          </span>
          <span style={{ fontSize: 10, color: c.textDim }}>{USERS.filter(u => u.daysLeft <= 7).length} customers · Immediate action needed</span>
        </div>
        <div style={{ display: 'flex', overflowX: 'auto', padding: '14px 20px', gap: 12 }}>
          {USERS.filter(u => u.daysLeft <= 7).sort((a,b) => a.daysLeft - b.daysLeft).map(user => {
            const col = PRED_COLOR[user.prediction]
            return (
              <div key={user.id} onClick={() => onNudge(user)} style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${c.border}`,
                borderTop: `3px solid ${col}`,
                borderRadius: 10, padding: '12px 14px',
                minWidth: 160, cursor: 'pointer',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${col}`; e.currentTarget.style.borderTop = `3px solid ${col}` }}
                onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${c.border}`; e.currentTarget.style.borderTop = `3px solid ${col}` }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: c.text, marginBottom: 2 }}>{user.name}</div>
                <div style={{ fontSize: 10, color: c.textDim, marginBottom: 8 }}>{user.city}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: col }}>{user.daysLeft}d</div>
                    <div style={{ fontSize: 9, color: c.textDim }}>left</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.text }}>{user.fdAmount}</div>
                    <span style={{
                      fontSize: 8, padding: '1px 5px', borderRadius: 3,
                      background: `${col}18`, color: col, fontWeight: 700,
                    }}>{user.prediction}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Wealth Opportunities strip ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Live stocks mini panel */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{
            padding: '12px 16px', borderBottom: `1px solid ${c.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>📈 Top Stocks Today</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 9, color: c.textDim }}>NSE/BSE</span>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6ABFA0', boxShadow: '0 0 4px #6ABFA0' }} />
            </div>
          </div>
          <div style={{ padding: '4px 0' }}>
            {MINI_STOCKS.map((s, i) => {
              const up = s.pct >= 0
              const col = up ? '#6ABFA0' : '#E05A3A'
              return (
                <div key={s.symbol} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 16px',
                  borderBottom: i < MINI_STOCKS.length - 1 ? `1px solid ${c.border}` : 'none',
                  background: i % 2 === 0 ? c.rowEven : c.rowOdd,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.text, width: 90 }}>{s.symbol}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.text, fontVariantNumeric: 'tabular-nums' }}>
                    ₹{s.price.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: col }}>
                    {up ? '▲' : '▼'} {Math.abs(s.pct)}%
                  </span>
                  <div style={{ height: 4, width: 60, background: c.border, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, 50 + s.pct * 15)}%`, background: col }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{
            padding: '10px 16px', borderTop: `1px solid ${c.border}`,
            background: `rgba(86,143,124,0.05)`,
          }}>
            <button
              onClick={() => {}}
              style={{
                width: '100%', padding: '7px', borderRadius: 7,
                background: `rgba(86,143,124,0.12)`, border: `1px solid ${c.border}`,
                color: c.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>
              View Full Wealth Hub → Stocks, MF, Insurance
            </button>
          </div>
        </div>

        {/* Wealth opportunities panel */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>💰 Wealth Opportunities</span>
            <div style={{ fontSize: 10, color: c.textDim, marginTop: 2 }}>Upgrade paths for maturing FD customers</div>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label:'Mutual Fund Cross-Sell',   count:'14,600', revenue:'₹408 Cr AUM', color:'#5B9ED6', icon:'📊' },
              { label:'Insurance Upsell',         count:'8,400',  revenue:'₹2.1 Cr premium', color:'#6ABFA0', icon:'🛡️' },
              { label:'Digital Gold SIP',         count:'6,200',  revenue:'₹18 Cr',     color:'#D4A535', icon:'🥇' },
              { label:'Equity + NPS',             count:'3,500',  revenue:'₹24 Cr',     color:'#E05A3A', icon:'📈' },
            ].map(op => (
              <div key={op.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 9,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${c.border}`,
              }}>
                <span style={{ fontSize: 18 }}>{op.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{op.label}</div>
                  <div style={{ fontSize: 10, color: c.textDim }}>{op.count} customers eligible</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: op.color }}>{op.revenue}</div>
                  <div style={{ fontSize: 9, color: c.textDim }}>opportunity</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
