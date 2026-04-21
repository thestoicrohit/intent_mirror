import { DARK, LIGHT } from '../../theme'

export default function ForBanksPage({ onClose, onOpenDemo, onOpenContact, isDark, onToggleTheme }) {
  const c = isDark ? DARK : LIGHT

  const TIERS = [
    {
      name:'Starter', price:'Free', sub:'Hackathon demo',
      features:['Up to 1,000 users','Basic persona classification','EN language only','Dashboard access'],
      color:c.textMuted, cta:'Try Demo', action:'demo',
    },
    {
      name:'Growth', price:'₹2.4L/yr', sub:'For mid-size NBFCs',
      features:['Up to 50,000 users','Full behavioral scoring','EN + HI nudges','API access','Priority support'],
      color:c.accent, cta:'Schedule Call', highlight:true, action:'contact',
    },
    {
      name:'Enterprise', price:'Custom', sub:'For large banks',
      features:['Unlimited users','White-label available','Custom model training','Dedicated CSM','SLA guarantee'],
      color:c.accent2, cta:'Contact Sales', action:'contact',
    },
  ]

  const CAPABILITIES = [
    { icon:'🧠', title:'Behavioral Scoring Engine', desc:'Every user scored on 14 behavioral signals updated every 24 hours. Not demographics — actual behavior.' },
    { icon:'🎭', title:'4-Persona DNA System',      desc:'Protector, Optimizer, Anxious Saver, Exiter. Each persona gets a different message, tone, and timing.' },
    { icon:'⏰', title:'Harvest Window Detection',  desc:'Flags every FD maturing in the next 30 days with urgency ranking. Your team knows exactly who to call first.' },
    { icon:'💬', title:'Persona-Matched Nudges',    desc:'AI-generated messages tailored to each user\'s behavioral profile. 41% higher CTR than generic notifications.' },
    { icon:'🔍', title:'Conversational Search',     desc:'Ask "show me churn risk users in Mumbai" and get a filtered result instantly. No SQL. No reports.' },
    { icon:'🌐', title:'Bilingual Support',          desc:'Every nudge generated in both English and Hindi. Switch with one click. Never lose a user to language.' },
  ]

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto page-in transition-colors duration-300"
      style={{ background:c.bg, color:c.text }}>

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4"
        style={{ background:c.headerBg, backdropFilter:'blur(16px)', borderBottom:`1px solid ${c.border}` }}>
        <div>
          <div className="text-xs font-bold tracking-widest mb-0.5" style={{ color:c.accent }}>ENTERPRISE</div>
          <h1 className="text-xl font-bold" style={{ color:c.text }}>Intent Mirror for Banks</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onToggleTheme}
            className="px-3 py-1.5 rounded-full text-xs"
            style={{ background:`${c.accent}18`, color:c.accent, border:`1px solid ${c.border}` }}>
            {isDark ? '☀' : '🌙'}
          </button>
          <button onClick={onOpenDemo}
            className="px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background:`${c.accent}18`, color:c.accent, border:`1px solid ${c.borderStrong}` }}>
            ▶ Watch Demo
          </button>
          <button onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:brightness-110"
            style={{ background:c.accent2, color:'#BDD1BD' }}>
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-16">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6"
            style={{ background:`${c.accent}18`, color:c.accent, border:`1px solid ${c.borderStrong}` }}>
            🏦 Built for FD-heavy financial institutions
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-5" style={{ color:c.text }}>
            Stop losing customers<br />
            <span style={{ color:c.accent }}>you never knew were leaving.</span>
          </h2>
          <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color:c.textMuted }}>
            Intent Mirror gives your retention team behavioral intelligence on every single user —
            so you intervene before the exit, upgrade before the competitor does,
            and renew before the deadline.
          </p>
        </div>

        {/* ROI row */}
        <div className="grid grid-cols-4 gap-4 mb-16">
          {[
            { value:'₹4.2 Cr', label:'Revenue recovered',   color:'#E05A3A' },
            { value:'847',     label:'Churns prevented',     color:c.warning  },
            { value:'1,340',   label:'Upgrades converted',   color:c.accent   },
            { value:'74%',     label:'Renewal rate',         color:c.textMuted},
          ].map((m, i) => (
            <div key={i} className="p-5 rounded-2xl text-center hover:brightness-110 transition-all"
              style={{ background:c.card, border:`1px solid ${m.color}30` }}>
              <div className="text-3xl font-bold mb-1" style={{ color:m.color }}>{m.value}</div>
              <div className="text-xs" style={{ color:c.textMuted }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Capabilities */}
        <h3 className="text-xl font-bold mb-6" style={{ color:c.text }}>What you get</h3>
        <div className="grid grid-cols-3 gap-4 mb-16">
          {CAPABILITIES.map((cap, i) => (
            <div key={i} className="p-5 rounded-2xl hover:brightness-110 transition-all"
              style={{ background:c.card, border:`1px solid ${c.border}` }}>
              <div className="text-2xl mb-3">{cap.icon}</div>
              <div className="font-semibold text-sm mb-2" style={{ color:c.text }}>{cap.title}</div>
              <p className="text-xs leading-relaxed" style={{ color:c.textMuted }}>{cap.desc}</p>
            </div>
          ))}
        </div>

        {/* Integration */}
        <div className="p-8 rounded-2xl mb-16" style={{ background:c.card, border:`1px solid ${c.border}` }}>
          <h3 className="text-lg font-bold mb-6" style={{ color:c.text }}>Dead-simple integration</h3>
          <div className="grid grid-cols-4 gap-6">
            {[
              { step:'01', title:'Connect your data', desc:'Pass user FD data via REST API or CSV upload. No infra changes needed.' },
              { step:'02', title:'Signals are scored', desc:'Our model runs on your data and classifies all users within 24 hours.' },
              { step:'03', title:'Dashboard goes live', desc:'Your team sees the ranked list — who\'s at risk, who\'s ready to upgrade.' },
              { step:'04', title:'Nudges fire automatically', desc:'Persona-matched messages reach users via push, SMS, or in-app.' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-xs font-bold mb-2" style={{ color:c.textDim }}>Step {s.step}</div>
                <div className="font-semibold text-sm mb-1" style={{ color:c.text }}>{s.title}</div>
                <p className="text-xs leading-relaxed" style={{ color:c.textMuted }}>{s.desc}</p>
                {i < 3 && <div className="mt-3 text-lg" style={{ color:c.accent2 }}>↓</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <h3 className="text-xl font-bold mb-6 text-center" style={{ color:c.text }}>Simple pricing</h3>
        <div className="grid grid-cols-3 gap-6 mb-12">
          {TIERS.map((tier, i) => (
            <div key={i} className="p-6 rounded-2xl flex flex-col transition-all hover:brightness-110"
              style={{ background:c.card,
                border: tier.highlight ? `2px solid ${tier.color}80` : `1px solid ${tier.color}40`,
                boxShadow: tier.highlight ? `0 0 32px ${tier.color}30` : 'none' }}>
              {tier.highlight && (
                <div className="text-[10px] font-bold px-2 py-0.5 rounded-full self-start mb-3"
                  style={{ background:`${tier.color}20`, color:tier.color }}>MOST POPULAR</div>
              )}
              <div className="font-bold text-lg mb-0.5" style={{ color:c.text }}>{tier.name}</div>
              <div className="text-2xl font-bold mb-0.5" style={{ color:tier.color }}>{tier.price}</div>
              <div className="text-xs mb-5" style={{ color:c.textDim }}>{tier.sub}</div>
              <div className="space-y-2 flex-1 mb-5">
                {tier.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs" style={{ color:c.textMuted }}>
                    <span style={{ color:tier.color }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => tier.action === 'demo' ? onOpenDemo() : tier.action === 'contact' ? onOpenContact() : onClose()}
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                style={{ background: tier.highlight ? tier.color : `${tier.color}18`,
                  color: tier.highlight ? '#BDD1BD' : tier.color,
                  border: tier.highlight ? 'none' : `1px solid ${tier.color}40` }}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-10 rounded-2xl"
          style={{ background:c.card, border:`1px solid ${c.borderStrong}` }}>
          <h3 className="text-2xl font-bold mb-3" style={{ color:c.text }}>Ready to stop the exits?</h3>
          <p className="text-sm mb-6" style={{ color:c.textMuted }}>
            Schedule a 30-minute walkthrough. We'll show you what Intent Mirror finds in your data on day one.
          </p>
          <button onClick={onOpenDemo}
            className="px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:brightness-110"
            style={{ background:c.accent2, color:'#BDD1BD', boxShadow:`0 0 32px ${c.accent2}55` }}>
            ▶ See the AI Demo First
          </button>
        </div>
      </div>
    </div>
  )
}
