/* ═══════════════════════════════════════════════
   Intent Mirror — demo auth (sign up / log in / reset)
   ───────────────────────────────────────────────
   Runs fully in the browser for the hackathon demo: accounts live in
   localStorage, passwords are salted + SHA-256 hashed, and the
   one-time email code is generated locally and shown in an on-screen
   "demo inbox" (no mail server). Production swaps this module for a
   real auth provider; the UI does not change.
═══════════════════════════════════════════════ */

const USER_PREFIX = 'im_user:'
const norm = (e) => e.trim().toLowerCase()

async function sha256(text) {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
  }
  let h = 5381                                   // non-secure fallback (insecure origins)
  for (const ch of text) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0
  return h.toString(16)
}
const randomSalt = () => [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, '0')).join('')

export function getUser(email) {
  try { return JSON.parse(localStorage.getItem(USER_PREFIX + norm(email)) || 'null') } catch { return null }
}
const saveUser = (u) => localStorage.setItem(USER_PREFIX + u.email, JSON.stringify(u))

export function passwordStrength(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const score = Math.min(4, s)
  return { score, label: ['Too weak', 'Weak', 'Okay', 'Strong', 'Excellent'][score] }
}

export async function createUser({ name, email, password }) {
  if (getUser(email)) throw new Error('An account with this email already exists. Try logging in.')
  const salt = randomSalt()
  const user = { name: name.trim(), email: norm(email), salt, hash: await sha256(salt + password), createdAt: new Date().toISOString() }
  saveUser(user)
  return user
}

export async function verifyLogin(email, password) {
  const u = getUser(email)
  if (!u) throw new Error('No account found for this email. Sign up first.')
  if (u.hash !== await sha256(u.salt + password)) throw new Error('Incorrect password.')
  return u
}

export async function resetPassword(email, password) {
  const u = getUser(email)
  if (!u) throw new Error('No account found for this email.')
  u.salt = randomSalt()
  u.hash = await sha256(u.salt + password)
  saveUser(u)
  return u
}

/* ── one-time codes (6 digits, 5 min, 5 attempts) ── */
const otps = new Map()
export function issueOtp(email) {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  otps.set(norm(email), { code, exp: Date.now() + 5 * 60_000, tries: 0 })
  return code
}
export function checkOtp(email, input) {
  const rec = otps.get(norm(email))
  if (!rec) return 'Request a new code.'
  if (Date.now() > rec.exp) { otps.delete(norm(email)); return 'Code expired — request a new one.' }
  if (++rec.tries > 5) { otps.delete(norm(email)); return 'Too many attempts — request a new code.' }
  if (rec.code !== input) return `Wrong code. ${6 - rec.tries} attempt${6 - rec.tries === 1 ? '' : 's'} left.`
  otps.delete(norm(email))
  return null
}
