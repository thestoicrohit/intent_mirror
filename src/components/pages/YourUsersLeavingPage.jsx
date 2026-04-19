import { useState, useEffect } from 'react'
import { DARK, LIGHT } from '../../theme'

export default function YourUsersLeavingPage({ onClose, isDark, onToggleTheme }) {
  const c = isDark ? DARK : LIGHT
  const [activeIdx, setActiveIdx] = useState(0)

  // auto-cycle through "customer stories"
  useEffect(() => {
    const t = setInterval(() => setActiveIdx(i => (i + 1) % STORIES.length), 3200)
    return () => clearInterval(t)
  }, [])

  const STATS = [
    { value:'47%',    label:'FDs that don\'t renew',       sub:'Every year, silently',          color:'#E05A3A' },
    { value:'8 days', label:'Window to act',               sub:'Before maturity — that\'s all', color:c.warning  },
    { value:'₹1.2L',  label:'Avg. FD value lost per exit', sub:'Compounding loss over 10 yrs',  color:c.accent   },
    { value:'3×',     label:'More predictive',             sub:'Behavior vs. demographics',     color:c.textMuted },
  ]

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto page-in transition-colors duration-300"
      style={{ background:c.bg, color:c.text }}>

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4"
        style={{ background:c.headerBg, backdropFilter:'blur(16px)', borderBottom:`1px solid ${c.border}` }}>
        <div>
          <div className="text-xs font-bold tracking-widest mb-0.5" style={{ color:'#E05A3A' }}>THE PROBLEM</div>
          <h1 className="text-xl font-bold" style={{ color:c.text }}>Your Users Are Leaving.</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onToggleTheme}
            className="px-3 py-1.5 rounded-full text-xs"
            style={{ background:`${c.accent}18`, color:c.accent, border:`1px solid ${c.border}` }}>
            {isDark ? '☀' : '🌙'}
          </button>
          <button onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:brightness-110"
            style={{ background:c.accent2, color:'#BDD1BD' }}>
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-16">

        {/* Hero statement */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6"
            style={{ background:'rgba(224,90,58,0.12)', color:'#E05A3A', border:'1px solid rgba(224,90,58,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background:'#E05A3A' }} />
            This is happening right now, at your bank
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6" style={{ color:c.text }}>
            The decision to leave<br />is made in <span style={{ color:'#E05A3A' }}>silence.</span>
          </h2>
          <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color:c.textMuted }}>
            Your customer doesn't call. They don't complain. They don't even think about it consciously.
            They just browse, compare, hesitate — and one morning, they don't renew.
            By then, your SMS is already too late.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-16">
          {STATS.map((s, i) => (
            <div key={i} className="p-6 rounded-2xl text-center transition-all hover:brightness-110"
              style={{ background:c.card, border:`1px solid ${s.color}30` }}>
              <div className="text-4xl font-bold mb-2" style={{ color:s.color }}>{s.value}</div>
              <div className="text-sm font-medium mb-1" style={{ color:c.text }}>{s.label}</div>
              <div className="text-xs" style={{ color:c.textDim }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* The 8-day timeline */}
        <div className="rounded-2xl p-8 mb-12" style={{ background:c.card, border:`1px solid ${c.border}` }}>
          <h3 className="text-lg font-bold mb-8" style={{ color:c.text }}>
            What happens in the 8 days before a customer leaves
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5" style={{ background:c.border }} />
            {TIMELINE.map((t, i) => (
              <div key={i} className="flex gap-6 mb-6 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 relative"
                    style={{ background:`${t.color}20`, color:t.color, border:`2px solid ${t.color}`, minWidth:32 }}>
                    {t.day}
                  </div>
                </div>
                <div className="flex-1 pb-2">
                  <div className="font-semibold text-sm mb-1" style={{ color:c.text }}>{t.event}</div>
                  <div className="text-xs leading-relaxed" style={{ color:c.textMuted }}>{t.detail}</div>
                  {t.signal && (
                    <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background:`${t.color}15`, color:t.color }}>
                      🎯 Intent Mirror detects: {t.signal}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer stories carousel */}
        <div className="mb-12">
          <h3 className="text-lg font-bold mb-6" style={{ color:c.text }}>
            Real signals. Real exits. Real loss.
          </h3>
          <div className="relative overflow-hidden rounded-2xl" style={{ height:180 }}>
            {STORIES.map((s, i) => (
              <div key={i} className="absolute inset-0 p-6 flex flex-col justify-between transition-all duration-500"
                style={{
                  background:`${s.color}12`, border:`1px solid ${s.color}30`,
                  opacity: i === activeIdx ? 1 : 0,
                  transform: i === activeIdx ? 'translateX(0)' : 'translateX(40px)',
                }}>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className="font-bold text-sm" style={{ color:c.text }}>{s.name} · {s.city}</div>
                      <div className="text-xs" style={{ color:s.color }}>{s.persona} · {s.fd} FD</div>
                    </div>
                    <div className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background:`${s.color}20`, color:s.color }}>{s.outcome}</div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color:c.textMuted }}>{s.story}</p>
                </div>
                <div className="text-xs font-semibold" style={{ color:s.color }}>
                  Signal: {s.signal}
                </div>
              </div>
            ))}
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {STORIES.map((_, i) => (
              <button key={i} onClick={() => setActiveIdx(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === activeIdx ? c.accent : c.border,
                  transform: i === activeIdx ? 'scale(1.3)' : 'scale(1)' }} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-10 rounded-2xl"
          style={{ background:c.card, border:`1px solid ${c.borderStrong}` }}>
          <h3 className="text-2xl font-bold mb-3" style={{ color:c.text }}>
            Intent Mirror sees what you can't.
          </h3>
          <p className="text-sm mb-6" style={{ color:c.textMuted }}>
            Every signal. Every moment. Every user. Start catching exits before they happen.
          </p>
          <button onClick={onClose}
            className="px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:brightness-110"
            style={{ background:c.accent2, color:'#BDD1BD', boxShadow:`0 0 32px ${c.accent2}55` }}>
            See the Dashboard →
          </button>
        </div>
      </div>
    </div>
  )
}

const TIMELINE = [
  { day:'D-8', event:'Customer browses FD rates on a competitor site', color:'#E05A3A',
    detail:'They open 3 tabs. Compare rates. Close them. Say nothing. This is the first signal.',
    signal:'rate_compare detected' },
  { day:'D-6', event:'Searches "best NBFC for FD 2024" at 11 PM', color:'#E05A3A',
    detail:'Late-night research. High intent. They\'re building a case to leave.',
    signal:'safety_check + rate_compare combo' },
  { day:'D-5', event:'Logs into their account — checks balance twice', color:'#D4A853',
    detail:'Not to transact. Just to look. Anxiety is building.',
    signal:'unusual login pattern detected' },
  { day:'D-3', event:'Doesn\'t renew after getting your SMS', color:'#D4A853',
    detail:'The generic "Your FD matures soon" message arrives. They ignore it. It feels impersonal.',
    signal:'no engagement on renewal prompt' },
  { day:'D-0', event:'FD matures. Money moves out.', color:'#568F7C',
    detail:'They\'ve already decided. The window closed 8 days ago. Intent Mirror would have caught it on Day 8.',
    signal: null },
]

const STORIES = [
  { emoji:'👩', name:'Kavitha Nair',  city:'Kochi',     persona:'Exiter',        fd:'₹12L',
    color:'#E05A3A', outcome:'Churned',
    story:'Browsed 3 competitor NBFC sites over 4 days. No login for 28 days. FD matured — money moved to a competitor offering 0.15% more.',
    signal:'no_login_30d + rate_compare x4' },
  { emoji:'👨', name:'Ravi Mehta',   city:'Pune',      persona:'Anxious Saver', fd:'₹3.2L',
    color:'#D4A853', outcome:'Withdrew Early',
    story:'Read 6 "is my money safe" articles. Checked DICGC insurance limit twice. Withdrew 5 days before maturity citing job uncertainty.',
    signal:'safety_check x6 + early browse' },
  { emoji:'👩', name:'Meera Singh',  city:'Delhi',     persona:'Optimizer',     fd:'₹7.2L',
    color:'#568F7C', outcome:'Upgraded ✓',
    story:'Browsed mutual fund pages 8 times in 2 weeks. Intent Mirror flagged her as Upgrade-ready. A personalised nudge converted her to SIP.',
    signal:'mf_browse x8 → nudge sent → converted' },
  { emoji:'👨', name:'Deepak Verma', city:'Hyderabad', persona:'Exiter',        fd:'₹6.5L',
    color:'#E05A3A', outcome:'1d left, critical',
    story:'Stock market browsing spiked. Stocks search detected. 1 day to maturity, urgency score 91. Needs immediate intervention.',
    signal:'stocks_search + 1d left → URGENT' },
]
