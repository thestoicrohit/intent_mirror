"""
Intent Mirror — Synthetic FD Customer Data Generator
Generates 5,000 realistic Indian banking FD customers with behavioral signals.

Each customer has:
  - Demographics: city, age_group, city_tier
  - FD details: fd_amount_l, fd_count, days_left
  - Behavior: last_login_days, signals (one-hot encoded)
  - Labels: persona, outcome (Churn/Withdraw/Upgrade/Renew), risk_score

The data follows realistic distributions based on Indian retail banking behavior:
  - ~47% FDs don't renew (churn or withdraw) at maturity
  - Protectors are the largest segment (~60% of base)
  - Exiters concentrate in low-login, high-withdrawal-search clusters
"""

import numpy as np
import pandas as pd
import random
import json
import os

SEED = 42
np.random.seed(SEED)
random.seed(SEED)

N = 5000

# ── Geography ──────────────────────────────────────────────────────────────
TIER1_CITIES  = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad']
TIER2_CITIES  = ['Jaipur', 'Lucknow', 'Kochi', 'Chandigarh', 'Indore', 'Coimbatore', 'Vadodara', 'Nagpur']
TIER3_CITIES  = ['Varanasi', 'Patna', 'Allahabad', 'Bhopal', 'Mysuru', 'Trivandrum', 'Surat', 'Agra']

CITY_TIERS = {c: 1 for c in TIER1_CITIES} | {c: 2 for c in TIER2_CITIES} | {c: 3 for c in TIER3_CITIES}
ALL_CITIES = TIER1_CITIES + TIER2_CITIES + TIER3_CITIES

# City probabilities skewed toward tier-1
CITY_PROBS = [0.045]*8 + [0.025]*8 + [0.015]*8
CITY_PROBS = np.array(CITY_PROBS) / sum(CITY_PROBS)

INDIAN_NAMES = [
    'Kavitha Nair', 'Rajan Mehra', 'Priya Sharma', 'Sunita Reddy', 'Amit Desai',
    'Meena Pillai', 'Suresh Kumar', 'Deepa Menon', 'Vikram Joshi', 'Ananya Bose',
    'Rohit Verma', 'Sneha Iyer', 'Arjun Kapoor', 'Lakshmi Devi', 'Kiran Rao',
    'Pooja Gupta', 'Manoj Tiwari', 'Divya Nambiar', 'Rahul Singh', 'Geetha S.',
    'Arun Nair', 'Sonia Khanna', 'Tarun Mishra', 'Pallavi Rao', 'Sunil Pandey',
    'Nisha Bajaj', 'Harish Chandra', 'Radha Krishnan', 'Fatima Begum', 'Ravi Pillai',
    'Swati Jain', 'Ajay Patel', 'Rekha Iyer', 'Sandeep Nair', 'Vandana Singh',
    'Krishnamurthy R.', 'Sumitra Devi', 'Naresh Yadav', 'Asha Kumari', 'Dinesh Gupta',
]

# ── Feature engineering helpers ────────────────────────────────────────────

def fd_amount_by_tier(tier):
    """Tier-1 customers hold larger FDs on average."""
    if tier == 1:
        return round(np.random.lognormal(mean=13.0, sigma=0.7) / 100000, 2)  # ~2L median
    elif tier == 2:
        return round(np.random.lognormal(mean=12.5, sigma=0.6) / 100000, 2)  # ~1.5L median
    else:
        return round(np.random.lognormal(mean=12.0, sigma=0.5) / 100000, 2)  # ~1L median

def assign_persona_and_outcome(row):
    """
    Deterministic persona + outcome assignment based on behavioral features.
    Models real-world patterns:
      - Exiter: high withdrawal signals + long inactivity + competitor browsing
      - Anxious Saver: safety-seeking + support tickets + moderate risk
      - Optimizer: MF/stocks browsing + rate comparison + engagement
      - Protector: safety checks only + low risk + high renewal
    """
    ew  = row['has_early_withdrawal']
    nl  = row['has_no_login']
    cb  = row['has_competitor_browse']
    sc  = row['has_safety_check']
    st  = row['has_support_ticket']
    rc  = row['has_rate_compare']
    mf  = row['has_mf_browse']
    ss  = row['has_stocks_search']
    dll = row['days_left']
    lli = row['last_login_days']

    # Exiter score
    exiter_score = ew*3 + nl*3 + cb*2 + (dll < 8)*2 + (lli > 20)*2
    # Anxious Saver score
    anxious_score = sc*2 + st*3 + ew*1 + (lli > 10)*1
    # Optimizer score
    optimizer_score = mf*3 + ss*2 + rc*2 + (lli < 5)*1
    # Protector score
    protector_score = sc*2 + (not ew)*1 + (not nl)*1 + (lli < 14)*1

    scores = {
        'Exiter': exiter_score,
        'Anxious Saver': anxious_score,
        'Optimizer': optimizer_score,
        'Protector': protector_score,
    }

    # Add noise
    for k in scores:
        scores[k] += np.random.uniform(0, 1.5)

    persona = max(scores, key=scores.get)

    # Outcome from persona
    if persona == 'Exiter':
        outcome = np.random.choice(['Churn', 'Withdraw'], p=[0.65, 0.35])
    elif persona == 'Anxious Saver':
        outcome = np.random.choice(['Withdraw', 'Churn', 'Renew'], p=[0.55, 0.20, 0.25])
    elif persona == 'Optimizer':
        outcome = np.random.choice(['Upgrade', 'Renew', 'Withdraw'], p=[0.60, 0.30, 0.10])
    else:  # Protector
        outcome = np.random.choice(['Renew', 'Upgrade', 'Withdraw'], p=[0.75, 0.15, 0.10])

    return persona, outcome


