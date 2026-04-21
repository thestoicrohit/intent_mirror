import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ML service base URL (Python Flask on port 5001)
const ML_SERVICE = process.env.ML_SERVICE_URL || 'http://localhost:5001'

async function callML(path, body = null, method = 'GET') {
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' } }
    if (body) opts.body = JSON.stringify(body)
    const res = await fetch(`${ML_SERVICE}${path}`, opts)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null   // ML service offline → fallback to rule-based
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = 3001
const STORE_FILE = join(__dirname, 'store.json')

/* ══════════════════════════════════════════
   IN-MEMORY DATA  (seeded from mock data)
══════════════════════════════════════════ */
const USERS = [
  { id:1,  name:'Kavitha Nair',       city:'Bengaluru',  fdAmount:'₹5.1L', daysLeft:3,  persona:'Exiter',        prediction:'Churn',    riskScore:97, signals:['early_withdrawal','no_login_30d','competitor_browse'],  lastLogin:31, urgency:97, detectedHrsAgo:1  },
  { id:2,  name:'Rajan Mehra',        city:'Delhi',      fdAmount:'₹1.8L', daysLeft:8,  persona:'Anxious Saver', prediction:'Withdraw', riskScore:91, signals:['safety_check','early_withdrawal','support_ticket'],      lastLogin:12, urgency:91, detectedHrsAgo:2  },
  { id:3,  name:'Farhan Sheikh',      city:'Ahmedabad',  fdAmount:'₹2.9L', daysLeft:12, persona:'Exiter',        prediction:'Withdraw', riskScore:88, signals:['early_withdrawal','rate_compare'],                       lastLogin:18, urgency:85, detectedHrsAgo:3  },
  { id:4,  name:'Priya Sharma',       city:'Mumbai',     fdAmount:'₹2.4L', daysLeft:14, persona:'Optimizer',     prediction:'Upgrade',  riskScore:65, signals:['mf_browse','rate_compare','stocks_search'],             lastLogin:2,  urgency:62, detectedHrsAgo:5  },
  { id:5,  name:'Sunita Reddy',       city:'Hyderabad',  fdAmount:'₹1.1L', daysLeft:19, persona:'Optimizer',     prediction:'Upgrade',  riskScore:58, signals:['mf_browse','stocks_search'],                            lastLogin:1,  urgency:55, detectedHrsAgo:6  },
  { id:6,  name:'Amit Desai',         city:'Pune',       fdAmount:'₹3.2L', daysLeft:26, persona:'Protector',     prediction:'Renew',    riskScore:18, signals:['safety_check'],                                          lastLogin:3,  urgency:20, detectedHrsAgo:12 },
  { id:7,  name:'Meena Pillai',       city:'Chennai',    fdAmount:'₹4.0L', daysLeft:5,  persona:'Exiter',        prediction:'Churn',    riskScore:93, signals:['early_withdrawal','no_login_30d'],                       lastLogin:35, urgency:93, detectedHrsAgo:1  },
  { id:8,  name:'Suresh Kumar',       city:'Kolkata',    fdAmount:'₹6.5L', daysLeft:7,  persona:'Anxious Saver', prediction:'Withdraw', riskScore:82, signals:['safety_check','support_ticket'],                        lastLogin:9,  urgency:80, detectedHrsAgo:2  },
  { id:9,  name:'Deepa Menon',        city:'Kochi',      fdAmount:'₹2.2L', daysLeft:10, persona:'Optimizer',     prediction:'Upgrade',  riskScore:70, signals:['mf_browse','rate_compare'],                             lastLogin:1,  urgency:68, detectedHrsAgo:4  },
  { id:10, name:'Vikram Joshi',       city:'Jaipur',     fdAmount:'₹3.8L', daysLeft:22, persona:'Protector',     prediction:'Renew',    riskScore:15, signals:['safety_check'],                                          lastLogin:5,  urgency:18, detectedHrsAgo:24 },
  { id:11, name:'Ananya Bose',        city:'Kolkata',    fdAmount:'₹1.5L', daysLeft:4,  persona:'Exiter',        prediction:'Churn',    riskScore:95, signals:['early_withdrawal','no_login_30d','competitor_browse'],  lastLogin:40, urgency:95, detectedHrsAgo:1  },
  { id:12, name:'Rohit Verma',        city:'Lucknow',    fdAmount:'₹2.7L', daysLeft:16, persona:'Anxious Saver', prediction:'Withdraw', riskScore:74, signals:['safety_check','early_withdrawal'],                      lastLogin:7,  urgency:72, detectedHrsAgo:5  },
  { id:13, name:'Sneha Iyer',         city:'Bengaluru',  fdAmount:'₹3.3L', daysLeft:11, persona:'Optimizer',     prediction:'Upgrade',  riskScore:60, signals:['mf_browse','stocks_search','rate_compare'],             lastLogin:1,  urgency:58, detectedHrsAgo:3  },
  { id:14, name:'Arjun Kapoor',       city:'Mumbai',     fdAmount:'₹5.5L', daysLeft:28, persona:'Protector',     prediction:'Renew',    riskScore:12, signals:['safety_check'],                                          lastLogin:4,  urgency:14, detectedHrsAgo:36 },
  { id:15, name:'Lakshmi Devi',       city:'Chennai',    fdAmount:'₹1.9L', daysLeft:6,  persona:'Anxious Saver', prediction:'Withdraw', riskScore:86, signals:['safety_check','early_withdrawal','support_ticket'],     lastLogin:11, urgency:84, detectedHrsAgo:2  },
  { id:16, name:'Kiran Rao',          city:'Hyderabad',  fdAmount:'₹4.2L', daysLeft:20, persona:'Optimizer',     prediction:'Upgrade',  riskScore:52, signals:['mf_browse','rate_compare'],                             lastLogin:2,  urgency:50, detectedHrsAgo:8  },
  { id:17, name:'Pooja Gupta',        city:'Delhi',      fdAmount:'₹2.1L', daysLeft:9,  persona:'Anxious Saver', prediction:'Withdraw', riskScore:79, signals:['safety_check','early_withdrawal'],                      lastLogin:15, urgency:77, detectedHrsAgo:3  },
  { id:18, name:'Manoj Tiwari',       city:'Bhopal',     fdAmount:'₹3.6L', daysLeft:25, persona:'Protector',     prediction:'Renew',    riskScore:22, signals:['safety_check'],                                          lastLogin:6,  urgency:24, detectedHrsAgo:18 },
  { id:19, name:'Divya Nambiar',      city:'Kochi',      fdAmount:'₹1.7L', daysLeft:13, persona:'Optimizer',     prediction:'Upgrade',  riskScore:55, signals:['mf_browse','stocks_search'],                            lastLogin:1,  urgency:52, detectedHrsAgo:4  },
  { id:20, name:'Rahul Singh',        city:'Varanasi',   fdAmount:'₹2.5L', daysLeft:2,  persona:'Exiter',        prediction:'Churn',    riskScore:98, signals:['early_withdrawal','no_login_30d','competitor_browse'],  lastLogin:45, urgency:98, detectedHrsAgo:1  },
  { id:21, name:'Geetha Subramanian', city:'Coimbatore', fdAmount:'₹4.8L', daysLeft:17, persona:'Protector',     prediction:'Renew',    riskScore:25, signals:['safety_check'],                                          lastLogin:3,  urgency:28, detectedHrsAgo:14 },
  { id:22, name:'Arun Nair',          city:'Trivandrum', fdAmount:'₹3.1L', daysLeft:15, persona:'Optimizer',     prediction:'Upgrade',  riskScore:48, signals:['mf_browse','rate_compare'],                             lastLogin:2,  urgency:45, detectedHrsAgo:6  },
  { id:23, name:'Sonia Khanna',       city:'Chandigarh', fdAmount:'₹2.3L', daysLeft:8,  persona:'Anxious Saver', prediction:'Withdraw', riskScore:83, signals:['safety_check','support_ticket'],                        lastLogin:10, urgency:81, detectedHrsAgo:2  },
  { id:24, name:'Tarun Mishra',       city:'Allahabad',  fdAmount:'₹1.6L', daysLeft:29, persona:'Protector',     prediction:'Renew',    riskScore:10, signals:['safety_check'],                                          lastLogin:7,  urgency:12, detectedHrsAgo:48 },
  { id:25, name:'Pallavi Rao',        city:'Pune',       fdAmount:'₹5.7L', daysLeft:21, persona:'Optimizer',     prediction:'Upgrade',  riskScore:42, signals:['mf_browse','stocks_search','rate_compare'],             lastLogin:1,  urgency:40, detectedHrsAgo:10 },
  { id:26, name:'Sunil Pandey',       city:'Patna',      fdAmount:'₹2.0L', daysLeft:6,  persona:'Exiter',        prediction:'Churn',    riskScore:90, signals:['early_withdrawal','no_login_30d'],                       lastLogin:33, urgency:88, detectedHrsAgo:2  },
  { id:27, name:'Nisha Bajaj',        city:'Nagpur',     fdAmount:'₹3.4L', daysLeft:18, persona:'Anxious Saver', prediction:'Withdraw', riskScore:68, signals:['safety_check','early_withdrawal'],                      lastLogin:8,  urgency:65, detectedHrsAgo:7  },
  { id:28, name:'Harish Chandra',     city:'Indore',     fdAmount:'₹4.5L', daysLeft:24, persona:'Protector',     prediction:'Renew',    riskScore:20, signals:['safety_check'],                                          lastLogin:4,  urgency:22, detectedHrsAgo:20 },
  { id:29, name:'Radha Krishnan',     city:'Mysuru',     fdAmount:'₹2.8L', daysLeft:11, persona:'Optimizer',     prediction:'Upgrade',  riskScore:57, signals:['mf_browse','stocks_search'],                            lastLogin:2,  urgency:55, detectedHrsAgo:4  },
  { id:30, name:'Fatima Begum',       city:'Hyderabad',  fdAmount:'₹1.4L', daysLeft:3,  persona:'Anxious Saver', prediction:'Withdraw', riskScore:89, signals:['safety_check','early_withdrawal','support_ticket'],     lastLogin:14, urgency:87, detectedHrsAgo:1  },
]

/* ══════════════════════════════════════════
   PERSISTENT STORE  (nudges + contacts)
══════════════════════════════════════════ */
function loadStore() {
  if (existsSync(STORE_FILE)) {
    try { return JSON.parse(readFileSync(STORE_FILE, 'utf8')) } catch { /* ignore */ }
  }
  return { nudges: [], contacts: [], searchLogs: [] }
}

function saveStore(store) {
  try { writeFileSync(STORE_FILE, JSON.stringify(store, null, 2)) } catch { /* ignore */ }
}

let store = loadStore()

/* ══════════════════════════════════════════
   NL SEARCH LOGIC
══════════════════════════════════════════ */
function nlSearch(q) {
  const lq = q.toLowerCase().trim()
  if (!lq) return []
  return USERS.filter(u => {
    if (u.name.toLowerCase().includes(lq))        return true
    if (u.city.toLowerCase().includes(lq))        return true
    if (u.persona.toLowerCase().includes(lq))     return true
    if (u.prediction.toLowerCase().includes(lq))  return true
    if (lq.includes('churn')    && (u.prediction === 'Churn' || u.prediction === 'Withdraw'))      return true
    if ((lq.includes('week') || lq.includes('7 day') || lq.includes('this week')) && u.daysLeft <= 7) return true
    if (lq.includes('matur')    && u.daysLeft <= 30)         return true
    if (lq.includes('upgrade')  && u.prediction === 'Upgrade') return true
    if (lq.includes('withdraw') && u.prediction === 'Withdraw') return true
    if (lq.includes('renew')    && u.prediction === 'Renew')  return true
    if ((lq.includes('high risk') || lq.includes('> 80') || lq.includes('>80')) && u.riskScore > 80) return true
    if ((lq.includes('no login') || lq.includes('inactive')) && u.signals.includes('no_login_30d'))  return true
    if ((lq.includes('mutual fund') || lq.includes(' mf'))   && u.signals.includes('mf_browse'))      return true
    if (lq.includes('anxious')   && u.persona === 'Anxious Saver') return true
    if ((lq.includes('exit') || lq.includes('exiter')) && u.persona === 'Exiter') return true
    if (lq.includes('protector') && u.persona === 'Protector')   return true
    if (lq.includes('optimizer') && u.persona === 'Optimizer')   return true
    if (lq.includes('urgent')    && u.daysLeft <= 7)             return true
    if (lq.includes('mumbai')    && u.city.toLowerCase() === 'mumbai') return true
    if (lq.includes('delhi')     && u.city.toLowerCase() === 'delhi')  return true
    if (lq.includes('bengaluru') && u.city.toLowerCase() === 'bengaluru') return true
    return false
  }).sort((a, b) => b.riskScore - a.riskScore)
}

/* ══════════════════════════════════════════
   ANALYTICS COMPUTATION
══════════════════════════════════════════ */
function computeAnalytics() {
  const churnCount   = USERS.filter(u => u.prediction === 'Churn' || u.prediction === 'Withdraw').length
  const upgradeCount = USERS.filter(u => u.prediction === 'Upgrade').length
  const renewCount   = USERS.filter(u => u.prediction === 'Renew').length
  const harvestCount = USERS.filter(u => u.daysLeft <= 30).length
  const highIntent   = USERS.filter(u => u.urgency >= 60).length
  const beyondFD     = USERS.filter(u => u.prediction === 'Upgrade').length * 487  // scaled to 50k

  // nudge stats from store
  const nudgesSent  = store.nudges.length
  const lastNudge   = store.nudges.at(-1) || null

  return {
    totalUsers:    50000,
    harvestWindow: harvestCount,
    churnRisk:     847,          // scaled
    highIntent:    2341,         // scaled
    retentionRate: 74,
    beyondFD:      14600,        // scaled
    healthScore:   74,
    churnCount,
    upgradeCount,
    renewCount,
    nudgesSent,
    lastNudge,
    personaBreakdown: {
      Protector:     31200,
      Optimizer:     9500,
      'Anxious Saver': 6000,
      Exiter:        3500,
    },
    signalCounts: {
      early_withdrawal: 20600,
      safety_check:     39200,
      rate_compare:     27200,
      mf_browse:        14600,
      stocks_search:    9100,
      no_login_30d:     5000,
    },
  }
}

/* ══════════════════════════════════════════
   EXPRESS APP
══════════════════════════════════════════ */
const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5180', 'http://localhost:5175'] }))
app.use(express.json())

/* ── Logging middleware ── */
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString().slice(11,19)}] ${req.method} ${req.path}`)
  next()
})

/* ─────────────────────────────────
   USERS
───────────────────────────────── */
// GET /api/users  — list with optional filter, sort, search
app.get('/api/users', (req, res) => {
  const { filter, sort = 'risk', search } = req.query
  let users = [...USERS]

  // text search
  if (search) {
    const s = search.toLowerCase()
    users = users.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.city.toLowerCase().includes(s) ||
      u.persona.toLowerCase().includes(s) ||
      u.prediction.toLowerCase().includes(s)
    )
  }

  // filter
  if (filter === 'churn')   users = users.filter(u => u.prediction === 'Churn' || u.prediction === 'Withdraw')
  if (filter === 'upgrade') users = users.filter(u => u.prediction === 'Upgrade')
  if (filter === 'renew')   users = users.filter(u => u.prediction === 'Renew')

  // sort
  if (sort === 'risk')    users.sort((a, b) => b.riskScore - a.riskScore)
  if (sort === 'urgency') users.sort((a, b) => b.urgency - a.urgency)
  if (sort === 'days')    users.sort((a, b) => a.daysLeft - b.daysLeft)

  // enrich with nudge history
  const enriched = users.map(u => ({
    ...u,
    nudgesSent: store.nudges.filter(n => n.userId === u.id).length,
    lastNudge:  store.nudges.filter(n => n.userId === u.id).at(-1) || null,
  }))

  res.json({ users: enriched, total: enriched.length })
})

// GET /api/users/:id
app.get('/api/users/:id', (req, res) => {
  const user = USERS.find(u => u.id === parseInt(req.params.id))
  if (!user) return res.status(404).json({ error: 'User not found' })
  const nudges = store.nudges.filter(n => n.userId === user.id)
  res.json({ ...user, nudgeHistory: nudges })
})

/* ─────────────────────────────────
   ANALYTICS
───────────────────────────────── */
app.get('/api/analytics', (_req, res) => {
  res.json(computeAnalytics())
})

/* ─────────────────────────────────
   SEARCH
───────────────────────────────── */
app.get('/api/search', (req, res) => {
  const { q = '' } = req.query
  const results = nlSearch(q)

  // log search
  store.searchLogs.push({ query: q, count: results.length, at: new Date().toISOString() })
  // keep only last 100
  if (store.searchLogs.length > 100) store.searchLogs = store.searchLogs.slice(-100)
  saveStore(store)

  res.json({ query: q, results, total: results.length })
})

/* ─────────────────────────────────
   NUDGES
───────────────────────────────── */
// POST /api/nudges  — record a sent nudge
app.post('/api/nudges', (req, res) => {
  const { userId, userName, persona, prediction, message, lang, channel = 'in-app' } = req.body
  if (!userId || !message) return res.status(400).json({ error: 'userId and message are required' })

  const nudge = {
    id:        store.nudges.length + 1,
    userId:    parseInt(userId),
    userName,
    persona,
    prediction,
    message,
    lang,
    channel,
    status:    'sent',
    sentAt:    new Date().toISOString(),
  }
  store.nudges.push(nudge)
  saveStore(store)

  console.log(`✅ Nudge sent to user ${userId} (${userName}) — ${channel}`)
  res.status(201).json({ success: true, nudge })
})

// GET /api/nudges  — full history
app.get('/api/nudges', (req, res) => {
  const { userId } = req.query
  let nudges = [...store.nudges].reverse()   // newest first
  if (userId) nudges = nudges.filter(n => n.userId === parseInt(userId))
  res.json({ nudges, total: nudges.length })
})

/* ─────────────────────────────────
   CONTACT
───────────────────────────────── */
app.post('/api/contact', (req, res) => {
  const { name, org, email, type, message } = req.body
  if (!email || !name) return res.status(400).json({ error: 'name and email are required' })

  const submission = {
    id:          store.contacts.length + 1,
    name,
    org:         org || '',
    email,
    type:        type || 'general',
    message:     message || '',
    submittedAt: new Date().toISOString(),
  }
  store.contacts.push(submission)
  saveStore(store)

  console.log(`📧 Contact form: ${name} <${email}> [${type}]`)
  res.status(201).json({ success: true, id: submission.id, message: 'We will get back to you within 2 hours.' })
})

// GET /api/contact  — admin view of all submissions
app.get('/api/contact', (_req, res) => {
  res.json({ submissions: [...store.contacts].reverse(), total: store.contacts.length })
})

/* ─────────────────────────────────
   ML — PREDICT (proxy to Python service)
───────────────────────────────── */
// POST /api/ml/predict  — get ML-powered prediction for a user profile
app.post('/api/ml/predict', async (req, res) => {
  const profile = req.body
  const mlResult = await callML('/predict', profile, 'POST')

  if (mlResult) {
    return res.json({ source: 'ml_model', ...mlResult })
  }

  // Fallback: rule-based prediction (offline mode)
  const signals = profile.signals || []
  const riskScore = Math.min(100, Math.max(0,
    (signals.includes('early_withdrawal') ? 25 : 0) +
    (signals.includes('no_login_30d')     ? 20 : 0) +
    (signals.includes('competitor_browse')? 18 : 0) +
    (signals.includes('support_ticket')   ? 12 : 0) +
    (profile.daysLeft <= 7 ? 14 : profile.daysLeft <= 14 ? 7 : 0) +
    ((profile.lastLogin || 0) > 20 ? 10 : 0)
  ))
  const prediction = riskScore > 70 ? 'Churn'
                   : riskScore > 50 ? 'Withdraw'
                   : signals.includes('mf_browse') ? 'Upgrade' : 'Renew'
  res.json({
    source: 'rule_based_fallback',
    prediction,
    prediction_confidence: 70,
    risk_score: riskScore,
    persona: profile.persona || 'Protector',
    persona_confidence: 70,
    model_used: 'Rule-based fallback (ML service offline)',
  })
})

// GET /api/ml/metrics  — model training metrics
app.get('/api/ml/metrics', async (req, res) => {
  const metrics = await callML('/metrics')
  if (metrics) return res.json({ source: 'ml_service', ...metrics })
  // Return static metrics snapshot if service is offline
  const metricsFile = join(__dirname, '..', 'ml', 'models', 'metrics.json')
  if (existsSync(metricsFile)) {
    try {
      const m = JSON.parse(readFileSync(metricsFile, 'utf8'))
      return res.json({ source: 'local_file', ...m })
    } catch {}
  }
  res.status(503).json({ error: 'ML metrics not available. Run ml/train.py first.' })
})

/* ─────────────────────────────────
   GEN AI — NUDGE GENERATION
───────────────────────────────── */
// POST /api/ai/nudge  — generate a personalized AI nudge
app.post('/api/ai/nudge', async (req, res) => {
  const { user, channel = 'in_app', lang = 'en' } = req.body
  if (!user) return res.status(400).json({ error: 'user is required' })

  const aiResult = await callML('/ai/nudge', { user, channel, lang }, 'POST')
  if (aiResult) return res.json({ source: 'gen_ai', ...aiResult })

  // Fallback template nudges
  const FALLBACK = {
    Exiter:        { en: `${user.name?.split(' ')[0]}, your FD matures in ${user.daysLeft} days. Complete transparency — see all your options now.`, hi: `${user.name?.split(' ')[0]}, ${user.daysLeft} दिनों में FD मैच्योर होगा। अभी देखें।` },
    'Anxious Saver':{ en: `${user.name?.split(' ')[0]}, we're here to help. Your FD matures in ${user.daysLeft} days — let's plan together.`, hi: `${user.name?.split(' ')[0]}, हम यहाँ हैं। ${user.daysLeft} दिनों में FD मैच्योर होगा।` },
    Optimizer:     { en: `${user.name?.split(' ')[0]}, your FD is maturing — a better rate awaits. See upgrade options →`, hi: `${user.name?.split(' ')[0]}, बेहतर रिटर्न का मौका है। अपग्रेड विकल्प देखें →` },
    Protector:     { en: `${user.name?.split(' ')[0]}, your family's savings are secure. Renew in ${user.daysLeft} days and keep growing.`, hi: `${user.name?.split(' ')[0]}, आपकी बचत सुरक्षित है। ${user.daysLeft} दिनों में रिन्यू करें।` },
  }
  const persona  = user.persona || 'Protector'
  const template = FALLBACK[persona] || FALLBACK.Protector
  res.json({
    source:   'fallback_template',
    message:  lang === 'hi' ? template.hi : template.en,
    reasoning:['ML service offline — using rule-based template fallback'],
    channel, lang,
    metadata: { persona, signals_used: user.signals || [] }
  })
})

/* ─────────────────────────────────
   HEALTH CHECK
───────────────────────────────── */
app.get('/api/health', async (_req, res) => {
  const mlHealth = await callML('/health')
  res.json({
    status:     'ok',
    version:    '3.0.0',
    users:      USERS.length,
    nudges:     store.nudges.length,
    contacts:   store.contacts.length,
    uptime:     Math.floor(process.uptime()),
    ml_service: mlHealth ? { status: 'ok', ...mlHealth } : { status: 'offline' },
  })
})

/* ─────────────────────────────────
   START
───────────────────────────────── */
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Intent Mirror API  v3.0               ║
║  http://localhost:${PORT}                 ║
║                                        ║
║  Endpoints:                            ║
║  GET  /api/health                      ║
║  GET  /api/users                       ║
║  GET  /api/users/:id                   ║
║  GET  /api/analytics                   ║
║  GET  /api/search?q=...                ║
║  POST /api/nudges                      ║
║  GET  /api/nudges                      ║
║  POST /api/contact                     ║
╚════════════════════════════════════════╝
  `)
})
