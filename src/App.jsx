import { useState, createContext, useContext } from 'react'
import { LABELS } from './i18n'
import { DARK, LIGHT } from './theme'
import Header from './components/Header'
import Overview from './components/Overview'
import UserDNA from './components/tabs/UserDNA'
import HarvestWindow from './components/tabs/HarvestWindow'
import IntentFeed from './components/tabs/IntentFeed'
import NextStepNudge from './components/tabs/NextStepNudge'
import ModelEngine from './components/tabs/ModelEngine'
import WealthHub from './components/WealthHub'
import NudgeModal from './components/NudgeModal'
import LandingPage from './components/LandingPage'
import DemoPage from './components/DemoPage'
import YourUsersLeavingPage from './components/pages/YourUsersLeavingPage'
import ForBanksPage from './components/pages/ForBanksPage'
import ContactPage from './components/pages/ContactPage'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [lang, setLang]                 = useState('EN')
  const [activeSection, setActiveSection] = useState('overview')
  const [view, setView]                 = useState('landing')
  const [isDark, setIsDark]             = useState(true)
  const [nudgeUser, setNudgeUser]       = useState(null)

  // Keep legacy activeTab for components that still use it
  const [activeTab, setActiveTab]       = useState('tabHarvest')

  const t = LABELS[lang]
  const c = isDark ? DARK : LIGHT

  const openNudge  = (user) => setNudgeUser(user)
  const closeNudge = ()     => setNudgeUser(null)

  /* ── Non-dashboard views ─────────────────────────────── */
  if (view === 'landing') {
    return (
      <LandingPage
        onEnterDashboard={() => setView('dashboard')}
        onOpenDemo={()      => setView('demo')}
        onOpenProblem={()   => setView('problem')}
        onOpenBanks={()     => setView('banks')}
        onOpenContact={()   => setView('contact')}
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
      />
    )
  }
  if (view === 'demo') {
    return <DemoPage onClose={() => setView('dashboard')} isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} />
  }
  if (view === 'problem') {
    return <YourUsersLeavingPage onClose={() => setView('landing')} isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} />
  }
  if (view === 'banks') {
    return <ForBanksPage onClose={() => setView('landing')} onOpenDemo={() => setView('demo')} onOpenContact={() => setView('contact')} isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} />
  }
  if (view === 'contact') {
    return <ContactPage onClose={() => setView('landing')} onOpenDemo={() => setView('demo')} onEnterDashboard={() => setView('dashboard')} isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} />
  }

  /* ── Section label for breadcrumb ────────────────────── */
  const SECTION_LABELS = {
    overview:     'Operations Overview',
    customers:    'Customer Intelligence',
    intelligence: 'User DNA & Behavior',
    nudges:       'Smart Nudge Engine',
    wealth:       'Wealth Hub — Beyond the FD',
    ml:           'ML + Gen AI Engine',
  }

  /* ── Dashboard ───────────────────────────────────────── */
  return (
    <AppContext.Provider value={{
      lang, setLang: (v) => setLang(typeof v === 'function' ? v(lang) : v),
      t, activeTab, setActiveTab,
      activeSection, setActiveSection,
      isDark, setIsDark: (v) => setIsDark(typeof v === 'function' ? v(isDark) : v),
      c,
    }}>
      <div style={{ minHeight: '100vh', background: c.bg, color: c.text }}>

        <Header onHome={() => setView('landing')} />

        {/* Breadcrumb bar */}
        <div style={{
          padding: '8px 24px',
          background: isDark ? 'rgba(4,14,26,0.5)' : 'rgba(122,149,144,0.3)',
          borderBottom: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 11, color: c.textDim,
        }}>
          <span style={{ color: c.accent, fontWeight: 700 }}>Intent Mirror</span>
          <span style={{ color: c.border }}>›</span>
          <span style={{ color: c.text, fontWeight: 600 }}>
            {SECTION_LABELS[activeSection]}
          </span>
          <span style={{ marginLeft: 'auto', color: c.textDim }}>
            50,000 accounts monitored
          </span>
        </div>

        {/* Main content */}
        <main>
          {activeSection === 'overview'     && <Overview onNudge={openNudge} />}
          {activeSection === 'customers'    && (
            <div style={{ padding: '20px 24px' }}>
              <HarvestWindow />
            </div>
          )}
          {activeSection === 'intelligence' && (
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <UserDNA />
              <IntentFeed />
            </div>
          )}
          {activeSection === 'nudges'       && (
            <div style={{ padding: '20px 24px' }}>
              <NextStepNudge />
            </div>
          )}
          {activeSection === 'wealth'        && <WealthHub onNudge={openNudge} />}
          {activeSection === 'ml'           && (
            <div style={{ padding: '20px 24px' }}>
              <ModelEngine />
            </div>
          )}
        </main>

        {/* Nudge modal */}
        {nudgeUser && (
          <NudgeModal
            user={nudgeUser}
            onClose={closeNudge}
            onSent={closeNudge}
          />
        )}
      </div>
    </AppContext.Provider>
  )
}
