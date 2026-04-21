/**
 * Intent Mirror — Wealth Hub
 * Turns FD maturities into wealth-building opportunities.
 * Features: Live NSE/BSE stocks, Mutual Funds, Insurance products,
 * Financial Literacy, Customer Upgrade Map.
 */
import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { useApp } from '../App'
import { USERS } from '../data/users'

/* ─── Mock NSE/BSE stock data ────────────────────────────────────────── */
const BASE_STOCKS = [
  { symbol:'RELIANCE', name:'Reliance Industries', price:2847.50, change:+23.40, pct:+0.83, sector:'Energy',     mktCap:'₹19.2L Cr', volume:'4.2M' },
  { symbol:'TCS',      name:'Tata Consultancy',    price:3912.80, change:-18.60, pct:-0.47, sector:'IT',         mktCap:'₹14.1L Cr', volume:'1.8M' },
  { symbol:'HDFCBANK', name:'HDFC Bank',           price:1623.45, change:+12.75, pct:+0.79, sector:'Banking',    mktCap:'₹12.3L Cr', volume:'6.1M' },
  { symbol:'INFY',     name:'Infosys',             price:1478.20, change:-8.30,  pct:-0.56, sector:'IT',         mktCap:'₹6.1L Cr',  volume:'3.4M' },
  { symbol:'ICICIBANK',name:'ICICI Bank',          price:1198.60, change:+9.85,  pct:+0.83, sector:'Banking',    mktCap:'₹8.4L Cr',  volume:'5.2M' },
  { symbol:'SBIN',     name:'State Bank of India', price:812.30,  change:-4.20,  pct:-0.51, sector:'Banking',    mktCap:'₹7.2L Cr',  volume:'8.9M' },
  { symbol:'BAJFINANCE',name:'Bajaj Finance',      price:7234.50, change:+84.30, pct:+1.18, sector:'NBFC',       mktCap:'₹4.3L Cr',  volume:'0.9M' },
  { symbol:'WIPRO',    name:'Wipro Ltd',           price:487.60,  change:-3.40,  pct:-0.69, sector:'IT',         mktCap:'₹2.5L Cr',  volume:'4.8M' },
  { symbol:'ASIANPAINT',name:'Asian Paints',       price:2987.40, change:+18.90, pct:+0.64, sector:'Consumer',   mktCap:'₹2.8L Cr',  volume:'0.7M' },
  { symbol:'MARUTI',   name:'Maruti Suzuki',       price:11240.00,change:+156.00,pct:+1.41, sector:'Auto',       mktCap:'₹3.4L Cr',  volume:'0.4M' },
  { symbol:'LTIM',     name:'LTIMindtree',         price:5678.90, change:-42.10, pct:-0.74, sector:'IT',         mktCap:'₹1.7L Cr',  volume:'0.6M' },
  { symbol:'AXISBANK', name:'Axis Bank',           price:1089.70, change:+7.60,  pct:+0.70, sector:'Banking',    mktCap:'₹3.3L Cr',  volume:'4.1M' },
]

/* ─── Mutual Funds ───────────────────────────────────────────────────── */
const MUTUAL_FUNDS = [
  { name:'Mirae Asset Large Cap Fund', category:'Large Cap', returns1y:'+18.4%', returns3y:'+14.2%', risk:'Low-Medium', minSIP:'₹500',  rating:5, color:'#6ABFA0', tag:'Most Popular', personas:['Protector','Anxious Saver'] },
  { name:'Parag Parikh Flexi Cap',     category:'Flexi Cap', returns1y:'+22.1%', returns3y:'+16.8%', risk:'Medium',     minSIP:'₹1,000',rating:5, color:'#5B9ED6', tag:'Top Rated',   personas:['Optimizer','Exiter'] },
  { name:'Axis Long Term Equity (ELSS)',category:'ELSS',     returns1y:'+19.7%', returns3y:'+15.1%', risk:'Medium',     minSIP:'₹500',  rating:4, color:'#9B8FD6', tag:'Tax Saver',   personas:['Optimizer','Protector'] },
  { name:'SBI Bluechip Fund',          category:'Large Cap', returns1y:'+16.8%', returns3y:'+12.9%', risk:'Low',        minSIP:'₹500',  rating:4, color:'#D4A535', tag:'Safe Choice', personas:['Protector','Anxious Saver'] },
  { name:'HDFC Mid-Cap Opportunities', category:'Mid Cap',   returns1y:'+31.2%', returns3y:'+19.4%', risk:'High',       minSIP:'₹1,000',rating:5, color:'#E05A3A', tag:'High Returns',personas:['Optimizer','Exiter'] },
  { name:'Nippon India Liquid Fund',   category:'Liquid',    returns1y:'+7.2%',  returns3y:'+6.8%',  risk:'Very Low',   minSIP:'₹100',  rating:4, color:'#56C4C4', tag:'FD Alternative',personas:['Anxious Saver','Protector'] },
]

