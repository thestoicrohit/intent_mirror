/* ═══════════════════════════════════════════════
   Intent Mirror — API client
   All requests proxy through Vite → localhost:3001
═══════════════════════════════════════════════ */

async function request(method, path, body, params) {
  const url = new URL('/api' + path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
  }
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(url, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `API error ${res.status}`)
  }
  return res.json()
}

const get  = (path, params) => request('GET',  path, null, params)
const post = (path, body)   => request('POST', path, body)

/* ── Users ── */
export const getUsers = (params = {}) => get('/users', params)
  // params: { filter:'all'|'churn'|'upgrade'|'renew', sort:'risk'|'urgency'|'days', search }

export const getUser = (id) => get(`/users/${id}`)

/* ── Analytics ── */
export const getAnalytics = () => get('/analytics')

/* ── Search ── */
export const searchUsers = (q) => get('/search', { q })

/* ── Nudges ── */
export const sendNudge = (data) => post('/nudges', data)
  // data: { userId, userName, persona, prediction, message, lang, channel? }

export const getNudges = (userId) => get('/nudges', userId ? { userId } : {})

/* ── Contact ── */
export const submitContact = (data) => post('/contact', data)
  // data: { name, org, email, type, message }

/* ── Health ── */
export const getHealth = () => get('/health')
