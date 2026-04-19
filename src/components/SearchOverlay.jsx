import { useApp } from '../App'
import { searchUsers } from '../api'
import { Spinner } from '../hooks/useApi'
import { USERS as LOCAL_USERS } from '../data/users'
import NudgeModal from './NudgeModal'
import { useState, useEffect, useRef } from 'react'

/* Local keyword search — mirrors server nlSearch() for offline fallback */
function localSearch(q) {
  const lq = q.toLowerCase().trim()
  if (!lq) return []
  return LOCAL_USERS.filter(u => {
    if (u.name.toLowerCase().includes(lq))       return true
    if (u.city.toLowerCase().includes(lq))       return true
    if (u.persona.toLowerCase().includes(lq))    return true
    if (u.prediction.toLowerCase().includes(lq)) return true
    if (lq.includes('churn')   && (u.prediction === 'Churn' || u.prediction === 'Withdraw')) return true
    if ((lq.includes('week')   || lq.includes('this week')) && u.daysLeft <= 7)              return true
    if (lq.includes('matur')   && u.daysLeft <= 30)                                          return true
    if (lq.includes('upgrade') && u.prediction === 'Upgrade')                                return true
    if (lq.includes('withdraw')&& u.prediction === 'Withdraw')                               return true
    if (lq.includes('renew')   && u.prediction === 'Renew')                                  return true
    if ((lq.includes('high risk') || lq.includes('>80')) && u.riskScore > 80)                return true
    if ((lq.includes('no login')  || lq.includes('inactive')) && u.signals.includes('no_login_30d')) return true
    if ((lq.includes('mutual fund') || lq.includes(' mf')) && u.signals.includes('mf_browse'))       return true
    if (lq.includes('exiter')  && u.persona === 'Exiter')     return true
    if (lq.includes('anxious') && u.persona === 'Anxious Saver') return true
    if (lq.includes('protector')&& u.persona === 'Protector') return true
    if (lq.includes('optimizer')&& u.persona === 'Optimizer') return true
    if (lq.includes('urgent')  && u.daysLeft <= 7)            return true
    return false
  }).sort((a, b) => b.riskScore - a.riskScore)
}

const PS = {
  'Protector':     { color:'#85B093', bg:'rgba(133,176,147,0.12)', border:'rgba(133,176,147,0.3)' },
  'Optimizer':     { color:'#568F7C', bg:'rgba(86,143,124,0.12)',  border:'rgba(86,143,124,0.3)'  },
  'Anxious Saver': { color:'#D4A853', bg:'rgba(212,168,83,0.12)',  border:'rgba(212,168,83,0.3)'  },
  'Exiter':        { color:'#E05A3A', bg:'rgba(224,90,58,0.12)',   border:'rgba(224,90,58,0.3)'   },
}

export default function SearchOverlay({ query, onClose }) {
  const { t, c } = useApp()
  const [results,   setResults]   = useState([])
  const [loading,   setLoading]   = useState(false)
  const [nudgeUser, setNudgeUser] = useState(null)
  const debounce = useRef(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    clearTimeout(debounce.current)
    setLoading(true)
    debounce.current = setTimeout(async () => {
      try {
        const res = await searchUsers(query)
        setResults(res.results)
      } catch {
        // Backend unreachable — fall back to local search
        setResults(localSearch(query).map(u => ({ ...u, nudgesSent: 0 })))
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(debounce.current)
  }, [query])

  return (
    <div className="px-6 py-4 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color:c.text }}>{t.searchTitle}</h2>
          <p className="text-sm mt-0.5" style={{ color:c.accent2 }}>
            {loading ? 'Searching…' : `${results.length} ${results.length===1?'user':'users'} matched "${query}"`}
          </p>
        </div>
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background:c.card, color:c.textDim, border:`1px solid ${c.border}` }}>
          {t.clearSearch}
        </button>
      </div>

      {loading ? <Spinner c={c} /> : results.length === 0 ? (
        <div className="rounded-xl px-6 py-10 text-center" style={{ background:c.card, border:`1px solid ${c.border}` }}>
          <div className="text-3xl mb-3">🔍</div>
          <div className="text-sm font-medium mb-1" style={{ color:c.textMuted }}>{t.searchNoResults}</div>
          <div className="text-xs" style={{ color:c.accent2 }}>{t.searchTip}</div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['churn risk','maturing this week','Mumbai','Exiter','upgrade ready'].map(s => (
              <span key={s} className="text-xs px-2 py-1 rounded-full cursor-pointer hover:brightness-110"
                style={{ background:`${c.accent}15`, color:c.accent, border:`1px solid ${c.border}` }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border:`1px solid ${c.border}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background:c.card, borderBottom:`1px solid ${c.border}` }}>
                {[t.colUser,t.colAmount,t.colDays,t.colPersona,t.colPrediction,t.colRisk,t.colAction].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold tracking-widest"
                    style={{ color:c.accent2 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((u, i) => {
                const ps = PS[u.persona] || PS['Protector']
                const pc = u.prediction==='Churn'?c.danger:u.prediction==='Withdraw'?c.warning:
                           u.prediction==='Upgrade'?c.accent:c.textMuted
                return (
                  <tr key={u.id}
                    style={{ background:i%2===0?c.rowEven:c.rowOdd, borderBottom:`1px solid ${c.border}` }}
                    className="hover:brightness-105 transition-all">
                    <td className="px-4 py-3">
                      <div className="font-medium" style={{ color:c.text }}>{u.name}</div>
                      <div className="text-xs" style={{ color:c.accent2 }}>{u.city}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color:c.textMuted }}>{u.fdAmount}</td>
                    <td className="px-4 py-3">
                      <span style={{ color:u.daysLeft<=7?c.danger:u.daysLeft<=14?c.warning:c.accent, fontWeight:600 }}>
                        {u.daysLeft}d
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background:ps.bg, color:ps.color, border:`1px solid ${ps.border}` }}>
                        {u.persona}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold" style={{ color:pc }}>{u.prediction}</span>
                    </td>
                    <td className="px-4 py-3 font-bold"
                      style={{ color:u.riskScore>75?c.danger:u.riskScore>50?c.warning:c.accent }}>
                      {u.riskScore}%
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setNudgeUser(u)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                        style={{ background:c.cardAlt, color:c.text, border:`1px solid ${c.borderStrong}` }}>
                        {t.sendNudge}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {nudgeUser && <NudgeModal user={nudgeUser} onClose={() => setNudgeUser(null)} />}
    </div>
  )
}
