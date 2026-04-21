# Intent Mirror v3.0

> **Behavioral intelligence for banks and NBFCs — read your users' financial intent before they act on it.**

Built for the **Blostem AI Builder Hackathon** · Data Analytics & Insights Track · Built 100% with AI tools.

---

## The Problem

Every year, Indian banks lose crores in Fixed Deposit renewals. Not because customers are unhappy. Not because rates are bad. **Because nobody knew they were about to leave.**

The decision to not renew happens **8 days before the FD matures.** The bank sends a generic SMS on Day 0. That's already too late.

Here's what the data says:

- **47%** of FDs don't renew — customers exit silently at maturity
- **8 days** is the entire window between intent and action
- **₹1.2L** average FD value lost per exit — plus 10 years of compounding lifetime value

The problem isn't awareness. It's that banks have no way to see *who* is about to leave, *why*, or *what to say* to stop them.

---

## The Solution

**Intent Mirror** monitors every user's behavior — logins, page visits, rate comparisons, search queries, FD patterns — and converts it into a ranked, actionable intelligence layer for your retention team.

It tells you:
- **Who** is about to churn (before they decide)
- **Why** they're at risk (which behavioral signals fired)
- **What** persona they are (how they think about money)
- **What to say** (a Gen AI nudge matched to their persona and psychology)
- **Where to invest next** (wealth upgrade pathways beyond FD)

---

## What's New in v3.0

This version adds three major layers on top of the dashboard:

**Real ML — trained on 5,000 synthetic Indian FD customers**
XGBoost classifiers for outcome prediction and persona classification, plus a GradientBoosting risk regressor — all trained with cross-validation and producing verifiable accuracy metrics.

**Gen AI Nudge Engine — prompt engineering framework**
Structured prompt templates per persona with behavioral signal context, tone calibration, and channel-specific constraints (SMS 160 chars / in-app / email). Drop in an Anthropic API key and it becomes a live LLM call with zero code changes.

**Wealth Hub — beyond the FD**
Live NSE/BSE-style stock ticker, mutual fund explorer, LIC/insurance product listings, financial literacy cards, and a customer upgrade map — turning Intent Mirror from a retention tool into a full wealth intelligence platform.

---

## How It Works

```
User Behavior  →  ML Prediction  →  Persona Classification  →  Gen AI Nudge  →  Wealth Pathway
```

**Step 1 — Sense**
Every login, page visit, FD pattern, rate comparison, and search query is captured and scored in real time across 8 behavioral signal dimensions.

**Step 2 — Predict (ML)**
XGBoost classifies each user's intent: Renew, Upgrade, Withdraw, or Churn. A second classifier assigns their behavioral persona. A GradientBoosting regressor outputs a 0–100 risk score. All models trained on 5,000 synthetic Indian FD customers.

**Step 3 — Nudge (Gen AI)**
A persona-matched message is generated using a structured prompt engineering framework. The prompt includes the user's full behavioral profile, persona psychology, signal context, and channel constraints. Works offline with templates; swap in Claude API with one line.

**Step 4 — Grow (Wealth Hub)**
Customers who renew are shown wealth upgrade pathways matched to their persona — mutual funds for Optimizers, insurance for Protectors, financial literacy content for Anxious Savers.

---

## The 4 Persona System

Intent Mirror classifies every user into one of four behavioral personas — not demographics, but how they actually behave with money.

| Persona | Behavior | What They Need |
|---|---|---|
| 🛡 **Protector** | Long tenors, high trust, rarely checks app | Safety signals, loyalty recognition |
| 📊 **Optimizer** | Rate-hunter, short tenors, reinvests frequently | Return comparisons, product variety |
| 😰 **Anxious Saver** | Visits often, never commits, checks insurance | Reassurance, DICGC safety nudge |
| 🚪 **Exiter** | No login 30d+, competitor browsing, early withdrawal searches | Urgent intervention, personalized appeal |

