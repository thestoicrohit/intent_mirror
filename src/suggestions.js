/* ═══════════════════════════════════════════════
   Intent Mirror — Suggestion engine (B2C)
   ───────────────────────────────────────────────
   Turns the portfolio + behaviour + money persona into a short list
   of personalised, plain-English suggestions. This is the "coach"
   layer — it reads intent and nudges YOU, the way the bank version
   nudged customers.

   Runs fully client-side so the app is never blank. The backend
   /api/ai/nudge endpoint can enrich these with an LLM-written message
   when the server + ML service are up (see enrichWithAI below).
═══════════════════════════════════════════════ */

function inrL(v) {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`
  return `₹${Math.round(v).toLocaleString('en-IN')}`
}

export function generateSuggestions({ pf, persona, holdings, activity }, lang = 'EN') {
  const hi = lang === 'HI'
  const out = []
  const top = pf.topConcentration
  const p = persona.persona

  // 1. Concentration / behaviour-driven warning (the headline value)
  const exiting = activity.some(a => a.weight === 'exit')
  if (exiting) {
    out.push({
      tone: 'warn',
      title: hi ? 'आप बाहर निकलने जैसा व्यवहार दिखा रहे हैं' : "You're showing exit behaviour",
      body: hi
        ? `आपने जल्दी बेचने का तरीका खोजा और आज कई बार ऐप खोला — यह पैटर्न आमतौर पर घबराहट में बेचने से ठीक पहले आता है। आपका ${p} पर्सोना गिरावट में टिके रहकर बेहतर करता रहा है। एक रात सोच लें।`
        : `You searched how to sell fast and you've opened the app many times today — that pattern usually comes right before a panic sell. Your ${p} profile historically does better holding through dips. Sleep on it.`,
    })
  }

  if (top && top.pct > 40) {
    out.push({
      tone: 'warn',
      title: hi ? `आपका ${top.pct.toFixed(0)}% पैसा ${top.name} में है` : `${top.pct.toFixed(0)}% of your money is in ${top.name}`,
      body: hi
        ? `यह एक ही जगह केंद्रित है। आप जैसा ${p} आमतौर पर यहाँ मुनाफ़ा थोड़ा निकालकर ${inrL(top.value * 0.15)} किसी स्थिर चीज़ में लगाता है।`
        : `That's concentrated. A ${p} like you usually trims a winner here and moves ${inrL(top.value * 0.15)} into something steadier to lock in gains.`,
    })
  }

  // 2. FD maturity nudge (carried over from the original product)
  const fd = holdings.find(h => h.daysToMaturity != null)
  if (fd && fd.daysToMaturity <= 14) {
    out.push({
      tone: 'info',
      title: hi ? `आपका FD ${fd.daysToMaturity} दिन में मैच्योर होगा` : `Your FD matures in ${fd.daysToMaturity} days`,
      body: hi
        ? `इसे आँख मूँदकर 7.1% पर ऑटो-रिन्यू न होने दें। अभी विकल्प देखें — एक डेट फंड या ऊँची दर वाला FD इससे बेहतर हो सकता है। मैच्योरिटी से पहले फ़ैसला लें।`
        : `Don't let it auto-renew blindly at 7.1%. Compare options now — even a debt fund or a higher-rate FD could beat it. Decide before maturity, not after.`,
    })
  }

  // 3. Growth pathway matched to persona
  const growth = {
    Optimizer:      { en:['Add a low-cost index fund','You chase returns but you\'re heavy in single bets. A Nifty 50 index fund gives you market returns at near-zero cost — a calmer core around your crypto satellite.'], hi:['एक कम-लागत इंडेक्स फंड जोड़ें','आप रिटर्न के पीछे भागते हैं पर कुछ ही दाँवों में भारी हैं। Nifty 50 इंडेक्स फंड लगभग शून्य लागत पर बाज़ार रिटर्न देता है — आपकी क्रिप्टो के इर्द-गिर्द एक शांत आधार।'] },
    Protector:      { en:['Beat inflation, safely','Your money is safe but barely beating inflation. A short-duration debt fund earns a little more with low risk — a gentle first step beyond the FD.'], hi:['महँगाई को सुरक्षित ढंग से मात दें','आपका पैसा सुरक्षित है पर मुश्किल से महँगाई को मात दे रहा है। एक शॉर्ट-ड्यूरेशन डेट फंड कम जोखिम में थोड़ा अधिक कमाता है — FD से आगे का पहला कदम।'] },
    'Anxious Saver':{ en:['Automate so you don\'t have to decide','You watch closely but hesitate. A small monthly SIP into a balanced fund removes the timing stress — you invest on autopilot, no daily decisions.'], hi:['ऑटोमेट करें ताकि आपको तय न करना पड़े','आप ध्यान से देखते हैं पर हिचकिचाते हैं। एक छोटी मासिक SIP टाइमिंग का तनाव हटा देती है — आप ऑटोपायलट पर निवेश करते हैं।'] },
    Exiter:         { en:['Before you exit, see the full picture','Cashing out crystallises losses and taxes. Here\'s exactly what each holding would net you today — full transparency, no pressure.'], hi:['बाहर निकलने से पहले पूरी तस्वीर देखें','भुनाने से नुकसान और टैक्स पक्के हो जाते हैं। यहाँ है कि आज हर होल्डिंग आपको कितना देगी — पूरी पारदर्शिता, कोई दबाव नहीं।'] },
  }
  const g = growth[p]
  if (g) out.push({ tone: 'grow', title: (hi ? g.hi : g.en)[0], body: (hi ? g.hi : g.en)[1] })

  // 4. Learn (newcomer-friendly)
  out.push({
    tone: 'info',
    title: hi ? 'सीखें: आपके रिटर्न को असल में क्या चलाता है' : 'Learn: what actually drives your returns',
    body: hi
      ? 'आपके दीर्घकालिक नतीजे का ~90% एसेट आवंटन तय करता है — स्टॉक चुनना नहीं। 2 मिनट की प्राइमर के लिए वेल्थ हब खोलें।'
      : 'Asset allocation decides ~90% of your long-term outcome — not stock picking. Open the Wealth Hub for a 2-minute primer.',
  })

  return out.slice(0, 4)
}

/**
 * Optional LLM enrichment via the existing backend nudge endpoint.
 * Returns a single personalised message string, or null on failure.
 * The UI works without this — it's a progressive enhancement.
 */
export async function enrichWithAI(profile) {
  try {
    const res = await fetch('/api/ai/nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: profile, channel: 'in_app', lang: 'en' }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.message || null
  } catch {
    return null
  }
}
