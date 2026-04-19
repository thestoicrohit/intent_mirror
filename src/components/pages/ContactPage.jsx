import { useState } from 'react'
import { DARK, LIGHT } from '../../theme'
import { submitContact } from '../../api'

export default function ContactPage({ onClose, onOpenDemo, onEnterDashboard, isDark, onToggleTheme }) {
  const c = isDark ? DARK : LIGHT
  const [form,    setForm]    = useState({ name:'', org:'', email:'', type:'demo', msg:'' })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setSending(true); setError(null)
    try {
      await submitContact({
        name:    form.name,
        org:     form.org,
        email:   form.email,
        type:    form.type,
        message: form.msg,
      })
      setSent(true)
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const CHANNELS = [
    { icon:'📧', label:'Email Support',  val:'support@intentmirror.ai', sub:'Avg. response 2 hrs',  color:c.accent   },
    { icon:'💬', label:'Live Chat',       val:'Available on dashboard',  sub:'9 AM – 6 PM IST',     color:c.textMuted },
    { icon:'📞', label:'Schedule a Call', val:'+91 98765 43210',         sub:'Mon–Fri, 10 AM–5 PM', color:c.accent2  },
  ]

  const TYPES = [
    { key:'demo',       label:'Watch a Demo'       },
    { key:'pilot',      label:'Request a Pilot'    },
    { key:'enterprise', label:'Enterprise Inquiry'  },
    { key:'support',    label:'Technical Support'   },
  ]

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto page-in transition-colors duration-300"
      style={{ background:c.bg, color:c.text }}>

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4"
        style={{ background:c.headerBg, backdropFilter:'blur(16px)', borderBottom:`1px solid ${c.border}` }}>
        <div>
          <div className="text-xs font-bold tracking-widest mb-0.5" style={{ color:c.accent }}>CONTACT</div>
          <h1 className="text-xl font-bold" style={{ color:c.text }}>Get in Touch</h1>
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

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color:c.text }}>We'd love to hear from you.</h2>
          <p className="text-sm" style={{ color:c.textMuted }}>
            Whether you're a bank exploring behavioral AI, a developer with questions,
            or just curious — we're happy to talk.
          </p>
        </div>

        {/* Channels */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {CHANNELS.map((ch, i) => (
            <div key={i} className="p-5 rounded-2xl text-center hover:brightness-110 transition-all"
              style={{ background:c.card, border:`1px solid ${ch.color}30` }}>
              <div className="text-3xl mb-3">{ch.icon}</div>
              <div className="font-semibold text-sm mb-1" style={{ color:c.text }}>{ch.label}</div>
              <div className="text-xs font-medium mb-0.5" style={{ color:ch.color }}>{ch.val}</div>
              <div className="text-xs" style={{ color:c.textDim }}>{ch.sub}</div>
            </div>
          ))}
        </div>

        {/* Form / Success */}
        {sent ? (
          <div className="text-center p-14 rounded-2xl fade-in"
            style={{ background:c.card, border:`1px solid ${c.borderStrong}` }}>
            <div className="text-5xl mb-5">✅</div>
            <h3 className="text-2xl font-bold mb-3" style={{ color:c.text }}>Message sent!</h3>
            <p className="text-sm mb-6" style={{ color:c.textMuted }}>
              We'll get back to you at{' '}
              <span style={{ color:c.accent }}>{form.email}</span> within 2 hours.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={onEnterDashboard ?? onClose}
                className="px-6 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
                style={{ background:c.accent2, color:'#BDD1BD' }}>
                Open Dashboard →
              </button>
              <button onClick={onOpenDemo}
                className="px-6 py-2.5 rounded-full text-sm font-semibold"
                style={{ background:`${c.accent}18`, color:c.accent, border:`1px solid ${c.borderStrong}` }}>
                ▶ Watch Demo
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="p-8 rounded-2xl"
            style={{ background:c.card, border:`1px solid ${c.border}` }}>
            <h3 className="text-lg font-bold mb-6" style={{ color:c.text }}>Send us a message</h3>

            {/* Inquiry type */}
            <div className="mb-5">
              <label className="text-xs font-semibold mb-2 block" style={{ color:c.textDim }}>INQUIRY TYPE</label>
              <div className="flex gap-2 flex-wrap">
                {TYPES.map(tp => (
                  <button type="button" key={tp.key} onClick={() => set('type', tp.key)}
                    className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: form.type===tp.key ? c.accent2 : `${c.accent}12`,
                      color:      form.type===tp.key ? '#BDD1BD' : c.textMuted,
                      border:     `1px solid ${form.type===tp.key ? c.accent2 : c.border}`,
                    }}>
                    {tp.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { key:'name', placeholder:'Your name',         label:'NAME'         },
                { key:'org',  placeholder:'Bank / NBFC / Org', label:'ORGANISATION' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:c.textDim }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder} required={f.key === 'name'}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background:c.inputBg, color:c.text, border:`1px solid ${c.border}`, caretColor:c.accent }}
                  />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color:c.textDim }}>EMAIL *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@yourbank.com" required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:c.inputBg, color:c.text, border:`1px solid ${c.border}`, caretColor:c.accent }}
              />
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color:c.textDim }}>MESSAGE</label>
              <textarea rows={4} value={form.msg} onChange={e => set('msg', e.target.value)}
                placeholder="Tell us about your use case, user base size, or any questions…"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ background:c.inputBg, color:c.text, border:`1px solid ${c.border}`, caretColor:c.accent }}
              />
            </div>

            {error && (
              <div className="mb-4 text-xs px-3 py-2 rounded-xl"
                style={{ background:`${c.danger}15`, color:c.danger, border:`1px solid ${c.danger}30` }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={sending}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110 disabled:opacity-60"
              style={{ background:c.accent2, color:'#BDD1BD', boxShadow:`0 0 24px ${c.accent2}50` }}>
              {sending ? 'Sending…' : 'Send Message →'}
            </button>
          </form>
        )}

        {/* FAQ */}
        <div className="mt-10">
          <div className="text-xs font-bold mb-4" style={{ color:c.textDim }}>COMMON QUESTIONS</div>
          <div className="space-y-2">
            {[
              'How quickly can Intent Mirror integrate with existing systems?',
              'Is user data processed on-premise or in the cloud?',
              'Which SEBI regulations does the nudge framework comply with?',
              "Can nudge messages be customised to our bank's tone of voice?",
            ].map(q => (
              <div key={q} className="flex items-center gap-3 p-3 rounded-xl hover:brightness-110 transition-all"
                style={{ background:c.card, border:`1px solid ${c.border}` }}>
                <span style={{ color:c.accent }}>?</span>
                <span className="text-sm" style={{ color:c.textMuted }}>{q}</span>
                <span className="ml-auto" style={{ color:c.textDim }}>›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