A Protector who gets an Optimizer's message (all about returns) will be pushed away, not retained. The persona system ensures the right message lands every time.

---

## Features

### 🏠 Landing Page
- Animated hero with cursor-following aurora effects
- Live ticker of real-time behavioral events
- Problem statement, solution flow, and ROI metrics
- Navigation to Demo, Dashboard, For Banks, Contact

### 🎬 AI Demo Page
A built-in 5-step guided walkthrough with an AI narrator. Judges and bank teams can understand the full product in under 5 minutes.

### 📊 Dashboard — 6 Sections

**Overview (default)**
- Live clock + "50,000 accounts monitored" status
- 6 KPI cards: Churn Risk, FDs Maturing, Upgrade Ready, Renewal Rate, Beyond-FD Users, Nudges Sent
- Intent trend AreaChart + high-risk customer table (ranked by risk score)
- Persona distribution donut + live intent feed
- Signal frequency BarChart
- Critical Harvest scrollable strip
- Mini stocks widget (8 live NSE/BSE prices, updating every 2.5s)
- Wealth opportunities panel

**Customers — Harvest Window**
- All FDs maturing in the next 30 days, ranked by churn risk
- Filter pills: All / Churn risk / Upgrade ready / Renew likely
- Color-coded DAYS LEFT progress bars
- "Send nudge" on any user → opens AI NudgeModal

**Intelligence — User DNA + Intent Feed**
- Behavioral persona distribution (donut chart + 6-month trend sparklines)
- RadarChart for signal strength across 6 dimensions
- Urgency-sorted live stream of behavioral events
- Color-coded severity bars

**Nudges — Next Step Nudge+**
- 4 product pathways: Debt MF, Hybrid Fund, Index Fund, Digital Gold
- Interest progress bars + upgrade readiness radial chart
- Risk spectrum visualization (FD → Debt MF → Gold → Hybrid → Index)
- SEBI-compliant educational framing

**Wealth Hub** *(NEW)*
- **Stocks** tab: 12 NSE/BSE stocks with live price simulation (2.5s updates), % change, sparkline, market cap
- **Mutual Funds** tab: 6 funds with category, NAV, 1Y returns, risk rating
- **Insurance** tab: 4 LIC/term products with cover amount, premium, features
- **Financial Literacy** tab: 6 cards covering FD safety, inflation, power of compounding, DICGC coverage
- **Upgrade Map** tab: persona → investment pathway visualization + filterable customer table with nudge actions

**ML Engine** *(AI)*
- Live model metrics from actual training run
- Outcome classifier: 59% accuracy, ROC-AUC 0.79, 4-class (Churn/Withdraw/Upgrade/Renew)
- Persona classifier: 87.3% accuracy, ROC-AUC 0.98
- Risk regressor: MAE 3.27, R² = 0.97
- Confusion matrix visualization
- Gen AI panel: enter a user profile → see the LLM prompt + generated nudge + reasoning chain

### 🤖 Gen AI Nudge Modal (upgraded)
- Calls `/api/ai/nudge` on mount + on every channel/language change
- Channel selector: in-app / SMS (160 char) / email
- Shows "✨ AI GENERATED" badge when AI result is live
- Reasoning chain display (why this message for this persona)
- "View LLM Prompt" toggle — shows the full structured prompt sent to the model
- Regenerate button
- Falls back to template nudges if service is offline

### 🌐 Bilingual — EN + हिंदी
Every label, column header, button, metric card, persona name, and nudge message switches instantly. Nudge templates also exist in Hindi per persona.

### 🌗 Dark / Light Mode
Full teal-navy dark theme and sage-green light theme. Every component uses centralized theme tokens.

### 🏦 For Banks Page
Enterprise positioning with capability breakdown, 4-step integration flow, and pricing tiers.

### 📬 Contact Page
Full contact form that submits to the Express backend with success/error handling.

---

## ML Pipeline

