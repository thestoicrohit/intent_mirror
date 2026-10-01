import { useEffect, useRef, useState } from 'react'
import { getOrCreateWallet, shortAddress } from '../web3/wallet'
import { createUser, verifyLogin, resetPassword, getUser, issueOtp, checkOtp, passwordStrength } from '../web3/auth'

/* ───────────────────────────────────────────────
   Onboarding — full sign up / log in experience
   Sign up → verify email code → wallet created silently → in.
   Log in · Forgot password · Show/hide password · strength meter.
   No MetaMask, no seed phrase, no gas. The whole point.
─────────────────────────────────────────────── */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

function OtpBoxes({ value, onChange, c, disabled }) {
  const refs = useRef([])
  const live = useRef(value)          // latest value, so rapid typing can't read stale state
  live.current = value
  const set = (i, ch) => {
    const arr = live.current.padEnd(6, ' ').split('')
    arr[i] = ch || ' '
    live.current = arr.join('').replace(/ +$/, '').slice(0, 6)
    onChange(live.current)
  }
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i} ref={el => (refs.current[i] = el)} inputMode="numeric" autoComplete="one-time-code" disabled={disabled}
          autoFocus={i === 0} aria-label={`Digit ${i + 1}`}
          value={value[i] && value[i] !== ' ' ? value[i] : ''}
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '')
            if (digits.length > 1) {                       // autofill / fast typing: spread across boxes
              const merged = (live.current.slice(0, i).padEnd(i, ' ') + digits).slice(0, 6).replace(/ /g, '')
              live.current = merged; onChange(merged)
              refs.current[Math.min(merged.length, 5)]?.focus()
              return
            }
            set(i, digits)
            if (digits && i < 5) refs.current[i + 1]?.focus()
          }}
          onKeyDown={e => {
            if (e.key === 'Backspace' && !(value[i] && value[i] !== ' ') && i > 0) refs.current[i - 1]?.focus()
          }}
          onPaste={e => {
            const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
            if (t) { e.preventDefault(); live.current = t; onChange(t); refs.current[Math.min(t.length, 5)]?.focus() }
          }}
          style={{
            width: '100%', minWidth: 0, textAlign: 'center', fontSize: 22, fontWeight: 800, padding: '12px 0',
            background: c.inputBg, color: c.text, border: `1px solid ${value[i] ? c.accent : c.border}`,
            borderRadius: 10, outline: 'none', fontFamily: 'monospace',
          }}
        />
      ))}
    </div>
  )
}

