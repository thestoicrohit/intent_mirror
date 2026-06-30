/* ═══════════════════════════════════════════════
   Intent Mirror — Backend API
   ───────────────────────────────────────────────
   Focused, robust API for the B2C money copilot:
     • My Money — portfolio, server-computed persona + AI suggestions,
       and persisted holding verification (verified holdings gate net worth)
     • On-chain Intent Credential mint + read (Base Sepolia, viem)
     • Family / Kids "Money Quest" — missions, XP, levels, streaks,
       savings goals, allowance (persisted)
     • Health

   The portfolio + suggestion logic is shared with the frontend via the
   src/ modules below — single source of truth, no duplication.

   Design rules:
     • Every route is wrapped so a bad request never crashes the server.
     • Persistence is atomic-ish (write to a temp file, then rename).
     • On-chain mint is optional — falls back to onchain:false so the
       frontend can simulate. Nothing here ever throws on missing config.
═══════════════════════════════════════════════ */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, renameSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createWalletClient, createPublicClient, http, isAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
// Shared logic — same modules the frontend uses (single source of truth)
import {
  HOLDINGS, ACTIVITY, EXPECTED_CAGR,
  computePortfolio, deriveMoneyPersona, deriveSignals,
} from '../src/data/portfolio.js'
import { generateSuggestions } from '../src/suggestions.js'

const __dirname   = dirname(fileURLToPath(import.meta.url))
const PORT        = process.env.PORT || 3001
const STORE_FILE  = join(__dirname, 'store.json')

/* ══════════════════════════════════════════
   PERSISTENCE  (families keyed by wallet address)
══════════════════════════════════════════ */
const DEFAULT_STORE = { families: {}, portfolios: {} }

function loadStore() {
  if (existsSync(STORE_FILE)) {
    try {
      const data = JSON.parse(readFileSync(STORE_FILE, 'utf8'))
      return { ...DEFAULT_STORE, ...data, families: data.families || {}, portfolios: data.portfolios || {} }
    } catch (e) {
      console.warn(`⚠️  store.json unreadable (${e.message}) — starting fresh`)
    }
  }
  return structuredClone(DEFAULT_STORE)
}

let store = loadStore()
let saveTimer = null

function saveStore() {
  // debounce rapid writes, then write atomically
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      const tmp = STORE_FILE + '.tmp'
      writeFileSync(tmp, JSON.stringify(store, null, 2))
      renameSync(tmp, STORE_FILE)
    } catch (e) {
      console.error('Failed to persist store:', e.message)
    }
  }, 50)
}

/* ══════════════════════════════════════════
   MONEY QUEST  (kids missions — learn then do)
══════════════════════════════════════════ */
const MISSIONS = [
  { id:'save-first',  icon:'🐷', xp:50, reward:100,
    lesson:'Saving means keeping some money for later instead of spending it all now. Future-you will say thanks!',
    lessonHi:'बचत यानी अभी सब खर्च करने के बजाय कुछ पैसा बाद के लिए रखना। आने वाला कल आपको धन्यवाद देगा!',
    action:'Move ₹100 into your savings goal',
    actionHi:'अपने बचत लक्ष्य में ₹100 डालें' },
  { id:'goal',        icon:'🎯', xp:60, reward:0,
    lesson:'A goal gives your money a job. When you know WHAT you are saving for, saving becomes fun.',
    lessonHi:'लक्ष्य आपके पैसे को एक काम देता है। जब आप जानते हैं किसलिए बचा रहे हैं, बचत मज़ेदार हो जाती है।',
    action:'Pick what you are saving for',
    actionHi:'चुनें कि आप किसलिए बचत कर रहे हैं' },
  { id:'compound',    icon:'🌱', xp:80, reward:0,
    lesson:'Money can grow money. A little saved every month becomes a LOT over years — that is called compounding.',
    lessonHi:'पैसा पैसा बढ़ा सकता है। हर महीने थोड़ा बचाना सालों में बहुत बन जाता है — इसे कंपाउंडिंग कहते हैं।',
    action:'Watch your seed grow',
    actionHi:'अपने बीज को बढ़ते देखें' },
  { id:'spot-scam',   icon:'🕵️', xp:70, reward:0,
    lesson:'If someone promises free money or asks for your secret password, it is a scam. Never share your password!',
    lessonHi:'अगर कोई मुफ़्त पैसे का वादा करे या आपका गुप्त पासवर्ड माँगे, तो वह धोखा है। पासवर्ड कभी साझा न करें!',
    action:'Pass the scam-spotter quiz',
    actionHi:'स्कैम-स्पॉटर क्विज़ पास करें' },
  { id:'needs-wants', icon:'⚖️', xp:60, reward:0,
    lesson:'Needs are things you must have, like food. Wants are nice extras, like toys. Spend on needs first.',
    lessonHi:'ज़रूरतें वे चीज़ें हैं जो होनी ही चाहिए, जैसे खाना। चाहतें अच्छे अतिरिक्त हैं, जैसे खिलौने। पहले ज़रूरतों पर खर्च करें।',
    action:'Sort needs from wants',
    actionHi:'ज़रूरतें और चाहतें अलग करें' },
]
const MISSION_IDS = new Set(MISSIONS.map(m => m.id))

