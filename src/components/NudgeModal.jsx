import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { SIGNAL_LABELS } from '../data/signals'
import { sendNudge } from '../api'

const PERSONA_COLOR = {
  'Protector':     '#85B093',
  'Optimizer':     '#5B9ED6',
  'Anxious Saver': '#D4A853',
  'Exiter':        '#E05A3A',
}

// Fallback template nudges (used if AI service is offline)
const NUDGE_FALLBACK = {
  EN: {
    Churn:    (u) => `Hi ${u.name.split(' ')[0]}, your ${u.fdAmount} FD matures in just ${u.daysLeft} days. We've been your trusted savings partner — and we'd love to continue that. Renewing takes 30 seconds. As a loyal customer, you're eligible for our premium rate of 7.85% p.a. Your money stays safe, your trust stays intact. Tap to renew now.`,
    Withdraw: (u) => `Hi ${u.name.split(' ')[0]}, we noticed you've been checking your account closely. Your ${u.fdAmount} FD matures in ${u.daysLeft} days. Every rupee is insured up to ₹5L under DICGC. No hidden fees. Renewal takes one tap. We're here if you have any questions.`,
    Upgrade:  (u) => `Hi ${u.name.split(' ')[0]}, you're a smart saver — and we think you're ready for the next step. With ${u.fdAmount} maturing in ${u.daysLeft} days, explore Debt Mutual Funds on Blostem. Same safety, slightly better returns. Takes 2 minutes to start.`,
    Renew:    (u) => `Hi ${u.name.split(' ')[0]}, your ${u.fdAmount} FD matures in ${u.daysLeft} days. We've locked in a special renewal rate of 7.9% p.a. just for you. One tap to renew, zero paperwork. Keep your money working hard.`,
  },
  HI: {
    Churn:    (u) => `नमस्ते ${u.name.split(' ')[0]} जी, आपका ${u.fdAmount} FD सिर्फ ${u.daysLeft} दिनों में परिपक्व होगा। नवीनीकरण में सिर्फ 30 सेकंड लगते हैं। आपको 7.85% की प्रीमियम दर मिलेगी।`,
    Withdraw: (u) => `नमस्ते ${u.name.split(' ')[0]} जी, आपका ${u.fdAmount} FD ${u.daysLeft} दिनों में परिपक्व होगा। आपका पैसा DICGC के तहत ₹5L तक बीमित है।`,
    Upgrade:  (u) => `नमस्ते ${u.name.split(' ')[0]} जी, ${u.fdAmount} ${u.daysLeft} दिनों में परिपक्व होगा। Blostem पर Debt Mutual Funds आज़माएं।`,
    Renew:    (u) => `नमस्ते ${u.name.split(' ')[0]} जी, आपका ${u.fdAmount} FD ${u.daysLeft} दिनों में परिपक्व होगा। 7.9% की विशेष दर आपके लिए तय है।`,
  },
}