export default function Onboarding({ onComplete, c, isDark, onToggleTheme, initialMode = 'signup', onBack }) {
  // email → (password | create) → creating → done.   forgot: verify → newpass
  const [mode, setMode]   = useState('email')
  const [email, setEmail] = useState('')
  const [name, setName]   = useState('')
  const [pw, setPw]       = useState('')
  const [showPw, setShowPw] = useState(false)
  const [otp, setOtp]     = useState('')
  const [demoCode, setDemoCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy]   = useState(false)
  const [steps, setSteps] = useState([])
  const [step, setStep]   = useState(0)
  const [wallet, setWallet] = useState(null)
  const [who, setWho]     = useState('')
  const [returning, setReturning] = useState(false)

  const strength = passwordStrength(pw)
  const strengthCol = ['#E05A3A', '#E05A3A', '#D4A853', '#6ABFA0', '#6ABFA0'][strength.score]
  const go = (m) => { setMode(m); setError(''); setNotice(''); setOtp(''); setPw('') }

  function onEmail(e) {
    e.preventDefault(); setError('')
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email address.')
    const exists = !!getUser(email)
    go(exists ? 'password' : 'create')
    if (!exists) setNotice("No account yet — let's create one. It takes ten seconds.")
  }

  async function onLogin(e) {
    e.preventDefault(); setError('')
    if (!pw) return setError('Enter your password.')
    setBusy(true)
    try { const u = await verifyLogin(email, pw); await finish(u, true) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function onCreate(e) {
    e.preventDefault(); setError('')
    if (pw.length < 8) return setError('Use at least 8 characters.')
    setBusy(true)
    try {
      const u = await createUser({ name: name.trim() || email.split('@')[0], email, password: pw })
      await finish(u, false)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  function sendReset() {
    setDemoCode(issueOtp(email)); setOtp(''); setError(''); setMode('verify')
  }
  function onVerify(e) {
    e.preventDefault()
    if (otp.length < 6) return setError('Enter the 6-digit code.')
    const problem = checkOtp(email, otp)
    if (problem) { setOtp(''); return setError(problem) }
    go('newpass')
  }
  async function onNewPass(e) {
    e.preventDefault(); setError('')
    if (pw.length < 8) return setError('Use at least 8 characters.')
    setBusy(true)
    try { const u = await resetPassword(email, pw); await finish(u, true) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function finish(user, isReturning) {
    setWho(user.name); setReturning(isReturning); setMode('creating')
    const list = isReturning ? ['Unlocking your wallet'] : ['Creating your wallet', 'Preparing your money profile']
    setSteps(list)
    for (let i = 0; i < list.length; i++) { setStep(i); await sleep(650) }
    const w = getOrCreateWallet(user.email)
    setWallet(w); setMode('done')
    await sleep(1100)
    onComplete(w)
  }

  /* ── styles ── */
  const label = { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: c.textDim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }
  const input = { width: '100%', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '13px 14px', color: c.text, fontSize: 15, outline: 'none' }
  const primary = {
    width: '100%', background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`, border: 'none', borderRadius: 10,
    padding: '14px 20px', color: c.onAccent, fontSize: 14.5, fontWeight: 700, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1,
  }
  const link = { background: 'none', border: 'none', color: c.accent, fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }
  const h1 = { fontSize: 26, fontWeight: 800, lineHeight: 1.2, margin: '0 0 6px' }
  const sub = { color: c.textMuted, fontSize: 13.5, lineHeight: 1.6, margin: '0 0 20px' }
  const pwInput = (value, onChange, ph, id) => (
    <div style={{ position: 'relative' }}>
      <input id={id} type={showPw ? 'text' : 'password'} value={value} onChange={onChange} placeholder={ph} autoFocus
        autoComplete={mode === 'password' ? 'current-password' : 'new-password'} style={{ ...input, paddingRight: 60 }} />
      <button type="button" onClick={() => setShowPw(v => !v)} style={{ ...link, position: 'absolute', right: 14, top: 15, fontSize: 12 }}>{showPw ? 'Hide' : 'Show'}</button>
    </div>
  )
  const msgs = (
    <>
      {error && <div role="alert" style={{ color: c.danger, fontSize: 12.5, lineHeight: 1.5 }}>⚠ {error}</div>}
      {notice && <div style={{ color: c.positive, fontSize: 12.5, lineHeight: 1.5 }}>{notice}</div>}
    </>
  )
  const emailChip = (
    <button type="button" onClick={() => go('email')} title="Change email" style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, background: c.card, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '6px 12px', color: c.text, fontSize: 13, cursor: 'pointer', marginBottom: 18,
    }}>✉ {email} <span style={{ color: c.textDim, fontSize: 11 }}>change</span></button>
  )
  const first = (who || name || email.split('@')[0] || '').split(' ')[0]

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${c.accent}22 0%, transparent 70%)`, top: '-10%', right: '-8%', pointerEvents: 'none' }} />
      <button onClick={onToggleTheme} aria-label="Toggle theme" style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid ${c.border}`, borderRadius: 8, width: 36, height: 36, cursor: 'pointer', fontSize: 15 }}>{isDark ? '☀️' : '🌙'}</button>
      {onBack && mode !== 'creating' && mode !== 'done' && (
        <button onClick={onBack} style={{ position: 'absolute', top: 20, left: 20, background: 'transparent', border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px 14px', color: c.textMuted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>← Keep exploring</button>
      )}

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: c.onAccent, fontWeight: 800 }}>⬡</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Intent Mirror</div>
            <div style={{ fontSize: 11, color: c.textDim, letterSpacing: 1, textTransform: 'uppercase' }}>Your money, your mirror</div>
          </div>
        </div>

        {mode === 'email' && (
          <form onSubmit={onEmail} noValidate style={{ display: 'grid', gap: 14 }}>
            <div>
              <h1 style={h1}>{initialMode === 'login' ? 'Welcome back' : 'Save your progress'}</h1>
              <p style={sub}>Enter your email to log in or create a free account. A secure wallet is set up for you — no MetaMask, no seed phrase.</p>
            </div>
            <div>
              <label style={label} htmlFor="em">Email</label>
              <input id="em" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" autoFocus style={input} />
            </div>
            <button type="submit" className="glow-btn" style={primary}>Continue →</button>
            {msgs}
            <div style={{ fontSize: 12, color: c.textDim, textAlign: 'center' }}>You can keep exploring without an account anytime.</div>
          </form>
        )}

        {mode === 'password' && (
          <form onSubmit={onLogin} noValidate style={{ display: 'grid', gap: 14 }}>
            <div>{emailChip}<h1 style={h1}>Welcome back 👋</h1><p style={sub}>Enter your password to continue.</p></div>
            {pwInput(pw, e => setPw(e.target.value), 'Your password', 'pw')}
            <button type="submit" disabled={busy} className="glow-btn" style={primary}>{busy ? 'Checking…' : 'Log in →'}</button>
            {msgs}
            <button type="button" onClick={sendReset} style={{ ...link, textAlign: 'center' }}>Forgot password?</button>
          </form>
        )}

        {mode === 'create' && (
          <form onSubmit={onCreate} noValidate style={{ display: 'grid', gap: 14 }}>
            <div>{emailChip}<h1 style={h1}>Create your account</h1><p style={sub}>Pick a password — that's it.</p></div>
            <div>
              <label style={label} htmlFor="nm">Your name <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>(optional)</span></label>
              <input id="nm" value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?" autoComplete="given-name" style={input} />
            </div>
            <div>
              <label style={label} htmlFor="pw">Password</label>
              {pwInput(pw, e => setPw(e.target.value), 'At least 8 characters', 'pw')}
              {pw && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {[0, 1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < strength.score ? strengthCol : c.border }} />)}
                  <span style={{ fontSize: 11, color: strengthCol, fontWeight: 700, marginLeft: 8, minWidth: 56 }}>{strength.label}</span>
                </div>
              )}
            </div>
            <button type="submit" disabled={busy} className="glow-btn" style={primary}>{busy ? 'Creating…' : 'Create account →'}</button>
            {msgs}
            <div style={{ fontSize: 11.5, color: c.textDim, textAlign: 'center', lineHeight: 1.5 }}>By continuing you agree to the Terms & Privacy Policy. Demo app — not financial advice.</div>
          </form>
        )}

        {mode === 'verify' && (
          <form onSubmit={onVerify} style={{ display: 'grid', gap: 14 }}>
            <div>{emailChip}<h1 style={h1}>Enter the code</h1><p style={sub}>We sent a 6-digit code to reset your password.</p></div>
            <div style={{ background: c.card, border: `1px dashed ${c.borderStrong}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: c.textDim, fontWeight: 800, letterSpacing: 1 }}>DEMO INBOX · no mail server</div>
                <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, letterSpacing: 4, color: c.accent }}>{demoCode}</div>
              </div>
              <button type="button" onClick={() => setOtp(demoCode)} style={{ ...link, border: `1px solid ${c.border}`, borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>Autofill</button>
            </div>
            <OtpBoxes key={demoCode} value={otp} onChange={setOtp} c={c} disabled={busy} />
            <button type="submit" className="glow-btn" style={primary}>Verify →</button>
            {msgs}
            <button type="button" onClick={sendReset} style={{ ...link, textAlign: 'center' }}>Send a new code</button>
          </form>
        )}

        {mode === 'newpass' && (
          <form onSubmit={onNewPass} noValidate style={{ display: 'grid', gap: 14 }}>
            <div><h1 style={h1}>New password</h1><p style={sub}>Choose one you'll remember.</p></div>
            {pwInput(pw, e => setPw(e.target.value), 'At least 8 characters', 'pw')}
            <button type="submit" disabled={busy} className="glow-btn" style={primary}>{busy ? 'Saving…' : 'Save & log in →'}</button>
            {msgs}
          </form>
        )}

        {mode === 'creating' && (
          <div style={{ padding: '20px 0' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px' }}>{first ? `Hi ${first} 👋` : 'One moment…'}</h2>
            {steps.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, margin: '10px 0', color: i <= step ? c.text : c.textDim, opacity: i <= step ? 1 : 0.45 }}>
                {i < step ? <span style={{ color: c.positive }}>✓</span>
                  : i === step ? <span className="im-spin" style={{ width: 14, height: 14, border: `2px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', display: 'inline-block' }} />
                  : <span>○</span>}
                {s}
              </div>
            ))}
          </div>
        )}

        {mode === 'done' && wallet && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 46, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>{returning ? `Welcome back, ${first}!` : `You're in, ${first}!`}</h2>
            <p style={{ color: c.textMuted, fontSize: 14, margin: '0 0 18px' }}>Your wallet is ready: <span style={{ fontFamily: 'monospace', color: c.text }}>{shortAddress(wallet.address)}</span></p>
          </div>
        )}
      </div>

      <style>{`
        .im-spin { animation: im-spin 0.8s linear infinite; }
        @keyframes im-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
