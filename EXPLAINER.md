# Intent Mirror — Simple Explainer

---

## What Is This?

A dashboard for bank employees that shows them **which customers are about to leave** — and exactly what to say to keep them.

It watches how FD (Fixed Deposit) customers behave on the app, detects warning signs, predicts what they'll do next using real machine learning models, generates a personalised AI message for each customer, and shows wealth upgrade opportunities beyond the FD.

---

## The Problem It Solves

When an FD matures, the bank has a small window to retain that money.
Most banks miss it because:

- They don't know who is at risk until the customer is already gone
- They send the same generic SMS to everyone
- Nobody knows who to call first
- There's no path to grow the customer into higher-value products

**Intent Mirror fixes all four.**

---

## How It Works — In 4 Steps

1. **Watch** — Tracks what users do: did they visit the early withdrawal page? Compare rates? Stop logging in? Browse competitor banks?
2. **Predict** — A trained XGBoost model gives every user a risk score (0–100) and predicts what they'll do next (Churn / Withdraw / Upgrade / Renew). A second model classifies their behavioral persona.
3. **Nudge** — Generates a personalised AI message (in English or Hindi) calibrated to their persona's psychology — not a generic template
4. **Grow** — Shows wealth upgrade pathways: mutual funds, insurance, stocks, and financial literacy content matched to each persona

---

## The Pages

### 🏠 Landing Page
The home / marketing page.

- **"Your Users Are Leaving"** button → Opens a page that explains the problem with real stats
- **"For Banks"** button → Opens the enterprise pitch page with pricing, capabilities, and integration steps
- **"Contact"** button → Opens a contact form that submits to the backend
- **"Live Demo →"** button → Opens the 5-step AI-guided walkthrough
- **"Enter Dashboard →"** button → Goes straight to the ops dashboard

---

### 🎬 Demo Page
A self-running guided tour of the product.

- Auto-advances every 8 seconds through 5 steps
- Each step shows a visual + an AI narrator explaining what's happening
- You can manually click through or pause it
- Steps: Platform Overview → User DNA → Harvest Window → Intent Feed → Smart Nudges

---

### 📊 Dashboard
The main product. Has 6 sections accessible from the top navigation bar.

---

#### Header Bar (always visible)

| Element | What It Does |
|---------|-------------|
| Logo / brand name | Click to go back to the landing page |
| Overview / Customers / Intelligence / Nudges / Wealth Hub / ML Engine | Switch between dashboard sections |
| EN / हिंदी toggle | Switches the entire dashboard to Hindi |
| ☀ / 🌙 button | Toggles dark mode and light mode |
| LIVE badge | Shows the system is active and processing |
| Live alert ticker | Scrolling strip of real-time customer alerts — churn risks, withdrawal intents, upgrade signals |

---

#### Section 1 — Overview (default landing section)

This is the main ops screen — everything a bank manager needs to see at a glance, all in one place.

| Section | What It Shows |
|---------|--------------|
| Live clock + account count | Timestamp and total accounts being monitored |
| 6 KPI cards | Churn Risk, FDs Maturing, Upgrade Ready, Renewal Rate, Beyond-FD Users, Nudges Sent Today |
| Intent trend chart | Area chart showing churn vs renewal signals over the last 30 days |
| High-risk customer table | Top 8 at-risk customers with days left, persona, risk score, and Send Nudge button |
| Persona distribution donut | What % of your customer base is each behavioral type |
| Live intent feed | Real-time stream of customers triggering behavioral signals |
| Signal frequency chart | Bar chart showing which signals are firing most |
| Critical Harvest strip | Horizontally scrollable cards for customers needing action today |
| Mini stocks widget | 8 live NSE/BSE stock prices updating every 2.5 seconds |
| Wealth opportunities panel | Overview of customers ready to be moved into wealth products |

---

#### Section 2 — Customers (Harvest Window)
Shows every FD maturing in the next 30 days, ranked by churn risk.

| Section | What It Shows |
|---------|--------------|
| Maturity timeline chart | Bar chart of users grouped by how soon their FD matures |
| Risk score trend | Area chart of top risk scores in this window |
| 3 summary counters | Withdraw/Churn count, Upgrade ready, Will Renew |
| Filter pills | All / Churn risk / Upgrade ready / Renew likely |
| User table | Every at-risk user with FD amount, days left, persona, prediction, risk score |
| Send Nudge button | Opens the AI nudge modal for that specific user |

---

#### Section 3 — Intelligence (User DNA + Intent Feed)

**User DNA** — breaks down the entire user base by personality type.

| Section | What It Shows |
|---------|--------------|
| Persona share donut chart | What % of users are each behavioral type |
| 4 persona cards | Each with a 6-month trend sparkline, description, recommended action |
| Drift alert | Warning when users are shifting to a riskier persona |
| Signal bars | 8 behavioral signals with how many users triggered each |
| Signal radar | Radar chart showing intensity across all signals |
| Cohort chart | How personas have shifted over 6 months |

**The 4 Personas:**
- 🛡️ **Protector** — Loyal, long tenors, renews on autopilot. Needs a rate reminder and loyalty recognition.
- 📊 **Optimizer** — Compares rates, short tenors, data-driven. Most likely to upgrade to mutual funds.
- 😰 **Anxious Saver** — Visits often but hesitates. Needs DICGC safety reassurance.
- 🚪 **Exiter** — Declining activity, competitor browsing, FD maturing. Needs urgent personal appeal.

**Intent Feed** — urgency-sorted live stream of customer signals.

