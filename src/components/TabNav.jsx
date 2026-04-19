import { useApp } from '../App'

export default function TabNav({ tabs }) {
  const { t, activeTab, setActiveTab, c } = useApp()
  return (
    <div className="flex gap-0 mt-2" style={{ borderBottom: `1px solid ${c.border}` }}>
      {tabs.map((tab) => {
        const active = activeTab === tab
        return (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-3 text-sm font-medium transition-colors relative"
            style={{ color: active ? c.accent : c.accent2 }}>
            {t[tab]}
            {active && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: c.accent }} />}
          </button>
        )
      })}
    </div>
  )
}
