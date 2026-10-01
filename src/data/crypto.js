/* ═══════════════════════════════════════════════
   Intent Mirror — Crypto market data (Arena)
   ───────────────────────────────────────────────
   Live prices + 7-day sparklines come from CoinGecko's free public
   API (no key). If the request fails or is rate-limited, we fall back
   to the last cached snapshot, then to a deterministic simulated
   snapshot — so the Arena always renders and the games always work.
═══════════════════════════════════════════════ */
import { useEffect, useState } from 'react'

/** id = CoinGecko id. group: 'sol' = Solana memecoin, 'major' = large-cap. */
export const COINS = [
  // Solana memecoins
  { id: 'bonk',                 symbol: 'BONK',   name: 'Bonk',            group: 'sol',   emoji: '🐕', color: '#F2A33A', price: 0.0000215, mcap: 1.6e9,  d1: 4.1,  d7: 9.5 },
  { id: 'dogwifcoin',           symbol: 'WIF',    name: 'dogwifhat',       group: 'sol',   emoji: '🧢', color: '#B98A6B', price: 0.92,      mcap: 0.92e9, d1: -2.3, d7: 6.2 },
  { id: 'popcat',               symbol: 'POPCAT', name: 'Popcat',          group: 'sol',   emoji: '😺', color: '#E36CA8', price: 0.41,      mcap: 0.4e9,  d1: 7.4,  d7: 18.1 },
  { id: 'cat-in-a-dogs-world',  symbol: 'MEW',    name: 'cat in a dogs world', group: 'sol', emoji: '🐱', color: '#9B8FD6', price: 0.0031, mcap: 0.27e9, d1: -5.2, d7: -3.4 },
  { id: 'book-of-meme',         symbol: 'BOME',   name: 'BOOK OF MEME',    group: 'sol',   emoji: '📖', color: '#5B9ED6', price: 0.0016,    mcap: 0.11e9, d1: 1.2,  d7: -7.8 },
  { id: 'fartcoin',             symbol: 'FARTCOIN', name: 'Fartcoin',      group: 'sol',   emoji: '💨', color: '#6ABFA0', price: 0.78,      mcap: 0.78e9, d1: 11.6, d7: 22.4 },
  { id: 'official-trump',       symbol: 'TRUMP',  name: 'Official Trump',  group: 'sol',   emoji: '🇺🇸', color: '#D95F4A', price: 8.9,       mcap: 1.8e9,  d1: -1.4, d7: -9.9 },
  { id: 'pudgy-penguins',       symbol: 'PENGU',  name: 'Pudgy Penguins',  group: 'sol',   emoji: '🐧', color: '#56C4C4', price: 0.0098,    mcap: 0.62e9, d1: 3.3,  d7: 5.0 },
  { id: 'goatseus-maximus',     symbol: 'GOAT',   name: 'Goatseus Maximus', group: 'sol',  emoji: '🐐', color: '#C9C9C9', price: 0.062,     mcap: 0.06e9, d1: -8.8, d7: -14.6 },
  { id: 'peanut-the-squirrel',  symbol: 'PNUT',   name: 'Peanut the Squirrel', group: 'sol', emoji: '🐿️', color: '#D4A535', price: 0.19,   mcap: 0.19e9, d1: 2.0,  d7: 4.4 },
  // Large caps
  { id: 'bitcoin',              symbol: 'BTC',    name: 'Bitcoin',         group: 'major', emoji: '₿',  color: '#F7931A', price: 98000,     mcap: 1.94e12, d1: 1.1, d7: 3.2 },
  { id: 'ethereum',             symbol: 'ETH',    name: 'Ethereum',        group: 'major', emoji: '◆',  color: '#8C9EFF', price: 3400,      mcap: 4.1e11, d1: 1.9,  d7: 5.1 },
  { id: 'solana',               symbol: 'SOL',    name: 'Solana',          group: 'major', emoji: '◎',  color: '#14F195', price: 215,       mcap: 1.0e11, d1: -0.8, d7: 7.3 },
  { id: 'binancecoin',          symbol: 'BNB',    name: 'BNB',             group: 'major', emoji: '⬡',  color: '#F3BA2F', price: 640,       mcap: 9.3e10, d1: 0.4,  d7: 1.8 },
  { id: 'ripple',               symbol: 'XRP',    name: 'XRP',             group: 'major', emoji: '✕',  color: '#9AA7B5', price: 2.4,       mcap: 1.4e11, d1: -1.9, d7: -2.5 },
  { id: 'dogecoin',             symbol: 'DOGE',   name: 'Dogecoin',        group: 'major', emoji: '🐶', color: '#C2A633', price: 0.34,      mcap: 5.0e10, d1: 3.0,  d7: 8.8 },
]

