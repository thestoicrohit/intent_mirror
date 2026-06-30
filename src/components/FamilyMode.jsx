import { useState, useEffect } from 'react'
import { keccak256, toHex } from 'viem'
import { useApp } from '../App'
import {
  getFamily, updateFamily, completeMission, saveToGoal, getMissions,
  FALLBACK_FAMILY, FALLBACK_MISSIONS,
} from '../familyApi'

const levelFor = (xp) => Math.floor((xp || 0) / 150) + 1

/* ───────────────────────────────────────────────
   Family — Money Quest for kids
   A parent sets up guardrails; the child learns money by doing,
   earns XP / levels / streaks, saves toward a goal, and claims a
   soulbound "Money Explorer" badge they own for life.
─────────────────────────────────────────────── */
export default function FamilyMode({ wallet }) {
  const { c, isDark, t, lang } = useApp()
  const tf = t.family
  const addr = wallet?.address

  const [family, setFamily]   = useState(null)
  const [missions, setMissions] = useState(FALLBACK_MISSIONS)
  const [open, setOpen]       = useState(null)     // expanded mission id
  const [claiming, setClaiming] = useState(false)
  const [form, setForm]       = useState(null)     // parent settings draft
  const [savedFlash, setSavedFlash] = useState(false)
  const [badge, setBadge]     = useState(() => {
    try { const r = localStorage.getItem('im_kidbadge:' + addr); return r ? JSON.parse(r) : null } catch { return null }
  })

  // Load family + missions from the backend (graceful fallback if offline).
  useEffect(() => {
    let alive = true
    ;(async () => {
      const [f, m] = await Promise.all([getFamily(addr), getMissions()])
      if (!alive) return
      setFamily(f?.family || { ...FALLBACK_FAMILY })
      if (m?.missions) setMissions(m.missions)
    })()
    return () => { alive = false }
  }, [addr])

  if (!family) {
    return <div style={{ padding: 40, textAlign: 'center', color: c.textDim }}>Loading…</div>
  }

  const fam   = family
  const level = fam.level || levelFor(fam.xp)
  const xpInto = (fam.xp || 0) % 150
  const card  = { background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 20 }

  // Apply a backend result, or fall back to an optimistic local update.
  const apply = (res, optimistic) =>
    setFamily(res?.family ? res.family : (prev => optimistic({ ...prev })))

  /* ── Parent actions ── */
  const startForm = () => setForm({ kidName: fam.kidName, allowance: fam.allowance, goalName: fam.goal.name, goalTarget: fam.goal.target })

  async function saveSettings() {
    const res = await updateFamily(addr, form)
    apply(res, p => ({ ...p, kidName: form.kidName, allowance: Number(form.allowance) || 0, goal: { ...p.goal, name: form.goalName, target: Number(form.goalTarget) || p.goal.target } }))
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1500)
  }
  async function setKidMode(on) {
    const res = await updateFamily(addr, { kidMode: on })
    apply(res, p => ({ ...p, kidMode: on }))
  }

  /* ── Kid actions ── */
  async function doMission(m) {
    setOpen(null)
    const res = await completeMission(addr, m.id)
    apply(res, p => p.completedMissions.includes(m.id) ? p : ({
      ...p, completedMissions: [...p.completedMissions, m.id], xp: (p.xp || 0) + m.xp,
    }))
  }
  async function addSaving() {
    const res = await saveToGoal(addr, 100)
    apply(res, p => {
      const move = Math.min(100, p.pocketMoney, Math.max(0, p.goal.target - p.goal.saved))
      return { ...p, pocketMoney: p.pocketMoney - move, goal: { ...p.goal, saved: p.goal.saved + move } }
    })
  }
  async function claimBadge() {
    setClaiming(true)
    const profile = {
      persona: `${tf.badgeTitle} L${level}`,
      intentScore: Math.min(100, fam.xp || 0),
      signals: ['saver', 'learner'],
      summary: `${fam.kidName} · Level ${level} · ${fam.completedMissions.length} missions`,
    }
    let onchain = false, txHash, chain
    try {
      const res = await fetch('/api/credential/mint', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr, profile }),
      })
      if (res.ok) { const d = await res.json(); if (d.onchain) { onchain = true; txHash = d.txHash; chain = d.chain } }
    } catch { /* fall through */ }
    if (!onchain) { txHash = keccak256(toHex(`${addr}|kidbadge|${Date.now()}`)); chain = 'Base Sepolia (simulated)' }
    const b = { ...profile, level, txHash, chain, onchain, issuedAt: new Date().toISOString() }
    localStorage.setItem('im_kidbadge:' + addr, JSON.stringify(b))
    setBadge(b); setClaiming(false)
  }

  /* ════════════════════ PARENT PANEL ════════════════════ */
  if (!fam.kidMode) {
    const f = form || { kidName: fam.kidName, allowance: fam.allowance, goalName: fam.goal.name, goalTarget: fam.goal.target }
    const input = { background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 9, padding: '10px 12px', color: c.text, fontSize: 13, width: '100%', outline: 'none' }
    const label = { fontSize: 11, fontWeight: 700, color: c.textDim, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }

    return (
      <div style={{ padding: '20px 24px', maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{tf.parentTitle}</h2>
          <p style={{ fontSize: 13.5, color: c.textMuted, lineHeight: 1.6, margin: '6px 0 0' }}>{tf.parentSub}</p>
        </div>

        <div style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={label}>{tf.kidName}</label>
            <input style={input} value={f.kidName} onChange={e => setForm({ ...f, kidName: e.target.value })} />
          </div>
          <div>
            <label style={label}>{tf.allowance}</label>
            <input style={input} type="number" min="0" value={f.allowance} onChange={e => setForm({ ...f, allowance: e.target.value })} />
          </div>
          <div>
            <label style={label}>{tf.goalName}</label>
            <input style={input} value={f.goalName} onChange={e => setForm({ ...f, goalName: e.target.value })} />
          </div>
          <div>
            <label style={label}>{tf.goalTarget}</label>
            <input style={input} type="number" min="1" value={f.goalTarget} onChange={e => setForm({ ...f, goalTarget: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => { if (!form) startForm(); saveSettings() }} style={{
              background: 'transparent', border: `1px solid ${c.borderStrong}`, borderRadius: 9,
              padding: '10px 18px', color: c.text, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>{savedFlash ? tf.saved : tf.save}</button>
            <button onClick={() => setKidMode(true)} style={{
              background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`, border: 'none', borderRadius: 9,
              padding: '10px 20px', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
            }}>{tf.startQuest}</button>
          </div>
        </div>

        <div style={{ ...card, background: isDark ? 'rgba(86,143,124,0.08)' : 'rgba(33,80,82,0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: c.accent, marginBottom: 6 }}>💡 {tf.whyTitle}</div>
          <p style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.6, margin: 0 }}>{tf.whyBody}</p>
        </div>
      </div>
    )
  }

  /* ════════════════════ KID — MONEY QUEST ════════════════════ */
  const goalPct = Math.min(100, (fam.goal.saved / fam.goal.target) * 100)
  const goalDone = fam.goal.saved >= fam.goal.target
  const KID = c.accent            // stay on the app's palette

  return (
    <div style={{ padding: '20px 24px', maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Hero */}
      <div style={{
        ...card, padding: 22, color: '#fff',
        background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`, border: 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{tf.greeting(fam.kidName)}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{tf.questTitle}</div>
          </div>
          <button onClick={() => setKidMode(false)} style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: 20, padding: '5px 12px', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>{tf.backToParent}</button>
        </div>

        <div style={{ display: 'flex', gap: 18, marginTop: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{level}</div>
            <div style={{ fontSize: 10, opacity: 0.9, letterSpacing: 0.5 }}>{tf.level}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, opacity: 0.95 }}>
              <span>{fam.xp} {tf.xp}</span><span>{xpInto}/150</span>
            </div>
            <div style={{ height: 9, background: 'rgba(255,255,255,0.25)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${(xpInto / 150) * 100}%`, height: '100%', background: '#fff', borderRadius: 6 }} />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>🔥{fam.streak}</div>
            <div style={{ fontSize: 10, opacity: 0.9 }}>{tf.streak}</div>
          </div>
        </div>
      </div>

      {/* Savings goal */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: c.textDim, textTransform: 'uppercase', letterSpacing: 0.5 }}>{tf.savingsGoal}</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{fam.goal.name}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: KID }}>{tf.savedOf(fam.goal.saved, fam.goal.target)}</div>
        </div>
        <div style={{ height: 14, background: c.border, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ width: `${goalPct}%`, height: '100%', background: `linear-gradient(90deg, ${c.accent}, ${c.positive})`, borderRadius: 8, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <div style={{ fontSize: 11, color: c.textDim }}>{tf.pocket}: ₹{fam.pocketMoney}</div>
          <button onClick={addSaving} disabled={goalDone || fam.pocketMoney <= 0} style={{
            background: goalDone ? c.border : `${KID}22`, border: `1px solid ${goalDone ? c.border : KID}`,
            borderRadius: 9, padding: '8px 14px', color: goalDone ? c.textDim : KID,
            fontSize: 12.5, fontWeight: 700, cursor: goalDone || fam.pocketMoney <= 0 ? 'default' : 'pointer',
          }}>{goalDone ? tf.goalReached : tf.addSavings}</button>
        </div>
      </div>

      {/* Missions */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{tf.missions}</div>
          <div style={{ fontSize: 11, color: c.textDim }}>{fam.completedMissions.length}/{missions.length} {tf.missionsDone}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {missions.map(m => {
            const done = fam.completedMissions.includes(m.id)
            const isOpen = open === m.id
            return (
              <div key={m.id} style={{
                borderRadius: 12, border: `1px solid ${done ? c.positive : c.border}`,
                background: done ? `${c.positive}1f` : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                padding: 14, opacity: done ? 0.85 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{lang === 'HI' ? m.actionHi : m.action}</div>
                    <div style={{ fontSize: 11, color: KID, fontWeight: 700 }}>+{m.xp} XP</div>
                  </div>
                  {done ? (
                    <span style={{ fontSize: 12, fontWeight: 800, color: c.positive }}>{tf.done}</span>
                  ) : (
                    <button onClick={() => setOpen(isOpen ? null : m.id)} style={{
                      background: `${KID}22`, border: `1px solid ${KID}`, borderRadius: 8,
                      padding: '6px 14px', color: KID, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}>{tf.doIt}</button>
                  )}
                </div>
                {isOpen && !done && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${c.border}` }}>
                    <p style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.6, margin: '0 0 12px' }}>
                      {lang === 'HI' ? m.lessonHi : m.lesson}
                    </p>
                    <button onClick={() => doMission(m)} style={{
                      background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`, border: 'none', borderRadius: 9,
                      padding: '9px 18px', color: '#fff', fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                    }}>{tf.gotIt}</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Badge */}
      <div style={{ ...card, textAlign: 'center' }}>
        {badge ? (
          <>
            <div style={{ fontSize: 44 }}>🏅</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 4 }}>{tf.badgeTitle} · L{badge.level || level}</div>
            <div style={{ fontSize: 12, color: c.textMuted, maxWidth: 420, margin: '8px auto 10px', lineHeight: 1.6 }}>{tf.badgeBody}</div>
            <div style={{ display: 'inline-flex', gap: 8, fontSize: 11, color: c.textDim, alignItems: 'center' }}>
              <span style={{ padding: '3px 9px', borderRadius: 20, background: `${c.positive}22`, color: c.positive, fontWeight: 700 }}>
                {tf.badgeClaimed}
              </span>
              <span style={{ fontFamily: 'monospace' }}>{badge.txHash?.slice(0, 10)}…</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 38 }}>🏅</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 6 }}>{tf.badgeTitle}</div>
            <div style={{ fontSize: 12, color: c.textMuted, maxWidth: 420, margin: '6px auto 14px', lineHeight: 1.6 }}>{tf.badgeBody}</div>
            <button onClick={claimBadge} disabled={claiming} style={{
              background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`, border: 'none', borderRadius: 10,
              padding: '11px 22px', color: '#fff', fontSize: 13.5, fontWeight: 800, cursor: claiming ? 'wait' : 'pointer',
            }}>{claiming ? '…' : tf.claimBadge}</button>
          </>
        )}
      </div>
    </div>
  )
}
