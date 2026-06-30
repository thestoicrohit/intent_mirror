import { useEffect, useState } from 'react'
import { DARK, LIGHT } from '../theme'

/* ─── Cursor-following aurora ─── */
function CursorAurora() {
  const [pos, setPos] = useState({ x: -600, y: -600 })
  useEffect(() => {
    const fn = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])
  return (
    <>
      <div className="cursor-aurora" style={{
        left: pos.x - 280, top: pos.y - 280, width: 560, height: 560,
        background: 'radial-gradient(circle, rgba(86,143,124,0.16) 0%, rgba(61,122,114,0.05) 45%, transparent 70%)',
      }} />
      <div className="cursor-aurora" style={{
        left: pos.x - 110, top: pos.y - 110, width: 220, height: 220,
        background: 'radial-gradient(circle, rgba(133,176,147,0.12) 0%, transparent 70%)',
        transition: 'left 0.04s ease-out, top 0.04s ease-out',
      }} />
    </>
  )
}

/* ─── Animated hero orb with orbiting rings ─── */
function HeroOrb({ c, isDark }) {
  return (
    <div className="float-orb" style={{ position: 'relative', width: 380, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="ring-pulse"       style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${c.accent}`, opacity: 0.25 }} />
      <div className="ring-pulse-delay" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${c.accent2}`, opacity: 0.18 }} />
      <div className="ring-pulse-slow"  style={{ position: 'absolute', width: 400, height: 400, top: -10, left: -10, borderRadius: '50%', border: `1px solid ${c.textDim}`, opacity: 0.08 }} />

      {/* Orbiting dashed ring CW */}
      <div className="orbit-cw" style={{ position: 'absolute', width: 300, height: 300, top: 40, left: 40 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px dashed ${c.accent}`, opacity: 0.2 }} />
        <div style={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', top: -6, left: '50%', marginLeft: -6, background: c.accent, boxShadow: `0 0 12px ${c.accent}` }} />
      </div>
      {/* Orbiting ring CCW */}
      <div className="orbit-ccw" style={{ position: 'absolute', width: 220, height: 220, top: 80, left: 80 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${c.borderStrong}`, opacity: 0.4 }} />
        <div style={{ position: 'absolute', width: 9, height: 9, borderRadius: '50%', top: 0, left: '50%', marginLeft: -4, background: c.textMuted, boxShadow: `0 0 10px ${c.textMuted}` }} />
      </div>

      {/* Core glow-pulse with the ⬡ mark */}
      <div className="glow-pulse" style={{
        position: 'relative', zIndex: 2, width: 140, height: 140, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isDark ? 'radial-gradient(circle, #1E3045 0%, #0D1C2B 100%)' : 'radial-gradient(circle, #AABFB0 0%, #82A090 100%)',
        border: `2px solid ${c.borderStrong}`,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, fontSize: 34, fontWeight: 800, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`,
        }}>⬡</div>
      </div>
    </div>
  )
}

/* ─── Floating "money win" cards ─── */
const DREAMS = [
  { emoji: '🏦', title: 'FD verified ✓',      sub: 'On-chain proof',   cl: 'dream-1', top: '2%',  left: '52%' },
  { emoji: '📈', title: '+22% this year',     sub: 'Index + crypto',   cl: 'dream-2', top: '24%', left: '78%' },
  { emoji: '₿',  title: 'You own your wallet', sub: 'No seed phrase',  cl: 'dream-3', top: '60%', left: '74%' },
  { emoji: '🎯', title: 'Goal 64% there',     sub: 'Money Quest',      cl: 'dream-4', top: '82%', left: '50%' },
  { emoji: '🏅', title: 'Money Explorer L3',  sub: "Kid's badge",      cl: 'dream-1', top: '44%', left: '90%' },
]
function DreamCards({ c, isDark }) {
  return DREAMS.map((d, i) => (
    <div key={i} className={d.cl} style={{ position: 'absolute', top: d.top, left: d.left, zIndex: 3, pointerEvents: 'none', animationDelay: `${i * 0.4}s` }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', borderRadius: 16, whiteSpace: 'nowrap',
        background: isDark ? 'rgba(19,37,53,0.82)' : 'rgba(203,224,217,0.85)',
        border: `1px solid ${c.borderStrong}`, backdropFilter: 'blur(6px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      }}>
        <span style={{ fontSize: 19 }}>{d.emoji}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1, color: c.text }}>{d.title}</div>
          <div style={{ fontSize: 10, marginTop: 3, color: c.textMuted }}>{d.sub}</div>
        </div>
      </div>
    </div>
  ))
}

/* ─── Live ticker strip ─── */
const TICKER = [
  { icon: '⛓', text: 'Soulbound credential minted' },
  { icon: '📈', text: 'RELIANCE ₹2,847 ▲ 0.83%' },
  { icon: '🪙', text: 'ETH verified on-chain' },
  { icon: '🎯', text: 'Savings goal 64% reached' },
  { icon: '🛡', text: 'Persona detected: Optimizer' },
  { icon: '🏅', text: 'Money Explorer leveled up' },
  { icon: '🧺', text: 'SIP started from ₹100' },
]
function LiveTicker({ c, isDark }) {
  const doubled = [...TICKER, ...TICKER]
  return (
    <div style={{ width: '100%', overflow: 'hidden', padding: '10px 0', borderTop: `1px solid ${c.border}`, background: `${c.bgDeep}cc`, backdropFilter: 'blur(8px)' }}>
      <div className="ticker-track" style={{ display: 'flex', width: 'max-content' }}>
        {doubled.map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', fontSize: 12, whiteSpace: 'nowrap', color: c.textMuted }}>
            <span>{e.icon}</span><span>{e.text}</span>
            <span style={{ color: c.border, marginLeft: 6 }}>|</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════ */
export default function LandingPage({ onEnter, isDark, onToggleTheme }) {
  const c = isDark ? DARK : LIGHT

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: c.bg, color: c.text }}>
      <CursorAurora />

      {/* mesh background */}
      <div className="bg-mesh" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: isDark
          ? `radial-gradient(ellipse at 25% 55%, rgba(86,143,124,0.10) 0%, transparent 55%), radial-gradient(ellipse at 78% 18%, rgba(61,122,114,0.08) 0%, transparent 50%), ${c.bg}`
          : `radial-gradient(ellipse at 25% 55%, rgba(33,80,82,0.12) 0%, transparent 55%), radial-gradient(ellipse at 75% 20%, rgba(86,143,124,0.10) 0%, transparent 50%), ${c.bg}`,
      }} />
      {/* drifting particles */}
      <div className="particle-a" style={{ position: 'fixed', top: '22%', left: '14%', width: 6, height: 6, borderRadius: '50%', background: c.accent, zIndex: 1, pointerEvents: 'none' }} />
      <div className="particle-b" style={{ position: 'fixed', top: '68%', left: '20%', width: 5, height: 5, borderRadius: '50%', background: c.accent2, zIndex: 1, pointerEvents: 'none' }} />
      <div className="particle-c" style={{ position: 'fixed', top: '40%', left: '8%', width: 4, height: 4, borderRadius: '50%', background: c.textDim, zIndex: 1, pointerEvents: 'none' }} />

      {/* top bar */}
      <div style={{ position: 'relative', zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff' }}>⬡</div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Intent Mirror</div>
        </div>
        <button onClick={onToggleTheme} style={{
          background: 'transparent', border: `1px solid ${c.border}`, borderRadius: 20,
          padding: '6px 14px', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>{isDark ? '☀ Light' : '🌙 Dark'}</button>
      </div>

      {/* hero */}
      <div style={{ position: 'relative', zIndex: 4, flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 40, padding: '20px 28px 40px', maxWidth: 1180, margin: '0 auto', width: '100%' }}>
        {/* left: copy */}
        <div style={{ flex: '1 1 420px', maxWidth: 560 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: c.accent, marginBottom: 14 }}>
            YOUR MONEY · YOUR MIRROR
          </div>
          <h1 style={{ fontSize: 46, lineHeight: 1.08, fontWeight: 800, margin: 0, letterSpacing: -1 }}>
            See what you're about<br />to do with your money —{' '}
            <span className="shimmer-text">before you do it.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: c.textMuted, margin: '20px 0 28px', maxWidth: 480 }}>
            Track crypto, stocks, mutual funds and your FD in one place. Get coached on how
            <em> you</em> behave with money — and own your financial profile, not the bank.
            No MetaMask, no seed phrase. There's even a mode that teaches kids.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={onEnter} style={{
              background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`, border: 'none', borderRadius: 12,
              padding: '15px 30px', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
              boxShadow: `0 10px 30px ${c.accent}44`,
            }}>Get Started →</button>
            <span style={{ fontSize: 12.5, color: c.textDim }}>🔐 A wallet is created for you — instantly, no setup.</span>
          </div>

          {/* mini stat row */}
          <div style={{ display: 'flex', gap: 26, marginTop: 36 }}>
            {[['4', 'asset classes, one view'], ['EN · हिं', 'fully bilingual'], ['100%', 'you own your data']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 800, color: c.accent }}>{v}</div>
                <div style={{ fontSize: 11, color: c.textDim }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* right: orb + floating cards */}
        <div style={{ flex: '1 1 380px', position: 'relative', minWidth: 360, height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HeroOrb c={c} isDark={isDark} />
          <DreamCards c={c} isDark={isDark} />
        </div>
      </div>

      <LiveTicker c={c} isDark={isDark} />
    </div>
  )
}