export const COIN_BY_ID = Object.fromEntries(COINS.map(c => [c.id, c]))

/* ── deterministic PRNG so the fallback snapshot is stable ── */
export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Bridge-style random walk (168 hourly points) that ends exactly at `price`
 *  and starts at price / (1 + d7%). */
function simulateSparkline(coin, idx) {
  const rnd = mulberry32(1000 + idx * 97)
  const n = 168
  const start = coin.price / (1 + coin.d7 / 100)
  const vol = coin.group === 'sol' ? 0.012 : 0.005
  const walk = [0]
  for (let i = 1; i < n; i++) walk.push(walk[i - 1] + (rnd() - 0.5) * 2 * vol)
  const drift = walk[n - 1]
  const out = []
  for (let i = 0; i < n; i++) {
    const bridged = walk[i] - (drift * i) / (n - 1)           // pin the end
    const trend = Math.log(coin.price / start) * (i / (n - 1))
    out.push(start * Math.exp(trend + bridged))
  }
  out[n - 1] = coin.price
  return out
}

export function fallbackSnapshot() {
  return COINS.map((c, i) => ({
    ...c,
    spark: simulateSparkline(c, i),
    // 24h change taken from the last 24 sparkline points
    d1: c.d1,
  }))
}

const CACHE_KEY = 'im_arena_snapshot_v1'
const IDS = COINS.map(c => c.id).join(',')
const URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + IDS +
  '&sparkline=true&price_change_percentage=24h,7d&per_page=50'

async function fetchLive() {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(URL, { signal: ctrl.signal })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const rows = await res.json()
    if (!Array.isArray(rows) || !rows.length) throw new Error('empty')
    const byId = Object.fromEntries(rows.map(r => [r.id, r]))
    const merged = COINS.map((c, i) => {
      const r = byId[c.id]
      if (!r || !r.sparkline_in_7d?.price?.length) return { ...c, spark: simulateSparkline(c, i), simulated: true }
      return {
        ...c,
        price: r.current_price,
        mcap: r.market_cap || c.mcap,
        d1: r.price_change_percentage_24h_in_currency ?? r.price_change_percentage_24h ?? 0,
        d7: r.price_change_percentage_7d_in_currency ?? 0,
        spark: r.sparkline_in_7d.price,
        volume: r.total_volume,
      }
    })
    return merged
  } finally {
    clearTimeout(timer)
  }
}

/** React hook → { coins, status: 'loading'|'live'|'cached'|'demo', updatedAt, refresh } */
export function useCryptoData() {
  const [state, setState] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
      if (cached?.coins?.length) return { coins: cached.coins, status: 'cached', updatedAt: cached.at }
    } catch { /* ignore */ }
    return { coins: fallbackSnapshot(), status: 'loading', updatedAt: null }
  })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    fetchLive()
      .then(coins => {
        if (!alive) return
        const at = Date.now()
        setState({ coins, status: 'live', updatedAt: at })
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ coins, at })) } catch { /* quota */ }
      })
      .catch(() => {
        if (!alive) return
        setState(s => ({ ...s, status: s.status === 'cached' ? 'cached' : 'demo' }))
      })
    return () => { alive = false }
  }, [tick])

  // refresh every 2 min (free tier is rate-limited)
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 120000)
    return () => clearInterval(t)
  }, [])

  return { ...state, refresh: () => setTick(x => x + 1) }
}

/* ── formatters ── */
export function fmtPrice(p) {
  if (p == null) return '—'
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (p >= 1)    return '$' + p.toFixed(2)
  if (p >= 0.01) return '$' + p.toFixed(4)
  return '$' + p.toPrecision(3)
}
export function fmtCap(n) {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(0) + 'M'
  return '$' + n.toLocaleString()
}
export const fmtPct = (v) => (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
