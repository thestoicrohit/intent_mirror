import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  HOLDINGS, ACTIVITY, ASSET_CLASSES, EXPECTED_CAGR,
  computePortfolio, deriveMoneyPersona, fetchCryptoHoldings,
} from '../data/portfolio'
import { getCredential } from '../web3/credential'
import { generateSuggestions } from '../suggestions'
import { getPortfolio, verifyHolding as verifyHoldingApi } from '../familyApi'

// Persona colours match the palette already used in the Wealth Hub.
const PERSONA_META = {
  Optimizer:      { icon: '📊', tag: 'Return-chaser',  color: '#5B9ED6' },
  Protector:      { icon: '🛡', tag: 'Safety-first',    color: '#6ABFA0' },
  'Anxious Saver':{ icon: '😌', tag: 'Cautious watcher', color: '#D4A853' },
  Exiter:         { icon: '🚪', tag: 'Ready to move',   color: '#E05A3A' },
}

/** ₹ formatter → ₹3.8L / ₹1.2Cr */
function inr(v) {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)}L`
  return `₹${Math.round(v).toLocaleString('en-IN')}`
}

export default function MyMoney({ wallet, onOpenIdentity }) {
  const { c, isDark, t, lang } = useApp()
  const [holdings, setHoldings] = useState(HOLDINGS)

  // ── Verification: only verified holdings count toward net worth ──────────
  // The FD is bank-linked, so it starts verified; the user proves the rest.
  const VKEY = 'im_verified:' + (wallet?.address || 'anon')
  const [server, setServer]     = useState(null)   // backend portfolio (persona, suggestions, verified)
  const [verified, setVerified] = useState(() => {
    try { const r = localStorage.getItem(VKEY); return new Set(r ? JSON.parse(r) : ['fd']) }
    catch { return new Set(['fd']) }
  })
  const [verifying, setVerifying] = useState(null)

  // Backend is the source of truth for verification + persona + suggestions.
  // Falls back to local computation if the server is offline.
  useEffect(() => {
    let alive = true
    getPortfolio(wallet?.address, lang).then(d => {
      if (!alive || !d) return
      setServer(d)
      setVerified(new Set(d.verified))
      try { localStorage.setItem(VKEY, JSON.stringify(d.verified)) } catch { /* ignore */ }
    })
    return () => { alive = false }
  }, [wallet, lang])   // eslint-disable-line react-hooks/exhaustive-deps

  function doVerify(h) {
    setVerifying(h.id)
    setVerified(prev => {            // optimistic update
      const next = new Set(prev); next.add(h.id)
      try { localStorage.setItem(VKEY, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
    verifyHoldingApi(wallet?.address, h.id, lang).then(d => {
      if (d) { setServer(d); setVerified(new Set(d.verified)) }
      setVerifying(null)
    })
  }

  // simulate live crypto prices every 4s
  useEffect(() => {
    const tick = async () => {
      const fresh = await fetchCryptoHoldings(wallet?.address)
      setHoldings(prev => prev.map(h => fresh.find(f => f.id === h.id) || h))
    }
    const id = setInterval(tick, 4000)
    return () => clearInterval(id)
  }, [wallet])

  const pf            = computePortfolio(holdings)                            // everything
  const verifiedList  = holdings.filter(h => verified.has(h.id))
  const vpf           = computePortfolio(verifiedList.length ? verifiedList : holdings.slice(0, 1))
  const pending       = pf.netWorth - vpf.netWorth
  const clientPersona = deriveMoneyPersona(holdings)                          // behaviour uses all holdings
  const persona       = server?.persona || clientPersona                     // backend-computed when available
  const suggestions   = server?.suggestions || generateSuggestions({ pf, persona: clientPersona, holdings, activity: ACTIVITY }, lang)
  const pm            = PERSONA_META[persona.persona] || PERSONA_META.Protector
  const credential    = getCredential(wallet?.address)
  const allVerified   = pending <= 0

  const card = { background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, padding: 18 }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Net worth hero (verified) ──────────────────────── */}
      <div style={{
        ...card, padding: 22,
        background: `linear-gradient(135deg, ${c.card} 0%, ${isDark ? '#0E1F30' : '#B8CEC8'} 100%)`,
        display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, color: c.textDim, letterSpacing: 1, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            {t.money.verifiedNetWorth}
            <span style={{ color: c.positive }}>✓</span>
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1, marginTop: 4 }}>{inr(vpf.netWorth)}</div>
          <div style={{ fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ color: vpf.pnl >= 0 ? c.positive : c.danger, fontWeight: 700 }}>
              {vpf.pnl >= 0 ? '▲' : '▼'} {inr(Math.abs(vpf.pnl))} ({vpf.pnlPct.toFixed(1)}%)
            </span>
            <span style={{ color: c.textDim }}>{t.money.ofTotal(inr(pf.netWorth))}</span>
            {!allVerified && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: c.warning,
                background: `${c.warning}1f`, border: `1px solid ${c.warning}55`,
                borderRadius: 20, padding: '2px 9px',
              }}>{t.money.toVerify(inr(pending))}</span>
            )}
          </div>
        </div>

        {/* allocation donut (verified only) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 110, height: 110 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={vpf.allocation} dataKey="value" nameKey="name"
                     innerRadius={34} outerRadius={52} paddingAngle={2} stroke="none">
                  {vpf.allocation.map((a, i) => <Cell key={i} fill={a.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {vpf.allocation.map(a => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: a.color }} />
                <span style={{ color: c.textMuted, minWidth: 86 }}>{t.assetClass[a.name] || a.name}</span>
                <span style={{ fontWeight: 700 }}>{a.pct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18 }}>
        {/* ── Holdings (with verify) ───────────────────────── */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{t.money.holdings}</div>
          </div>
          {!allVerified && (
            <div style={{ fontSize: 11, color: c.textDim, marginBottom: 12 }}>{t.money.verifyHint}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {holdings.map(h => {
              const pnl = h.value - h.invested
              const pnlPct = (pnl / h.invested) * 100
              const isV = verified.has(h.id)
              const busy = verifying === h.id
              return (
                <div key={h.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 10px', borderRadius: 9,
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  opacity: isV ? 1 : 0.72,
                }}>
                  <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>
                    {ASSET_CLASSES[h.class]?.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{h.name}</div>
                    <div style={{ fontSize: 10, color: c.textDim, letterSpacing: 0.4 }}>
                      {h.symbol}{h.daysToMaturity != null ? ` · ${t.money.maturesIn(h.daysToMaturity)}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isV ? c.text : c.textDim }}>{inr(h.value)}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: pnl >= 0 ? c.positive : c.danger }}>
                      {pnl >= 0 ? '▲' : '▼'} {pnlPct.toFixed(1)}%
                      {h.change24h ? <span style={{ color: c.textDim, fontWeight: 500 }}> · 24h {h.change24h > 0 ? '+' : ''}{h.change24h}%</span> : null}
                    </div>
                  </div>
                  {/* verify control */}
                  <div style={{ width: 104, display: 'flex', justifyContent: 'flex-end' }}>
                    {isV ? (
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: c.positive, display: 'flex', alignItems: 'center', gap: 3 }}>
                        ✓ {t.money.verified}
                      </span>
                    ) : (
                      <button onClick={() => doVerify(h)} disabled={busy} style={{
                        fontSize: 10.5, fontWeight: 700, cursor: busy ? 'wait' : 'pointer',
                        padding: '5px 9px', borderRadius: 7,
                        background: `${c.accent}1f`, border: `1px solid ${c.accent}66`, color: c.accent,
                        whiteSpace: 'nowrap',
                      }}>
                        {busy ? t.money.verifying : (h.class === 'Crypto' ? `⛓ ${t.money.proveOnChain}` : t.money.verify)}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Money persona + identity ─────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ ...card, borderColor: pm.color + '55' }}>
            <div style={{ fontSize: 11, color: c.textDim, letterSpacing: 1, textTransform: 'uppercase' }}>
              {t.money.moneyPersona}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0' }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12, fontSize: 24,
                background: pm.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{pm.icon}</div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: pm.color }}>{persona.persona}</div>
                <div style={{ fontSize: 11, color: c.textDim }}>{t.personaTag[persona.persona]}</div>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.55, margin: 0 }}>{lang === 'HI' ? persona.whyHi : persona.why}</p>
          </div>

          {/* on-chain identity teaser */}
          <button onClick={onOpenIdentity} style={{
            ...card, textAlign: 'left', cursor: 'pointer', width: '100%',
            background: `linear-gradient(135deg, ${c.accent}1a 0%, ${c.card} 100%)`,
            borderColor: c.borderStrong,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, color: c.accent, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800 }}>
                ⬡ {t.money.onChainIdentity}
              </div>
              <span style={{ fontSize: 16, color: c.textDim }}>→</span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>
              {credential ? t.money.credLive : t.money.credMint}
            </div>
            <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 4, lineHeight: 1.5 }}>
              {credential ? t.money.credLiveBody : t.money.credMintBody}
            </div>
          </button>
        </div>
      </div>

      {/* ── Intent reading + suggestions ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* What you're about to do */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{t.money.aboutToDo}</div>
          <div style={{ fontSize: 11, color: c.textDim, marginBottom: 14 }}>
            {t.money.aboutToDoSub}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ACTIVITY.map(a => {
              const tone = a.weight === 'exit' ? c.danger : a.weight === 'grow' ? c.positive : c.warning
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: tone, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{lang === 'HI' ? a.labelHi : a.label}</span>
                  <span style={{ fontSize: 11, color: c.textDim, marginLeft: 'auto' }}>{lang === 'HI' ? a.detailHi : a.detail}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI suggestions */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            {t.money.suggestions}
            <span style={{
              fontSize: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 800, letterSpacing: 0.5,
              background: 'rgba(91,158,214,0.18)', color: '#5B9ED6',
            }}>AI</span>
          </div>
          <div style={{ fontSize: 11, color: c.textDim, marginBottom: 14 }}>
            {t.money.matchedTo(persona.persona)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{
                padding: '11px 12px', borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderLeft: `3px solid ${s.tone === 'warn' ? c.danger : s.tone === 'grow' ? c.positive : c.accent}`,
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 11.5, color: c.textMuted, lineHeight: 1.5 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Growth projector ─────────────────────────────────── */}
      <GrowProjector card={card} c={c} t={t} />
    </div>
  )
}

/* "What if you invested?" — compound-growth demo. */
function GrowProjector({ card, c, t }) {
  const [amount, setAmount]   = useState(10000)
  const [years, setYears]     = useState(10)
  const [klass, setKlass]     = useState('Mutual Fund')

  const cagr      = EXPECTED_CAGR[klass]
  const amt       = Number(amount) || 0
  const projected = Math.round(amt * Math.pow(1 + cagr, years))
  const mult      = amt > 0 ? (projected / amt).toFixed(1) : '0'

  const inrFull = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`
  const chip = (active) => ({
    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
    border: `1px solid ${active ? c.accent : c.border}`,
    background: active ? `${c.accent}1f` : 'transparent',
    color: active ? c.accent : c.textMuted,
  })

  return (
    <div style={card}>
      <div style={{ fontSize: 13, fontWeight: 800 }}>{t.money.growTitle}</div>
      <div style={{ fontSize: 11, color: c.textDim, marginBottom: 14 }}>{t.money.growSub}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18, alignItems: 'center' }}>
        {/* controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 10.5, color: c.textDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.money.amount}</label>
            <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} style={{
              width: '100%', marginTop: 5, background: c.inputBg, border: `1px solid ${c.border}`,
              borderRadius: 9, padding: '10px 12px', color: c.text, fontSize: 15, fontWeight: 700, outline: 'none',
            }} />
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {Object.keys(EXPECTED_CAGR).map(k => (
              <button key={k} onClick={() => setKlass(k)} style={chip(klass === k)}>
                {t.assetClass[k] || k} · {(EXPECTED_CAGR[k] * 100).toFixed(0)}%
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            {[5, 10, 20].map(y => (
              <button key={y} onClick={() => setYears(y)} style={chip(years === y)}>{y}y</button>
            ))}
          </div>
        </div>

        {/* result */}
        <div style={{
          textAlign: 'center', borderRadius: 12, padding: '18px 16px',
          background: `linear-gradient(135deg, ${c.accent}1a 0%, ${c.positive}14 100%)`,
          border: `1px solid ${c.border}`,
        }}>
          <div style={{ fontSize: 11, color: c.textMuted }}>
            {inrFull(amt)} {t.money.inAsset} {t.assetClass[klass] || klass} · {years}y
          </div>
          <div style={{ fontSize: 11, color: c.textDim, margin: '2px 0 6px' }}>{t.money.couldBecome}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: c.positive, lineHeight: 1.1 }}>{inrFull(projected)}</div>
          <div style={{
            display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 800, color: c.accent,
            background: `${c.accent}1f`, borderRadius: 20, padding: '3px 12px',
          }}>{t.money.multiplier(mult)}</div>
        </div>
      </div>

      <div style={{ fontSize: 10, color: c.textDim, marginTop: 12, fontStyle: 'italic' }}>{t.money.growDisclaimer}</div>
    </div>
  )
}