/* ─── Insurance / Protection Products ───────────────────────────────── */
const INSURANCE = [
  {
    name:'LIC Jeevan Anand',     type:'Life Insurance', provider:'LIC',
    premium:'₹8,000/yr',        cover:'₹25L',          tenure:'21 yrs',
    highlight:'Endowment + Bonus', color:'#6ABFA0',      icon:'🛡️',
    tag:'Best Seller', desc:'Guaranteed returns + life cover. Perfect for risk-averse savers.',
    personas:['Protector','Anxious Saver'],
  },
  {
    name:'HDFC Click 2 Protect', type:'Term Insurance', provider:'HDFC Life',
    premium:'₹12,000/yr',       cover:'₹1 Cr',         tenure:'30 yrs',
    highlight:'Pure Protection', color:'#5B9ED6',        icon:'💙',
    tag:'Best Value', desc:'Maximum life cover at lowest cost. Pure term with claim settlement 99.4%.',
    personas:['Optimizer','Exiter'],
  },
  {
    name:'Star Health Comprehensive', type:'Health Insurance', provider:'Star Health',
    premium:'₹14,500/yr',       cover:'₹10L',          tenure:'1 yr',
    highlight:'Cashless hospitals', color:'#E05A3A',      icon:'❤️',
    tag:'Top Rated', desc:'5,900+ cashless hospitals. No claim bonus up to 50%. Family floater available.',
    personas:['Protector','Anxious Saver','Optimizer'],
  },
  {
    name:'Bajaj Allianz Gold SIP',   type:'Gold Bond',      provider:'Bajaj Allianz',
    premium:'₹500/mo SIP',      cover:'Market price',  tenure:'Flexible',
    highlight:'Digital Gold',    color:'#D4A535',        icon:'🥇',
    tag:'Trending', desc:'Buy 24K digital gold from ₹500. No storage cost. Sell anytime.',
    personas:['Optimizer','Exiter'],
  },
]

/* ─── Financial Literacy tips ────────────────────────────────────────── */
const LITERACY_CARDS = [
  { icon:'💡', title:'FD vs Debt Mutual Fund', color:'#6ABFA0',
    content:"Debt MFs offer similar safety to FDs but better post-tax returns (indexation benefit after 3 years). On ₹5L for 3 years: FD gives ~₹6.1L, Debt MF gives ~₹6.4L after tax." },
  { icon:'📊', title:'The Power of SIP', color:'#5B9ED6',
    content:"₹5,000/month for 20 years in a large-cap fund (12% CAGR) = ₹49.9 Lakhs. The same amount in an FD (7%) = ₹26.3 Lakhs. Difference: ₹23.6 Lakhs from the same investment." },
  { icon:'🛡️', title:'The 50-30-20 Rule', color:'#D4A535',
    content:"50% of income → needs (rent, food), 30% → wants (travel, gadgets), 20% → investments & savings. Most Indian salaried individuals invest only 8-10%. Double it to build real wealth." },
  { icon:'🥇', title:'Why Gold Makes Sense Now', color:'#D4A535',
    content:"Gold has returned 13% CAGR over 10 years in INR. With RBI buying gold aggressively and global uncertainty, 10-15% allocation in gold (digital or SGBs) is advisable." },
  { icon:'📋', title:'ELSS: Tax + Returns', color:'#9B8FD6',
    content:"ELSS funds save ₹46,800 in tax (30% bracket) on ₹1.56L invested under 80C. Lowest lock-in (3 years) among all 80C options. Average ELSS returns: 15-18% over 5 years." },
  { icon:'🏥', title:'Health Insurance Gap', color:'#E05A3A',
    content:"Average Indian hospitalisation costs ₹2-3L. 70% of Indians have no health insurance. One hospitalisation without cover can wipe out 5 years of FD savings. Minimum ₹10L cover recommended." },
]