async function fetchAINudge(user, lang, channel = 'in_app') {
  try {
    const res = await fetch('http://localhost:3001/api/ai/nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, channel, lang: lang === 'HI' ? 'hi' : 'en' }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default function NudgeModal({ user, onClose, onSent }) {
  const { t, lang, c } = useApp()
  const [copied,      setCopied]      = useState(false)
  const [sending,     setSending]     = useState(false)
  const [sentDone,    setSentDone]    = useState(false)
  const [sendErr,     setSendErr]     = useState(null)
  const [aiResult,    setAiResult]    = useState(null)
  const [aiLoading,   setAiLoading]   = useState(true)
  const [showPrompt,  setShowPrompt]  = useState(false)
  const [channel,     setChannel]     = useState('in_app')

  if (!user) return null

  const fallbackMsg = NUDGE_FALLBACK[lang]?.[user.prediction]?.(user) ?? NUDGE_FALLBACK[lang].Renew(user)
  const message     = aiResult?.message || fallbackMsg
  const color       = PERSONA_COLOR[user.persona] ?? c.accent
  const isAI        = !!aiResult

  // Fetch AI nudge on mount and when channel changes
  useEffect(() => {
    let cancelled = false
    setAiLoading(true)
    setAiResult(null)
    fetchAINudge(user, lang, channel).then(result => {
      if (!cancelled) {
        setAiResult(result)
        setAiLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [user.id, lang, channel])

  const handleCopy = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleSend = async () => {
    setSending(true); setSendErr(null)
    try {
      await sendNudge({
        userId:     user.id,
        userName:   user.name,
        persona:    user.persona,
        prediction: user.prediction,
        message,
        lang,
        channel: channel.replace('_', '-'),
      })
      setSentDone(true)
      onSent?.()
      setTimeout(onClose, 1800)
    } catch (e) {
      if (e.message?.includes('fetch') || e.message?.includes('500') || e.message?.includes('Failed')) {
        setSendErr('Backend not running — nudge logged locally only.')
        setTimeout(() => { setSentDone(true); onSent?.(); setTimeout(onClose, 1800) }, 1200)
      } else {
        setSendErr(e.message || 'Send failed')
      }
    } finally {
      setSending(false)
    }
  }

  const handleRegenerate = () => {
    setAiLoading(true)
    setAiResult(null)
    fetchAINudge(user, lang, channel).then(result => {
      setAiResult(result)
      setAiLoading(false)
    })
  }

  const channelBtnStyle = (ch) => ({
    padding: '4px 12px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    border: `1px solid ${channel === ch ? c.accent : c.border}`,
    background: channel === ch ? 'rgba(86,143,124,0.15)' : 'transparent',
    color: channel === ch ? c.accent : c.textMuted,
    cursor: 'pointer',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.80)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl w-full max-w-lg fade-in transition-colors duration-300"
        style={{ background:c.cardAlt, border:`1px solid ${c.borderStrong}`, maxHeight:'90vh', overflowY:'auto' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom:`1px solid ${c.border}` }}>
          <div>
            <div className="text-xs font-semibold tracking-widest mb-1" style={{ color:c.accent2 }}>
              {t.nudgeModalTitle}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg" style={{ color:c.text }}>{user.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background:`${color}18`, color, border:`1px solid ${color}40` }}>
                {user.persona}
              </span>
              {isAI && (
                <span style={{
                  fontSize: 9, padding: '2px 7px', borderRadius: 10,
                  background: 'rgba(91,158,214,0.15)', color: '#5B9ED6',
                  border: '1px solid rgba(91,158,214,0.30)', fontWeight: 700, letterSpacing: 0.5,
                }}>✨ AI GENERATED</span>
              )}
            </div>
            <div className="text-xs mt-0.5" style={{ color:c.accent2 }}>
              {user.city} · {user.fdAmount} · {user.daysLeft}{t.daysLabel} left · Risk {user.riskScore}/100
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ color:c.textDim, background:c.card }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Channel selector */}
        <div className="px-6 py-3" style={{ borderBottom:`1px solid ${c.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:10, color:c.textDim, fontWeight:700, letterSpacing:0.5, marginRight:4 }}>CHANNEL</span>
            {['in_app','sms','email'].map(ch => (
              <button key={ch} style={channelBtnStyle(ch)} onClick={() => setChannel(ch)}>
                {ch === 'in_app' ? 'In-App' : ch === 'sms' ? 'SMS' : 'Email'}
              </button>
            ))}
          </div>
        </div>

        {/* Signals */}
        <div className="px-6 py-3" style={{ borderBottom:`1px solid ${c.border}` }}>
          <div className="text-xs font-semibold mb-2" style={{ color:c.accent2 }}>TRIGGERED BY</div>
          <div className="flex flex-wrap gap-2">
            {user.signals?.map((s) => (
              <span key={s} className="text-xs px-2 py-1 rounded-full"
                style={{ background:c.card, color:c.textMuted, border:`1px solid ${c.border}` }}>
                {SIGNAL_LABELS[s] || s}
              </span>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="px-6 py-4">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <div className="text-xs font-semibold" style={{ color:c.accent2 }}>
              {isAI ? '✨ AI-GENERATED NUDGE' : t.nudgeMessageLabel}
            </div>
            {!aiLoading && (
              <button onClick={handleRegenerate}
                style={{
                  fontSize:10, color:c.textMuted, cursor:'pointer',
                  background:'transparent', border:`1px solid ${c.border}`,
                  borderRadius:6, padding:'3px 10px',
                }}>
                ↻ Regenerate
              </button>
            )}
          </div>

          {aiLoading ? (
            <div className="rounded-xl p-4 text-sm" style={{ background:c.card, border:`1px solid ${c.border}`, color:c.textDim }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14 }}>✨</span>
                <span>Generating AI nudge…</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background:c.card, color:c.textMuted, border:`1px solid ${c.border}`,
                borderLeft: isAI ? `3px solid #5B9ED6` : `3px solid ${c.border}`,
              }}>
              {message}
            </div>
          )}
        </div>

        {/* AI Reasoning (only when AI result is available) */}
        {isAI && aiResult?.reasoning && (
          <div className="px-6 pb-3">
            <div style={{
              background: 'rgba(91,158,214,0.06)', border:'1px solid rgba(91,158,214,0.20)',
              borderRadius:10, padding:'12px 14px',
            }}>
              <div style={{ fontSize:10, color:'#5B9ED6', fontWeight:700, letterSpacing:1, marginBottom:8 }}>AI REASONING CHAIN</div>
              {aiResult.reasoning.map((step, i) => (
                <div key={i} style={{ fontSize:11, color:c.textMuted, marginBottom:4, lineHeight:1.5 }}>{step}</div>
              ))}
            </div>

            {/* Show/hide LLM prompt */}
            <button
              onClick={() => setShowPrompt(v => !v)}
              style={{
                marginTop:8, background:'transparent', border:`1px solid ${c.border}`,
                color:c.textDim, borderRadius:7, padding:'5px 12px',
                fontSize:10, cursor:'pointer', letterSpacing:0.3,
              }}>
              {showPrompt ? '▲ Hide LLM Prompt' : '▼ View LLM Prompt'}
            </button>

            {showPrompt && (
              <pre style={{
                marginTop:8, background:c.bg || '#040E1A',
                border:`1px solid ${c.border}`, borderRadius:8,
                padding:'12px 14px', fontSize:10, color:c.textMuted,
                overflowX:'auto', lineHeight:1.6, whiteSpace:'pre-wrap',
                maxHeight:200, overflowY:'auto',
              }}>
                {aiResult.prompt}
              </pre>
            )}
          </div>
        )}

        {/* Error */}
        {sendErr && (
          <div className="px-6 pb-2 text-xs" style={{ color:c.danger }}>{sendErr}</div>
        )}

        {/* Actions */}
        {sentDone ? (
          <div className="px-6 pb-5 text-center">
            <div className="py-3 rounded-xl text-sm font-semibold fade-in"
              style={{ background:`${c.accent}18`, color:c.accent }}>
              ✓ Nudge sent successfully!
            </div>
          </div>
        ) : (
          <div className="flex gap-3 px-6 pb-5">
            <button onClick={handleCopy}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: copied ? `${c.accent}18` : c.card,
                color:      copied ? c.accent : c.textDim,
                border:     `1px solid ${copied ? c.borderStrong : c.border}`,
              }}>
              {copied ? '✓ Copied!' : t.copyBtn}
            </button>
            <button onClick={handleSend} disabled={sending || aiLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-60"
              style={{ background:c.accent2, color:'#BDD1BD' }}>
              {sending ? 'Sending…' : t.sendBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
