import { useState, useEffect, useRef } from 'react'
import { DARK, LIGHT } from '../theme'
import Logo from './Logo'

/* ── AI narrator steps ── */
const STEPS = [
  {
    id: 'overview',
    title: 'Platform Overview',
    tag: 'WHAT IS INTENT MIRROR?',
    ai: `Intent Mirror is a real-time behavioral intelligence layer built for fintechs and banks. It monitors 50,000 users — their logins, FD patterns, browsing habits, and search queries — and tells you exactly who is about to leave, upgrade, or renew, before they act.`,
    visual: 'overview',
  },
  {
    id: 'dna',
    title: 'User DNA',
    tag: 'PERSONA CLASSIFICATION',
    ai: `Every user is classified into one of four behavioral personas — Protector, Optimizer, Anxious Saver, or Exiter. This isn't demographics. It's how they behave with money. A Protector needs reassurance. An Optimizer needs better returns. An Exiter needs intervention — now.`,
    visual: 'dna',
  },
  {
    id: 'harvest',
    title: 'Harvest Window',
    tag: 'FD MATURITY INTELLIGENCE',
    ai: `340 FDs are maturing in the next 30 days. Intent Mirror ranks each user by churn risk, identifies those signaling withdrawal intent, and surfaces upgrade candidates — all sorted by urgency. Your team knows exactly who to contact and in what order.`,
    visual: 'harvest',
  },
  {
    id: 'feed',
    title: 'Intent Feed',
    tag: 'LIVE BEHAVIORAL SIGNALS',
    ai: `The Intent Feed is a real-time stream of behavioral events, sorted by urgency. When a user browses MF options after 11 PM, compares rates twice in a week, or goes 30 days without logging in — Intent Mirror catches it and scores it. The signal is live. The window is short.`,
    visual: 'feed',
  },
  {
    id: 'nudge',
    title: 'Smart Nudges',
    tag: 'PERSONA-MATCHED MESSAGING',
    ai: `When the right moment arrives, Intent Mirror generates a persona-matched message. Not a generic SMS. A message written for this user, at this moment, about this product. Protectors get safety guarantees. Optimizers get return comparisons. Exiters get a reason to stay.`,
    visual: 'nudge',
  },
]