/* ─── Persona → Investment recommendation map ────────────────────────── */
const PERSONA_INVEST = {
  Protector:      { path:'FD → Debt MF → NSC / PPF → SGB',         color:'#6ABFA0', reason:'Preserve capital, beat inflation, stay safe' },
  'Anxious Saver':{ path:'FD → Hybrid Fund → Term Insurance',        color:'#D4A535', reason:'Protection first, then gradual wealth building' },
  Optimizer:      { path:'FD → ELSS → Flexi Cap MF → Direct Stocks', color:'#5B9ED6', reason:'Maximise returns, tax efficiency, market exposure' },
  Exiter:         { path:'FD → Liquid MF → Equity SIP → NPS',        color:'#E05A3A', reason:'Flexible, high-return, long-term wealth creation' },
}

/* ─── Sparkline data generator ─────────────────────────────────────── */
function sparkData(seed, up) {
  const arr = []
  let v = 50
  for (let i = 0; i < 12; i++) {
    v += (Math.sin(i * seed) * 4) + (up ? 0.5 : -0.3)
    arr.push({ v: Math.max(30, Math.min(80, v)) })
  }
  return arr
}

/* ─── Stock Row ──────────────────────────────────────────────────────── */
function StockRow({ s, idx, c, live }) {
  const price = live[s.symbol] || s.price
  const change = s.change + (live[s.symbol] ? live[s.symbol] - s.price : 0)
  const pct = ((change / s.price) * 100).toFixed(2)
  const up = change >= 0
  const col = up ? '#6ABFA0' : '#E05A3A'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '28px 70px 1fr 90px 80px 80px',
      padding: '9px 14px', alignItems: 'center',
      borderBottom: `1px solid ${c.border}`,
      background: idx % 2 === 0 ? c.rowEven : c.rowOdd,
      transition: 'background 0.12s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => e.currentTarget.style.background = `rgba(86,143,124,0.08)`}
      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? c.rowEven : c.rowOdd}
    >
      <span style={{ fontSize: 10, color: c.textDim, fontWeight: 600 }}>{idx + 1}</span>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: c.text, letterSpacing: 0.3 }}>{s.symbol}</div>
        <div style={{ fontSize: 9, color: c.textDim }}>{s.sector}</div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: c.textMuted }}>{s.name}</div>
        <div style={{ fontSize: 9, color: c.textDim }}>Mkt Cap: {s.mktCap}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: c.text, fontVariantNumeric: 'tabular-nums' }}>
          ₹{price.toFixed(2)}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: col }}>
          {up ? '+' : ''}{change.toFixed(2)}
        </div>
        <div style={{ fontSize: 10, color: col }}>{up ? '▲' : '▼'} {Math.abs(pct)}%</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width={60} height={28}>
          <AreaChart data={sparkData(idx + 1, up)} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
            <Area type="monotone" dataKey="v" stroke={col} fill={`${col}20`} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ─── MF Card ─────────────────────────────────────────────────────────── */
