import { useState } from 'react'
import { useApp } from '../App'
import Logo from './Logo'

export default function Header({ onSearch, searchQuery, onClearSearch, onHome }) {
  const { lang, setLang, t, c, isDark, setIsDark } = useApp()
  const [focused, setFocused] = useState(false)

  return (
    <header className="flex items-center gap-4 px-6 py-3 sticky top-0 z-50 transition-colors duration-300"
      style={{ background: c.headerBg, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${c.border}` }}>

      {/* Brand */}
      <button onClick={onHome} className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity">
        <Logo size={30} />
        <div>
          <div className="font-bold text-sm tracking-wide leading-none" style={{ color: c.text }}>
            {t.appName}
          </div>
          <div className="text-xs tracking-widest" style={{ color: c.accent2, fontSize: 8 }}>
            {t.version}
          </div>
        </div>
      </button>

      {/* Search bar */}
      <div className="flex-1 relative">
        <div className="flex items-center rounded-xl px-4 py-2 gap-3 transition-all"
          style={{
            background: c.inputBg,
            border: focused ? `1px solid ${c.accent}` : `1px solid ${c.border}`,
          }}>
          <svg className="w-4 h-4 shrink-0" style={{ color: c.accent2 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t.searchPlaceholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:truncate"
            style={{ color: c.text, caretColor: c.accent }}
          />
          {searchQuery && (
            <button onClick={onClearSearch} style={{ color: c.accent2 }} className="hover:opacity-70 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Language toggle */}
      <div className="flex items-center rounded-xl overflow-hidden shrink-0"
        style={{ border: `1px solid ${c.border}` }}>
        {['EN', 'HI'].map((l) => (
          <button key={l} onClick={() => setLang(l)}
            className="px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              background: lang === l ? c.accent2 : 'transparent',
              color:      lang === l ? c.text    : c.textDim,
            }}>
            {l === 'EN' ? 'EN' : 'हिंदी'}
          </button>
        ))}
      </div>

      {/* Theme toggle */}
      <button onClick={() => setIsDark(d => !d)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0"
        style={{ background: `${c.accent}18`, color: c.accent, border: `1px solid ${c.borderStrong}` }}
        title="Toggle dark/light mode">
        {isDark ? '☀' : '🌙'}
      </button>

      {/* LIVE badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 text-xs font-semibold"
        style={{ background: `${c.accent}18`, color: c.accent, border: `1px solid ${c.borderStrong}` }}>
        <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: c.accent }} />
        {t.live}
      </div>
    </header>
  )
}
