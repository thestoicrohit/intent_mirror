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
- **What to say** (a persona-matched nudge, not a generic SMS)

---

## How It Works

```
User Behavior  →  Behavioral Scoring  →  Persona Classification  →  Ranked Dashboard  →  Persona-Matched Nudge
```

**Step 1 — Sense**
Every login, page visit, FD pattern, rate comparison, and search query is captured and scored in real time across 6 behavioral signal dimensions.

**Step 2 — Predict**
The scoring engine classifies each user's intent: Renew, Upgrade, Withdraw, or Churn — updated every 24 hours. Users are ranked by urgency so your team knows exactly who to contact first.

**Step 3 — Nudge**
A persona-matched message fires at exactly the right moment. Not generic. Not late. Written for this user, at this moment, about this product.

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
- Live ticker of real-time behavioral events firing across the platform
- The problem statement, solution flow, and ROI metrics — all in one scroll
- Navigation to Demo, Dashboard, For Banks, Contact

### 🤖 AI Demo Page
A built-in 5-step guided walkthrough with an AI narrator that auto-advances through every feature. Judges and bank teams can understand the full product in under 5 minutes without anyone explaining it.

Steps: Platform Overview → User DNA → Harvest Window → Intent Feed → Smart Nudges

### 📊 Dashboard — 4 Tabs

**User DNA**
- Behavioral persona distribution across 50,000 users (donut chart)
- 4 persona cards with individual AreaChart sparklines showing 6-month trend
- RadarChart for signal strength across 6 behavioral dimensions
- Stacked BarChart for cohort distribution
- Persona drift alert (Optimizers trending toward Exiter behavior)
- 6 engagement metric cards with live counts

**Harvest Window** *(default tab)*
- All FDs maturing in the next 30 days, ranked by churn risk
- Filter pills: All / Churn risk / Upgrade ready / Renew likely
- Color-coded DAYS LEFT progress bar (red <7d, orange <15d, green 21d+)
- Summary cards: Withdraw/Churn (red), Upgrade potential (green), Likely to renew (blue)
- BarChart: FD maturity bucket distribution (0–7d, 8–14d, 15–21d, 22–30d)
- AreaChart: Top 10 risk scores trend
- "Send nudge" on any user → opens NudgeModal with persona-matched message

**Intent Feed**
- Urgency-sorted live stream of behavioral events
- Left-edge color bar indicates severity (red = critical, orange = high, green = moderate)
- Each row: name, persona badge, urgency score, signal detected, hours ago
- Filter: All / Exit risk / Growing
- BarChart: urgency bucket breakdown
- LineChart: urgency scores across top users

**Next Step Nudge+**
- 4 product pathways: Debt MF, Hybrid Fund, Index Fund, Digital Gold
- Interest progress bars showing how many users are exploring each product
- BarChart: product interest distribution
- RadialBarChart: upgrade readiness by product
- Risk spectrum visualization (FD → Debt MF → Gold → Hybrid → Index)
- SEBI-compliant educational framing throughout

### 🔍 Conversational Search
Type plain English queries — "show churn risk users in Mumbai", "optimizer maturing this week" — and get an instantly filtered user table. No SQL. No reports.

### 💬 Nudge Modal
Click "Send nudge" on any user and get a persona-matched message generated for that specific user. Protectors get safety and loyalty language. Exiters get urgent intervention. Optimizers get return data. Every nudge is logged to the backend.

### 🌐 Bilingual — EN + हिंदी
Every single label, column header, button, metric card, filter pill, persona name, SEBI note, and nudge message switches instantly with one click. Built for teams and users who operate in Hindi.

### 🌗 Dark / Light Mode
Full teal-navy dark theme and sage-green light theme. Every component uses the theme system — no hardcoded colors anywhere.

### 🏦 For Banks Page
Enterprise positioning with capability breakdown, 4-step integration flow, and three pricing tiers (Starter / Growth / Enterprise).

### 📬 Contact Page
Full contact form (name, org, email, inquiry type, message) that submits to the Express backend. Success state and error handling included.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS + inline theme tokens |
| Charts | Recharts (Bar, Area, Line, Pie, Radar, RadialBar) |
| Backend | Express.js (Node) |
| Data | In-memory mock data + JSON file persistence |
| i18n | Custom label map (EN / HI) |
| State | React Context API + useState + useMemo |

---

## Architecture