function MFCard({ f, c }) {
  return (
    <div style={{
      background: c.card, border: `1px solid ${c.border}`,
      borderRadius: 12, padding: '14px 16px',
      borderTop: `3px solid ${f.color}`,
      transition: 'transform 0.15s, box-shadow 0.15s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.2)` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{
          fontSize: 9, padding: '2px 8px', borderRadius: 10,
          background: `${f.color}18`, color: f.color, fontWeight: 700,
        }}>{f.tag}</span>
        <div style={{ display: 'flex', gap: 1 }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ fontSize: 9, color: i < f.rating ? '#D4A535' : c.border }}>★</span>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 4, lineHeight: 1.3 }}>{f.name}</div>
      <div style={{ fontSize: 10, color: c.textDim, marginBottom: 12 }}>{f.category} · {f.risk} Risk · SIP from {f.minSIP}</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, background: `${f.color}10`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: f.color }}>{f.returns1y}</div>
          <div style={{ fontSize: 9, color: c.textDim, marginTop: 2 }}>1Y Returns</div>
        </div>
        <div style={{ flex: 1, background: `rgba(86,143,124,0.08)`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: c.accent }}>{f.returns3y}</div>
          <div style={{ fontSize: 9, color: c.textDim, marginTop: 2 }}>3Y CAGR</div>
        </div>
      </div>
      <button style={{
        width: '100%', marginTop: 10, padding: '7px',
        background: `${f.color}18`, border: `1px solid ${f.color}40`,
        borderRadius: 7, color: f.color, fontSize: 11, fontWeight: 700,
        cursor: 'pointer', letterSpacing: 0.3,
      }}>Recommend to Customers →</button>
    </div>
  )
}