const levelFor = (xp) => Math.floor((xp || 0) / 150) + 1   // 150 XP per level
const todayStr = () => new Date().toISOString().slice(0, 10)

/* Build a fresh family record */
function newFamily() {
  return {
    kidMode:   false,
    kidName:   'Explorer',
    allowance: 50,                                  // weekly pocket money (₹)
    pocketMoney: 200,                               // current spendable (₹)
    goal:      { name: 'New bicycle 🚲', target: 4000, saved: 0 },
    completedMissions: [],
    xp: 0,
    streak: 0,
    lastActive: null,
    createdAt: new Date().toISOString(),
  }
}

/** Get a family by address, creating + persisting a default if absent. */
function getFamily(address) {
  const key = address.toLowerCase()
  if (!store.families[key]) {
    store.families[key] = newFamily()
    saveStore()
  }
  return store.families[key]
}

/** Update the daily streak based on last activity. */
function bumpStreak(fam) {
  const today = todayStr()
  if (fam.lastActive === today) return            // already counted today
  if (fam.lastActive) {
    const diffDays = Math.round((Date.parse(today) - Date.parse(fam.lastActive)) / 86400000)
    fam.streak = diffDays === 1 ? (fam.streak + 1) : 1
  } else {
    fam.streak = 1
  }
  fam.lastActive = today
}

/* ══════════════════════════════════════════
   MY MONEY  (portfolio, verification, persona, suggestions)
   Verified holdings gate net worth. Logic reused from src/.
══════════════════════════════════════════ */
const HOLDING_IDS = new Set(HOLDINGS.map(h => h.id))

function getPortfolioRec(address) {
  const key = address.toLowerCase()
  if (!store.portfolios[key]) {
    store.portfolios[key] = { verified: ['fd'] }   // FD is bank-linked → auto-verified
    saveStore()
  }
  return store.portfolios[key]
}

function buildPortfolio(address, lang = 'EN') {
  const rec = getPortfolioRec(address)
  const verified = new Set(rec.verified)
  const verifiedList = HOLDINGS.filter(h => verified.has(h.id))
  const pf  = computePortfolio(HOLDINGS)
  const vpf = computePortfolio(verifiedList.length ? verifiedList : HOLDINGS.slice(0, 1))
  const persona = deriveMoneyPersona(HOLDINGS)
  return {
    holdings:        HOLDINGS.map(h => ({ ...h, verified: verified.has(h.id) })),
    verified:        [...verified],
    activity:        ACTIVITY,
    verifiedNetWorth: vpf.netWorth,
    totalNetWorth:   pf.netWorth,
    pending:         pf.netWorth - vpf.netWorth,
    pnl:             vpf.pnl,
    pnlPct:          vpf.pnlPct,
    allocation:      vpf.allocation,
    persona,
    signals:         deriveSignals(HOLDINGS),
    suggestions:     generateSuggestions({ pf, persona, holdings: HOLDINGS, activity: ACTIVITY }, lang),
  }
}

