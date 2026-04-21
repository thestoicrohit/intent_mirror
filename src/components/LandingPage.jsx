import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import { DARK, LIGHT } from '../theme'

/* ─── Theme toggle ─── */
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      style={{
        background: isDark ? 'rgba(86,143,124,0.14)' : 'rgba(35,78,80,0.12)',
        color:      isDark ? '#85B093' : '#234E50',
        border:     isDark ? '1px solid rgba(86,143,124,0.32)' : '1px solid rgba(35,78,80,0.3)',
      }}>
      {isDark ? '☀ Light' : '🌙 Dark'}
    </button>
  )
}

/* ─── Cursor-following aurora ─── */
function CursorAurora({ c }) {
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
        background: `radial-gradient(circle, rgba(86,143,124,0.18) 0%, rgba(50,109,108,0.06) 45%, transparent 70%)`,
      }} />
      <div className="cursor-aurora" style={{
        left: pos.x - 120, top: pos.y - 120, width: 240, height: 240,
        background: `radial-gradient(circle, rgba(133,176,147,0.12) 0%, transparent 70%)`,
        transition: 'left 0.04s ease-out, top 0.04s ease-out',
      }} />
    </>
  )
}

/* ─── Dream bubble cards ─── */
const DREAMS = [
  { emoji:'🏠', title:'₹85L Home Secured',    sub:'Priya M. · Mumbai',      cl:'dream-1', top:'12%', left:'62%' },
  { emoji:'📈', title:'+34% Returns',          sub:'FD → Index Fund',        cl:'dream-2', top:'28%', left:'80%' },
  { emoji:'🎓', title:'Kids Education ✓',      sub:'SIP started today',      cl:'dream-3', top:'58%', left:'68%' },
  { emoji:'✈️', title:'Trip to Maldives',      sub:'Ravi K. · Bengaluru',    cl:'dream-4', top:'72%', left:'82%' },
  { emoji:'💰', title:'₹2.4 Cr Portfolio',    sub:'Anjali R. · Delhi',      cl:'dream-1', top:'82%', left:'55%' },
  { emoji:'🚀', title:'7.9% p.a. Locked',     sub:'340 renewals today',     cl:'dream-2', top:'18%', left:'52%' },
]

