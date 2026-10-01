/**
 * Games Arcade — four small games built on the live coin data.
 * Virtual points only. Each game feeds a "degen profile" that mirrors
 * how the player behaves under market pressure (the app's core idea).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'
import { fmtPct, fmtPrice } from '../../data/crypto'

import { UP, DOWN, GOLD, btnStyle as btn, Confetti } from '../../ui'

/* ── persisted stats ── */
const KEY = 'im_arena_stats_v1'
const DEFAULTS = {
  duel: { best: 0, played: 0, right: 0 },
  reader: { played: 0, right: 0, streak: 0, best: 0 },
  rug: { bank: 1000, rounds: 0, cashed: 0, rugged: 0, sumCash: 0, bestMult: 0 },
  match: { best: 0 },
}
function loadStats() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return DEFAULTS }
}
function useStats() {
  const [stats, setStats] = useState(loadStats)
  const update = useCallback((game, patch) => {
    setStats(s => {
      const next = { ...s, [game]: { ...s[game], ...(typeof patch === 'function' ? patch(s[game]) : patch) } }
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private mode */ }
      return next
    })
  }, [])
  const reset = () => { try { localStorage.removeItem(KEY) } catch { /* noop */ } setStats(DEFAULTS) }
  return [stats, update, reset]
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