def compute_risk_score(row):
    """Compute a 0–100 risk score from features."""
    score = 0
    score += row['has_early_withdrawal'] * 25
    score += row['has_no_login'] * 20
    score += row['has_competitor_browse'] * 18
    score += row['has_support_ticket'] * 12
    score += row['has_rate_compare'] * 8
    score += row['has_safety_check'] * 5
    score += row['has_mf_browse'] * (-5)   # upgrading intent, not churn
    score += row['has_stocks_search'] * (-3)

    # Days-left pressure
    if row['days_left'] <= 3:   score += 20
    elif row['days_left'] <= 7: score += 14
    elif row['days_left'] <= 14: score += 7

    # Login recency
    if row['last_login_days'] > 30: score += 12
    elif row['last_login_days'] > 14: score += 6

    # Clip to 0–100
    score += np.random.normal(0, 4)
    return int(np.clip(score, 0, 100))


# ── Generate rows ───────────────────────────────────────────────────────────

rows = []
for i in range(N):
    city = np.random.choice(ALL_CITIES, p=CITY_PROBS)
    tier = CITY_TIERS[city]
    age_group = np.random.choice(['young', 'mid', 'senior'], p=[0.20, 0.55, 0.25])
    fd_amount = fd_amount_by_tier(tier)
    fd_count  = np.random.choice([1, 2, 3, 4, 5], p=[0.45, 0.30, 0.15, 0.07, 0.03])
    days_left = int(np.random.randint(1, 31))

    # Signal probabilities vary by days_left
    urgency_factor = max(0, (15 - days_left) / 15)   # 0→1 as days_left drops

    has_early_withdrawal  = int(np.random.random() < 0.25 + urgency_factor * 0.35)
    has_no_login          = int(np.random.random() < 0.12 + urgency_factor * 0.20)
    has_competitor_browse = int(np.random.random() < 0.10 + urgency_factor * 0.18)
    has_safety_check      = int(np.random.random() < 0.55)
    has_support_ticket    = int(np.random.random() < 0.15 + urgency_factor * 0.12)
    has_rate_compare      = int(np.random.random() < 0.35)
    has_mf_browse         = int(np.random.random() < 0.20)
    has_stocks_search     = int(np.random.random() < 0.12)

    last_login_days = int(np.random.exponential(scale=8) + 1)
    if has_no_login:
        last_login_days = int(np.random.uniform(25, 60))
    last_login_days = min(last_login_days, 60)

    n_signals = (has_early_withdrawal + has_no_login + has_competitor_browse +
                 has_safety_check + has_support_ticket + has_rate_compare +
                 has_mf_browse + has_stocks_search)

    row_dict = dict(
        id=i+1,
        city=city,
        city_tier=tier,
        age_group=age_group,
        fd_amount_l=fd_amount,
        fd_count=fd_count,
        days_left=days_left,
        last_login_days=last_login_days,
        n_signals=n_signals,
        has_early_withdrawal=has_early_withdrawal,
        has_no_login=has_no_login,
        has_competitor_browse=has_competitor_browse,
        has_safety_check=has_safety_check,
        has_support_ticket=has_support_ticket,
        has_rate_compare=has_rate_compare,
        has_mf_browse=has_mf_browse,
        has_stocks_search=has_stocks_search,
    )

    persona, outcome = assign_persona_and_outcome(row_dict)
    risk_score = compute_risk_score(row_dict)

    row_dict['persona'] = persona
    row_dict['outcome'] = outcome
    row_dict['risk_score'] = risk_score
    row_dict['urgency'] = int(np.clip(risk_score + np.random.normal(0, 3), 0, 100))
    rows.append(row_dict)

df = pd.DataFrame(rows)

# ── Save ────────────────────────────────────────────────────────────────────
OUT = os.path.join(os.path.dirname(__file__), 'data', 'fd_customers_5000.csv')
df.to_csv(OUT, index=False)

print(f"✅  Generated {len(df)} customers → {OUT}")
print(f"\n── Outcome distribution ──")
print(df['outcome'].value_counts())
print(f"\n── Persona distribution ──")
print(df['persona'].value_counts())
print(f"\n── Signal rates ──")
for sig in ['has_early_withdrawal','has_no_login','has_competitor_browse',
            'has_safety_check','has_support_ticket','has_rate_compare',
            'has_mf_browse','has_stocks_search']:
    print(f"  {sig:<28} {df[sig].mean()*100:.1f}%")
print(f"\n── FD Amount (lakhs) ──")
print(df['fd_amount_l'].describe().round(2))
print(f"\n── Risk Score ──")
print(df['risk_score'].describe().round(1))
