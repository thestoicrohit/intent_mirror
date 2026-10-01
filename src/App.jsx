import { useState, useEffect, lazy, Suspense } from 'react'
import { AppContext } from './context'
import { LABELS } from './i18n'
import { DARK, LIGHT } from './theme'
import LandingPage from './components/LandingPage'
import Onboarding from './components/Onboarding'
const MyMoney = lazy(() => import('./components/MyMoney'))
const IdentityCard = lazy(() => import('./components/IdentityCard'))
const WealthHub = lazy(() => import('./components/WealthHub'))
const FamilyMode = lazy(() => import('./components/FamilyMode'))
const CryptoArena = lazy(() => import('./components/CryptoArena'))
import { getActiveWallet, signOut, shortAddress } from './web3/wallet'
import { getUser } from './web3/auth'
import { setTone } from './ui'

/** Browsing without an account: a stable per-browser guest profile (so guests don't share data). */
function makeGuest() {
  let id = ''
  try {
    id = localStorage.getItem('im_guest_id') || ''
    if (!id) { id = Array.from(crypto.getRandomValues(new Uint8Array(20)), b => b.toString(16).padStart(2, '0')).join(''); localStorage.setItem('im_guest_id', id) }
  } catch { id = '0'.repeat(40) }
  return { email: 'guest', address: '0x' + id, guest: true }
}
const GUEST = makeGuest()


const NAV = [
  { id: 'money',    label: 'My Money',   icon: '◉' },
  { id: 'wealth',   label: 'Wealth Hub', icon: '◈' },
  { id: 'arena',    label: 'Crypto Arena', icon: '◎', badge: 'LIVE' },
  { id: 'family',   label: 'Family',     icon: '◐', badge: 'KIDS' },
  { id: 'identity', label: 'Identity',   icon: '⬡', badge: 'WEB3' },
]