function Shell({ c, title, tag, desc, color, children, right, win }) {
  return (
    <div className="lift" style={{ position: 'relative', background: c.card, border: `1px solid ${c.border}`, borderTop: `3px solid ${color}`, borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>{title}</div>
          <div style={{ fontSize: 11.5, color: c.textDim, marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: `${color}20`, color, fontWeight: 800, letterSpacing: .5 }}>{tag}</span>
          {right && <div style={{ fontSize: 11, color: c.textMuted, marginTop: 6, fontWeight: 700 }}>{right}</div>}
        </div>
      </div>
      {children}
      {win ? <Confetti key={win} /> : null}
    </div>
  )
}

/* ═════════ 1 · Pump Duel ═════════ */
function PumpDuel({ coins, c, stats, update }) {
  const newPair = useCallback(() => {
    const a = pick(coins)
    let b = pick(coins)
    for (let i = 0; i < 20 && (b.id === a.id || Math.abs(a.d7 - b.d7) < 1.5); i++) b = pick(coins)
    return [a, b]
  }, [coins])
  const [pair, setPair] = useState(newPair)
  const [res, setRes] = useState(null)     // { chosen, correct }
  const [streak, setStreak] = useState(0)

  const choose = (coin) => {
    if (res) return
    const winner = pair[0].d7 >= pair[1].d7 ? pair[0] : pair[1]
    const ok = coin.id === winner.id
    setRes({ chosen: coin.id, ok })
    setStreak(s => ok ? s + 1 : 0)
    update('duel', d => ({ played: d.played + 1, right: d.right + (ok ? 1 : 0), best: Math.max(d.best, ok ? streak + 1 : 0) }))
  }
  const next = () => { setRes(null); setPair(newPair()) }

  return (
    <Shell c={c} color="#5B9ED6" tag="HIGHER / LOWER" title="⚔️ Pump Duel"
      desc="Which coin pumped harder over the last 7 days? Pick the winner." win={res?.ok ? `${pair[0].id}${stats.duel.played}` : null} right={`🔥 ${streak} · best ${stats.duel.best}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {pair.map(x => {
          const winnerId = pair[0].d7 >= pair[1].d7 ? pair[0].id : pair[1].id
          const state = !res ? null : x.id === winnerId ? 'win' : 'lose'
          const col = state === 'win' ? UP : state === 'lose' ? DOWN : x.color
          return (
            <button key={x.id} onClick={() => choose(x)} style={{
              background: `${col}12`, border: `2px solid ${res && res.chosen === x.id ? col : `${col}40`}`, borderRadius: 12,
              padding: '16px 8px', cursor: res ? 'default' : 'pointer', color: c.text, textAlign: 'center',
            }}>
              <div style={{ fontSize: 34 }}>{x.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 14, marginTop: 4 }}>{x.symbol}</div>
              <div style={{ fontSize: 10.5, color: c.textDim }}>{x.name}</div>
              <div style={{ height: 22, marginTop: 8, fontSize: 15, fontWeight: 800, color: state === 'win' ? UP : DOWN }}>
                {res ? fmtPct(x.d7) : '?'}
              </div>
            </button>
          )
        })}
      </div>
      <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: res ? (res.ok ? UP : DOWN) : c.textDim }}>
          {res ? (res.ok ? '✅ Nice read!' : '❌ Missed it — momentum is hard to call.') : 'Tap the coin you think pumped more.'}
        </div>
        {res && <button onClick={next} style={btn('#6AA6FF', true)}>Next →</button>}
      </div>
    </Shell>
  )
}

/* ═════════ 2 · Chart Reader ═════════ */
const HORIZON = 24
function makeRound(coins) {
  const coin = pick(coins)
  const n = coin.spark.length
  const cut = Math.floor(n * 0.45 + Math.random() * n * 0.4)           // visible up to here
  const end = Math.min(n - 1, cut + HORIZON)
  return { coin, cut, end, goesUp: coin.spark[end] >= coin.spark[cut] }
}
function ChartReader({ coins, c, stats, update }) {
  const [round, setRound] = useState(() => makeRound(coins))
  const [guess, setGuess] = useState(null)

  const { coin, cut, end, goesUp } = round
  const revealed = guess !== null
  const data = coin.spark.slice(0, revealed ? end + 1 : cut + 1).map((v, i) => ({ i, v }))
  const move = ((coin.spark[end] / coin.spark[cut]) - 1) * 100
  const ok = revealed && ((guess === 'up') === goesUp)

  const answer = (g) => {
    if (revealed) return
    setGuess(g)
    const right = (g === 'up') === goesUp
    update('reader', d => ({ played: d.played + 1, right: d.right + (right ? 1 : 0), streak: right ? d.streak + 1 : 0, best: Math.max(d.best, right ? d.streak + 1 : d.best) }))
  }
  const next = () => { setGuess(null); setRound(makeRound(coins)) }
  const col = revealed ? (goesUp ? UP : DOWN) : coin.color

  return (
    <Shell c={c} color={UP} tag="PREDICT" title="🔮 Chart Reader"
      desc={`Here's a real 7-day chart, cut off. Will ${coin.symbol} be higher or lower 24 hours later?`}
      win={ok ? `${coin.id}${stats.reader.played}` : null} right={`🔥 ${stats.reader.streak} · ${stats.reader.played ? Math.round(stats.reader.right / stats.reader.played * 100) : 0}% acc`}>
      <div style={{ height: 170 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
            <XAxis dataKey="i" type="number" domain={[0, coin.spark.length - 1]} hide />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            {revealed && <ReferenceArea x1={cut} x2={end} fill={goesUp ? UP : DOWN} fillOpacity={0.1} />}
            {revealed && <ReferenceLine x={cut} stroke={c.textDim} strokeDasharray="4 3" label={{ value: 'you were here', fill: c.textDim, fontSize: 9, position: 'insideTopLeft' }} />}
            <Area type="monotone" dataKey="v" stroke={col} fill={`${col}22`} strokeWidth={2} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: revealed ? (ok ? UP : DOWN) : c.textDim }}>
          {revealed ? `${ok ? '✅ Correct' : '❌ Wrong'} — moved ${fmtPct(move)}` : `${coin.emoji} ${coin.symbol} · now ${fmtPrice(coin.spark[cut])}`}
        </div>
        {!revealed ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => answer('up')} style={btn(UP)}>▲ Higher</button>
            <button onClick={() => answer('down')} style={btn(DOWN)}>▼ Lower</button>
          </div>
        ) : <button onClick={next} style={btn(UP, true)}>Next chart →</button>}
      </div>
    </Shell>
  )
}

/* ═════════ 3 · Rug Runner (crash game, virtual points) ═════════ */
function RugRunner({ c, stats, update }) {
  const [phase, setPhase] = useState('idle')          // idle | running | cashed | rugged
  const [bet, setBet] = useState(100)
  const [mult, setMult] = useState(1)
  const [path, setPath] = useState([{ t: 0, m: 1 }])
  const [msg, setMsg] = useState('')
  const crashAt = useRef(2)
  const startAt = useRef(0)
  const betRef = useRef(100)
  const bank = stats.rug.bank

  const start = () => {
    if (bank < bet) return
    const r = Math.random()
    crashAt.current = Math.min(80, Math.max(1.0, 0.95 / (1 - r)))     // heavy-tailed: ~half of rugs hit before 2x
    betRef.current = bet
    startAt.current = performance.now()
    update('rug', d => ({ bank: d.bank - bet }))
    setPath([{ t: 0, m: 1 }]); setMult(1); setMsg(''); setPhase('running')
  }

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(() => {
      const t = (performance.now() - startAt.current) / 1000
      const m = Math.exp(0.13 * t)
      if (m >= crashAt.current) {
        const final = crashAt.current
        setMult(final); setPath(p => [...p, { t, m: final }]); setPhase('rugged')
        setMsg(`💀 Rugged at ${final.toFixed(2)}x — you lost ${betRef.current} pts.`)
        update('rug', d => ({ rounds: d.rounds + 1, rugged: d.rugged + 1 }))
        clearInterval(id)
      } else {
        setMult(m); setPath(p => [...p, { t, m }])
      }
    }, 90)
    return () => clearInterval(id)
  }, [phase, update])

  const cashOut = () => {
    if (phase !== 'running') return
    const win = Math.floor(betRef.current * mult)
    setPhase('cashed')
    setMsg(`💰 Cashed out at ${mult.toFixed(2)}x → +${win - betRef.current} pts. (It would have rugged at ${crashAt.current.toFixed(2)}x.)`)
    update('rug', d => ({ bank: d.bank + win, rounds: d.rounds + 1, cashed: d.cashed + 1, sumCash: d.sumCash + mult, bestMult: Math.max(d.bestMult, mult) }))
  }

  const col = phase === 'rugged' ? DOWN : phase === 'cashed' ? GOLD : UP
  const running = phase === 'running'
  const broke = bank < 50 && !running

  return (
    <Shell c={c} color={DOWN} tag="NERVES" title="💀 Rug Runner"
      desc="Buy in, watch the price climb, and sell before the dev rugs. Greed kills — so does panic."
      win={phase === 'cashed' ? `cash${stats.rug.rounds}` : null} right={`Bank: ${bank} pts`}>
      <div style={{ height: 170, position: 'relative', background: c.inputBg, borderRadius: 10 }}>
        <ResponsiveContainer>
          <AreaChart data={path} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
            <XAxis dataKey="t" type="number" domain={[0, 'dataMax']} hide />
            <YAxis hide domain={[1, 'dataMax']} />
            <Area type="monotone" dataKey="m" stroke={col} fill={`${col}28`} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: col, textShadow: '0 2px 12px #0008', fontVariantNumeric: 'tabular-nums' }}>{mult.toFixed(2)}x</div>
        </div>
      </div>
      <div style={{ minHeight: 34, fontSize: 12.5, fontWeight: 700, color: phase === 'rugged' ? DOWN : phase === 'cashed' ? GOLD : c.textDim, lineHeight: 1.5 }}>
        {msg || (running ? 'Price is pumping… when do you sell?' : 'Pick a stake and buy in. Virtual points only.')}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {[50, 100, 250].map(b => (
          <button key={b} disabled={running} onClick={() => setBet(b)} style={{ ...btn(GOLD, bet === b, running), padding: '8px 12px', fontSize: 12 }}>{b}</button>
        ))}
        <div style={{ flex: 1 }} />
        {running
          ? <button onClick={cashOut} style={{ ...btn(GOLD, true), padding: '10px 26px' }}>SELL {Math.floor(bet * mult)}</button>
          : broke
            ? <button onClick={() => update('rug', { bank: 1000 })} style={btn(UP, true)}>Refill 1000 pts</button>
            : <button onClick={start} disabled={bank < bet} style={btn(UP, true, bank < bet)}>{phase === 'idle' ? 'Buy in' : 'Go again'}</button>}
      </div>
    </Shell>
  )
}

