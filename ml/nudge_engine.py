"""
Intent Mirror — Gen AI Nudge Engine
=====================================
Prompt-engineering framework for generating persona-matched, contextually aware
nudge messages for FD customers.

Architecture:
  1. build_prompt()     — constructs a structured LLM prompt with user context
  2. generate_nudge()   — uses the prompt to generate a message (template-based
                          LLM simulation; swap in Claude API when key available)
  3. Supports EN + HI  — full bilingual output
  4. Channel-aware      — SMS (160 chars), in-app (400 chars), email (rich)
  5. Returns prompt + message + reasoning — for dashboard transparency

Usage:
  from nudge_engine import generate_nudge
  result = generate_nudge(user_profile, channel='sms', lang='en')
"""

import random
import json
from typing import Literal

# ── Persona Emotional Profiles ─────────────────────────────────────────────
PERSONA_PROFILES = {
    'Protector': {
        'core_fear':    'losing the safety net',
        'core_desire':  'guaranteed security for family',
        'tone':         'reassuring, warm, trustworthy',
        'en_hook':      ['Your family\'s safety net is working hard for you.',
                         'Your savings have been growing securely.',
                         'Peace of mind — that\'s what you\'ve built.'],
        'hi_hook':      ['आपकी बचत आपके परिवार की सुरक्षा कर रही है।',
                         'आपका पैसा सुरक्षित और बढ़ रहा है।'],
        'cta_en':       'Renew now and keep the peace of mind going.',
        'cta_hi':       'अभी रिन्यू करें और सुरक्षा बनाए रखें।',
    },
    'Optimizer': {
        'core_fear':    'missing a better return',
        'core_desire':  'maximum yield on every rupee',
        'tone':         'data-driven, confident, forward-looking',
        'en_hook':      ['Your ₹{amt}L FD is maturing — and a better rate is waiting.',
                         'Smart investors are already moving to {rate}% p.a.',
                         'You\'ve browsed mutual funds. Here\'s a smarter upgrade path.'],
        'hi_hook':      ['आपका ₹{amt}L FD मैच्योर हो रहा है — बेहतर रिटर्न का मौका।',
                         'आपके पैसे के लिए सबसे अच्छा विकल्प देखें।'],
        'cta_en':       'See personalized upgrade options → Compare now.',
        'cta_hi':       'अपग्रेड विकल्प देखें → अभी तुलना करें।',
    },
    'Anxious Saver': {
        'core_fear':    'making a wrong financial decision',
        'core_desire':  'clear guidance, no surprises',
        'tone':         'gentle, supportive, step-by-step',
        'en_hook':      ['We noticed you had a question about your FD. We\'re here.',
                         'Your ₹{amt}L matures in {days} days. Let\'s plan together.',
                         'No rush, no pressure — just your options, clearly explained.'],
        'hi_hook':      ['हम यहाँ हैं — आपके FD के बारे में कोई भी सवाल पूछें।',
                         'आपका FD {days} दिनों में मैच्योर होगा। साथ मिलकर प्लान करें।'],
        'cta_en':       'Talk to your personal advisor — no fees, no pressure.',
        'cta_hi':       'अपने पर्सनल एडवाइजर से बात करें — बिल्कुल मुफ्त।',
    },
    'Exiter': {
        'core_fear':    'being locked in or deceived',
        'core_desire':  'flexibility and control over money',
        'tone':         'direct, no-nonsense, transparent',
        'en_hook':      ['Your ₹{amt}L FD matures in {days} days. Here\'s exactly what happens next.',
                         'We see you\'ve been comparing rates. Here\'s our honest answer.',
                         'Full flexibility. Your money, your choice. No lock-in.'],
        'hi_hook':      ['आपका {days} दिनों में FD मैच्योर होगा। यहाँ है पूरी जानकारी।',
                         'हम जानते हैं आप विकल्प देख रहे हैं। यहाँ है हमारा जवाब।'],
        'cta_en':       'See your maturity options — complete transparency guaranteed.',
        'cta_hi':       'अपने मैच्योरिटी विकल्प देखें — पूर्ण पारदर्शिता।',
    }
}

