/* ═══════════════════════════════════════════════
   Intent Mirror — Family / Money Quest API client
   Talks to the Express backend. Every call resolves to data or null
   (never throws), so the UI can fall back gracefully if the backend
   is offline.
═══════════════════════════════════════════════ */

async function req(method, path, body) {
  try {
    const res = await fetch('/api' + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// My Money — portfolio + verification (server is source of truth)
export const getPortfolio   = (addr, lang = 'EN')        => req('GET',  `/portfolio/${addr}?lang=${lang}`)
export const verifyHolding  = (addr, holdingId, lang='EN') => req('POST', `/portfolio/${addr}/verify?lang=${lang}`, { holdingId })

export const getMissions   = ()              => req('GET',  '/missions')
export const getFamily     = (addr)          => req('GET',  `/family/${addr}`)
export const updateFamily  = (addr, patch)   => req('PUT',  `/family/${addr}`, patch)
export const completeMission = (addr, missionId) => req('POST', `/family/${addr}/mission`, { missionId })
export const saveToGoal    = (addr, amount)  => req('POST', `/family/${addr}/save`, { amount })

/* Local fallback used only if the backend is unreachable, so the
   Money Quest screen still renders something sensible. */
export const FALLBACK_FAMILY = {
  kidMode: true,
  kidName: 'Explorer',
  allowance: 50,
  pocketMoney: 200,
  goal: { name: 'New bicycle 🚲', target: 4000, saved: 0 },
  completedMissions: [],
  xp: 0,
  level: 1,
  streak: 0,
  lastActive: null,
}

export const FALLBACK_MISSIONS = [
  { id:'save-first',  icon:'🐷', xp:50, lesson:'Saving means keeping some money for later instead of spending it all now.', lessonHi:'बचत यानी अभी सब खर्च करने के बजाय कुछ पैसा बाद के लिए रखना।', action:'Move ₹100 into your savings goal', actionHi:'अपने बचत लक्ष्य में ₹100 डालें' },
  { id:'goal',        icon:'🎯', xp:60, lesson:'A goal gives your money a job. Knowing WHAT you save for makes saving fun.', lessonHi:'लक्ष्य आपके पैसे को काम देता है। किसलिए बचा रहे हैं जानना बचत को मज़ेदार बनाता है।', action:'Pick what you are saving for', actionHi:'चुनें कि आप किसलिए बचत कर रहे हैं' },
  { id:'compound',    icon:'🌱', xp:80, lesson:'A little saved every month becomes a LOT over years — that is compounding.', lessonHi:'हर महीने थोड़ा बचाना सालों में बहुत बन जाता है — यही कंपाउंडिंग है।', action:'Watch your seed grow', actionHi:'अपने बीज को बढ़ते देखें' },
  { id:'spot-scam',   icon:'🕵️', xp:70, lesson:'If someone promises free money or asks for your password, it is a scam. Never share it!', lessonHi:'अगर कोई मुफ़्त पैसे का वादा करे या पासवर्ड माँगे, तो वह धोखा है। कभी साझा न करें!', action:'Pass the scam-spotter quiz', actionHi:'स्कैम क्विज़ पास करें' },
  { id:'needs-wants', icon:'⚖️', xp:60, lesson:'Needs are things you must have (food). Wants are extras (toys). Spend on needs first.', lessonHi:'ज़रूरतें होनी ही चाहिए (खाना)। चाहतें अतिरिक्त हैं (खिलौने)। पहले ज़रूरतों पर खर्च करें।', action:'Sort needs from wants', actionHi:'ज़रूरतें और चाहतें अलग करें' },
]
