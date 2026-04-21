import { useApp } from '../App'

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',     icon: '⬡' },
  { id: 'customers',    label: 'Customers',    icon: '◉' },
  { id: 'intelligence', label: 'Intelligence', icon: '◎' },
  { id: 'nudges',       label: 'Nudges',       icon: '◆' },
  { id: 'wealth',       label: 'Wealth Hub',   icon: '◈', badge: 'NEW' },
  { id: 'ml',           label: 'ML Engine',    icon: '✦', badge: 'AI' },
]

const TICKER_ALERTS = [
  { name: 'Kavitha Nair',  detail: 'Churn risk · 3d left · ₹5.1L',       color: '#E05A3A' },
  { name: 'Rahul Singh',   detail: 'Churn risk · 2d left · ₹2.5L',       color: '#E05A3A' },
  { name: 'Rajan Mehra',   detail: 'Withdrawal intent · 8d · ₹1.8L',     color: '#D4A535' },
  { name: 'Suresh Kumar',  detail: 'Anxiety signal · 7d · ₹6.5L',        color: '#D4A535' },
  { name: 'Priya Sharma',  detail: 'Upgrade ready · 14d · ₹2.4L',        color: '#6ABFA0' },
  { name: 'Ananya Bose',   detail: 'Churn risk · 4d left · ₹1.5L',       color: '#E05A3A' },
  { name: 'Meena Pillai',  detail: 'No login 35d · 5d left · ₹4.0L',     color: '#E05A3A' },
  { name: 'Deepa Menon',   detail: 'Rate comparison · 10d · ₹2.2L',      color: '#5B9ED6' },
]

export default function Header({ onHome }) {
  const { c, isDark, setIsDark, lang, setLang, activeSection, setActiveSection } = useApp()

  return (
    <header style={{
      background: c.headerBg,
      borderBottom: `1px solid ${c.border}`,
      position: 'sticky', top: 0, zIndex: 100,
    }}>

      {/* ── Main nav bar ───────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 24px', height: 52, gap: 8,
      }}>

        {/* Logo */}
        <button onClick={onHome} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 10px 0 0', borderRight: `1px solid ${c.border}`,
          marginRight: 8, flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: '#fff', fontWeight: 800,
          }}>⬡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: c.text, letterSpacing: 0.2, lineHeight: 1 }}>
              Intent Mirror
            </div>
            <div style={{ fontSize: 8, color: c.textDim, letterSpacing: 1.5, lineHeight: 1.5, textTransform: 'uppercase' }}>
              Fintech AI · v3.0
            </div>
          </div>
        </button>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const active = activeSection === item.id
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
                background: active ? `rgba(86,143,124,0.14)` : 'transparent',
                border: `1px solid ${active ? c.borderStrong : 'transparent'}`,
                borderRadius: 7, padding: '5px 13px',
                color: active ? c.accent : c.textDim,
                fontSize: 12, fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                letterSpacing: 0.2, transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 9, opacity: active ? 1 : 0.5 }}>{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span style={{
                    fontSize: 8, padding: '1px 5px', borderRadius: 3,
                    background: item.id === 'wealth' ? 'rgba(212,165,53,0.2)' : 'rgba(91,158,214,0.18)',
                    color: item.id === 'wealth' ? '#D4A535' : '#5B9ED6',
                    fontWeight: 800, letterSpacing: 0.5,
                  }}>{item.badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Live dot */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(224,89,58,0.10)',
            border: '1px solid rgba(224,89,58,0.22)',
            borderRadius: 20, padding: '4px 10px',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#E05A3A', boxShadow: '0 0 5px #E05A3A',
              animation: 'im-pulse 1.8s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 9, color: '#E05A3A', fontWeight: 800, letterSpacing: 1 }}>LIVE</span>
          </div>

          {/* Notification */}
          <div style={{ position: 'relative' }}>
            <button style={{
              background: 'transparent', border: `1px solid ${c.border}`,
              borderRadius: 7, width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 13, color: c.textMuted,
            }}>🔔</button>
            <div style={{
              position: 'absolute', top: 5, right: 5,
              width: 7, height: 7, borderRadius: '50%',
              background: '#E05A3A', border: `2px solid ${c.headerBg}`,
            }} />
          </div>

          {/* Lang */}
          <button onClick={() => setLang(l => l === 'EN' ? 'HI' : 'EN')} style={{
            background: 'transparent', border: `1px solid ${c.border}`,
            borderRadius: 7, padding: '5px 10px',
            color: c.textMuted, fontSize: 11, fontWeight: 600,
            cursor: 'pointer', letterSpacing: 0.3,
          }}>
            {lang === 'EN' ? 'हिंदी' : 'EN'}
          </button>

          {/* Theme */}
          <button onClick={() => setIsDark(d => !d)} style={{
            background: 'transparent', border: `1px solid ${c.border}`,
            borderRadius: 7, width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 13,
          }}>
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#fff', cursor: 'pointer',
          }}>RG</div>
        </div>
      </div>

      {/* ── Live alert ticker ────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${c.border}`,
        background: isDark ? 'rgba(8,23,42,0.6)' : 'rgba(144,171,164,0.4)',
        padding: '4px 24px',
        display: 'flex', alignItems: 'center', gap: 20,
        overflow: 'hidden',
      }}>
        <span style={{
          color: '#E05A3A', fontWeight: 800, fontSize: 9,
          letterSpacing: 1.5, flexShrink: 0,
          padding: '2px 8px', background: 'rgba(224,89,58,0.12)',
          border: '1px solid rgba(224,89,58,0.25)', borderRadius: 4,
        }}>
          ⚡ LIVE ALERTS
        </span>
        <div style={{
          display: 'flex', gap: 24, animation: 'im-ticker 40s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {[...TICKER_ALERTS, ...TICKER_ALERTS].map((a, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
              <span style={{ color: a.color, fontSize: 7 }}>●</span>
              <span style={{ color: c.text, fontWeight: 600 }}>{a.name}</span>
              <span style={{ color: c.textDim }}>— {a.detail}</span>
              <span style={{ color: c.border, marginLeft: 8 }}>|</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes im-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 5px #E05A3A; }
          50% { opacity: 0.5; box-shadow: 0 0 2px #E05A3A; }
        }
        @keyframes im-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </header>
  )
}
