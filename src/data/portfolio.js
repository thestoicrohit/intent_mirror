/* ═══════════════════════════════════════════════
   Intent Mirror — Personal Portfolio (B2C)
   ───────────────────────────────────────────────
   "Your money, in one place." A unified view across crypto, stocks,
   mutual funds and a fixed deposit — the four worlds a modern Indian
   investor juggles. Values are in ₹.

   Crypto holdings are simulated here but structured so that, when a
   real wallet is connected, fetchCryptoHoldings() can read live
   on-chain balances instead. Everything else (stocks/MF/FD) would
   come from account aggregators (RBI AA framework) in production.
═══════════════════════════════════════════════ */

// Colours drawn from the palette already used across the app (Wealth Hub / header).
export const ASSET_CLASSES = {
  Crypto:        { color: '#D4A853', icon: '₿' },
  Stocks:        { color: '#6ABFA0', icon: '📈' },
  'Mutual Fund': { color: '#5B9ED6', icon: '🧺' },
  'Fixed Deposit': { color: '#568F7C', icon: '🏦' },
}

// Illustrative historical-average annual returns, used only by the
// "what if you invested?" growth projector. Not advice or a guarantee.
export const EXPECTED_CAGR = {
  'Fixed Deposit': 0.07,
  'Mutual Fund':   0.12,
  Stocks:          0.14,
  Crypto:          0.20,
}

/** Base holdings. `value` is current ₹ value; `invested` is cost basis. */
export const HOLDINGS = [
  { id:'eth',  class:'Crypto',        name:'Ethereum',         symbol:'ETH',  qty:1.42,   value:382000, invested:298000, change24h:+3.8 },
  { id:'btc',  class:'Crypto',        name:'Bitcoin',          symbol:'BTC',  qty:0.071,  value:298000, invested:210000, change24h:+1.9 },
  { id:'sol',  class:'Crypto',        name:'Solana',           symbol:'SOL',  qty:18.5,   value:74000,  invested:96000,  change24h:-4.2 },
  { id:'rel',  class:'Stocks',        name:'Reliance Ind.',    symbol:'RELIANCE', qty:40, value:118000, invested:104000, change24h:+0.7 },
  { id:'tcs',  class:'Stocks',        name:'TCS',              symbol:'TCS',  qty:22,     value:92000,  invested:88000,  change24h:-0.3 },
  { id:'idx',  class:'Mutual Fund',   name:'Nifty 50 Index',   symbol:'NIFTYBEES', qty:1, value:140000, invested:120000, change24h:+0.5 },
  { id:'flexi',class:'Mutual Fund',   name:'Flexi Cap Fund',   symbol:'FLEXI', qty:1,     value:86000,  invested:80000,  change24h:+0.4 },
  { id:'fd',   class:'Fixed Deposit', name:'Bank FD · 7.1% p.a.', symbol:'FD', qty:1,     value:210000, invested:200000, change24h:0,  daysToMaturity:11 },
]

/* ── Behavioural events: what the user has actually been doing ──────────
   These drive the "intent" reading — the thing that makes this more than
   a portfolio tracker. */
export const ACTIVITY = [
  { id:1, kind:'view',    label:'Opened the app',                    labelHi:'ऐप खोला',                     detail:'14 times today',           detailHi:'आज 14 बार',          weight:'watch' },
  { id:2, kind:'compare', label:'Compared SOL vs ETH',              labelHi:'SOL बनाम ETH की तुलना की',    detail:'3 times in the last hour', detailHi:'पिछले घंटे में 3 बार', weight:'watch' },
  { id:3, kind:'search',  label:'Searched "how to sell crypto fast"', labelHi:'"क्रिप्टो जल्दी कैसे बेचें" खोजा', detail:'this morning',          detailHi:'आज सुबह',            weight:'exit'  },
  { id:4, kind:'browse',  label:'Read about index funds',           labelHi:'इंडेक्स फंड के बारे में पढ़ा',  detail:'2 articles',               detailHi:'2 लेख',              weight:'grow'  },
  { id:5, kind:'rate',    label:'Checked FD renewal rates',         labelHi:'FD रिन्यूअल दरें देखीं',        detail:'yesterday',                detailHi:'कल',                 weight:'grow'  },
]