/* ═════════ 4 · Meme Match ═════════ */
function MemeMatch({ coins, c, stats, update }) {
  const deal = useCallback(() => {
    const picks = shuffle(coins.filter(x => x.group === 'sol')).slice(0, 8)
    return shuffle([...picks, ...picks].map((x, i) => ({ key: i, id: x.id, emoji: x.emoji, symbol: x.symbol, color: x.color })))
  }, [coins])
  const [cards, setCards] = useState(deal)
  const [open, setOpen] = useState([])           // indices currently face-up (unmatched)
  const [done, setDone] = useState(() => new Set())
  const [moves, setMoves] = useState(0)
  const lock = useRef(false)

  const won = done.size === cards.length
  useEffect(() => {
    if (won && moves > 0) update('match', d => ({ best: d.best === 0 ? moves : Math.min(d.best, moves) }))
  }, [won]) // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (i) => {
    if (lock.current || open.includes(i) || done.has(i)) return
    const nextOpen = [...open, i]
    setOpen(nextOpen)
    if (nextOpen.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = nextOpen
      if (cards[a].id === cards[b].id) {
        setDone(d => new Set([...d, a, b])); setOpen([])
      } else {
        lock.current = true
        setTimeout(() => { setOpen([]); lock.current = false }, 750)
      }
    }
  }
  const restart = () => { setCards(deal()); setOpen([]); setDone(new Set()); setMoves(0); lock.current = false }

  return (
    <Shell c={c} color="#9B8FD6" tag="MEMORY" title="🃏 Meme Match"
      desc="Match the Solana memecoin pairs in as few moves as you can." win={won ? `won${moves}` : null} right={`Moves ${moves}${stats.match.best ? ` · best ${stats.match.best}` : ''}`}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {cards.map((card, i) => {
          const up = open.includes(i) || done.has(i)
          return (
            <button key={card.key} onClick={() => flip(i)} style={{
              aspectRatio: '1', borderRadius: 10, cursor: 'pointer', fontSize: 26, display: 'grid', placeItems: 'center',
              background: up ? `${card.color}22` : c.inputBg,
              border: `1.5px solid ${done.has(i) ? UP : up ? card.color : c.border}`,
              transform: up ? 'rotateY(0)' : 'rotateY(0)', transition: 'background .2s, border-color .2s',
              opacity: done.has(i) ? 0.75 : 1, color: c.textDim,
            }}>
              {up ? <span>{card.emoji}<span style={{ display: 'block', fontSize: 8.5, fontWeight: 800, color: c.textMuted }}>{card.symbol}</span></span> : <span style={{ fontSize: 16, opacity: .5 }}>?</span>}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: won ? UP : c.textDim }}>{won ? `🎉 Cleared in ${moves} moves!` : `${done.size / 2} / 8 pairs`}</div>
        <button onClick={restart} style={btn('#9B8FD6', won)}>{won ? 'Play again' : 'Shuffle'}</button>
      </div>
    </Shell>
  )
}

/* ═════════ Degen profile ═════════ */
function DegenProfile({ stats, c, onReset }) {
  const { rug, reader, duel } = stats
  const hasData = rug.rounds + reader.played + duel.played > 0
  const avgCash = rug.cashed ? rug.sumCash / rug.cashed : 0
  const rugRate = rug.rounds ? rug.rugged / rug.rounds : 0
  const acc = reader.played + duel.played ? (reader.right + duel.right) / (reader.played + duel.played) : 0

  let persona = { n: 'Unknown', e: '🫥', d: 'Play a few rounds and your behaviour profile appears here.', col: c.textDim }
  if (hasData) {
    if (rug.rounds >= 3 && rugRate > 0.5) persona = { n: 'The Exiter… too late', e: '🚪', col: DOWN, d: 'You hold past the exit and get rugged often. Set a target before you buy in — and sell when you hit it.' }
    else if (rug.cashed >= 3 && avgCash < 1.4) persona = { n: 'The Anxious Saver', e: '😌', col: GOLD, d: 'You sell early and safe. Great for capital, but you may leave real upside on the table.' }
    else if (acc >= 0.62 && reader.played + duel.played >= 6) persona = { n: 'The Optimizer', e: '📊', col: '#6AA6FF', d: 'You read charts well and weigh data before acting. Keep position sizes small — skill still meets luck.' }
    else persona = { n: 'The Protector', e: '🛡', col: UP, d: 'Balanced and disciplined: you take profit at sensible levels without chasing the moon.' }
  }

  const tile = (l, v) => (
    <div style={{ background: c.inputBg, borderRadius: 10, padding: '10px 12px', minWidth: 110, flex: 1 }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: c.text }}>{v}</div>
      <div style={{ fontSize: 9.5, color: c.textDim, fontWeight: 700, letterSpacing: .4, textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
    </div>
  )

  return (
    <div style={{ background: c.card, border: `1px solid ${persona.col}55`, borderRadius: 14, padding: 18, display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
      <div>
        <div style={{ fontSize: 10, color: c.textDim, fontWeight: 800, letterSpacing: 1.2 }}>YOUR ARENA PROFILE</div>
        <div style={{ fontSize: 30, marginTop: 6 }}>{persona.e}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: persona.col }}>{persona.n}</div>
        <div style={{ fontSize: 11.5, color: c.textMuted, lineHeight: 1.55, marginTop: 4 }}>{persona.d}</div>
      </div>
      <div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tile('Prediction accuracy', hasData && (reader.played + duel.played) ? Math.round(acc * 100) + '%' : '—')}
          {tile('Avg cash-out', avgCash ? avgCash.toFixed(2) + 'x' : '—')}
          {tile('Rug rate', rug.rounds ? Math.round(rugRate * 100) + '%' : '—')}
          {tile('Best multiplier', rug.bestMult ? rug.bestMult.toFixed(2) + 'x' : '—')}
          {tile('Best duel streak', duel.best)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div style={{ fontSize: 10.5, color: c.textDim }}>Games are for fun. Real trades carry real risk.</div>
          <button onClick={onReset} style={{ background: 'transparent', border: `1px solid ${c.border}`, color: c.textDim, borderRadius: 7, padding: '4px 10px', fontSize: 10.5, cursor: 'pointer' }}>Reset stats</button>
        </div>
      </div>
    </div>
  )
}

export default function GamesArcade({ coins, c }) {
  const [stats, update, reset] = useStats()
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <DegenProfile stats={stats} c={c} onReset={reset} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(460px,1fr))', gap: 16 }}>
        <PumpDuel coins={coins} c={c} stats={stats} update={update} />
        <ChartReader coins={coins} c={c} stats={stats} update={update} />
        <RugRunner c={c} stats={stats} update={update} />
        <MemeMatch coins={coins} c={c} stats={stats} update={update} />
      </div>
    </div>
  )
}