# ── Signal-specific context lines ─────────────────────────────────────────
SIGNAL_CONTEXT = {
    'early_withdrawal':   {
        'en': 'We noticed you searched for early withdrawal options.',
        'hi': 'हमने देखा आप अर्ली विड्रॉल खोज रहे थे।'
    },
    'no_login_30d':       {
        'en': 'We\'ve missed you — you haven\'t logged in for a while.',
        'hi': 'आपसे बात नहीं हुई — थोड़े समय से लॉगिन नहीं हुआ।'
    },
    'competitor_browse':  {
        'en': 'You\'ve been checking other banks\' rates. We want to match your expectations.',
        'hi': 'आप दूसरे बैंकों की दरें देख रहे थे। हम आपकी उम्मीदें पूरी करना चाहते हैं।'
    },
    'safety_check':       {
        'en': 'Your DICGC insurance cover is ₹5L — your deposit is fully protected.',
        'hi': 'आपकी DICGC बीमा कवर ₹5L है — आपकी जमा पूरी तरह सुरक्षित है।'
    },
    'support_ticket':     {
        'en': 'Your recent query is our priority — we\'re resolving it now.',
        'hi': 'आपकी हालिया क्वेरी हमारी प्राथमिकता है — हम इसे हल कर रहे हैं।'
    },
    'rate_compare':       {
        'en': 'You\'ve compared rates recently. Our current offer is {rate}% p.a. — among the highest.',
        'hi': 'आपने हाल ही में दरें तुलना की। हमारी दर {rate}% p.a. — सबसे बेहतर में से एक।'
    },
    'mf_browse':          {
        'en': 'We noticed your interest in mutual funds. Your FD can be the launchpad.',
        'hi': 'आपकी म्यूचुअल फंड में रुचि देखी। आपका FD एक अच्छी शुरुआत हो सकता है।'
    },
    'stocks_search':      {
        'en': 'Your investment appetite is growing. We have products that match.',
        'hi': 'आपकी निवेश की भूख बढ़ रही है। हमारे पास सही उत्पाद हैं।'
    },
}

# ── Rate lookup (mock) ─────────────────────────────────────────────────────
def get_best_rate(persona: str) -> str:
    rates = {'Protector': '7.5', 'Optimizer': '8.1', 'Anxious Saver': '7.2', 'Exiter': '7.8'}
    return rates.get(persona, '7.5')