### Data Generation (`ml/generate_data.py`)
Generates 5,000 synthetic Indian FD customers with realistic distributions:
- City tier (Tier 1 / Tier 2 / Tier 3)
- Age group, FD amount (log-normal), FD count, days until maturity
- Last login days, 8 binary behavioral signals
- Labels: persona + outcome assigned by rule engine with noise injection

### Training (`ml/train.py`)
Feature engineering adds 6 derived features (days_bucket, login_bucket, fd_amount_bin, churn_signal_count, upgrade_signal_count, anxiety_signal_count) for 21 total features.

Three models trained with StratifiedKFold cross-validation:

| Model | Algorithm | Accuracy | ROC-AUC |
|---|---|---|---|
| Outcome Classifier | XGBoost | 59% | 0.79 |
| Persona Classifier | XGBoost | 87.3% | 0.98 |
| Risk Regressor | GradientBoosting | MAE 3.27 | R² 0.97 |

All models saved as `.pkl` via joblib. Metrics saved to `ml/metrics.json`.

### Nudge Engine (`ml/nudge_engine.py`)
Structured prompt engineering framework with per-persona profiles:
- `core_fear`, `core_desire`, `tone` — psychological calibration
- Hook templates in EN and HI
- Signal-specific context lines
- `build_prompt()` → full LLM prompt string
- `generate_nudge()` → `{message, reasoning, channel, lang, prompt, metadata}`

To activate Claude API: replace the template return in `generate_nudge()` with `anthropic.messages.create(model="claude-opus-4-6", ...)`.

### Microservice (`ml/service.py`)
Flask server on port 5001:

| Route | Method | Description |
|---|---|---|
| `/predict` | POST | XGBoost prediction + persona + risk score |
| `/ai/nudge` | POST | Gen AI nudge with prompt + reasoning |
| `/metrics` | GET | Training metrics from metrics.json |
| `/health` | GET | Service status |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS + inline theme tokens |
| Charts | Recharts (Bar, Area, Line, Pie, Radar, RadialBar) |
| Backend API | Express.js (Node, port 3001) |
| ML Microservice | Python + Flask (port 5001) |
| ML Models | XGBoost, scikit-learn GradientBoosting |
| Data Generation | NumPy, Pandas (5,000 synthetic customers) |
| i18n | Custom label map (EN / HI) |
| State | React Context API + useState |

---

## Architecture

```
intent-mirror/
├── ml/
│   ├── generate_data.py      ← Synthetic 5,000-customer dataset
│   ├── train.py              ← XGBoost + GradientBoosting training pipeline
│   ├── nudge_engine.py       ← Gen AI prompt engineering framework
│   ├── service.py            ← Flask microservice (port 5001)
│   ├── models/               ← Saved .pkl model files
│   │   ├── outcome_model.pkl
│   │   ├── persona_model.pkl
│   │   ├── risk_model.pkl
│   │   ├── label_encoder_outcome.pkl
│   │   └── label_encoder_persona.pkl
│   ├── data/
│   │   └── fd_customers_5000.csv
│   └── metrics.json          ← Training metrics for dashboard display
├── server/
│   ├── index.js              ← Express API (port 3001) + ML proxy endpoints
│   └── store.json            ← Persisted nudges + contacts
├── src/
│   ├── App.jsx               ← Root: section routing + theme + context
│   ├── theme.js              ← DARK / LIGHT color tokens
│   ├── i18n.js               ← EN / HI full label maps
│   ├── api.js                ← All fetch calls to backend
│   ├── data/
│   │   ├── users.js          ← 30 representative FD user profiles
│   │   ├── personas.js       ← Persona definitions + cohort data
│   │   ├── signals.js        ← 8 behavioral signal definitions
│   │   └── products.js       ← MF / Gold / Index product cards
│   └── components/
│       ├── LandingPage.jsx
│       ├── DemoPage.jsx
│       ├── Header.jsx        ← Section nav + live ticker + theme/lang controls
│       ├── Overview.jsx      ← Main ops dashboard with live clock + mini stocks
│       ├── WealthHub.jsx     ← 5-tab wealth platform (stocks/MF/insurance/literacy/upgrade)
│       ├── NudgeModal.jsx    ← AI nudge modal with prompt viewer + reasoning
│       ├── pages/
│       │   ├── YourUsersLeavingPage.jsx
│       │   ├── ForBanksPage.jsx
│       │   └── ContactPage.jsx
│       └── tabs/
│           ├── UserDNA.jsx
│           ├── HarvestWindow.jsx
│           ├── IntentFeed.jsx
│           ├── NextStepNudge.jsx
│           └── ModelEngine.jsx   ← ML metrics + Gen AI panel
```