function DreamCards({ c }) {
  return (
    <>
      {DREAMS.map((d, i) => (
        <div key={i} className={`absolute pointer-events-none ${d.cl}`}
          style={{ top: d.top, left: d.left, zIndex: 3, animationDelay: `${i * 0.4}s` }}>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl backdrop-blur-sm whitespace-nowrap"
            style={{
              background: `rgba(${c === DARK ? '22,37,53' : '152,181,164'},0.82)`,
              border: `1px solid ${c.borderStrong}`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px ${c.border}`,
            }}>
            <span className="text-xl">{d.emoji}</span>
            <div>
              <div className="text-xs font-bold leading-none" style={{ color: c.text }}>{d.title}</div>
              <div className="text-[10px] mt-0.5" style={{ color: c.textMuted }}>{d.sub}</div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

/* ─── Animated hero orb with orbiting rings ─── */
function HeroOrb({ c, isDark }) {
  return (
    <div className="relative flex items-center justify-center float-orb" style={{ width: 460, height: 460 }}>
      {/* Aurora rings */}
      <div className="absolute inset-0 rounded-full ring-pulse"     style={{ border:`1px solid ${c.accent}`, opacity:0.25 }} />
      <div className="absolute inset-0 rounded-full ring-pulse-delay" style={{ border:`1px solid ${c.accent2}`, opacity:0.18 }} />
      <div className="absolute rounded-full ring-pulse-slow"
        style={{ width:480, height:480, top:-10, left:-10, border:`1px solid ${c.textDim}`, opacity:0.08 }} />

      {/* Orbiting dashed ring CW */}
      <div className="absolute orbit-cw" style={{ width:360, height:360, top:50, left:50 }}>
        <div className="absolute inset-0 rounded-full"
          style={{ border:`1px dashed ${c.accent}`, opacity:0.18 }} />
        <div className="absolute w-3 h-3 rounded-full -top-1.5 left-1/2 -ml-1.5"
          style={{ background:c.accent, boxShadow:`0 0 12px ${c.accent}` }} />
      </div>

      {/* Orbiting ring CCW */}
      <div className="absolute orbit-ccw" style={{ width:270, height:270, top:95, left:95 }}>
        <div className="absolute inset-0 rounded-full" style={{ border:`1px solid ${c.borderStrong}`, opacity:0.4 }} />
        <div className="absolute w-2.5 h-2.5 rounded-full top-0 left-1/2 -ml-1"
          style={{ background:c.textMuted, boxShadow:`0 0 10px ${c.textMuted}` }} />
      </div>

      {/* Static mid ring */}
      <div className="absolute rounded-full" style={{
        width:200, height:200, top:130, left:130,
        border:`1px solid ${c.border}`,
        background: isDark ? 'rgba(86,143,124,0.04)' : 'rgba(35,78,80,0.05)',
      }} />

      {/* Core glow-pulse */}
      <div className="relative z-10 flex items-center justify-center rounded-full glow-pulse" style={{
        width:160, height:160,
        background: isDark
          ? 'radial-gradient(circle, #1E3045 0%, #0D1C2B 100%)'
          : 'radial-gradient(circle, #AABFB0 0%, #82A090 100%)',
        border:`2px solid ${c.borderStrong}`,
      }}>
        <Logo size={82} />
      </div>

      {/* Orbital dots */}
      {[
        { top:'7%',  left:'20%', size:7, cl:'particle-a' },
        { top:'80%', left:'12%', size:4, cl:'particle-c' },
        { top:'12%', left:'78%', size:6, cl:'particle-b' },
        { top:'84%', left:'78%', size:4, cl:'particle-a' },
        { top:'48%', left:'2%',  size:5, cl:'particle-c' },
      ].map((p, i) => (
        <div key={i} className={`absolute rounded-full ${p.cl}`}
          style={{ top:p.top, left:p.left, width:p.size, height:p.size,
            background:c.accent, boxShadow:`0 0 ${p.size*3}px ${c.accent}80` }} />
      ))}
    </div>
  )
}

/* ─── Live event ticker ─── */
const TICKER = [
  { icon:'🔴', text:'Ravi Mehta · ₹3.2L FD · 5d left · Churn detected'      },
  { icon:'🟡', text:'Priya Patel · ₹8.5L FD · 12d left · Withdrawal intent'  },
  { icon:'🟢', text:'Arun Kumar · ₹5.1L maturing · Upgrade signal'            },
  { icon:'🔴', text:'Kavitha Nair · ₹12L FD · 3d left · No login 30 days'    },
  { icon:'🟡', text:'Suresh Iyer · ₹4.8L FD · 9d left · Rate comparison'     },
  { icon:'🟢', text:'Meera Singh · ₹7.2L · MF browse → Upgrade ready'        },
  { icon:'🔴', text:'Deepak Verma · ₹6.5L FD · 1d left · Early withdrawal'   },
  { icon:'🟢', text:'Anjali Rao · ₹9.1L FD · 28d · High intent renewal'      },
  { icon:'🟡', text:'Rahul Shah · ₹3.8L FD · 7d left · Safety check'         },
  { icon:'🟢', text:'Lakshmi Prasad · ₹15L · Ready for Index Fund'            },
]

function LiveTicker({ c }) {
  const doubled = [...TICKER, ...TICKER]
  return (
    <div className="w-full overflow-hidden py-2.5"
      style={{ borderTop:`1px solid ${c.border}`, borderBottom:`1px solid ${c.border}`,
        background: `${c.bgDeep}cc`, backdropFilter:'blur(8px)' }}>
      <div className="flex gap-0 ticker-track" style={{ width:'max-content' }}>
        {doubled.map((e, i) => (
          <div key={i} className="flex items-center gap-2 px-6 text-xs whitespace-nowrap"
            style={{ color:c.textMuted }}>
            <span>{e.icon}</span>
            <span>{e.text}</span>
            <span style={{ color:c.border, marginLeft:6 }}>|</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Stat card with scroll-triggered count ─── */
function StatCard({ value, label, sub, c, delay = 0 }) {
  const [vis, setVis] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className="text-center p-6 rounded-2xl transition-all hover:brightness-110"
      style={{
        background: c.card, border:`1px solid ${c.border}`,
        opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(20px)',
        transition: `opacity 0.5s ${delay}ms, transform 0.5s ${delay}ms`,
      }}>
      <div className={`text-3xl font-bold mb-1 ${vis ? 'count-in' : ''}`}
        style={{ color:c.accent, animationDelay:`${delay}ms` }}>{value}</div>
      <div className="text-sm font-medium mb-0.5" style={{ color:c.text }}>{label}</div>
      <div className="text-xs" style={{ color:c.textDim }}>{sub}</div>
    </div>
  )
}

/* ════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════ */
export default function LandingPage({
  onEnterDashboard, onOpenDemo,
  onOpenProblem, onOpenBanks, onOpenContact,
  isDark, onToggleTheme,
}) {
  const c = isDark ? DARK : LIGHT

  const NAV = [
    { label:'Your Users Are Leaving.', action: onOpenProblem, hot:true  },
    { label:'For Banks',               action: onOpenBanks,   hot:false },
    { label:'Contact',                 action: onOpenContact, hot:false },
    { label:'Live Demo →',             action: onOpenDemo,    hot:false },
  ]

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300"
      style={{ background:c.bg, color:c.text }}>

      {/* Cursor aurora (fixed, above bg, below content) */}
      <CursorAurora c={c} />

      {/* Mesh bg */}
      <div className="fixed inset-0 pointer-events-none bg-mesh" style={{
        background: isDark
          ? `radial-gradient(ellipse at 25% 55%, rgba(86,143,124,0.1) 0%, transparent 55%),
             radial-gradient(ellipse at 78% 18%, rgba(50,109,108,0.07) 0%, transparent 50%),
             radial-gradient(ellipse at 55% 85%, rgba(22,37,53,0.6) 0%, transparent 55%), ${c.bg}`
          : `radial-gradient(ellipse at 25% 55%, rgba(35,78,80,0.12) 0%, transparent 55%),
             radial-gradient(ellipse at 75% 20%, rgba(86,143,124,0.1) 0%, transparent 50%), ${c.bg}`,
        zIndex:0,
      }} />

      <div className="relative" style={{ zIndex:2 }}>

        {/* ── HEADER ── */}
        <header className="flex items-center justify-between px-10 py-4 sticky top-0 z-50 transition-colors duration-300"
          style={{ background:c.headerBg, backdropFilter:'blur(18px)', borderBottom:`1px solid ${c.border}` }}>
          <div className="flex items-center gap-3">
            <Logo size={34} />
            <div>
              <div className="font-bold text-lg tracking-wide leading-none" style={{ color:c.text }}>INTENT MIRROR</div>
              <div className="tracking-widest" style={{ color:c.textDim, fontSize:9 }}>
                FINTECH AI · BEHAVIOR → INTENT → GROWTH
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {NAV.map(n => (
              <button key={n.label} onClick={n.action || undefined}
                className="text-sm transition-all hover:opacity-80 relative"
                style={{ color:n.hot ? '#E05A3A' : n.label.includes('Demo') ? c.accent : c.textMuted,
                  fontWeight: n.hot ? 600 : 400 }}>
                {n.label}
                {n.hot && (
                  <span className="absolute -top-1.5 -right-3 w-1.5 h-1.5 rounded-full pulse-dot"
                    style={{ background:'#E05A3A' }} />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            <button onClick={onEnterDashboard}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:brightness-110"
              style={{ background:c.accent2, color:'#BDD1BD', boxShadow:`0 0 22px ${c.accent2}50` }}>
              Dashboard →
            </button>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="relative flex items-center px-10 gap-8 overflow-hidden"
          style={{ maxWidth:1280, margin:'0 auto', width:'100%', minHeight:'88vh', paddingTop:'5vh', paddingBottom:'5vh' }}>

          {/* Dream cards – absolute inside section */}
          <DreamCards c={c} />

          {/* Left copy */}
          <div className="flex-1 max-w-xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{ background:`${c.accent}18`, color:c.accent, border:`1px solid ${c.borderStrong}` }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background:c.accent }} />
              Live · Monitoring 50,000 users right now
            </div>

            <h1 className="font-bold leading-tight mb-5" style={{ fontSize:56, color:c.text, letterSpacing:'-0.025em' }}>
              Read users'<br />
              <span className="shimmer-text">financial intent.</span><br />
              Guide them to grow.
            </h1>

            <p className="text-base mb-8 leading-relaxed" style={{ color:c.textMuted, maxWidth:480 }}>
              AI catches the exact moment a customer decides to leave — before they act.
              Persona-matched nudges. Right time. Right product. Zero guesswork.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={onEnterDashboard}
                className="px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:brightness-110 hover:scale-105"
                style={{ background:c.accent2, color:'#BDD1BD', boxShadow:`0 0 32px ${c.accent2}55`,
                  transition:'all 0.2s' }}>
                See Live Dashboard →
              </button>
              <button onClick={onOpenDemo}
                className="px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:brightness-110"
                style={{ background:`${c.accent}18`, color:c.accent, border:`1px solid ${c.borderStrong}` }}>
                ▶ Watch AI Demo
              </button>
            </div>

            <div className="flex items-center gap-6 mt-10 flex-wrap">
              {[{icon:'🏦',label:'50,000 FintechX Users'},{icon:'🔒',label:'SEBI-Compliant'},{icon:'🤖',label:'100% AI-Built'}].map(b => (
                <div key={b.label} className="flex items-center gap-2 text-xs" style={{ color:c.textDim }}>
                  <span>{b.icon}</span><span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right orb */}
          <div className="hidden lg:flex flex-1 items-center justify-center relative z-10">
            <HeroOrb c={c} isDark={isDark} />
          </div>
        </section>

        {/* ── LIVE TICKER ── */}
        <LiveTicker c={c} />

        {/* ── THE PROBLEM ── */}
        <section id="problem" className="px-10 py-20" style={{ background:c.bgDeep }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ background:c.border }} />
              <span className="text-xs font-bold tracking-widest" style={{ color:'#E05A3A' }}>
                YOUR USERS ARE LEAVING.
              </span>
              <div className="flex-1 h-px" style={{ background:c.border }} />
            </div>

            <h2 className="text-4xl font-bold text-center mb-4 leading-tight" style={{ color:c.text }}>
              The moment a customer decides to leave<br />
              <span style={{ color:c.accent }}>happens 8 days before the FD matures.</span>
            </h2>
            <p className="text-center text-sm mb-12 max-w-xl mx-auto" style={{ color:c.textMuted }}>
              You can't see it. Your CRM can't see it. But their behavior tells the whole story —
              if you know where to look.
            </p>

            <div className="grid grid-cols-3 gap-6 mb-16">
              {[
                { stat:'47%',  headline:"of FDs don't renew",   body:"Nearly half your customers quietly exit at maturity. They don't complain. They don't call. They just move on.", color:'#E05A3A', icon:'📉' },
                { stat:'8 days',headline:'is your entire window',body:"The decision is made a week before maturity. Most banks send a generic SMS on Day 0. That's already too late.", color:c.warning, icon:'⏱'  },
                { stat:'₹1.2L', headline:'average FD value lost', body:"Every exit isn't just today's deposit. It's 10 years of compounding trust, cross-sell, and lifetime value.", color:c.accent, icon:'💸' },
              ].map((card, i) => (
                <div key={i} className="rounded-2xl p-7 transition-all hover:brightness-110"
                  style={{ background:c.card, border:`1px solid ${card.color}30` }}>
                  <div className="text-3xl mb-4">{card.icon}</div>
                  <div className="text-4xl font-bold mb-2" style={{ color:card.color }}>{card.stat}</div>
                  <div className="font-semibold text-base mb-3" style={{ color:c.text }}>{card.headline}</div>
                  <p className="text-sm leading-relaxed" style={{ color:c.textMuted }}>{card.body}</p>
                </div>
              ))}
            </div>

            {/* Flow */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px" style={{ background:c.border }} />
              <span className="text-xs font-bold tracking-widest" style={{ color:c.accent2 }}>HOW INTENT MIRROR FIXES THIS</span>
              <div className="flex-1 h-px" style={{ background:c.border }} />
            </div>
            <div className="flex items-center justify-center gap-0">
              {[
                { icon:'〜', step:'01', title:'Sense',   sub:'Every login, page visit, FD pattern, search query — captured and scored in real time.',             color:c.accent   },
                { icon:'◎', step:'02', title:'Predict', sub:"ML model classifies each user's intent: Renew, Upgrade, Withdraw, or Churn. Updated every 24h.", color:c.textMuted },
                { icon:'✓', step:'03', title:'Nudge',   sub:'A persona-matched message fires at exactly the right moment — not generic, not late.',             color:c.accent2  },
              ].map((card, i) => (
                <div key={card.step} className="flex items-center">
                  <div className="rounded-2xl p-7 w-80 hover:brightness-110 transition-all"
                    style={{ background:c.card, border:`1px solid ${c.border}` }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                        style={{ background:`${card.color}20`, color:card.color, border:`1px solid ${card.color}35` }}>
                        {card.icon}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color:card.color }}>{card.title}</div>
                        <div className="text-xs" style={{ color:c.textDim }}>Step {card.step}</div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color:c.textMuted }}>{card.sub}</p>
                  </div>
                  {i < 2 && <div className="flex items-center px-4 text-xl" style={{ color:c.accent2 }}>→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── METRICS ── */}
        <section className="px-10 py-16" style={{ background:c.bg }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div className="text-center mb-10">
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color:c.accent2 }}>LIVE PLATFORM METRICS</div>
              <h2 className="text-3xl font-bold" style={{ color:c.text }}>Numbers that speak for themselves</h2>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <StatCard value="50,000"  label="FintechX Users"         sub="Platform modeled on"           c={c} delay={0}   />
              <StatCard value="340"     label="FDs in harvest window"   sub="Maturing in next 30 days"      c={c} delay={100} />
              <StatCard value="74%"     label="Retention rate"          sub="+3 pts this month"             c={c} delay={200} />
              <StatCard value="14.6k"   label="Beyond-FD ready"         sub="Upgrade candidates identified" c={c} delay={300} />
            </div>
          </div>
        </section>

        {/* ── FOR BANKS ── */}
        <section id="banks" className="px-10 py-16" style={{ background:c.bgDeep, borderTop:`1px solid ${c.border}` }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div className="grid grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-xs font-bold tracking-widest mb-3" style={{ color:c.accent }}>FOR BANKS & NBFCs</div>
                <h2 className="text-3xl font-bold mb-5 leading-tight" style={{ color:c.text }}>
                  Built for teams who<br />
                  <span style={{ color:c.accent }}>can't afford to guess.</span>
                </h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color:c.textMuted }}>
                  Intent Mirror plugs into your existing user data — no custom infra,
                  no months of integration. A working behavioral intelligence layer in days.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    'Real-time behavioral scoring on all users',
                    'Persona classification — not just demographics',
                    'SEBI-compliant nudge framework',
                    'EN + HI language support out of the box',
                    'Works on web, app, and branch touchpoints',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-3 text-sm" style={{ color:c.textMuted }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background:`${c.accent}20`, color:c.accent }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={onOpenBanks}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-110"
                  style={{ background:c.accent2, color:'#BDD1BD' }}>
                  Learn more for banks →
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label:'Churn Prevented',   value:'847 users',  pct:72, color:'#E05A3A' },
                  { label:'Upgrade Converted', value:'1,340 users',pct:55, color:c.accent  },
                  { label:'Renewal Rate',       value:'74%',        pct:74, color:c.textMuted},
                  { label:'Revenue Recovered', value:'₹4.2 Cr',   pct:88, color:c.warning  },
                ].map(m => (
                  <div key={m.label} className="rounded-xl p-4 transition-all hover:brightness-105"
                    style={{ background:c.card, border:`1px solid ${c.border}` }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm" style={{ color:c.textMuted }}>{m.label}</span>
                      <span className="font-bold text-sm" style={{ color:m.color }}>{m.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background:c.border }}>
                      <div className="h-full rounded-full" style={{ width:`${m.pct}%`, background:m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DEMO CTA ── */}
        <section className="px-10 py-20" style={{ background:c.bg, borderTop:`1px solid ${c.border}` }}>
          <div className="text-center" style={{ maxWidth:700, margin:'0 auto' }}>
            <div className="text-xs font-bold tracking-widest mb-3" style={{ color:c.accent2 }}>INTERACTIVE DEMO</div>
            <h2 className="text-4xl font-bold mb-5 leading-tight" style={{ color:c.text }}>
              See it work on<br />
              <span style={{ color:c.accent }}>30 real user journeys.</span>
            </h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color:c.textMuted }}>
              Our AI guide walks you through every feature — behavioral signal detection,
              persona classification, and nudge delivery. Live data. Real explanations.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button onClick={onOpenDemo}
                className="px-8 py-4 rounded-full font-bold text-sm transition-all hover:brightness-110 hover:scale-105"
                style={{ background:c.accent2, color:'#BDD1BD', boxShadow:`0 0 36px ${c.accent2}55`,
                  transition:'all 0.2s' }}>
                ▶ Launch AI Demo Experience
              </button>
              <button onClick={onEnterDashboard}
                className="px-8 py-4 rounded-full font-bold text-sm transition-all"
                style={{ border:`1px solid ${c.borderStrong}`, color:c.textMuted }}>
                Open Dashboard →
              </button>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="px-10 py-16" style={{ background:c.bgDeep, borderTop:`1px solid ${c.border}` }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div className="text-center mb-10">
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color:c.accent2 }}>GET IN TOUCH</div>
              <h2 className="text-3xl font-bold" style={{ color:c.text }}>We'd love to hear from you</h2>
            </div>
            <div className="grid grid-cols-3 gap-8">
              {[
                { icon:'💬', title:'Contact Support', lines:['Available 9 AM–6 PM IST','support@intentmirror.ai','Avg. response: 2 hours'],   action: onOpenContact },
                { icon:'📋', title:'Request a Demo',  lines:['Custom walkthrough for your team','Schedule a 30-min call','hello@intentmirror.ai'],action: onOpenDemo    },
                { icon:'🏢', title:'Enterprise Sales', lines:['For banks with 10k+ users','API + white-label available','enterprise@intentmirror.ai'],action: onOpenBanks },
              ].map(card => (
                <button key={card.title} onClick={card.action}
                  className="text-left rounded-2xl p-6 transition-all hover:brightness-110 hover:scale-105"
                  style={{ background:c.card, border:`1px solid ${c.border}`, transition:'all 0.2s' }}>
                  <div className="text-3xl mb-4">{card.icon}</div>
                  <div className="font-semibold text-base mb-3" style={{ color:c.text }}>{card.title}</div>
                  {card.lines.map(l => <div key={l} className="text-xs mb-1.5" style={{ color:c.textMuted }}>{l}</div>)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="px-10 py-6" style={{ borderTop:`1px solid ${c.border}`, background:c.bgDeep }}>
          <div className="flex items-center justify-between" style={{ maxWidth:1280, margin:'0 auto' }}>
            <div className="flex items-center gap-2">
              <Logo size={20} />
              <span className="text-xs font-semibold" style={{ color:c.textDim }}>Intent Mirror v3.0</span>
            </div>
            <span className="text-xs" style={{ color:c.textDim }}>
              Blostem AI Builder Hackathon · Data Analytics & Insights · Built 100% with AI
            </span>
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </footer>
      </div>
    </div>
  )
}
