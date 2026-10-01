/**
 * Intent Mirror — Crypto Arena
 * Live Solana-memecoin + major-crypto charts, and a games arcade that
 * turns market behaviour into play (and into a "degen profile").
 */
import { useMemo, useState } from 'react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Treemap, CartesianGrid,
} from 'recharts'
import { useApp } from '../context'
import { useCryptoData, fmtPrice, fmtCap, fmtPct } from '../data/crypto'
import GamesArcade from './arena/GamesArcade'
import { Card, SectionTitle, chipStyle, UP, DOWN } from '../ui'

function StatusBadge({ status, updatedAt, onRefresh, c }) {
  const map = {
    live:    { label: 'LIVE · CoinGecko', col: UP },
    cached:  { label: 'CACHED', col: '#D4A853' },
    loading: { label: 'CONNECTING…', col: '#5B9ED6' },
    demo:    { label: 'DEMO DATA · offline', col: '#D4A853' },
  }
  const m = map[status]
  return (
    <button onClick={onRefresh} title="Refresh" style={{
      display: 'flex', alignItems: 'center', gap: 6, background: `${m.col}15`,
      border: `1px solid ${m.col}50`, borderRadius: 20, padding: '4px 12px',
      color: m.col, fontSize: 10, fontWeight: 800, letterSpacing: 0.6, cursor: 'pointer',
    }}>
      <span className={status === 'live' ? 'pulse-dot' : ''} style={{ width: 6, height: 6, borderRadius: '50%', background: m.col }} />
      {m.label}
      {updatedAt && <span style={{ opacity: 0.7, fontWeight: 600 }}>· {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
      <span style={{ opacity: 0.7 }}>↻</span>
    </button>
  )
}

/* ── Meme heat gauge (semi-circle) ── */
function HeatGauge({ value, c }) {
  const v = Math.max(0, Math.min(100, value))
  const angle = -90 + (v / 100) * 180
  const label = v < 25 ? 'Freezing' : v < 45 ? 'Cool' : v < 60 ? 'Neutral' : v < 80 ? 'Heating up' : 'On fire'
  const col = v < 45 ? DOWN : v < 60 ? '#D4A853' : UP
  const arc = (a0, a1, r) => {
    const p = a => [100 + r * Math.cos((a - 180) * Math.PI / 180), 100 + r * Math.sin((a - 180) * Math.PI / 180)]
    const [x0, y0] = p(a0), [x1, y1] = p(a1)
    return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`
  }
  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 200 118" width="100%" style={{ maxWidth: 220 }}>
        <path d={arc(0, 60, 80)} stroke={DOWN} strokeWidth="12" fill="none" opacity=".85" />
        <path d={arc(60, 120, 80)} stroke="#D4A853" strokeWidth="12" fill="none" opacity=".85" />
        <path d={arc(120, 180, 80)} stroke={UP} strokeWidth="12" fill="none" opacity=".85" />
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '100px 100px', transition: 'transform .8s cubic-bezier(.22,1,.36,1)' }}>
          <line x1="100" y1="100" x2="100" y2="34" stroke={c.text} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="7" fill={c.text} />
        </g>
      </svg>
      <div style={{ fontSize: 22, fontWeight: 800, color: col, marginTop: -8 }}>{Math.round(v)}</div>
      <div style={{ fontSize: 11, color: c.textDim, fontWeight: 700 }}>{label}</div>
    </div>
  )
}

/* ── Treemap tile ── */
function TreeTile(props) {
  const { x, y, width, height, symbol, d1, emoji } = props
  if (width < 4 || height < 4 || !symbol) return null
  const col = d1 >= 0 ? UP : DOWN
  const strength = Math.min(1, Math.abs(d1) / 12)
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={col} fillOpacity={0.18 + strength * 0.55} stroke="#0008" />
      {width > 46 && height > 34 && (
        <>
          <text x={x + 8} y={y + 18} fill="#fff" fontSize={width > 80 ? 13 : 11} fontWeight="800">{emoji} {symbol}</text>
          <text x={x + 8} y={y + 34} fill="#fff" fillOpacity=".85" fontSize="10.5" fontWeight="600">{fmtPct(d1)}</text>
        </>
      )}
    </g>
  )
}

function ChartTip({ active, payload, label, c, mode }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: c.modalBg, border: `1px solid ${c.borderStrong}`, borderRadius: 8, padding: '8px 10px', fontSize: 11 }}>
      <div style={{ color: c.textDim, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color || c.text, fontWeight: 700 }}>
          {p.name}: {mode === 'pct' ? fmtPct(p.value) : fmtPrice(p.value)}
        </div>
      ))}
    </div>
  )
}

/* ═════════════ Markets view ═════════════ */
function Markets({ coins, c }) {
  const [group, setGroup] = useState('all')
  const [selected, setSelected] = useState(['bonk', 'dogwifcoin', 'popcat', 'fartcoin'])
  const [mode, setMode] = useState('pct')       // pct | price
  const [range, setRange] = useState(168)       // hours of the 7d window
  const [sortKey, setSortKey] = useState('mcap')
  const [watch, setWatch] = useState(() => { try { return JSON.parse(localStorage.getItem('im_watch') || '[]') } catch { return [] } })
  const toggleWatch = (id) => setWatch(w => {
    const n = w.includes(id) ? w.filter(x => x !== id) : [...w, id]
    try { localStorage.setItem('im_watch', JSON.stringify(n)) } catch { /* private mode */ }
    return n
  })

  const shown = useMemo(() => {
    const list = coins.filter(x => group === 'all' || (group === 'watch' ? watch.includes(x.id) : x.group === group))
    return [...list].sort((a, b) => sortKey === 'mcap' ? b.mcap - a.mcap : b[sortKey] - a[sortKey])
  }, [coins, group, sortKey, watch])

  const memes = coins.filter(x => x.group === 'sol')
  const avgMeme = memes.reduce((s, x) => s + x.d1, 0) / memes.length
  const heat = 50 + avgMeme * 5
  const best = [...coins].sort((a, b) => b.d1 - a.d1)[0]
  const worst = [...coins].sort((a, b) => a.d1 - b.d1)[0]
  const memeCap = memes.reduce((s, x) => s + x.mcap, 0)

  const toggle = (id) => setSelected(s => s.includes(id) ? (s.length > 1 ? s.filter(x => x !== id) : s) : s.length >= 5 ? [...s.slice(1), id] : [...s, id])

  const chosen = coins.filter(x => selected.includes(x.id))
  const series = useMemo(() => {
    const len = Math.min(...chosen.map(x => x.spark.length))
    const n = Math.min(range, len)
    return Array.from({ length: n }, (_, i) => {
      const row = { t: `${Math.round((n - 1 - i) / 24 * 10) / 10}d ago` }
      chosen.forEach(x => {
        const s = x.spark.slice(-n)
        row[x.symbol] = mode === 'pct' ? (s[i] / s[0] - 1) * 100 : s[i]
      })
      return row
    })
  }, [chosen, range, mode])

  const bars = [...coins].sort((a, b) => b.d1 - a.d1).map(x => ({ symbol: x.symbol, d1: +x.d1.toFixed(2) }))
  const tree = memes.map(x => ({ name: x.symbol, symbol: x.symbol, size: x.mcap, d1: x.d1, emoji: x.emoji }))

  const chip = (active, col = c.accent) => chipStyle(c, active, col)

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* stat tiles + gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
        <Card c={c}>
          <SectionTitle c={c}>Meme Heat · Solana</SectionTitle>
          <HeatGauge value={heat} c={c} />
          <div style={{ fontSize: 10, color: c.textDim, textAlign: 'center', marginTop: 4 }}>avg 24h move of tracked memecoins: {fmtPct(avgMeme)}</div>
        </Card>
        {[
          { l: 'Solana meme cap tracked', v: fmtCap(memeCap), s: `${memes.length} coins`, col: c.accent },
          { l: 'Top mover · 24h', v: `${best.emoji} ${best.symbol}`, s: fmtPct(best.d1), col: UP },
          { l: 'Biggest drop · 24h', v: `${worst.emoji} ${worst.symbol}`, s: fmtPct(worst.d1), col: DOWN },
        ].map(t => (
          <Card c={c} className="lift" key={t.l} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 10, color: c.textDim, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase' }}>{t.l}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: c.text, margin: '6px 0 2px' }}>{t.v}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.col }}>{t.s}</div>
          </Card>
        ))}
      </div>

      {/* main compare chart */}
      <Card c={c}>
        <SectionTitle c={c} right={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['pct', '% change'], ['price', 'Price']].map(([k, l]) => <button key={k} onClick={() => setMode(k)} style={chip(mode === k)}>{l}</button>)}
            <span style={{ width: 8 }} />
            {[[24, '24H'], [72, '3D'], [168, '7D']].map(([k, l]) => <button key={k} onClick={() => setRange(k)} style={chip(range === k, '#5B9ED6')}>{l}</button>)}
          </div>
        }>Compare coins · pick up to 5</SectionTitle>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {coins.map(x => (
            <button key={x.id} onClick={() => toggle(x.id)} style={chip(selected.includes(x.id), x.color)}>{x.emoji} {x.symbol}</button>
          ))}
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={c.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: c.textDim, fontSize: 10 }} interval="preserveStartEnd" minTickGap={60} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} width={54}
                domain={['auto', 'auto']}
                tickFormatter={v => mode === 'pct' ? v.toFixed(0) + '%' : fmtPrice(v)} />
              <Tooltip content={<ChartTip c={c} mode={mode} />} />
              {mode === 'pct' && <ReferenceLine y={0} stroke={c.textDim} strokeDasharray="4 4" />}
              {chosen.map(x => (
                <Line key={x.id} type="monotone" dataKey={x.symbol} name={x.symbol} stroke={x.color} strokeWidth={2} dot={false} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {mode === 'price' && chosen.length > 1 && (
          <div style={{ fontSize: 10, color: c.textDim, marginTop: 6 }}>Tip: prices differ by orders of magnitude — switch to “% change” to compare fairly.</div>
        )}
      </Card>

      {/* gainers / losers + treemap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 12 }}>
        <Card c={c}>
          <SectionTitle c={c}>24h gainers & losers</SectionTitle>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={bars} layout="vertical" margin={{ left: 10, right: 16 }}>
                <XAxis type="number" tick={{ fill: c.textDim, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v + '%'} />
                <YAxis type="category" dataKey="symbol" tick={{ fill: c.textMuted, fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} width={64} interval={0} />
                <ReferenceLine x={0} stroke={c.textDim} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,.04)' }} content={({ active, payload }) => active && payload?.length ? (
                  <div style={{ background: c.modalBg, border: `1px solid ${c.borderStrong}`, borderRadius: 8, padding: '6px 10px', fontSize: 11, color: c.text }}>
                    {payload[0].payload.symbol}: <b>{fmtPct(payload[0].value)}</b>
                  </div>) : null} />
                <Bar dataKey="d1" radius={3} isAnimationActive={false}>
                  {bars.map(b => <Cell key={b.symbol} fill={b.d1 >= 0 ? UP : DOWN} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card c={c}>
          <SectionTitle c={c}>Memecoin heatmap · size = market cap</SectionTitle>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <Treemap data={tree} dataKey="size" content={<TreeTile />} isAnimationActive={false} />
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* table */}
      <Card c={c} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['all', 'All'], ['sol', '◎ Solana memes'], ['major', 'Majors'], ['watch', `★ Watchlist${watch.length ? ` (${watch.length})` : ''}`]].map(([k, l]) => <button key={k} onClick={() => setGroup(k)} style={chip(group === k)}>{l}</button>)}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['mcap', 'Market cap'], ['d1', '24h'], ['d7', '7d']].map(([k, l]) => <button key={k} onClick={() => setSortKey(k)} style={chip(sortKey === k, '#5B9ED6')}>{l}</button>)}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 640 }}>
            {shown.length === 0 && (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: c.textDim, fontSize: 13 }}>Star ☆ a coin to build your watchlist.</div>
            )}
            {shown.map((x, i) => {
              const up = x.d1 >= 0, up7 = x.d7 >= 0
              const data = x.spark.map(v => ({ v }))
              const col7 = up7 ? UP : DOWN
              return (
                <div key={x.id} onClick={() => setSelected([x.id])} title="Click to chart" style={{
                  display: 'grid', gridTemplateColumns: '30px 1.6fr 1fr 80px 80px 110px 100px',
                  alignItems: 'center', padding: '9px 16px', cursor: 'pointer',
                  background: i % 2 ? c.rowOdd : c.rowEven, borderTop: `1px solid ${c.border}`,
                }}>
                  <button onClick={e => { e.stopPropagation(); toggleWatch(x.id) }} aria-label={watch.includes(x.id) ? 'Remove from watchlist' : 'Add to watchlist'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: 0, color: watch.includes(x.id) ? '#F5B83D' : c.textDim }}>{watch.includes(x.id) ? '★' : '☆'}</button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: `${x.color}25`, border: `1px solid ${x.color}60`, display: 'grid', placeItems: 'center', fontSize: 14 }}>{x.emoji}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: c.text }}>{x.symbol}</div>
                      <div style={{ fontSize: 9.5, color: c.textDim }}>{x.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 800, color: c.text, fontVariantNumeric: 'tabular-nums' }}>{fmtPrice(x.price)}</div>
                  <div style={{ textAlign: 'right', fontSize: 11.5, fontWeight: 700, color: up ? UP : DOWN }}>{fmtPct(x.d1)}</div>
                  <div style={{ textAlign: 'right', fontSize: 11.5, fontWeight: 700, color: col7 }}>{fmtPct(x.d7)}</div>
                  <div style={{ textAlign: 'right', fontSize: 11, color: c.textMuted }}>{fmtCap(x.mcap)}</div>
                  <div style={{ height: 30 }}>
                    <ResponsiveContainer>
                      <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 4, right: 0 }}>
                        <YAxis hide domain={['dataMin', 'dataMax']} />
                        <Area type="monotone" dataKey="v" stroke={col7} fill={`${col7}22`} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ═════════════ Page ═════════════ */
export default function CryptoArena() {
  const { c } = useApp()
  const { coins, status, updatedAt, refresh } = useCryptoData()
  const [tab, setTab] = useState('markets')

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: c.text, letterSpacing: -0.3 }}>Crypto Arena</div>
          <div style={{ fontSize: 12.5, color: c.textDim, marginTop: 4, maxWidth: 560, lineHeight: 1.5 }}>
            Watch Solana memecoins and the majors move — then play the market instead of risking it.
            Every game teaches a real money-behaviour lesson.
          </div>
        </div>
        <StatusBadge status={status} updatedAt={updatedAt} onRefresh={refresh} c={c} />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 18, borderBottom: `1px solid ${c.border}`, paddingBottom: 10 }}>
        {[['markets', '📈 Markets'], ['games', '🎮 Games']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: tab === k ? 'rgba(69,217,184,0.16)' : 'transparent',
            color: tab === k ? c.accent : c.textDim,
            border: `1px solid ${tab === k ? c.borderStrong : 'transparent'}`,
          }}>{l}</button>
        ))}
      </div>

      {tab === 'markets' ? <Markets coins={coins} c={c} /> : <GamesArcade coins={coins} c={c} />}

      <div style={{ fontSize: 10, color: c.textDim, marginTop: 24, lineHeight: 1.6 }}>
        Prices in USD from CoinGecko's public API (falls back to simulated data offline). Memecoins are extremely volatile and many go to zero.
        Games use virtual points only — nothing here is investment advice.
      </div>
    </div>
  )
}
