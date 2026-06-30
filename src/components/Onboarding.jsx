import { useState } from 'react'
import { getOrCreateWallet, shortAddress } from '../web3/wallet'

/* ───────────────────────────────────────────────
   Onboarding — "Web3 without the friction"
   Email in → real wallet created silently → you're in.
   No MetaMask, no seed phrase, no gas. The whole point.
─────────────────────────────────────────────── */
export default function Onboarding({ onComplete, c, isDark, onToggleTheme }) {
  const [email, setEmail]   = useState('')
  const [stage, setStage]   = useState('idle')   // idle | creating | done
  const [wallet, setWallet] = useState(null)
  const [error, setError]   = useState('')

  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!valid) { setError('Enter a valid email'); return }
    setError(''); setStage('creating')
    // tiny pause so the "creating your wallet" moment is felt
    await new Promise(r => setTimeout(r, 1100))
    const w = getOrCreateWallet(email)
    setWallet(w); setStage('done')
    await new Promise(r => setTimeout(r, 1400))
    onComplete(w)
  }

  return (
    <div style={{
      minHeight: '100vh', background: c.bg, color: c.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient glow */}
      <div style={{
        position: 'absolute', width: 520, height: 520, borderRadius: '50%',
        background: `radial-gradient(circle, ${c.accent}22 0%, transparent 70%)`,
        top: '-10%', right: '-8%', pointerEvents: 'none',
      }} />

      <button onClick={onToggleTheme} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'transparent', border: `1px solid ${c.border}`,
        borderRadius: 8, width: 36, height: 36, cursor: 'pointer', fontSize: 15,
      }}>{isDark ? '☀️' : '🌙'}</button>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        {/* brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11,
            background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#fff', fontWeight: 800,
          }}>⬡</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.2 }}>Intent Mirror</div>
            <div style={{ fontSize: 11, color: c.textDim, letterSpacing: 1, textTransform: 'uppercase' }}>
              Your money, your mirror
            </div>
          </div>
        </div>

        {stage !== 'done' && (
          <>
            <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, margin: '0 0 10px' }}>
              See what you're about to do<br/>with your money — before you do it.
            </h1>
            <p style={{ color: c.textMuted, fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>
              Track crypto, stocks, mutual funds and your FD in one place.
              Get suggestions matched to how <em>you</em> behave with money — and
              own your financial profile, not the bank.
            </p>

            <form onSubmit={handleSubmit}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: c.textDim, textTransform: 'uppercase' }}>
                Continue with email
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  type="email" value={email} placeholder="you@example.com"
                  onChange={e => setEmail(e.target.value)}
                  disabled={stage === 'creating'}
                  style={{
                    flex: 1, background: c.inputBg, border: `1px solid ${c.border}`,
                    borderRadius: 10, padding: '13px 14px', color: c.text, fontSize: 14, outline: 'none',
                  }}
                />
                <button type="submit" disabled={stage === 'creating'} style={{
                  background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`,
                  border: 'none', borderRadius: 10, padding: '0 20px',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: stage === 'creating' ? 'wait' : 'pointer', whiteSpace: 'nowrap',
                }}>
                  {stage === 'creating' ? 'Creating…' : 'Get started →'}
                </button>
              </div>
              {error && <div style={{ color: c.danger, fontSize: 12, marginTop: 8 }}>{error}</div>}
            </form>

            <div style={{
              marginTop: 18, padding: 14, borderRadius: 10,
              background: isDark ? 'rgba(86,143,124,0.08)' : 'rgba(33,80,82,0.08)',
              border: `1px solid ${c.border}`, fontSize: 12, color: c.textMuted, lineHeight: 1.6,
            }}>
              🔐 A secure wallet is created for you automatically.
              <strong style={{ color: c.text }}> No MetaMask, no seed phrase, no crypto to buy.</strong> It just works.
            </div>

            {stage === 'creating' && (
              <div style={{ marginTop: 16, fontSize: 13, color: c.accent, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="im-spin" style={{
                  width: 14, height: 14, border: `2px solid ${c.border}`,
                  borderTopColor: c.accent, borderRadius: '50%', display: 'inline-block',
                }} />
                Creating your wallet on Base…
              </div>
            )}
          </>
        )}

        {stage === 'done' && wallet && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 46, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Your wallet is ready</h2>
            <p style={{ color: c.textMuted, fontSize: 14, margin: '0 0 18px' }}>
              You now own a wallet — and the financial profile we build for you.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: c.card, border: `1px solid ${c.borderStrong}`,
              borderRadius: 12, padding: '12px 18px',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`,
              }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: c.textDim }}>{wallet.email}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace' }}>
                  {shortAddress(wallet.address)}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 18, fontSize: 13, color: c.textDim }}>Taking you in…</div>
          </div>
        )}
      </div>

      <style>{`
        .im-spin { animation: im-spin 0.8s linear infinite; }
        @keyframes im-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
