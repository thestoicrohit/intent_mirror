import { useState, createContext, useContext } from 'react'
import { LABELS } from './i18n'
import { DARK, LIGHT } from './theme'
import Header from './components/Header'
import HealthScore from './components/HealthScore'
import MetricsBar from './components/MetricsBar'
import TabNav from './components/TabNav'
import UserDNA from './components/tabs/UserDNA'
import HarvestWindow from './components/tabs/HarvestWindow'
import IntentFeed from './components/tabs/IntentFeed'
import NextStepNudge from './components/tabs/NextStepNudge'
import SearchOverlay from './components/SearchOverlay'
import LandingPage from './components/LandingPage'
import DemoPage from './components/DemoPage'
import YourUsersLeavingPage from './components/pages/YourUsersLeavingPage'
import ForBanksPage from './components/pages/ForBanksPage'
import ContactPage from './components/pages/ContactPage'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const TABS = ['tabDNA', 'tabHarvest', 'tabFeed', 'tabNudge']

export default function App() {
  const [lang, setLang]             = useState('EN')
  const [activeTab, setActiveTab]   = useState('tabHarvest')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [view, setView]             = useState('landing')
  const [isDark, setIsDark]         = useState(true)

  const t = LABELS[lang]
  const c = isDark ? DARK : LIGHT

  const handleSearch = (q) => { setSearchQuery(q); setShowSearch(q.trim().length > 0) }
  const clearSearch  = ()  => { setSearchQuery(''); setShowSearch(false) }

  const toggle = () => setIsDark(d => !d)

  if (view === 'landing') {
    return (
      <LandingPage
        onEnterDashboard={() => setView('dashboard')}
        onOpenDemo={()      => setView('demo')}
        onOpenProblem={()   => setView('problem')}
        onOpenBanks={()     => setView('banks')}
        onOpenContact={()   => setView('contact')}
        isDark={isDark}
        onToggleTheme={toggle}
      />
    )
  }

  if (view === 'demo') {
    return <DemoPage onClose={() => setView('dashboard')} isDark={isDark} onToggleTheme={toggle} />
  }

  if (view === 'problem') {
    return <YourUsersLeavingPage onClose={() => setView('landing')} isDark={isDark} onToggleTheme={toggle} />
  }

  if (view === 'banks') {
    return <ForBanksPage onClose={() => setView('landing')} onOpenDemo={() => setView('demo')} onOpenContact={() => setView('contact')} isDark={isDark} onToggleTheme={toggle} />
  }

  if (view === 'contact') {
    return <ContactPage onClose={() => setView('landing')} onOpenDemo={() => setView('demo')} onEnterDashboard={() => setView('dashboard')} isDark={isDark} onToggleTheme={toggle} />
  }

  return (
    <AppContext.Provider value={{ lang, setLang, t, activeTab, setActiveTab, isDark, setIsDark, c }}>
      <div className="min-h-screen transition-colors duration-300" style={{ background: c.bg, color: c.text }}>
        <Header
          onSearch={handleSearch}
          searchQuery={searchQuery}
          onClearSearch={clearSearch}
          onHome={() => { setView('landing'); clearSearch() }}
        />
        {showSearch ? (
          <SearchOverlay query={searchQuery} onClose={clearSearch} />
        ) : (
          <>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${c.border}` }}>
              <HealthScore />
            </div>
            <div className="px-6 py-3"><MetricsBar /></div>
            <div className="px-6"><TabNav tabs={TABS} /></div>
            <div className="px-6 py-4 fade-in">
              {activeTab === 'tabDNA'     && <UserDNA />}
              {activeTab === 'tabHarvest' && <HarvestWindow />}
              {activeTab === 'tabFeed'    && <IntentFeed />}
              {activeTab === 'tabNudge'   && <NextStepNudge />}
            </div>
          </>
        )}
      </div>
    </AppContext.Provider>
  )
}
