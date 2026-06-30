/* ═══════════════════════════════════════════════
   Intent Mirror — Embedded Wallet
   ───────────────────────────────────────────────
   "Web3 without the friction."

   A bank/finance newcomer logs in with their email — and a real
   wallet is created for them silently, in-browser, via viem. No
   MetaMask, no seed phrase to write down, no gas to buy.

   For a hackathon demo this is perfect: it works fully offline and
   needs zero external accounts. For production you swap this module
   for an embedded-wallet provider (Privy / Web3Auth) that adds
   key recovery + social login on top of the same idea — the rest
   of the app does not change.

   NOTE: the private key lives in localStorage. That is fine for a
   testnet demo; a production build must move key custody to the
   provider above (the user never holds raw key material).
═══════════════════════════════════════════════ */

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

const KEY_PREFIX = 'im_wallet:'
const ACTIVE_KEY = 'im_wallet:active'

function storageKey(email) {
  return KEY_PREFIX + email.trim().toLowerCase()
}

/** Short, friendly form of an address: 0x1234… abcd */
export function shortAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

/**
 * Get the wallet for an email, creating one on first login.
 * Returns { email, address, createdAt } — never exposes the key.
 */
export function getOrCreateWallet(email) {
  const k = storageKey(email)
  const existing = localStorage.getItem(k)
  if (existing) {
    const w = JSON.parse(existing)
    localStorage.setItem(ACTIVE_KEY, email.trim().toLowerCase())
    return publicView(w)
  }

  // First time — silently create a real wallet
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)
  const wallet = {
    email: email.trim().toLowerCase(),
    address: account.address,
    privateKey,                 // demo-only; see note at top of file
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(k, JSON.stringify(wallet))
  localStorage.setItem(ACTIVE_KEY, wallet.email)
  return publicView(wallet)
}

/** The currently signed-in wallet, or null. */
export function getActiveWallet() {
  const email = localStorage.getItem(ACTIVE_KEY)
  if (!email) return null
  const raw = localStorage.getItem(storageKey(email))
  if (!raw) return null
  return publicView(JSON.parse(raw))
}

/** Sign out (keeps the wallet stored so the user can return). */
export function signOut() {
  localStorage.removeItem(ACTIVE_KEY)
}

function publicView(w) {
  return { email: w.email, address: w.address, createdAt: w.createdAt }
}