# ── Core prompt builder ────────────────────────────────────────────────────
def build_prompt(user: dict, channel: str, lang: str) -> str:
    """
    Builds the LLM prompt that would be sent to Claude / GPT for nudge generation.
    This is the Gen AI prompt engineering layer — visible in the dashboard.
    """
    persona  = user.get('persona', 'Protector')
    outcome  = user.get('prediction', 'Renew')
    days     = user.get('daysLeft', 10)
    amt      = user.get('fdAmount', '₹2L').replace('₹', '').replace('L', '')
    signals  = user.get('signals', [])
    city     = user.get('city', 'India')
    name     = user.get('name', 'Customer').split()[0]
    risk     = user.get('riskScore', 50)
    rate     = get_best_rate(persona)

    signal_descriptions = {
        'early_withdrawal':   'searched for early withdrawal options',
        'no_login_30d':       'has not logged in for 30+ days (high churn signal)',
        'competitor_browse':  'browsed competitor bank websites',
        'safety_check':       'searched for DICGC insurance coverage',
        'support_ticket':     'raised a support ticket recently',
        'rate_compare':       'compared FD interest rates',
        'mf_browse':          'browsed mutual fund options',
        'stocks_search':      'searched for stock market investments',
    }

    sig_list = '\n    '.join(
        f'- {signal_descriptions.get(s, s)}' for s in signals
    ) if signals else '    - No unusual signals'

    channel_instruction = {
        'sms':    'Write a crisp SMS under 160 characters. Use simple language.',
        'in_app': 'Write a warm in-app notification (2–3 sentences, ~80 words). Can include an emoji.',
        'email':  'Write a subject line + 3-paragraph email body. Personalized and professional.',
    }.get(channel, 'Write a warm in-app notification.')

    lang_instruction = 'Respond in Hindi (Devanagari script).' if lang == 'hi' else 'Respond in English.'

    prompt = f"""You are Intent Mirror AI, a behavioral intelligence system for Indian banks.
Your task: generate a personalized retention nudge for a bank customer.

=== CUSTOMER PROFILE ===
Name         : {name}
City         : {city}
Persona      : {persona}
FD Amount    : ₹{amt}L
Days to Maturity: {days} days
Risk Score   : {risk}/100  ({'HIGH RISK' if risk > 70 else 'MEDIUM RISK' if risk > 40 else 'LOW RISK'})
Predicted Outcome: {outcome}
Best Rate Available: {rate}% p.a.

=== BEHAVIORAL SIGNALS DETECTED ===
    {sig_list}

=== PERSONA PSYCHOLOGY ===
Core fear   : {PERSONA_PROFILES[persona]['core_fear']}
Core desire : {PERSONA_PROFILES[persona]['core_desire']}
Tone        : {PERSONA_PROFILES[persona]['tone']}

=== YOUR TASK ===
{channel_instruction}
{lang_instruction}
Address {name} by first name.
Do NOT be generic. Reference at least one specific signal or FD detail.
Do NOT be pushy. Be genuinely helpful.
End with a clear, single call-to-action.
SEBI Note: Do not promise guaranteed returns. Say "up to {rate}% p.a." only.

Generate the nudge message:"""

    return prompt