/* ── Visual panels for each step ── */
function OverviewVisual({ c }) {
  return (
    <div className="space-y-3">
      {/* Health score */}
      <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: c.card, border:`1px solid ${c.border}` }}>
        <div>
          <div className="text-4xl font-bold" style={{ color: c.accent }}>74</div>
          <div className="text-xs" style={{ color: c.textDim }}>Platform Health Score</div>
        </div>
        <div className="flex-1 space-y-1">
          {[80,62,74,78,74].map((v,i) => (
            <div key={i} className="h-1 rounded-full" style={{ background: c.border, position:'relative' }}>
              <div className="h-full rounded-full" style={{ width:`${v}%`, background: c.accent }} />
            </div>
          ))}
        </div>
        <div className="text-xs font-semibold" style={{ color: c.textMuted }}>↑ +3 pts</div>
      </div>
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label:'Churn Risk',  value:'847',   color:'#E05A3A' },
          { label:'Harvest',     value:'340',   color:'#D4A853' },
          { label:'Beyond-FD',   value:'14.6k', color: c.accent },
        ].map(m => (
          <div key={m.label} className="p-3 rounded-xl text-center" style={{ background: c.card, border:`1px solid ${c.border}` }}>
            <div className="text-xl font-bold" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs mt-0.5" style={{ color: c.textDim }}>{m.label}</div>
          </div>
        ))}
      </div>
      {/* Live ticker */}
      <div className="overflow-hidden rounded-xl p-3" style={{ background: c.card, border:`1px solid ${c.border}` }}>
        <div className="text-xs font-bold mb-2" style={{ color: c.textDim }}>LIVE EVENTS</div>
        {[
          { icon:'🔴', t:'Ravi Mehta · Churn risk · 5d left' },
          { icon:'🟡', t:'Priya Patel · Withdrawal intent · 12d' },
          { icon:'🟢', t:'Arun Kumar · Upgrade ready · ₹5.1L' },
        ].map((e,i) => (
          <div key={i} className="flex items-center gap-2 text-xs py-1" style={{ color: c.textMuted, borderBottom: i<2?`1px solid ${c.border}`:'none' }}>
            <span>{e.icon}</span><span>{e.t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DnaVisual({ c }) {
  const personas = [
    { key:'Protector',     pct:62, color:'#85B093', icon:'🛡' },
    { key:'Optimizer',     pct:19, color:'#568F7C', icon:'📈' },
    { key:'Anxious Saver', pct:12, color:'#D4A853', icon:'😟' },
    { key:'Exiter',        pct:7,  color:'#E05A3A', icon:'🚪' },
  ]
  return (
    <div className="space-y-3">
      {personas.map(p => (
        <div key={p.key} className="p-4 rounded-xl" style={{ background: c.card, border:`1px solid ${p.color}30` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span>{p.icon}</span>
              <span className="font-semibold text-sm" style={{ color: c.text }}>{p.key}</span>
            </div>
            <span className="font-bold text-sm" style={{ color: p.color }}>{p.pct}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: c.border }}>
            <div className="h-full rounded-full transition-all" style={{ width:`${p.pct}%`, background: p.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function HarvestVisual({ c }) {
  const users = [
    { name:'Kavitha Nair',  fd:'₹12L',  days:3,  pred:'Churn',   risk:94 },
    { name:'Ravi Mehta',    fd:'₹3.2L', days:5,  pred:'Churn',   risk:89 },
    { name:'Priya Patel',   fd:'₹8.5L', days:12, pred:'Withdraw',risk:72 },
    { name:'Meera Singh',   fd:'₹7.2L', days:18, pred:'Upgrade', risk:31 },
    { name:'Arun Kumar',    fd:'₹5.1L', days:24, pred:'Renew',   risk:22 },
  ]
  const pColor = { Churn:'#E05A3A', Withdraw:'#D4A853', Upgrade:'#85B093', Renew:'#85B093' }
  return (
    <div className="rounded-xl overflow-hidden" style={{ border:`1px solid ${c.border}` }}>
      <div className="px-3 py-2 text-xs font-bold" style={{ background: c.card, color: c.textDim, borderBottom:`1px solid ${c.border}` }}>
        340 FDs · SORTED BY URGENCY
      </div>
      {users.map((u,i) => (
        <div key={u.name} className="flex items-center gap-3 px-3 py-2.5 text-xs"
          style={{ background: i%2===0?c.rowEven:c.rowOdd, borderBottom: i<4?`1px solid ${c.border}`:'none' }}>
          <span className="font-medium flex-1" style={{ color: c.text }}>{u.name}</span>
          <span style={{ color: c.textMuted }}>{u.fd}</span>
          <span className="font-bold w-8 text-right" style={{ color: u.days<=7?'#E05A3A':u.days<=14?'#D4A853':c.accent }}>{u.days}d</span>
          <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background:`${pColor[u.pred]}18`, color:pColor[u.pred] }}>{u.pred}</span>
          <span className="font-bold" style={{ color: u.risk>75?'#E05A3A':u.risk>50?'#D4A853':c.accent }}>{u.risk}%</span>
        </div>
      ))}
    </div>
  )
}

function FeedVisual({ c }) {
  const events = [
    { name:'Kavitha Nair',  persona:'Exiter',        urgency:96, signal:'No login 30 days + early withdrawal search', color:'#E05A3A' },
    { name:'Deepak Verma',  persona:'Exiter',        urgency:91, signal:'Rate comparison × 3 this week',               color:'#E05A3A' },
    { name:'Priya Patel',   persona:'Anxious Saver', urgency:74, signal:'Safety FAQ browsed at 2 AM',                  color:'#D4A853' },
    { name:'Suresh Iyer',   persona:'Anxious Saver', urgency:68, signal:'FD calculator used 5 times',                  color:'#D4A853' },
    { name:'Meera Singh',   persona:'Optimizer',     urgency:42, signal:'MF browse → index fund comparison',           color:'#85B093' },
  ]
  return (
    <div className="space-y-2">
      {events.map(e => (
        <div key={e.name} className="flex items-center gap-3 p-3 rounded-xl relative overflow-hidden"
          style={{ background: c.card, border:`1px solid ${c.border}` }}>
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: e.color }} />
          <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0"
            style={{ background:`${e.color}15`, border:`1px solid ${e.color}30` }}>
            <span className="text-xs font-bold" style={{ color: e.color }}>{e.urgency}</span>
            <span className="text-[8px]" style={{ color: c.textDim }}>score</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-xs" style={{ color: c.text }}>{e.name}
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background:`${e.color}18`, color:e.color }}>{e.persona}</span>
            </div>
            <div className="text-[10px] mt-0.5 truncate" style={{ color: c.textDim }}>{e.signal}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function NudgeVisual({ c }) {
  const [typing, setTyping] = useState(false)
  const [done, setDone] = useState(false)
  const msg = "Hi Kavitha, your ₹12L FD matures in just 3 days. We've been your trusted partner for 4 years — and we'd love to continue that. As a loyal customer, you're eligible for our 7.85% p.a. premium renewal rate. Renewing takes 30 seconds. Your money stays safe, your trust stays intact."
  const [shown, setShown] = useState('')
  const idx = useRef(0)

  useEffect(() => {
    setShown(''); idx.current = 0; setDone(false)
    const t1 = setTimeout(() => {
      setTyping(true)
      const iv = setInterval(() => {
        idx.current++
        setShown(msg.slice(0, idx.current))
        if (idx.current >= msg.length) { clearInterval(iv); setDone(true); setTyping(false) }
      }, 18)
      return () => clearInterval(iv)
    }, 600)
    return () => clearTimeout(t1)
  }, [])

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl" style={{ background: c.card, border:`1px solid ${c.border}` }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ background:`#E05A3A20`, border:`1px solid #E05A3A35` }}>🛡</div>
          <div>
            <div className="text-xs font-semibold" style={{ color: c.text }}>Kavitha Nair</div>
            <div className="text-[10px]" style={{ color:'#E05A3A' }}>Exiter · Risk 94% · ₹12L FD · 3d left</div>
          </div>
          <div className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full pulse-dot"
            style={{ background:`#E05A3A18`, color:'#E05A3A' }}>URGENT</div>
        </div>
        <div className="text-xs font-bold mb-2" style={{ color: c.textDim }}>AI-GENERATED MESSAGE</div>
        <div className="p-3 rounded-xl text-xs leading-relaxed min-h-16"
          style={{ background: c.bgDeep || '#000009', color: c.textMuted, border:`1px solid ${c.border}` }}>
          {shown}
          {typing && <span className="inline-block w-0.5 h-3 ml-0.5 rounded-full" style={{ background: c.accent, animation:'pulse-dot 0.8s infinite' }} />}
        </div>
      </div>
      {done && (
        <div className="flex gap-2 fade-in">
          <div className="flex-1 py-2 rounded-xl text-xs text-center font-semibold"
            style={{ background:`${c.accent}18`, color:c.accent, border:`1px solid ${c.borderStrong}` }}>📋 Copy Message</div>
          <div className="flex-1 py-2 rounded-xl text-xs text-center font-semibold"
            style={{ background: c.accent2, color:'#BDD1BD' }}>📤 Send Nudge</div>
        </div>
      )}
    </div>
  )
}

function StepVisual({ step, c }) {
  const key = step.visual
  return (
    <div className="slide-up">
      {key === 'overview' && <OverviewVisual c={c} />}
      {key === 'dna'      && <DnaVisual c={c} />}
      {key === 'harvest'  && <HarvestVisual c={c} />}
      {key === 'feed'     && <FeedVisual c={c} />}
      {key === 'nudge'    && <NudgeVisual c={c} />}
    </div>
  )
}

/* ── Main DemoPage ── */
export default function DemoPage({ onClose, isDark, onToggleTheme }) {
  const c = isDark ? DARK : LIGHT
  const [activeStep, setActiveStep] = useState(0)
  const [playing, setPlaying]       = useState(true)
  const [progress, setProgress]     = useState(0)
  const DURATION = 8000
  const timerRef = useRef(null)
  const startRef = useRef(null)

  const goTo = (idx) => {
    setActiveStep(idx)
    setProgress(0)
    startRef.current = Date.now()
  }

  useEffect(() => {
    if (!playing) { clearInterval(timerRef.current); return }
    startRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min((elapsed / DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        setActiveStep(s => {
          const next = (s + 1) % STEPS.length
          startRef.current = Date.now()
          setProgress(0)
          return next
        })
      }
    }, 50)
    return () => clearInterval(timerRef.current)
  }, [playing, activeStep])

  const step = STEPS[activeStep]

  return (
    <div className="fixed inset-0 z-[100] flex flex-col transition-colors duration-300"
      style={{ background: c.bgDeep }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: c.headerBg, backdropFilter:'blur(16px)', borderBottom:`1px solid ${c.border}` }}>
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <div>
            <div className="font-bold text-sm" style={{ color: c.text }}>Intent Mirror · AI Demo</div>
            <div className="text-[10px] tracking-widest" style={{ color: c.textDim }}>GUIDED WALKTHROUGH · 5 FEATURES</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-1 mx-10">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: c.border }}>
            <div className="h-full rounded-full transition-none"
              style={{ width:`${((activeStep / STEPS.length) + (progress / 100 / STEPS.length)) * 100}%`, background: c.accent }} />
          </div>
          <div className="flex justify-between mt-1">
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => { goTo(i); setPlaying(false) }}
                className="text-[10px] transition-all"
                style={{ color: i === activeStep ? c.accent : c.textDim, fontWeight: i === activeStep ? 700 : 400 }}>
                {i + 1}. {s.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setPlaying(p => !p)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background:`${c.accent}18`, color:c.accent, border:`1px solid ${c.borderStrong}` }}>
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <button onClick={() => onToggleTheme()}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background:`${c.accent}18`, color:c.accent, border:`1px solid ${c.border}` }}>
            {isDark ? '☀' : '🌙'}
          </button>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-70"
            style={{ background: c.card, color: c.textDim, border:`1px solid ${c.border}` }}>
            ✕
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: step list */}
        <div className="w-56 shrink-0 flex flex-col py-6 px-4 gap-2 overflow-y-auto"
          style={{ borderRight:`1px solid ${c.border}`, background: c.bg }}>
          <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: c.textDim }}>DEMO STEPS</div>
          {STEPS.map((s, i) => {
            const active = i === activeStep
            return (
              <button key={s.id} onClick={() => { goTo(i); setPlaying(false) }}
                className="text-left px-3 py-3 rounded-xl transition-all"
                style={{
                  background: active ? `${c.accent}18` : 'transparent',
                  border: active ? `1px solid ${c.borderStrong}` : '1px solid transparent',
                }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: active ? c.accent : c.border, color: active ? '#fff' : c.textDim }}>
                    {i + 1}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: active ? c.accent : c.textMuted }}>
                    {s.title}
                  </span>
                </div>
                {active && (
                  <div className="h-0.5 rounded-full mt-2 overflow-hidden" style={{ background: c.border }}>
                    <div className="h-full rounded-full" style={{ width:`${progress}%`, background: c.accent, transition:'width 0.05s linear' }} />
                  </div>
                )}
              </button>
            )
          })}

          <div className="mt-auto pt-4" style={{ borderTop:`1px solid ${c.border}` }}>
            <div className="text-[10px] mb-3" style={{ color: c.textDim }}>
              Step {activeStep + 1} of {STEPS.length}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { goTo(Math.max(0, activeStep - 1)); setPlaying(false) }}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: c.card, color: c.textMuted, border:`1px solid ${c.border}` }}>
                ← Prev
              </button>
              <button onClick={() => { goTo((activeStep + 1) % STEPS.length); setPlaying(false) }}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: c.accent2, color:'#BDD1BD' }}>
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Center: visual */}
        <div className="flex-1 overflow-y-auto p-8" style={{ background: c.bg }}>
          <div className="max-w-md mx-auto">
            <div className="text-xs font-bold tracking-widest mb-2" style={{ color: c.textDim }}>{step.tag}</div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: c.text }}>{step.title}</h2>
            <StepVisual step={step} c={c} key={step.id} />
          </div>
        </div>

        {/* Right: AI narrator */}
        <div className="w-80 shrink-0 flex flex-col overflow-hidden"
          style={{ borderLeft:`1px solid ${c.border}`, background: c.bgDeep }}>
          {/* AI header */}
          <div className="px-5 py-4 shrink-0" style={{ borderBottom:`1px solid ${c.border}` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background:`${c.accent}20`, border:`1px solid ${c.borderStrong}` }}>
                🤖
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: c.text }}>Intent Mirror AI</div>
                <div className="flex items-center gap-1.5 text-[10px]" style={{ color: c.textDim }}>
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background:'#85B093' }} />
                  Narrating live
                </div>
              </div>
            </div>
          </div>

          {/* Narration text */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="slide-up" key={step.id}>
              <div className="text-sm leading-relaxed" style={{ color: c.textMuted }}>
                {step.ai}
              </div>

              {/* Key insight box */}
              <div className="mt-5 p-4 rounded-xl"
                style={{ background:`${c.accent}10`, border:`1px solid ${c.borderStrong}` }}>
                <div className="text-xs font-bold mb-2" style={{ color: c.accent }}>💡 KEY INSIGHT</div>
                <div className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
                  {activeStep === 0 && 'Intent Mirror connects behavior to action. Every event a user triggers becomes a data point that sharpens the prediction.'}
                  {activeStep === 1 && '62% of users are Protectors — they need safety, not returns. A generic "higher yield" pitch will push them away.'}
                  {activeStep === 2 && 'The top 10 users by churn risk account for ₹1.2 Cr in combined FD value. Prioritizing is everything.'}
                  {activeStep === 3 && 'Behavioral signals are 3× more predictive of intent than demographic data alone, per internal model validation.'}
                  {activeStep === 4 && 'Persona-matched nudges achieve 41% higher click-through than generic notifications in A/B testing on similar platforms.'}
                </div>
              </div>

              {/* Quick stats */}
              <div className="mt-4 space-y-2">
                <div className="text-xs font-bold" style={{ color: c.textDim }}>RELATED METRICS</div>
                {[
                  { label:'Users in this view', value: activeStep===0?'50,000':activeStep===1?'50,000':activeStep===2?'340':activeStep===3?'1,847':'94' },
                  { label:'Action required',    value: activeStep===0?'Monitor':activeStep===1?'Classify':activeStep===2?'Prioritise':activeStep===3?'Intervene':'Send' },
                  { label:'Avg. time to act',   value: activeStep===0?'Real-time':activeStep===1?'24h update':activeStep===2?'8 days':activeStep===3?'2–4 hrs':'30 sec' },
                ].map(m => (
                  <div key={m.label} className="flex justify-between text-xs"
                    style={{ color: c.textDim }}>
                    <span>{m.label}</span>
                    <span className="font-semibold" style={{ color: c.accent }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="px-5 py-4 shrink-0" style={{ borderTop:`1px solid ${c.border}` }}>
            <div className="text-xs mb-3" style={{ color: c.textDim }}>
              Ready to see the real dashboard?
            </div>
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110"
              style={{ background: c.accent2, color:'#BDD1BD' }}>
              Open Live Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
