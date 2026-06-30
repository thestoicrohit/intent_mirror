import { useState } from 'react'
import { useApp } from '../App'
import { shortAddress } from '../web3/wallet'
import { mintCredential, getCredential, ONCHAIN_ENABLED } from '../web3/credential'
import { HOLDINGS, ACTIVITY, computePortfolio, deriveMoneyPersona, deriveSignals } from '../data/portfolio'

/** Build the profile that gets sealed into the credential. */
function buildProfile() {
  const pf      = computePortfolio(HOLDINGS)
  const persona = deriveMoneyPersona(HOLDINGS)
  const signals = deriveSignals(HOLDINGS)
  const exiting = ACTIVITY.some(a => a.weight === 'exit')
  // Intent score = likelihood you make a money move soon (0–100)
  const intentScore = Math.min(100, Math.round(
    (exiting ? 45 : 15) + persona.cryptoPct * 0.4 + ACTIVITY.length * 4
  ))
  return {
    persona: persona.persona,
    intentScore,
    confidence: 0.87,
    signals,
    summary: persona.why,
  }
}

export default function IdentityCard({ wallet }) {
  const { c, isDark, t } = useApp()
  const ti = t.identity
  const [credential, setCredential] = useState(() => getCredential(wallet?.address))
  const [minting, setMinting] = useState(false)

  async function handleMint() {
    setMinting(true)
    await new Promise(r => setTimeout(r, 1300))   // feel the on-chain write
    const cred = await mintCredential(wallet.address, buildProfile())
    setCredential(cred)
    setMinting(false)
  }

  const card = { background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20 }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{ti.title}</h2>
        <p style={{ fontSize: 13.5, color: c.textMuted, lineHeight: 1.6, margin: '6px 0 0' }}>{ti.intro}</p>
      </div>

      {/* Wallet strip */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})` }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: c.textDim }}>{wallet?.email}</div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace' }}>{shortAddress(wallet?.address)}</div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 0.5, padding: '5px 10px', borderRadius: 6,
          background: `${c.positive}22`, color: c.positive,
        }}>
          {ONCHAIN_ENABLED ? ti.baseSepolia : ti.testnetSim}
        </div>
      </div>

      {/* The credential */}
      {!credential ? (
        <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>⬡</div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{ti.mintHeadline}</div>
          <p style={{ fontSize: 13, color: c.textMuted, maxWidth: 460, margin: '8px auto 20px', lineHeight: 1.6 }}>
            {ti.mintBody}
          </p>
          <button onClick={handleMint} disabled={minting} style={{
            background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`,
            border: 'none', borderRadius: 10, padding: '13px 26px',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: minting ? 'wait' : 'pointer',
          }}>
            {minting ? ti.minting : ti.mintBtn}
          </button>
        </div>
      ) : (
        <div style={{
          ...card, padding: 0, overflow: 'hidden',
          border: `1px solid ${c.borderStrong}`,
        }}>
          {/* credential header */}
          <div style={{
            padding: 20,
            background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`,
            color: '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.85, textTransform: 'uppercase' }}>
                  {ti.soulbound}
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{credential.persona}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, opacity: 0.85 }}>{ti.intentScore}</div>
                <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{credential.intentScore}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, opacity: 0.92, marginTop: 12, lineHeight: 1.5 }}>{credential.summary}</div>
          </div>

          {/* credential body */}
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Row c={c} label={ti.holder}       value={shortAddress(credential.holder)} mono />
            <Row c={c} label={ti.standard}     value={credential.standard} />
            <Row c={c} label={ti.transferable} value={credential.transferable ? 'Yes' : ti.transferableNo} />
            <Row c={c} label={ti.issuer}       value={credential.issuer} />
            <Row c={c} label={ti.chain}        value={credential.chain} />
            <Row c={c} label={ti.txHash}       value={shortAddress(credential.txHash)} mono />
            <Row c={c} label={ti.issued}       value={new Date(credential.issuedAt).toLocaleString('en-IN')} />

            <div>
              <div style={{ fontSize: 11, color: c.textDim, marginBottom: 6 }}>{ti.signalsSealed}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {credential.signals.map(s => (
                  <span key={s} style={{
                    fontSize: 11, padding: '3px 9px', borderRadius: 20,
                    background: isDark ? 'rgba(86,143,124,0.14)' : 'rgba(33,80,82,0.1)',
                    border: `1px solid ${c.border}`, color: c.textMuted,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* who can read it */}
          <div style={{
            padding: 16, borderTop: `1px solid ${c.border}`,
            background: isDark ? 'rgba(86,143,124,0.06)' : 'rgba(33,80,82,0.06)',
            fontSize: 12, color: c.textMuted, lineHeight: 1.6,
          }}>
            🔓 {ti.controlNote}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ c, label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
      <span style={{ color: c.textDim }}>{label}</span>
      <span style={{ fontWeight: 700, fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
  )
}