# ── Message generator (template-based LLM simulation) ─────────────────────
def generate_nudge(user: dict, channel: str = 'in_app', lang: str = 'en') -> dict:
    """
    Generates a personalized nudge message.

    In production: replace the template section with an actual LLM API call:
        response = anthropic.messages.create(
            model="claude-opus-4-6",
            max_tokens=256,
            messages=[{"role": "user", "content": prompt}]
        )
        message = response.content[0].text

    Returns a dict with:
        prompt    — the full LLM prompt (for dashboard transparency)
        message   — the generated nudge
        reasoning — explanation of why this message was chosen
        channel   — delivery channel
        lang      — language
        metadata  — rates, signals used, persona
    """
    persona  = user.get('persona', 'Protector')
    outcome  = user.get('prediction', 'Renew')
    days     = user.get('daysLeft', 10)
    amt      = user.get('fdAmount', '₹2L').replace('₹', '').replace('L', '')
    signals  = user.get('signals', [])
    name     = user.get('name', 'Customer').split()[0]
    risk     = user.get('riskScore', 50)
    rate     = get_best_rate(persona)

    profile  = PERSONA_PROFILES.get(persona, PERSONA_PROFILES['Protector'])
    prompt   = build_prompt(user, channel, lang)

    # ── Template-based generation (production: replace with LLM call) ──────
    if lang == 'hi':
        hook = random.choice(profile['hi_hook']).format(amt=amt, days=days, rate=rate)
        cta  = profile['cta_hi']
    else:
        hook = random.choice(profile['en_hook']).format(amt=amt, days=days, rate=rate)
        cta  = profile['cta_en']

    # Find the most impactful signal for this persona
    signal_priority = {
        'Exiter':       ['competitor_browse', 'no_login_30d', 'early_withdrawal', 'rate_compare'],
        'Anxious Saver':['support_ticket', 'safety_check', 'early_withdrawal'],
        'Optimizer':    ['mf_browse', 'stocks_search', 'rate_compare'],
        'Protector':    ['safety_check', 'early_withdrawal'],
    }
    priority_signals = signal_priority.get(persona, [])
    top_signal = next((s for s in priority_signals if s in signals), signals[0] if signals else None)

    signal_line = ''
    if top_signal and top_signal in SIGNAL_CONTEXT:
        ctx = SIGNAL_CONTEXT[top_signal]
        signal_line = ctx['hi' if lang == 'hi' else 'en'].format(rate=rate)

    # Urgency suffix
    if lang == 'hi':
        if days <= 3:
            urgency_line = f'⚠️ केवल {days} दिन शेष!'
        elif days <= 7:
            urgency_line = f'📅 {days} दिन बाकी हैं।'
        else:
            urgency_line = f'📅 मैच्योरिटी: {days} दिन में।'
    else:
        if days <= 3:
            urgency_line = f'⚠️ Only {days} day{"s" if days > 1 else ""} left!'
        elif days <= 7:
            urgency_line = f'📅 {days} days to maturity.'
        else:
            urgency_line = f'📅 Maturity in {days} days.'

    # Assemble message by channel
    if channel == 'sms':
        parts = [f'Hi {name},', urgency_line, cta.split('→')[0].strip()]
        message = ' '.join(parts)[:160]
    elif channel == 'email':
        subj = f'Your ₹{amt}L FD matures in {days} days — Important' if lang == 'en' else f'आपका ₹{amt}L FD {days} दिनों में मैच्योर होगा'
        if lang == 'hi':
            body = f"प्रिय {name},\n\n{hook}\n\n{signal_line}\n\n{urgency_line}\n\n{cta}\n\nआपका,\nIntent Mirror टीम"
        else:
            body = f"Dear {name},\n\n{hook}\n\n{signal_line}\n\n{urgency_line}\n\n{cta}\n\nWarm regards,\nIntent Mirror Team"
        message = f"Subject: {subj}\n\n{body}"
    else:  # in_app (default)
        parts = [f'{name}, {hook}']
        if signal_line:
            parts.append(signal_line)
        parts.extend([urgency_line, cta])
        message = ' '.join(p for p in parts if p)

    # ── Reasoning explanation ───────────────────────────────────────────────
    reasoning_steps = [
        f"1. Persona detected: **{persona}** — core fear is '{profile['core_fear']}'",
        f"2. Tone set to: {profile['tone']}",
        f"3. Key signal used: {top_signal or 'None detected'}" + (f" — most predictive for {persona}" if top_signal else ""),
        f"4. Urgency level: {'🔴 Critical' if days <= 3 else '🟡 High' if days <= 7 else '🟢 Moderate'} ({days}d left)",
        f"5. Rate offered: {rate}% p.a. — positioned as {'upgrade opportunity' if outcome == 'Upgrade' else 'renewal incentive'}",
        f"6. Language: {'Hindi (vernacular trust)' if lang == 'hi' else 'English (digital-native)'}",
        f"7. Channel: {channel} — {'brevity enforced (160 chars)' if channel == 'sms' else 'full context included'}",
    ]

    return {
        "prompt":     prompt,
        "message":    message,
        "reasoning":  reasoning_steps,
        "channel":    channel,
        "lang":       lang,
        "metadata": {
            "persona":      persona,
            "predicted_outcome": outcome,
            "risk_score":   risk,
            "days_left":    days,
            "best_rate":    rate,
            "signals_used": signals,
            "top_signal":   top_signal,
        }
    }


if __name__ == '__main__':
    # Quick test
    test_user = {
        "name": "Kavitha Nair",
        "city": "Bengaluru",
        "persona": "Exiter",
        "prediction": "Churn",
        "daysLeft": 3,
        "fdAmount": "₹5.1L",
        "riskScore": 97,
        "signals": ["early_withdrawal", "no_login_30d", "competitor_browse"],
    }

    print("\n=== IN-APP (English) ===")
    r = generate_nudge(test_user, channel='in_app', lang='en')
    print("MESSAGE:", r['message'])
    print("\nREASONING:")
    for step in r['reasoning']:
        print(" ", step)

    print("\n=== SMS (Hindi) ===")
    r2 = generate_nudge(test_user, channel='sms', lang='hi')
    print("MESSAGE:", r2['message'])

    print("\n=== PROMPT SENT TO LLM ===")
    print(r['prompt'][:800] + "…")