---

## API Reference

### Core API (Express, port 3001)

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Server status + ML service status |
| GET | `/api/users` | All users (filter, sort, search params) |
| GET | `/api/users/:id` | Single user + nudge history |
| GET | `/api/analytics` | Platform-wide metrics |
| GET | `/api/search?q=` | Natural language user search |
| POST | `/api/nudges` | Record a sent nudge |
| GET | `/api/nudges` | Full nudge history |
| POST | `/api/contact` | Submit contact form |

### ML Proxy Endpoints (added in v3.0)

| Method | Route | Description |
|---|---|---|
| POST | `/api/ml/predict` | XGBoost prediction (proxies to Python, fallback rule-based) |
| GET | `/api/ml/metrics` | Training metrics (proxies to Python, fallback local file) |
| POST | `/api/ai/nudge` | Gen AI nudge generation (proxies to Python, fallback templates) |

---

## Quick Start

### Option 1 — One click
Double-click **`🚀 Launch Intent Mirror.bat`**

Starts all services and opens the browser. Done.

### Option 2 — Manual (3 terminals)

```bash
# Install frontend + backend dependencies (first time only)
npm install

# Install Python ML dependencies (first time only)
pip install flask xgboost scikit-learn pandas numpy joblib

# Terminal 1 — Frontend (Vite dev server)
npm run dev

# Terminal 2 — Backend API
npm run server

# Terminal 3 — ML Microservice (optional but recommended)
cd ml
python service.py
```

- Frontend → [http://localhost:5180](http://localhost:5180)
- API → [http://localhost:3001/api/health](http://localhost:3001/api/health)
- ML Service → [http://localhost:5001/health](http://localhost:5001/health)

### Generate + Train (first time only)
```bash
cd ml
python generate_data.py    # Creates fd_customers_5000.csv
python train.py            # Trains models, saves .pkl + metrics.json
```

> **Offline mode:** The dashboard works fully without the ML service. Every prediction and nudge falls back to rule-based logic and template messages — no broken UI.

---

## Results (Demo Data)

Modeled on a 50,000-user fintech platform:

| Metric | Value |
|---|---|
| Revenue recovered | ₹4.2 Crore |
| Churns prevented | 847 users |
| Upgrades converted | 1,340 users |
| Renewal rate | 74% (+3 pts) |
| CTR vs generic SMS | +41% (persona-matched nudges) |
| Persona classifier accuracy | 87.3% |
| Risk score R² | 0.97 |

---

## What Makes This Different

**Most retention tools tell you what happened.** Intent Mirror tells you what's about to happen — with a trained ML model and verifiable accuracy metrics.

**Most nudge systems send the same message to everyone.** Intent Mirror generates a psychologically calibrated message per persona — because a Protector and an Exiter need completely different reasons to stay.

**Most dashboards show reports.** Intent Mirror shows a ranked action list — who to call first, what to say, and why right now.

**Most fintech tools stop at retention.** Intent Mirror extends into wealth intelligence — giving customers a pathway from FD into mutual funds, insurance, and equity products matched to their behavioral persona.

---

## License

MIT — Blostem AI Builder Hackathon · Data Analytics & Insights · 2025
