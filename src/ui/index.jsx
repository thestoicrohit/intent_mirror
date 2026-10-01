/* Shared UI primitives — one place for the look of cards, chips, buttons. */

// Up/down/gold are live bindings: setTone() swaps them per theme so numbers stay readable
// on both the dark glass cards and the pale light cards.
export let UP = '#4ADE9B'
export let DOWN = '#FF6B7A'
export let GOLD = '#F5B83D'
export function setTone(isDark) {
  UP = isDark ? '#4ADE9B' : '#0B7D4E'
  DOWN = isDark ? '#FF6B7A' : '#B8323F'
  GOLD = isDark ? '#F5B83D' : '#92650F'
}

export function Card({ c, children, style, className = '' }) {
  return (
    <div className={className} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, padding: 16, ...style }}>
      {children}
    </div>
  )
}

export function SectionTitle({ c, children, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: c.textDim, textTransform: 'uppercase' }}>{children}</div>
      {right}
    </div>
  )
}

/** Pill-style toggle chip. */
export const chipStyle = (c, active, col = c.accent) => ({
  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
  background: active ? `${col}22` : 'transparent', color: active ? col : c.textDim,
  border: `1px solid ${active ? col : c.border}`, transition: 'all .15s',
})

/** Button: outline by default, filled with `solid`. */
export const btnStyle = (col, solid = false, disabled = false) => ({
  padding: '10px 16px', borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
  background: solid ? col : `${col}18`, color: solid ? '#06101C' : col, border: `1px solid ${col}${solid ? '' : '60'}`,
  opacity: disabled ? 0.45 : 1,
})

/** Burst of emoji confetti; mount it (with a changing `key`) to replay. */
export function Confetti({ emojis = ['🎉', '✨', '🪙', '🚀', '💎'], n = 14 }) {
  return (
    <div className="confetti" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} style={{ left: `${(i * 97) % 100}%`, animationDelay: `${(i % 5) * 0.08}s` }}>{emojis[i % emojis.length]}</span>
      ))}
    </div>
  )
}