The left edge of each row is color-coded:
- 🔴 Red = Critical (risk score ≥ 85) — contact today
- 🟡 Amber = High (score 60–84) — contact this week
- 🟢 Green = Moderate (score < 60) — monitor

---

#### Section 4 — Nudges (Next Step Nudge+)
For customers ready to move beyond FD into other financial products.

| Section | What It Shows |
|---------|--------------|
| Product interest bar chart | How many users are exploring each product |
| Upgrade readiness radial chart | Strongly ready / Exploring / Hesitant |
| 3 KPI cards | Nudge CTR, Beyond-FD count, Upgrades this month |
| 4 product cards | Debt MF, Hybrid Fund, Index Fund, Digital Gold — with interest progress bar |
| Risk spectrum | Visual ladder from FD (safest) to Stocks (highest risk) |
| SEBI disclaimer | Regulatory note |

---

#### Section 5 — Wealth Hub *(NEW)*
This turns Intent Mirror from a retention tool into a full wealth intelligence platform. Five tabs:

**Stocks tab**
- 12 NSE/BSE stocks with live price simulation updating every 2.5 seconds
- % change colored green (up) or red (down)
- Market cap, sector, mini sparkline per stock
- Designed like an NSE/BSE-style terminal view

**Mutual Funds tab**
- 6 representative funds: ELSS, debt, flexi-cap, index, liquid, hybrid
- NAV, 1-year return, risk rating, fund house
- Sorted by customer interest signals

**Insurance tab**
- 4 products: LIC term plan, health insurance, ULIP, endowment
- Cover amount, annual premium, key features
- Matched to Protector and Anxious Saver personas

**Financial Literacy tab**
- 6 cards explaining: what happens to FD interest during inflation, power of compounding, DICGC insurance coverage, difference between debt and equity, SIP basics, tax-saving via ELSS
- Written in plain language, not jargon
- Color-coded by topic

**Upgrade Map tab**
- Persona → investment pathway visualization: which products suit which persona
- Filterable customer table: filter by persona, see which customers are upgrade-ready
- Send Nudge button on each row → opens AI modal pre-loaded with wealth upgrade messaging

---

#### Section 6 — ML Engine *(AI)*
Shows the actual machine learning models powering the platform.

| Section | What It Shows |
|---------|--------------|
| Outcome Classifier metrics | 59% accuracy, ROC-AUC 0.79, trained on 5,000 customers |
| Persona Classifier metrics | 87.3% accuracy, ROC-AUC 0.98 |
| Risk Regressor metrics | MAE 3.27, R² = 0.97 |
| Confusion matrix | Visual breakdown of prediction errors per class |
| Feature importance | Which behavioral signals matter most to each model |
| Gen AI Panel | Enter a customer profile → see the full LLM prompt + the generated nudge message + the reasoning behind it |

The Gen AI Panel shows exactly what gets sent to the language model — including the persona psychology, signal context, channel constraints, and task instructions. This is the prompt engineering framework.

---

### 🤖 AI Nudge Modal (upgraded in v3.0)
Opens when you click "Send Nudge" on any customer anywhere in the dashboard.

- Shows the customer's name, persona, city, FD amount, days left
- Shows which behavioral signals triggered the alert
- Calls the AI nudge engine and displays the generated message
- Shows **"✨ AI GENERATED"** badge when the AI result is live
- Channel selector: in-app notification / SMS (160 character limit) / email
- **Reasoning chain** — explains *why* this message was written for this persona
- **"View LLM Prompt"** — toggle to see the exact structured prompt sent to the AI model
- **Regenerate** button — get a fresh variation
- **EN / हिंदी** toggle — switches the generated message language
- **Copy** button — copies to clipboard
- **Send** button — logs the nudge to the backend

If the AI service is offline, it falls back to built-in persona-matched template messages automatically.

---

## The ML Models — Plain English

Three separate models run every time a customer is profiled:

**Model 1 — What will this customer do? (Outcome Classifier)**
Takes in behavioral signals (did they log in recently, did they compare rates, did they search for early withdrawal) and outputs one of four predictions: Churn, Withdraw, Upgrade, or Renew. Trained on 5,000 examples, achieves 59% accuracy on holdout data (vs ~25% if randomly guessing between 4 classes).

**Model 2 — Who is this customer? (Persona Classifier)**
Takes the same signals and outputs their behavioral persona: Exiter, Anxious Saver, Optimizer, or Protector. Achieves 87.3% accuracy — very high because persona is more stable than short-term outcome.

**Model 3 — How risky is this customer right now? (Risk Regressor)**
Outputs a continuous 0–100 risk score. Mean absolute error of 3.27 points — accurate enough to rank customers reliably for the ops team.

---

## Color Guide

| Color | Means |
|-------|-------|
| 🟢 Green / Teal | Safe, renewing, positive signal |
| 🔵 Blue | Optimizing, exploring, neutral |
| 🟡 Amber / Gold | Caution, anxious, medium risk |
| 🔴 Red / Coral | Churn risk, critical, immediate action needed |
| 🟣 Purple | Beyond-FD ready, upgrade pipeline |

---

## Search Examples That Work

Type these into the search bar:

- `churn risk` → all users predicted to churn
- `maturing this week` → FDs expiring in ≤ 7 days
- `Mumbai` → all Mumbai users
- `Exiter` → users classified as Exiters
- `high risk` → users with risk score > 80
- `mutual fund` → users browsing MF section
- `no login` → users inactive for 30+ days
- `upgrade ready` → users predicted to upgrade