```
intent-mirror/
├── server/
│   ├── index.js              ← Express API (port 3001)
│   └── store.json            ← Persisted nudges + contacts
├── src/
│   ├── App.jsx               ← Root: view routing + theme + context
│   ├── theme.js              ← DARK / LIGHT color tokens
│   ├── i18n.js               ← EN / HI full label maps
│   ├── api.js                ← All fetch calls to backend
│   ├── hooks/
│   │   └── useApi.jsx        ← useApi hook + Spinner + ApiError
│   ├── data/
│   │   ├── users.js          ← 30 representative FD user profiles
│   │   ├── personas.js       ← Persona definitions + cohort data
│   │   ├── signals.js        ← 6 behavioral signal definitions
│   │   └── products.js       ← MF / Gold / Index product cards
│   └── components/
│       ├── LandingPage.jsx   ← Full marketing landing page
│       ├── DemoPage.jsx      ← 5-step AI-narrated guided demo
│       ├── Header.jsx        ← Search bar + lang toggle + LIVE badge
│       ├── HealthScore.jsx   ← Platform score + sparkline
│       ├── MetricsBar.jsx    ← 5 KPI cards
│       ├── TabNav.jsx        ← Tab switcher
│       ├── NudgeModal.jsx    ← Persona-matched nudge generator
│       ├── SearchOverlay.jsx ← NL search → filtered user table
│       ├── pages/
│       │   ├── YourUsersLeavingPage.jsx
│       │   ├── ForBanksPage.jsx
│       │   └── ContactPage.jsx
│       └── tabs/
│           ├── UserDNA.jsx
│           ├── HarvestWindow.jsx
│           ├── IntentFeed.jsx
│           └── NextStepNudge.jsx
```

---

## API Reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Server status |
| GET | `/api/users` | All users (supports filter, sort, search params) |
| GET | `/api/users/:id` | Single user + nudge history |
| GET | `/api/analytics` | Platform-wide metrics |
| GET | `/api/search?q=` | Natural language user search |
| POST | `/api/nudges` | Record a sent nudge |
| GET | `/api/nudges` | Full nudge history |
| POST | `/api/contact` | Submit contact form |

---

## User Data Schema

```js
{
  id,                // unique identifier
  name,              // full name
  city,              // Indian city
  fdAmount,          // e.g. "₹5.1L"
  daysLeft,          // 1–30 (days until FD matures)
  persona,           // "Protector" | "Optimizer" | "Anxious Saver" | "Exiter"
  prediction,        // "Churn" | "Withdraw" | "Upgrade" | "Renew"
  riskScore,         // 0–100 (churn probability)
  urgency,           // 0–100 (action priority score)
  signals,           // array: ["early_withdrawal", "no_login_30d", ...]
  lastLogin,         // days since last login
  detectedHrsAgo     // hours since signal was first detected
}
```

### Behavioral Signals

| Signal | Meaning |
|---|---|
| `early_withdrawal` | Searched or initiated early withdrawal |
| `no_login_30d` | No platform login in 30+ days |
| `competitor_browse` | Visited competitor bank/NBFC pages |
| `rate_compare` | Compared FD rates across providers |
| `mf_browse` | Browsed mutual fund product pages |
| `stocks_search` | Searched for equity/stock products |
| `safety_check` | Visited DICGC or insurance FAQ pages |
| `support_ticket` | Raised a complaint or support request |

---

## Quick Start

### Option 1 — One click
Double-click **`🚀 Launch Intent Mirror.bat`**

Starts the backend, starts the frontend, opens the browser. Done.

### Option 2 — Manual

```bash
# Install dependencies (first time only)
npm install

# Terminal 1 — Backend API
npm run server

# Terminal 2 — Frontend
npm run dev
```

- Frontend → [http://localhost:5180](http://localhost:5180)
- API → [http://localhost:3001/api/health](http://localhost:3001/api/health)

> **Offline mode:** The dashboard works fully without the backend. Every tab falls back to local mock data automatically — no errors, no broken UI.

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

---

## What Makes This Different

**Most retention tools tell you what happened.** Intent Mirror tells you what's about to happen.

**Most nudge systems send the same message to everyone.** Intent Mirror sends a different message to every persona — because a Protector and an Exiter need completely different reasons to stay.

**Most dashboards show reports.** Intent Mirror shows a ranked action list — who to call first, what to say, and why right now.

---

## License

MIT — Blostem AI Builder Hackathon · Data Analytics & Insights · 2024
