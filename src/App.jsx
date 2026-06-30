import { useState, createContext, useContext } from 'react'
import { LABELS } from './i18n'
import { DARK, LIGHT } from './theme'
import Onboarding from './components/Onboarding'
import MyMoney from './components/MyMoney'
import IdentityCard from './components/IdentityCard'
import WealthHub from './components/WealthHub'
import FamilyMode from './components/FamilyMode'
import { getActiveWallet, signOut, shortAddress } from './web3/wallet'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const NAV = [
  { id: 'money',    label: 'My Money',   icon: '◉' },
  { id: 'wealth',   label: 'Wealth Hub', icon: '◈' },
  { id: 'family',   label: 'Family',     icon: '◐', badge: 'KIDS' },
  { id: 'identity', label: 'Identity',   icon: '⬡', badge: 'WEB3' },
]

export default function App() {
  const [wallet, setWallet]               = useState(() => getActiveWallet())
  const [lang, setLang]                   = useState('EN')
  const [isDark, setIsDark]               = useState(true)
  const [activeSection, setActiveSection] = useState('money')
  const [activeTab, setActiveTab]         = useState('tabHarvest')   // legacy, kept for context shape
  const [menuOpen, setMenuOpen]           = useState(false)

  const t = LABELS[lang]
  const c = isDark ? DARK : LIGHT

  /* ── Not signed in → onboarding ─────────────────────── */
  if (!wallet) {
    return (
      <Onboarding
        c={c} isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
        onComplete={(w) => setWallet(w)}
      />
    )
  }

  /* ── Signed in → personal money copilot ─────────────── */
  return (
    <AppContext.Provider value={{
      lang, setLang: (v) => setLang(typeof v === 'function' ? v(lang) : v),
      t, activeTab, setActiveTab,
      activeSection, setActiveSection,
      isDark, setIsDark: (v) => setIsDark(typeof v === 'function' ? v(isDark) : v),
      c, wallet,
    }}>
      <div style={{ minHeight: '100vh', background: c.bg, color: c.text }}>

        {/* ── Header ─────────────────────────────────────── */}
        <header style={{
          background: c.headerBg, borderBottom: `1px solid ${c.border}`,
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', height: 54,
        }}>
          {/* brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 14, borderRight: `1px solid ${c.border}`, marginRight: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: '#fff', fontWeight: 800,
            }}>⬡</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Intent Mirror</div>
          </div>

          {/* nav */}
          <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
            {NAV.map(item => {
              const active = activeSection === item.id
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
                  background: active ? 'rgba(86,143,124,0.14)' : 'transparent',
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

          {/* wallet menu */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(o => !o)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: c.card, border: `1px solid ${c.border}`,
              borderRadius: 20, padding: '4px 10px 4px 4px', cursor: 'pointer',
            }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})` }} />
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
                <div style={{ fontSize: 11, color: c.textDim }}>{wallet.email}</div>
                <div style={{ fontSize: 12, fontFamily: 'monospace', marginTop: 2, wordBreak: 'break-all' }}>{wallet.address}</div>
                <button onClick={() => { signOut(); setWallet(null) }} style={{
                  marginTop: 12, width: '100%', background: 'transparent',
                  border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px',
                  color: c.danger, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                }}>{t.nav.signOut}</button>
              </div>
            )}
          </div>
        </header>

        {/* ── Content ────────────────────────────────────── */}
        <main>
          {activeSection === 'money'    && <MyMoney wallet={wallet} onOpenIdentity={() => setActiveSection('identity')} />}
          {activeSection === 'wealth'   && <WealthHub />}
          {activeSection === 'family'   && <FamilyMode wallet={wallet} />}
          {activeSection === 'identity' && <IdentityCard wallet={wallet} />}
        </main>
      </div>
    </AppContext.Provider>
  )
}

function ctrlBtn(c) {
  return {
    background: 'transparent', border: `1px solid ${c.border}`,
    borderRadius: 7, padding: '6px 10px', height: 32,
    color: c.textMuted, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
  }
}