/* ─── Insurance Card ─────────────────────────────────────────────────── */
function InsuranceCard({ p, c }) {
  return (
    <div style={{
      background: c.card, border: `1px solid ${c.border}`,
      borderRadius: 12, padding: '14px 16px',
      cursor: 'pointer', transition: 'transform 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{p.icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{p.name}</div>
            <div style={{ fontSize: 9, color: c.textDim }}>{p.provider} · {p.type}</div>
          </div>
        </div>
        <span style={{
          fontSize: 9, padding: '2px 8px', borderRadius: 10,
          background: `${p.color}18`, color: p.color, fontWeight: 700,
        }}>{p.tag}</span>
      </div>
      <p style={{ fontSize: 11, color: c.textMuted, lineHeight: 1.6, margin: '8px 0 10px' }}>{p.desc}</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {[['Premium', p.premium], ['Cover', p.cover], ['Tenure', p.tenure]].map(([l, v]) => (
          <div key={l} style={{
            flex: 1, background: `${p.color}10`, borderRadius: 7,
            padding: '7px 8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: p.color }}>{v}</div>
            <div style={{ fontSize: 9, color: c.textDim }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: c.textDim, marginBottom: 8 }}>
        Best for: {p.personas.map(p => (
          <span key={p} style={{ color: c.textMuted, fontWeight: 600 }}>{p} </span>
        ))}
      </div>
      <button style={{
        width: '100%', padding: '7px',
        background: `${p.color}18`, border: `1px solid ${p.color}40`,
        borderRadius: 7, color: p.color, fontSize: 11, fontWeight: 700, cursor: 'pointer',
      }}>Show to Matching Customers →</button>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function WealthHub({ onNudge }) {
  const { c, isDark } = useApp()
  const [liveStocks, setLiveStocks] = useState({})
  const [activeTab, setActiveTab] = useState('stocks')
  const [filterPersona, setFilterPersona] = useState('All')
  const intervalRef = useRef(null)

  // Simulate live stock price updates
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLiveStocks(prev => {
        const next = { ...prev }
        BASE_STOCKS.forEach(s => {
          const base = prev[s.symbol] || s.price
          const delta = (Math.random() - 0.48) * s.price * 0.003
          next[s.symbol] = parseFloat((base + delta).toFixed(2))
        })
        return next
      })
    }, 2500)
    return () => clearInterval(intervalRef.current)
  }, [])

  const upgradeUsers = USERS.filter(u => u.daysLeft <= 21)
  const filteredUsers = filterPersona === 'All'
    ? upgradeUsers
    : upgradeUsers.filter(u => u.persona === filterPersona)

  const PERSONAS = ['All', 'Protector', 'Optimizer', 'Anxious Saver', 'Exiter']
  const PCOLOR = { Protector:'#6ABFA0', Optimizer:'#5B9ED6', 'Anxious Saver':'#D4A535', Exiter:'#E05A3A' }

  const tabBtn = (id, label) => ({
    padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: `1px solid ${activeTab === id ? c.accent : c.border}`,
    background: activeTab === id ? `rgba(86,143,124,0.14)` : 'transparent',
    color: activeTab === id ? c.accent : c.textMuted,
    transition: 'all 0.15s',
  })

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Page header ──────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: c.accent, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
            WEALTH INTELLIGENCE PLATFORM
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: c.text, letterSpacing: -0.5 }}>
            Wealth Hub — Beyond the FD
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: 12, color: c.textDim }}>
            Turn every FD maturity into a wealth-building conversation. Mutual funds · Insurance · Stocks · Education.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            ['₹4.2 Cr', 'Revenue opportunity', '#6ABFA0'],
            ['14.6k', 'Upgrade-ready customers', '#5B9ED6'],
            ['3 products', 'per customer avg', '#D4A535'],
          ].map(([val, lbl, col]) => (
            <div key={lbl} style={{
              background: c.card, border: `1px solid ${c.border}`,
              borderRadius: 10, padding: '10px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: col }}>{val}</div>
              <div style={{ fontSize: 9, color: c.textDim, letterSpacing: 0.3 }}>{lbl.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live stock ticker strip ───────────────────── */}
      <div style={{
        background: c.card, border: `1px solid ${c.border}`,
        borderRadius: 12, padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: 16, overflow: 'hidden',
      }}>
        <span style={{
          fontSize: 9, color: c.accent, fontWeight: 800, letterSpacing: 1,
          padding: '3px 8px', background: `rgba(86,143,124,0.12)`,
          border: `1px solid ${c.border}`, borderRadius: 4, flexShrink: 0,
        }}>NSE LIVE</span>
        <div style={{ display: 'flex', gap: 20, overflowX: 'auto', flex: 1 }}>
          {BASE_STOCKS.map(s => {
            const price = liveStocks[s.symbol] || s.price
            const up = (liveStocks[s.symbol] || s.price) >= s.price
            const col = up ? '#6ABFA0' : '#E05A3A'
            return (
              <div key={s.symbol} style={{
                display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: c.text }}>{s.symbol}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: col, fontVariantNumeric: 'tabular-nums' }}>
                  ₹{price.toFixed(2)}
                </span>
                <span style={{ fontSize: 9, color: col }}>{up ? '▲' : '▼'} {Math.abs(s.pct)}%</span>
              </div>
            )
          })}
        </div>
        <span style={{ fontSize: 9, color: c.textDim, flexShrink: 0 }}>
          NSE · BSE · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* ── Tab nav ───────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          ['stocks',    '📈 Top Stocks Today'],
          ['mf',        '📊 Mutual Funds'],
          ['insurance', '🛡️ Insurance & Protection'],
          ['literacy',  '💡 Financial Literacy'],
          ['upgrade',   '🚀 Customer Upgrade Map'],
        ].map(([id, label]) => (
          <button key={id} style={tabBtn(id, label)} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </div>

      {/* ── Stocks Tab ───────────────────────────────── */}
      {activeTab === 'stocks' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{
              padding: '14px 16px', borderBottom: `1px solid ${c.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>Top Stocks — NSE/BSE</span>
                <div style={{ fontSize: 10, color: c.textDim, marginTop: 2 }}>Live prices · Auto-updating every 2.5s</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6ABFA0', boxShadow: '0 0 5px #6ABFA0' }} />
                <span style={{ fontSize: 9, color: '#6ABFA0', fontWeight: 700 }}>LIVE</span>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '28px 70px 1fr 90px 80px 80px',
              padding: '7px 14px',
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
              borderBottom: `1px solid ${c.border}`,
            }}>
              {['#','SYMBOL','COMPANY','PRICE','CHANGE','TREND'].map(h => (
                <span key={h} style={{ fontSize: 9, color: c.textDim, fontWeight: 700, letterSpacing: 1 }}>{h}</span>
              ))}
            </div>
            {BASE_STOCKS.map((s, i) => <StockRow key={s.symbol} s={s} idx={i} c={c} live={liveStocks} />)}
          </div>

          {/* Market summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.text, marginBottom: 12 }}>Market Indices</div>
              {[
                { name:'NIFTY 50',   val:'22,147.00', chg:'+0.62%', up:true },
                { name:'SENSEX',     val:'73,421.50', chg:'+0.58%', up:true },
                { name:'NIFTY Bank', val:'48,312.00', chg:'-0.14%', up:false },
                { name:'NIFTY IT',   val:'33,876.00', chg:'-0.48%', up:false },
                { name:'NIFTY MidCap',val:'46,234.00',chg:'+1.21%', up:true },
              ].map(idx => (
                <div key={idx.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: `1px solid ${c.border}`,
                }}>
                  <span style={{ fontSize: 11, color: c.textMuted }}>{idx.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{idx.val}</div>
                    <div style={{ fontSize: 10, color: idx.up ? '#6ABFA0' : '#E05A3A' }}>{idx.chg}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.text, marginBottom: 10 }}>Today's Mood</div>
              {[
                { label:'Advancing', val: 1423, col:'#6ABFA0', pct: 68 },
                { label:'Declining', val: 612,  col:'#E05A3A', pct: 29 },
                { label:'Unchanged', val: 65,   col:'#D4A535', pct: 3  },
              ].map(m => (
                <div key={m.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: c.textMuted, marginBottom: 3 }}>
                    <span>{m.label}</span><span style={{ color: m.col, fontWeight: 700 }}>{m.val}</span>
                  </div>
                  <div style={{ height: 4, background: c.border, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${m.pct}%`, height: '100%', background: m.col, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mutual Funds Tab ──────────────────────────── */}
      {activeTab === 'mf' && (
        <div>
          <div style={{ marginBottom: 14, padding: '12px 16px', background: `rgba(86,143,124,0.07)`, border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 12, color: c.textMuted }}>
            <strong style={{ color: c.text }}>💡 Smart Cross-Sell:</strong> Customers with FDs maturing in ≤30 days are your best audience for MF recommendations. You have <strong style={{ color: '#6ABFA0' }}>14,600 upgrade-ready customers</strong> right now. Average ticket: ₹2.8L. Potential AUM: <strong style={{ color: '#D4A535' }}>₹408 Crore</strong>.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {MUTUAL_FUNDS.map(f => <MFCard key={f.name} f={f} c={c} />)}
          </div>
        </div>
      )}

      {/* ── Insurance Tab ─────────────────────────────── */}
      {activeTab === 'insurance' && (
        <div>
          <div style={{ marginBottom: 14, padding: '12px 16px', background: 'rgba(224,89,58,0.06)', border: '1px solid rgba(224,89,58,0.2)', borderRadius: 10, fontSize: 12, color: c.textMuted }}>
            <strong style={{ color: c.text }}>🛡️ Protection Gap in India:</strong> Only <strong style={{ color: '#E05A3A' }}>30% of Indians</strong> have health insurance. Among your FD customers, Protector and Anxious Saver personas are most receptive. One hospitalisation costs more than a year of FD interest — this is a genuine need, not just cross-sell.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {INSURANCE.map(p => <InsuranceCard key={p.name} p={p} c={c} />)}
          </div>
        </div>
      )}

      {/* ── Financial Literacy Tab ───────────────────── */}
      {activeTab === 'literacy' && (
        <div>
          <div style={{ marginBottom: 14, padding: '12px 16px', background: `rgba(91,158,214,0.07)`, border: `1px solid rgba(91,158,214,0.2)`, borderRadius: 10, fontSize: 12, color: c.textMuted }}>
            <strong style={{ color: c.text }}>📚 Why Financial Literacy = Retention:</strong> Customers who understand <em>why</em> a product is right for them are <strong style={{ color: '#5B9ED6' }}>3.2x more likely to upgrade</strong> rather than churn. These cards can be sent as in-app messages or WhatsApp content to customers 15 days before FD maturity.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {LITERACY_CARDS.map((card, i) => (
              <div key={i} style={{
                background: c.card, border: `1px solid ${c.border}`,
                borderRadius: 12, padding: '18px 20px',
                borderLeft: `4px solid ${card.color}`,
                cursor: 'pointer', transition: 'transform 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{card.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{card.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: c.textMuted, lineHeight: 1.7 }}>{card.content}</p>
                <button style={{
                  marginTop: 12, width: '100%', padding: '7px',
                  background: `${card.color}12`, border: `1px solid ${card.color}30`,
                  borderRadius: 7, color: card.color, fontSize: 11, fontWeight: 700,
                  cursor: 'pointer',
                }}>Send to Matching Customers →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Customer Upgrade Map Tab ──────────────────── */}
      {activeTab === 'upgrade' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Persona investment pathways */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {Object.entries(PERSONA_INVEST).map(([persona, info]) => (
              <div key={persona} style={{
                background: c.card, border: `1px solid ${c.border}`,
                borderRadius: 12, padding: '16px',
                borderTop: `3px solid ${info.color}`,
              }}>
                <div style={{ fontSize: 10, color: info.color, fontWeight: 800, letterSpacing: 0.5, marginBottom: 6 }}>{persona.toUpperCase()}</div>
                <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 10, lineHeight: 1.5 }}>{info.reason}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.text, lineHeight: 1.8 }}>
                  {info.path.split(' → ').map((step, i, arr) => (
                    <span key={i}>
                      <span style={{ color: info.color }}>{step}</span>
                      {i < arr.length - 1 && <span style={{ color: c.textDim }}> → </span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Filter + customer table */}
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{
              padding: '14px 18px', borderBottom: `1px solid ${c.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
            }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>Upgrade-Ready Customers</span>
                <div style={{ fontSize: 10, color: c.textDim, marginTop: 2 }}>FD maturing in ≤21 days with investment pathway</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {PERSONAS.map(p => (
                  <button key={p} onClick={() => setFilterPersona(p)} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${filterPersona === p ? (PCOLOR[p] || c.accent) : c.border}`,
                    background: filterPersona === p ? `${PCOLOR[p] || c.accent}14` : 'transparent',
                    color: filterPersona === p ? (PCOLOR[p] || c.accent) : c.textDim,
                  }}>{p}</button>
                ))}
              </div>
            </div>

            {filteredUsers.map((u, i) => {
              const invest = PERSONA_INVEST[u.persona]
              const pCol   = PCOLOR[u.persona] || c.accent
              return (
                <div key={u.id} style={{
                  padding: '12px 18px',
                  borderBottom: `1px solid ${c.border}`,
                  display: 'grid',
                  gridTemplateColumns: '1fr 80px 100px 1fr 120px',
                  alignItems: 'center', gap: 12,
                  background: i % 2 === 0 ? c.rowEven : c.rowOdd,
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{u.name}</div>
                    <div style={{ fontSize: 10, color: c.textDim }}>{u.city} · {u.fdAmount}</div>
                  </div>
                  <span style={{
                    fontSize: 9, padding: '2px 7px', borderRadius: 4, textAlign: 'center',
                    background: `${pCol}14`, color: pCol, fontWeight: 700,
                  }}>{u.persona}</span>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: u.daysLeft <= 7 ? '#E05A3A' : '#D4A535' }}>{u.daysLeft}d left</div>
                  </div>
                  <div style={{ fontSize: 10, color: c.textMuted, lineHeight: 1.5 }}>
                    <span style={{ color: c.textDim }}>Path: </span>
                    {invest?.path.split(' → ').slice(0, 3).join(' → ')}
                  </div>
                  <button onClick={() => onNudge && onNudge(u)} style={{
                    padding: '6px 14px', borderRadius: 7,
                    background: `${pCol}18`, border: `1px solid ${pCol}40`,
                    color: pCol, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  }}>Recommend Product →</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