/* ══════════════════════════════════════════
   ON-CHAIN CREDENTIALS  (Base Sepolia, viem)
══════════════════════════════════════════ */
const ISSUER_PK = process.env.ISSUER_PRIVATE_KEY || ''
const CONTRACT  = process.env.CREDENTIAL_CONTRACT || ''
const RPC_URL   = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
const ONCHAIN   = Boolean(ISSUER_PK && CONTRACT)

const CREDENTIAL_ABI = [
  { type:'function', name:'issue', stateMutability:'nonpayable',
    inputs:[{name:'to',type:'address'},{name:'persona',type:'string'},{name:'intentScore',type:'uint256'},{name:'signals',type:'string'},{name:'uri',type:'string'}],
    outputs:[{name:'tokenId',type:'uint256'}] },
  { type:'function', name:'getByHolder', stateMutability:'view',
    inputs:[{name:'holder',type:'address'}],
    outputs:[{name:'tokenId',type:'uint256'},{name:'persona',type:'string'},{name:'intentScore',type:'uint256'},{name:'signals',type:'string'},{name:'uri',type:'string'},{name:'issuedAt',type:'uint64'}] },
]

let publicClient = null, walletClient = null, issuerAccount = null
if (ONCHAIN) {
  try {
    issuerAccount = privateKeyToAccount(ISSUER_PK.startsWith('0x') ? ISSUER_PK : `0x${ISSUER_PK}`)
    publicClient  = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) })
    walletClient  = createWalletClient({ account: issuerAccount, chain: baseSepolia, transport: http(RPC_URL) })
    console.log(`⛓  On-chain credentials ENABLED — issuer ${issuerAccount.address}`)
  } catch (e) {
    console.log(`⚠️  On-chain disabled (bad issuer key): ${e.message}`)
  }
} else {
  console.log('⛓  On-chain credentials DISABLED — frontend will simulate.')
}