/* ── Derived signals (maps activity → the ML signal vocabulary) ────────── */
export function deriveSignals(holdings = HOLDINGS, activity = ACTIVITY) {
  const signals = []
  if (activity.some(a => a.kind === 'compare' || a.kind === 'rate')) signals.push('rate_compare')
  if (activity.some(a => a.kind === 'search' && a.weight === 'exit')) signals.push('early_withdrawal')
  if (holdings.some(h => h.class === 'Crypto')) signals.push('stocks_search')
  if (holdings.some(h => h.class === 'Mutual Fund')) signals.push('mf_browse')
  if (activity.filter(a => a.kind === 'view').length) signals.push('safety_check')
  return signals
}

/* ── Portfolio maths ───────────────────────────────────────────────────── */
export function computePortfolio(holdings = HOLDINGS) {
  const netWorth = holdings.reduce((s, h) => s + h.value, 0)
  const invested = holdings.reduce((s, h) => s + h.invested, 0)
  const pnl      = netWorth - invested
  const pnlPct   = invested ? (pnl / invested) * 100 : 0

  const byClass = {}
  for (const h of holdings) {
    byClass[h.class] = (byClass[h.class] || 0) + h.value
  }
  const allocation = Object.entries(byClass).map(([name, value]) => ({
    name, value,
    pct: (value / netWorth) * 100,
    color: ASSET_CLASSES[name]?.color || '#888',
  })).sort((a, b) => b.value - a.value)

  const topConcentration = allocation[0]   // most-concentrated class

  return { netWorth, invested, pnl, pnlPct, allocation, topConcentration }
}

/* ── Money persona: how THIS user behaves with money ──────────────────────
   Reuses the four-persona system, now pointed at the individual. */
export function deriveMoneyPersona(holdings = HOLDINGS, activity = ACTIVITY) {
  const { allocation, topConcentration } = computePortfolio(holdings)
  const cryptoPct = (allocation.find(a => a.name === 'Crypto')?.pct) || 0
  const fdPct     = (allocation.find(a => a.name === 'Fixed Deposit')?.pct) || 0
  const exiting   = activity.some(a => a.weight === 'exit')

  let persona, why, whyHi
  if (cryptoPct >= 45 || activity.filter(a => a.kind === 'view').length >= 10) {
    persona = 'Optimizer'
    why   = 'High crypto allocation and frequent check-ins — you chase returns and stay active.'
    whyHi = 'ऊँचा क्रिप्टो आवंटन और बार-बार जाँच — आप रिटर्न के पीछे भागते हैं और सक्रिय रहते हैं।'
  } else if (fdPct >= 45) {
    persona = 'Protector'
    why   = 'Capital is parked in safe, guaranteed instruments. Stability over upside.'
    whyHi = 'पूँजी सुरक्षित, गारंटीड साधनों में रखी है। उछाल से ज़्यादा स्थिरता।'
  } else if (exiting) {
    persona = 'Exiter'
    why   = 'Recent exit-style behaviour detected (fast-sell searches).'
    whyHi = 'हाल ही में बाहर निकलने जैसा व्यवहार देखा गया (जल्दी बेचने की खोज)।'
  } else {
    persona = 'Anxious Saver'
    why   = 'You watch closely but diversify cautiously — you want reassurance before moving.'
    whyHi = 'आप ध्यान से देखते हैं पर सावधानी से विविधता लाते हैं — कदम उठाने से पहले आश्वासन चाहते हैं।'
  }
  return { persona, why, whyHi, cryptoPct, fdPct, topConcentration }
}

/* ── Live crypto balances (simulated; structured for real on-chain reads) ──
   In production: read ERC-20 / native balances for `walletAddress` from the
   connected chain via viem publicClient.getBalance / readContract, then price
   them. For the demo we jitter the stored values so the UI feels live. */
export async function fetchCryptoHoldings(/* walletAddress */) {
  return HOLDINGS.filter(h => h.class === 'Crypto').map(h => ({
    ...h,
    value: Math.round(h.value * (1 + (Math.random() - 0.5) * 0.01)),
  }))
}