export default function App() {
  const [account, setAccount]             = useState(() => getActiveWallet())
  const [authMode, setAuthMode]           = useState(null)     // null | 'signup' | 'login' (shown on demand)
  const [view, setView]                   = useState('landing')   // landing → app
  const [lang, setLang]                   = useState('EN')
  const [isDark, setIsDark]               = useState(true)
  const [activeSection, setActiveSection] = useState('money')
  const [menuOpen, setMenuOpen]           = useState(false)

  const wallet = account || GUEST        // browsing without an account uses a local guest profile
  useEffect(() => { document.documentElement.dataset.theme = isDark ? 'dark' : 'light' }, [isDark])

  const t = LABELS[lang]
  const c = isDark ? DARK : LIGHT
  setTone(isDark)                       // theme-aware up/down colours for the Arena

  /* ── Animated landing (the entrance) ────────────────── */
  if (view === 'landing') {
    return (
      <LandingPage
        onEnter={() => setView('app')}
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
      />
    )
  }

  /* ── Auth only when the visitor asks for it ─────────── */
  if (authMode) {
    return (
      <Onboarding
        c={c} isDark={isDark} initialMode={authMode}
        onToggleTheme={() => setIsDark(d => !d)}
        onBack={() => setAuthMode(null)}
        onComplete={(w) => { setAccount(w); setAuthMode(null) }}
      />
    )
  }

  /* ── Signed in → personal money copilot ─────────────── */
  return (
    <AppContext.Provider value={{
      lang, setLang: (v) => setLang(typeof v === 'function' ? v(lang) : v),
      t,
      activeSection, setActiveSection,
      isDark, setIsDark: (v) => setIsDark(typeof v === 'function' ? v(isDark) : v),
      c, wallet,
    }}>
      <div style={{ minHeight: '100vh', background: isDark ? 'transparent' : c.bg, color: c.text }}>

        {/* ── Header ─────────────────────────────────────── */}
        <header style={{
          background: c.headerBg, borderBottom: `1px solid ${c.border}`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', height: 54,
        }}>
          {/* brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 14, borderRight: `1px solid ${c.border}`, marginRight: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: c.onAccent, fontWeight: 800,
            }}>⬡</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Intent Mirror</div>
          </div>

          {/* nav */}
          <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
            {NAV.map(item => {
              const active = activeSection === item.id
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
                  background: active ? 'rgba(69,217,184,0.14)' : 'transparent',
                  border: `1px solid ${active ? c.borderStrong : 'transparent'}`,
                  borderRadius: 7, padding: '6px 14px',
                  color: active ? c.accent : c.textDim,
                  fontSize: 12.5, fontWeight: active ? 700 : 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 10, opacity: active ? 1 : 0.5 }}>{item.icon}</span>
                  {t.nav[item.id]}
                  {item.badge && (
                    <span style={{
                      fontSize: 8, padding: '1px 5px', borderRadius: 3, fontWeight: 800, letterSpacing: 0.5,
                      background: 'rgba(91,158,214,0.18)', color: '#5B9ED6',
                    }}>{item.badge}</span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* controls */}
          <button onClick={() => setLang(l => l === 'EN' ? 'HI' : 'EN')} style={ctrlBtn(c)}>
            {lang === 'EN' ? 'हिंदी' : 'EN'}
          </button>
          <button onClick={() => setIsDark(d => !d)} style={{ ...ctrlBtn(c), width: 32, padding: 0 }}>
            {isDark ? '☀️' : '🌙'}
          </button>

          {wallet.guest ? (
            <>
              <button onClick={() => setAuthMode('login')} style={ctrlBtn(c)}>Log in</button>
              <button className="glow-btn" onClick={() => setAuthMode('signup')} style={{
                background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`, border: 'none', borderRadius: 7,
                padding: '0 14px', height: 32, color: c.onAccent, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Sign up free</button>
            </>
          ) : (
            <>
          {/* wallet menu */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: c.card, border: `1px solid ${c.border}`,
                borderRadius: 20, padding: '4px 10px 4px 4px', cursor: 'pointer',
              }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`, color: c.onAccent, fontSize: 12, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{initials(wallet.email)}</div>
                <span style={{ fontSize: 11.5, fontWeight: 700, fontFamily: 'monospace', color: c.text }}>
                  {shortAddress(wallet.address)}
                </span>
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 40, minWidth: 220,
                  background: c.modalBg, border: `1px solid ${c.borderStrong}`,
                  borderRadius: 12, padding: 12, zIndex: 200,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{getUser(wallet.email)?.name || 'Your account'}</div>
                    <div style={{ fontSize: 11, color: c.textDim }}>{wallet.email}</div>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', marginTop: 2, wordBreak: 'break-all' }}>{wallet.address}</div>
                  <button onClick={() => { signOut(); setAccount(null); setActiveSection('money') }} style={{
                    marginTop: 12, width: '100%', background: 'transparent',
                    border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px',
                    color: c.danger, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  }}>{t.nav.signOut}</button>
                </div>
              )}
            </div>
            </>
          )}
        </header>

        {/* ── Content ────────────────────────────────────── */}
        <main>
          <Suspense fallback={<PageSkeleton />}>
          {activeSection === 'money'    && <MyMoney wallet={wallet} onOpenIdentity={() => setActiveSection('identity')} />}
          {activeSection === 'wealth'   && <WealthHub />}
          {activeSection === 'arena'    && <CryptoArena />}
          {activeSection === 'family'   && <FamilyMode wallet={wallet} />}
          {activeSection === 'identity' && <IdentityCard wallet={wallet} onSignup={() => setAuthMode('signup')} />}
          </Suspense>
        </main>
      </div>
    </AppContext.Provider>
  )
}

function PageSkeleton() {
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 20px', display: 'grid', gap: 14 }}>
      <div className="skeleton" style={{ height: 34, width: 260 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        {[0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: 130 }} />)}
      </div>
      <div className="skeleton" style={{ height: 280 }} />
    </div>
  )
}

function initials(email) {
  const name = getUser(email)?.name || email
  return (name.trim()[0] || '?').toUpperCase()
}

function ctrlBtn(c) {
  return {
    background: 'transparent', border: `1px solid ${c.border}`,
    borderRadius: 7, padding: '6px 10px', height: 32,
    color: c.textMuted, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
  }
}
