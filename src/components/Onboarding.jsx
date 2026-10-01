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
  const [mode, setMode]       = useState(initialMode)   // signup | login | forgot | verify | newpass | creating | done
  const [purpose, setPurpose] = useState('signup')   // what the code is for: signup | reset
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '', agree: false })
  const [showPw, setShowPw]   = useState(false)
  const [otp, setOtp]         = useState('')
  const [demoCode, setDemoCode] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [error, setError]     = useState('')
  const [notice, setNotice]   = useState('')
  const [busy, setBusy]       = useState(false)
  const [step, setStep]       = useState(0)
  const [steps, setSteps]     = useState([])
  const [returning, setReturning] = useState(false)
  const [wallet, setWallet]   = useState(null)
  const [welcomeName, setWelcomeName] = useState('')

  const f = (k) => (e) => setForm(s => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const strength = passwordStrength(form.password)
  const strengthCol = ['#E05A3A', '#E05A3A', '#D4A853', '#6ABFA0', '#6ABFA0'][strength.score]

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(x => x - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const go = (m) => { setMode(m); setError(''); setNotice(''); setOtp('') }

  function sendCode(forPurpose) {
    setPurpose(forPurpose)
    setDemoCode(issueOtp(form.email))
    setCooldown(30)
    setOtp('')
  }

  /* ── handlers ── */
  async function onSignup(e) {
    e.preventDefault(); setError('')
    if (form.name.trim().length < 2) return setError('Enter your name.')
    if (!EMAIL_RE.test(form.email)) return setError('Enter a valid email address.')
    if (getUser(form.email)) return setError('An account with this email already exists — log in instead.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (strength.score < 2) return setError('Choose a stronger password (mix letters, numbers, symbols).')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (!form.agree) return setError('Please accept the terms to continue.')
    sendCode('signup'); setMode('verify')
  }

  async function onLogin(e) {
    e.preventDefault(); setError(''); setNotice('')
    if (!EMAIL_RE.test(form.email)) return setError('Enter a valid email address.')
    if (!form.password) return setError('Enter your password.')
    setBusy(true)
    try {
      const u = await verifyLogin(form.email, form.password)
      setWelcomeName(u.name)
      await finish(u, true)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  function onForgot(e) {
    e.preventDefault(); setError('')
    if (!EMAIL_RE.test(form.email)) return setError('Enter a valid email address.')
    if (!getUser(form.email)) return setError('No account found for this email.')
    sendCode('reset'); setMode('verify')
  }

  async function onVerify(e) {
    e.preventDefault(); setError('')
    if (otp.length < 6) return setError('Enter the 6-digit code.')
    const problem = checkOtp(form.email, otp)
    if (problem) { setOtp(''); return setError(problem) }
    if (purpose === 'reset') { setMode('newpass'); return }
    setBusy(true)
    try {
      const u = await createUser({ name: form.name, email: form.email, password: form.password })
      setWelcomeName(u.name)
      await finish(u, false)
    } catch (err) { setError(err.message); setMode('signup') } finally { setBusy(false) }
  }

  async function onNewPass(e) {
    e.preventDefault(); setError('')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (strength.score < 2) return setError('Choose a stronger password.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    setBusy(true)
    try {
      await resetPassword(form.email, form.password)
      setForm(s => ({ ...s, password: '', confirm: '' }))
      setMode('login'); setNotice('Password updated — log in with your new password.')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  /** Wallet creation animation, then hand the wallet to the app. */
  async function finish(user, returning) {
    setMode('creating'); setStep(0)
    const list = returning ? ['Verifying you', 'Unlocking your wallet'] : ['Securing your account', 'Creating your wallet on Base', 'Preparing your money profile']
    setSteps(list); setReturning(returning)
    for (let i = 0; i < list.length; i++) { setStep(i); await sleep(750) }
    const w = getOrCreateWallet(user.email)
    setWallet(w); setMode('done')
    await sleep(1500)
    onComplete(w)
  }

  /* ── styles ── */
  const label = { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: c.textDim, textTransform: 'uppercase', display: 'block', marginBottom: 6 }
  const input = {
    width: '100%', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 10,
    padding: '12px 14px', color: c.text, fontSize: 14, outline: 'none',
  }
  const primary = {
    width: '100%', background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`,
    border: 'none', borderRadius: 10, padding: '13px 20px', color: '#fff', fontSize: 14, fontWeight: 700,
    cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1,
  }
  const link = { background: 'none', border: 'none', color: c.accent, fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }
  const pwField = (id, value, onChange, ph) => (
    <div style={{ position: 'relative' }}>
      <input id={id} type={showPw ? 'text' : 'password'} value={value} onChange={onChange} placeholder={ph}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'} style={{ ...input, paddingRight: 56 }} />
      <button type="button" onClick={() => setShowPw(s => !s)} style={{ ...link, position: 'absolute', right: 12, top: 13, fontSize: 11.5 }}>
        {showPw ? 'Hide' : 'Show'}
      </button>
    </div>
  )
  const Msg = () => (
    <>
      {error && <div role="alert" style={{ color: c.danger, fontSize: 12.5, marginTop: 12, lineHeight: 1.5 }}>⚠ {error}</div>}
      {notice && <div style={{ color: c.positive, fontSize: 12.5, marginTop: 12, lineHeight: 1.5 }}>✓ {notice}</div>}
    </>
  )
  const Strength = () => form.password ? (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < strength.score ? strengthCol : c.border }} />)}
      </div>
      <div style={{ fontSize: 11, color: strengthCol, marginTop: 4, fontWeight: 700 }}>{strength.label}</div>
    </div>
  ) : null

  const showTabs = mode === 'signup' || mode === 'login'

  return (
    <div style={{
      minHeight: '100vh', background: c.bg, color: c.text, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 520, height: 520, borderRadius: '50%',
        background: `radial-gradient(circle, ${c.accent}22 0%, transparent 70%)`, top: '-10%', right: '-8%', pointerEvents: 'none',
      }} />
      <button onClick={onToggleTheme} aria-label="Toggle theme" style={{
        position: 'absolute', top: 20, right: 20, background: 'transparent', border: `1px solid ${c.border}`,
        borderRadius: 8, width: 36, height: 36, cursor: 'pointer', fontSize: 15,
      }}>{isDark ? '☀️' : '🌙'}</button>

      {onBack && mode !== 'creating' && mode !== 'done' && (
        <button onClick={onBack} style={{
          position: 'absolute', top: 20, left: 20, background: 'transparent', border: `1px solid ${c.border}`,
          borderRadius: 8, padding: '8px 14px', color: c.textMuted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
        }}>← Keep exploring</button>
      )}

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        {/* brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11, background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', fontWeight: 800,
          }}>⬡</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Intent Mirror</div>
            <div style={{ fontSize: 11, color: c.textDim, letterSpacing: 1, textTransform: 'uppercase' }}>Your money, your mirror</div>
          </div>
        </div>

        {showTabs && (
          <>
            <div style={{ display: 'flex', background: c.inputBg, borderRadius: 11, padding: 4, marginBottom: 20, border: `1px solid ${c.border}` }}>
              {[['signup', 'Create account'], ['login', 'Log in']].map(([k, l]) => (
                <button key={k} onClick={() => go(k)} style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: mode === k ? c.card : 'transparent', color: mode === k ? c.text : c.textDim,
                  boxShadow: mode === k ? `0 0 0 1px ${c.borderStrong}` : 'none',
                }}>{l}</button>
              ))}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, margin: '0 0 8px' }}>
              {mode === 'signup' ? 'Start seeing your money clearly.' : 'Welcome back.'}
            </h1>
            <p style={{ color: c.textMuted, fontSize: 13.5, lineHeight: 1.6, margin: '0 0 20px' }}>
              {mode === 'signup'
                ? 'Create your account in under a minute. A secure wallet is set up for you automatically — no MetaMask, no seed phrase.'
                : 'Log in to pick up where you left off.'}
            </p>
          </>
        )}

        {/* ── SIGN UP ── */}
        {mode === 'signup' && (
          <form onSubmit={onSignup} noValidate style={{ display: 'grid', gap: 14 }}>
            <div><label style={label} htmlFor="su-name">Full name</label>
              <input id="su-name" value={form.name} onChange={f('name')} placeholder="Aarav Sharma" autoComplete="name" style={input} /></div>
            <div><label style={label} htmlFor="su-email">Email</label>
              <input id="su-email" type="email" value={form.email} onChange={f('email')} placeholder="you@example.com" autoComplete="email" style={input} /></div>
            <div><label style={label} htmlFor="su-pw">Password</label>
              {pwField('su-pw', form.password, f('password'), 'At least 8 characters')}<Strength /></div>
            <div><label style={label} htmlFor="su-cf">Confirm password</label>
              {pwField('su-cf', form.confirm, f('confirm'), 'Repeat password')}
              {form.confirm && form.confirm !== form.password && <div style={{ color: c.danger, fontSize: 11.5, marginTop: 6 }}>Passwords don't match yet</div>}</div>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12.5, color: c.textMuted, lineHeight: 1.5, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.agree} onChange={f('agree')} style={{ marginTop: 3, accentColor: c.accent }} />
              <span>I agree to the Terms and Privacy Policy. I understand this is a demo — nothing here is financial advice.</span>
            </label>
            <button type="submit" style={primary}>Create account →</button>
            <Msg />
            <div style={{ fontSize: 13, color: c.textDim, textAlign: 'center' }}>
              Already have an account? <button type="button" onClick={() => go('login')} style={link}>Log in</button>
            </div>
          </form>
        )}

        {/* ── LOG IN ── */}
        {mode === 'login' && (
          <form onSubmit={onLogin} noValidate style={{ display: 'grid', gap: 14 }}>
            <div><label style={label} htmlFor="li-email">Email</label>
              <input id="li-email" type="email" value={form.email} onChange={f('email')} placeholder="you@example.com" autoComplete="email" style={input} /></div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={label} htmlFor="li-pw">Password</label>
                <button type="button" onClick={() => go('forgot')} style={{ ...link, fontSize: 12, marginBottom: 6 }}>Forgot password?</button>
              </div>
              {pwField('li-pw', form.password, f('password'), 'Your password')}
            </div>
            <button type="submit" disabled={busy} style={primary}>{busy ? 'Checking…' : 'Log in →'}</button>
            <Msg />
            <div style={{ fontSize: 13, color: c.textDim, textAlign: 'center' }}>
              New here? <button type="button" onClick={() => go('signup')} style={link}>Create an account</button>
            </div>
          </form>
        )}

        {/* ── FORGOT ── */}
        {mode === 'forgot' && (
          <form onSubmit={onForgot} noValidate style={{ display: 'grid', gap: 14 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Reset your password</h1>
            <p style={{ color: c.textMuted, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>Enter your email and we'll send a 6-digit code to confirm it's you.</p>
            <div><label style={label} htmlFor="fg-email">Email</label>
              <input id="fg-email" type="email" value={form.email} onChange={f('email')} placeholder="you@example.com" style={input} autoFocus /></div>
            <button type="submit" style={primary}>Send code →</button>
            <Msg />
            <button type="button" onClick={() => go('login')} style={{ ...link, textAlign: 'center' }}>← Back to log in</button>
          </form>
        )}

        {/* ── VERIFY CODE ── */}
        {mode === 'verify' && (
          <form onSubmit={onVerify} style={{ display: 'grid', gap: 14 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Check your email</h1>
            <p style={{ color: c.textMuted, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              We sent a 6-digit code to <strong style={{ color: c.text }}>{form.email}</strong>. It expires in 5 minutes.
            </p>
            {/* demo inbox — there is no mail server in this demo */}
            <div style={{ background: c.card, border: `1px dashed ${c.borderStrong}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: c.textDim, fontWeight: 800, letterSpacing: 1 }}>DEMO INBOX · no mail server</div>
                <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, letterSpacing: 4, color: c.accent }}>{demoCode}</div>
              </div>
              <button type="button" onClick={() => setOtp(demoCode)} style={{ ...link, border: `1px solid ${c.border}`, borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>Autofill</button>
            </div>
            <OtpBoxes key={demoCode} value={otp} onChange={setOtp} c={c} disabled={busy} />
            <button type="submit" disabled={busy} style={primary}>{busy ? 'Verifying…' : 'Verify & continue →'}</button>
            <Msg />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c.textDim }}>
              <button type="button" onClick={() => go(purpose === 'reset' ? 'forgot' : 'signup')} style={link}>← Change email</button>
              {cooldown > 0
                ? <span>Resend in {cooldown}s</span>
                : <button type="button" onClick={() => { sendCode(purpose); setError(''); setNotice('New code sent.') }} style={link}>Resend code</button>}
            </div>
          </form>
        )}

        {/* ── NEW PASSWORD ── */}
        {mode === 'newpass' && (
          <form onSubmit={onNewPass} noValidate style={{ display: 'grid', gap: 14 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Choose a new password</h1>
            <div><label style={label} htmlFor="np-pw">New password</label>
              {pwField('np-pw', form.password, f('password'), 'At least 8 characters')}<Strength /></div>
            <div><label style={label} htmlFor="np-cf">Confirm password</label>
              {pwField('np-cf', form.confirm, f('confirm'), 'Repeat password')}</div>
            <button type="submit" disabled={busy} style={primary}>{busy ? 'Saving…' : 'Update password'}</button>
            <Msg />
          </form>
        )}

        {/* ── WALLET CREATION ── */}
        {mode === 'creating' && (
          <div style={{ padding: '24px 0' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>{welcomeName ? `Hi ${welcomeName.split(' ')[0]} 👋` : 'One moment…'}</h2>
            <p style={{ color: c.textMuted, fontSize: 14, margin: '0 0 18px' }}>Setting things up — this only takes a few seconds.</p>
            {steps.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, margin: '10px 0', color: i <= step ? c.text : c.textDim, opacity: i <= step ? 1 : 0.45 }}>
                {i < step
                  ? <span style={{ color: c.positive }}>✓</span>
                  : i === step
                    ? <span className="im-spin" style={{ width: 14, height: 14, border: `2px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', display: 'inline-block' }} />
                    : <span>○</span>}
                {s}
              </div>
            ))}
          </div>
        )}

        {mode === 'done' && wallet && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 46, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>
              {returning ? `Welcome back, ${welcomeName.split(' ')[0]}!` : `Welcome, ${welcomeName.split(' ')[0]}!`}
            </h2>
            <p style={{ color: c.textMuted, fontSize: 14, margin: '0 0 18px' }}>Your wallet is ready — you own it, and the financial profile we build for you.</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: c.card, border: `1px solid ${c.borderStrong}`, borderRadius: 12, padding: '12px 18px' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})` }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: c.textDim }}>{wallet.email}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace' }}>{shortAddress(wallet.address)}</div>
              </div>
            </div>
            <div style={{ marginTop: 18, fontSize: 13, color: c.textDim }}>Taking you in…</div>
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
