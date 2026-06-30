/* ═══════════════════════════════════════════════
   Intent Mirror — Intent Credential (the ownership layer)
   ───────────────────────────────────────────────
   This is the part a database genuinely cannot replicate.

   Your behavioural profile — money persona, intent score, the
   signals behind it — is minted as a SOULBOUND credential that
   lives in YOUR wallet. It is non-transferable (you can't sell your
   reputation) and portable (any bank or app can REQUEST to read it,
   and you approve). The bank no longer owns the mirror. You do.

   Two paths, same UI (graceful fallback, like the rest of the app):
     • Backend configured with an issuer + Base Sepolia contract →
       the backend mints a REAL soulbound token; we show the live tx.
     • Otherwise → we mint locally with a real keccak256 hash so the
       demo runs with zero setup or testnet funds.
═══════════════════════════════════════════════ */

import { keccak256, toHex } from 'viem'

const STORE_PREFIX = 'im_credential:'

// Frontend only uses this to label the UI ("BASE SEPOLIA" vs "SIMULATED").
// The authoritative on-chain mint happens server-side via the issuer wallet.
const CONTRACT = import.meta.env?.VITE_CREDENTIAL_CONTRACT || null
export const ONCHAIN_ENABLED = Boolean(CONTRACT)

/** Deterministic, real keccak256 hash so the simulated "tx" behaves on-chain. */
function mockTxHash(address, profile) {
  const payload = `${address}|${profile.persona}|${profile.intentScore}|${Date.now()}`
  return keccak256(toHex(payload))
}

/**
 * Mint (or refresh) the holder's Intent Credential.
 * Tries the backend issuer first; falls back to a local simulated mint.
 * @param {string} address  wallet address of the holder
 * @param {object} profile  { persona, intentScore, confidence, signals, summary }
 */
export async function mintCredential(address, profile) {
  let onchain = false
  let txHash, contract, chain

  // 1. Try a real on-chain mint via the backend issuer wallet.
  try {
    const res = await fetch('/api/credential/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, profile }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.onchain) {
        onchain  = true
        txHash   = data.txHash
        contract = data.contract
        chain    = data.chain
      }
    }
  } catch {
    // backend down — fall through to simulation
  }

  // 2. Fall back to a local simulated mint.
  if (!onchain) {
    txHash   = mockTxHash(address, profile)
    contract = CONTRACT || '0x5192…501d'
    chain    = ONCHAIN_ENABLED ? 'Base Sepolia' : 'Base Sepolia (simulated)'
  }

  const credential = {
    standard: 'ERC-5192 (soulbound)',
    holder: address,
    persona: profile.persona,
    intentScore: profile.intentScore,
    confidence: profile.confidence ?? null,
    signals: profile.signals || [],
    summary: profile.summary || '',
    issuer: 'Intent Mirror',
    onchain,
    chain,
    contract,
    txHash,
    issuedAt: new Date().toISOString(),
    transferable: false,
  }
  localStorage.setItem(STORE_PREFIX + address, JSON.stringify(credential))
  return credential
}

/** Read the credential held by an address from local cache, or null. */
export function getCredential(address) {
  if (!address) return null
  const raw = localStorage.getItem(STORE_PREFIX + address)
  return raw ? JSON.parse(raw) : null
}