/* ══════════════════════════════════════════
   EXPRESS APP
══════════════════════════════════════════ */
const app = express()
app.use(cors())
app.use(express.json())
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.path}`)
  next()
})

/** Wrap an async handler so rejected promises become clean 500s, not crashes. */
const wrap = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((e) => {
    console.error(`Error on ${req.method} ${req.path}:`, e.message)
    if (!res.headersSent) res.status(500).json({ error: e.message })
  })

/** Validate an EVM address param; returns lowercased or sends 400. */
function requireAddress(req, res) {
  const a = req.params.address
  if (!a || !isAddress(a)) { res.status(400).json({ error: 'valid wallet address required' }); return null }
  return a.toLowerCase()
}

/* ── Health ──────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '4.0.0',
    families: Object.keys(store.families).length,
    portfolios: Object.keys(store.portfolios).length,
    onchain: ONCHAIN,
    issuer: issuerAccount?.address || null,
    uptime: Math.floor(process.uptime()),
  })
})

/* ── Money Quest: missions catalogue ─────── */
app.get('/api/missions', (_req, res) => res.json({ missions: MISSIONS }))

/* ── Family: read state ──────────────────── */
app.get('/api/family/:address', wrap((req, res) => {
  const key = requireAddress(req, res); if (!key) return
  const fam = getFamily(key)
  res.json({ family: { ...fam, level: levelFor(fam.xp) } })
}))

/* ── Family: parent updates settings ─────── */
app.put('/api/family/:address', wrap((req, res) => {
  const key = requireAddress(req, res); if (!key) return
  const fam = getFamily(key)
  const { kidMode, kidName, allowance, goalName, goalTarget } = req.body || {}

  if (typeof kidMode === 'boolean') fam.kidMode = kidMode
  if (typeof kidName === 'string' && kidName.trim()) fam.kidName = kidName.trim().slice(0, 40)
  if (allowance != null) {
    const n = Number(allowance)
    if (!Number.isFinite(n) || n < 0) return res.status(400).json({ error: 'allowance must be a non-negative number' })
    fam.allowance = Math.round(n)
  }
  if (typeof goalName === 'string' && goalName.trim()) fam.goal.name = goalName.trim().slice(0, 60)
  if (goalTarget != null) {
    const n = Number(goalTarget)
    if (!Number.isFinite(n) || n <= 0) return res.status(400).json({ error: 'goalTarget must be a positive number' })
    fam.goal.target = Math.round(n)
    if (fam.goal.saved > fam.goal.target) fam.goal.saved = fam.goal.target
  }
  saveStore()
  res.json({ family: { ...fam, level: levelFor(fam.xp) } })
}))

/* ── Family: complete a mission (learn → do) ── */
app.post('/api/family/:address/mission', wrap((req, res) => {
  const key = requireAddress(req, res); if (!key) return
  const { missionId } = req.body || {}
  if (!MISSION_IDS.has(missionId)) return res.status(400).json({ error: 'unknown missionId' })

  const fam = getFamily(key)
  const mission = MISSIONS.find(m => m.id === missionId)

  // Idempotent: completing twice never double-awards.
  if (fam.completedMissions.includes(missionId)) {
    return res.json({ family: { ...fam, level: levelFor(fam.xp) }, awarded: 0, alreadyDone: true })
  }

  fam.completedMissions.push(missionId)
  fam.xp += mission.xp
  // Some missions also drop pocket money into the goal as the "do" reward.
  if (mission.reward > 0) {
    const room = Math.max(0, fam.goal.target - fam.goal.saved)
    const add  = Math.min(mission.reward, room)
    fam.goal.saved += add
  }
  bumpStreak(fam)
  saveStore()
  res.json({ family: { ...fam, level: levelFor(fam.xp) }, awarded: mission.xp, alreadyDone: false })
}))

/* ── Family: move money into the savings goal ── */
app.post('/api/family/:address/save', wrap((req, res) => {
  const key = requireAddress(req, res); if (!key) return
  const amount = Number((req.body || {}).amount)
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'amount must be a positive number' })

  const fam = getFamily(key)
  const move = Math.min(amount, fam.pocketMoney, Math.max(0, fam.goal.target - fam.goal.saved))
  if (move <= 0) return res.status(400).json({ error: 'nothing to save (goal full or no pocket money)' })

  fam.pocketMoney -= move
  fam.goal.saved  += move
  bumpStreak(fam)
  saveStore()
  res.json({ family: { ...fam, level: levelFor(fam.xp) }, saved: move })
}))

/* ── My Money: portfolio (server-computed, verified-gated) ── */
app.get('/api/portfolio/:address', wrap((req, res) => {
  const key = requireAddress(req, res); if (!key) return
  res.json(buildPortfolio(key, req.query.lang === 'HI' ? 'HI' : 'EN'))
}))

// POST /api/portfolio/:address/verify — prove/verify a holding (persists)
app.post('/api/portfolio/:address/verify', wrap((req, res) => {
  const key = requireAddress(req, res); if (!key) return
  const { holdingId } = req.body || {}
  if (!HOLDING_IDS.has(holdingId)) return res.status(400).json({ error: 'unknown holdingId' })
  const rec = getPortfolioRec(key)
  if (!rec.verified.includes(holdingId)) { rec.verified.push(holdingId); saveStore() }
  res.json(buildPortfolio(key, req.query.lang === 'HI' ? 'HI' : 'EN'))
}))

// GET /api/projection?amount=&class=&years= — compound-growth "what if?"
app.get('/api/projection', wrap((req, res) => {
  const amount = Number(req.query.amount)
  const years  = Number(req.query.years)
  const klass  = req.query.class
  if (!Number.isFinite(amount) || amount <= 0)            return res.status(400).json({ error: 'amount must be positive' })
  if (!Number.isFinite(years) || years <= 0 || years > 100) return res.status(400).json({ error: 'years must be 1–100' })
  const cagr = EXPECTED_CAGR[klass]
  if (cagr == null) return res.status(400).json({ error: 'unknown asset class' })
  const projected = Math.round(amount * Math.pow(1 + cagr, years))
  res.json({ amount, class: klass, years, cagr, projected, multiplier: Number((projected / amount).toFixed(1)) })
}))

/* ── On-chain credential: mint (issuer pays gas) ── */
app.post('/api/credential/mint', wrap(async (req, res) => {
  const { address, profile } = req.body || {}
  if (!address || !isAddress(address)) return res.status(400).json({ error: 'valid address required' })
  if (!profile || typeof profile !== 'object') return res.status(400).json({ error: 'profile required' })

  if (!ONCHAIN || !walletClient) return res.json({ onchain: false, reason: 'issuer not configured' })

  const signals = Array.isArray(profile.signals) ? profile.signals.join(',') : (profile.signals || '')
  const txHash = await walletClient.writeContract({
    address: CONTRACT, abi: CREDENTIAL_ABI, functionName: 'issue',
    args: [address, String(profile.persona || 'Protector'), BigInt(Math.round(profile.intentScore || 0)), String(signals), String(profile.uri || '')],
  })
  await publicClient.waitForTransactionReceipt({ hash: txHash })
  console.log(`⛓  Minted credential for ${address} — tx ${txHash}`)
  res.json({ onchain: true, txHash, contract: CONTRACT, chain: 'Base Sepolia', issuer: issuerAccount.address })
}))

/* ── On-chain credential: read ───────────── */
app.get('/api/credential/:address', wrap(async (req, res) => {
  const key = requireAddress(req, res); if (!key) return
  if (!ONCHAIN || !publicClient) return res.json({ onchain: false })

  const [tokenId, persona, intentScore, signals, uri, issuedAt] = await publicClient.readContract({
    address: CONTRACT, abi: CREDENTIAL_ABI, functionName: 'getByHolder', args: [key],
  })
  if (tokenId === 0n) return res.json({ onchain: true, exists: false })
  res.json({
    onchain: true, exists: true, tokenId: tokenId.toString(),
    persona, intentScore: Number(intentScore),
    signals: signals ? signals.split(',') : [], uri,
    issuedAt: new Date(Number(issuedAt) * 1000).toISOString(),
    contract: CONTRACT, chain: 'Base Sepolia',
  })
}))

/* ── 404 + error safety nets ─────────────── */
app.use((req, res) => res.status(404).json({ error: `no route ${req.method} ${req.path}` }))
app.use((err, _req, res, _next) => {
  console.error('Unhandled:', err.message)
  if (!res.headersSent) res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`\n  Intent Mirror API v4.0  →  http://localhost:${PORT}`)
  console.log(`  GET  /api/health`)
  console.log(`  GET  /api/portfolio/:address`)
  console.log(`  POST /api/portfolio/:address/verify`)
  console.log(`  GET  /api/projection`)
  console.log(`  GET  /api/missions`)
  console.log(`  GET  /api/family/:address`)
  console.log(`  PUT  /api/family/:address`)
  console.log(`  POST /api/family/:address/mission`)
  console.log(`  POST /api/family/:address/save`)
  console.log(`  POST /api/credential/mint`)
  console.log(`  GET  /api/credential/:address\n`)
})

// Never let an unexpected error take the process down.
process.on('unhandledRejection', (e) => console.error('unhandledRejection:', e?.message || e))
process.on('uncaughtException',  (e) => console.error('uncaughtException:', e?.message || e))
