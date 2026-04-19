# Intent Mirror — Simple Explainer

---

## What Is This?

A dashboard for bank employees that shows them **which customers are about to leave** — and exactly what to say to keep them.

It watches how FD (Fixed Deposit) customers behave on the app, detects warning signs, and suggests a personalised message to send them before it's too late.

---

## The Problem It Solves

When an FD matures, the bank has a small window to retain that money.
Most banks miss it because:

- They don't know who is at risk until the customer is already gone
- They send the same generic SMS to everyone
- Nobody knows who to call first

**Intent Mirror fixes all three.**

---

## How It Works — In 4 Steps

1. **Watch** — Tracks what users do: did they visit the early withdrawal page? Compare rates? Stop logging in?
2. **Score** — Gives every user an urgency score and predicts what they'll do next (Churn / Withdraw / Upgrade / Renew)
3. **Show** — Displays a ranked list: who needs action today, who can wait, who is ready to upgrade
4. **Nudge** — Generates a personalised message (in English or Hindi) and sends it with one click

---

## The Pages

### 🏠 Landing Page
The home / marketing page.

- **"Your Users Are Leaving"** button → Opens a page that explains the problem with real stats and customer exit stories
- **"For Banks"** button → Opens the enterprise pitch page with pricing, capabilities, and integration steps
- **"Contact"** button → Opens a contact form that actually submits to the backend
- **"Live Demo →"** button → Opens the 5-step AI-guided walkthrough

---

### 🎬 Demo Page
A self-running guided tour of the product.

- Auto-advances every 8 seconds through 5 steps
- Each step shows a visual + an AI narrator explaining what's happening
- You can manually click through or pause it
- Steps: Overview → User DNA → Harvest Window → Intent Feed → Smart Nudges

---

### 📊 Dashboard
The main product. Has 5 sections:

---

#### Header Bar (always visible)
| Element | What It Does |
|---------|-------------|
| Logo / brand name | Click to go back to the landing page |
| Search bar | Type anything — "show churn risk users in Mumbai" — and get filtered results instantly |
| EN / हिंदी toggle | Switches the entire dashboard (all labels, buttons, nudge messages) to Hindi |
| ☀ / 🌙 button | Toggles between dark mode and light mode |
| LIVE badge | Shows the system is active and processing |

---

#### Health Score (top section)
- The big number (74) = overall platform health out of 100
- The sparkline chart = how the score has trended over the last 7 data points
- 3 bullet points = quick highlights (renewal rate up, micro-moments needing action, FDs maturing)
- The pill on the right = how many nudges have been sent today (live from backend)

---

#### Metrics Bar (5 cards)

| Card | What It Shows |
|------|--------------|
| **CHURN RISK** | How many users are at high risk of leaving |
| **HARVEST WINDOW** | FDs maturing in the next 30 days |
| **HIGH INTENT** | Users who are ready to renew right now |
| **RETENTION** | % of customers successfully retained |
| **BEYOND-FD READY** | Users actively exploring Mutual Funds or Gold |

---

#### Tab 1 — User DNA
Breaks down the entire user base by personality type.

| Section | What It Shows |
|---------|--------------|
| Persona share donut chart | What % of users are each type |
| 4 persona cards | Each with a 6-month trend sparkline, description, and recommended action |
| Drift alert | Warning when users are shifting from one persona to a worse one |
| Signal bars | 6 behavioral signals with how many users triggered each |
| Signal radar | A radar chart showing the intensity of each signal across the platform |
| Cohort chart | Stacked bar chart showing how personas have shifted over 6 months |
| 6 engagement metrics | Session depth, days to decision, nudge CTR, renewal rate, pipeline, churn prevented |

**The 4 Personas:**
- 🛡️ **Protector** — Loyal, long tenors, renews on autopilot. Needs a rate reminder.
- 📊 **Optimizer** — Compares rates, short tenors, data-driven. Most likely to upgrade.
- 😰 **Anxious Saver** — Visits often but hesitates. Needs safety reassurance.
- 🚪 **Exiter** — Declining activity, FD maturing, browsing competitors. Needs urgent action.

---

#### Tab 2 — Harvest Window
Shows every FD maturing in the next 30 days, ranked by risk.

| Section | What It Shows |
|---------|--------------|
| Maturity timeline chart | Bar chart of users grouped by how soon their FD matures |
| Risk score trend | Area chart showing the top risk scores in this window |
| 3 summary counters | Withdraw/Churn count, Upgrade ready count, Will Renew count |
| Filter pills | All / Churn risk / Upgrade ready / Renew likely |
| User table | Every at-risk user with their FD amount, days left, persona, prediction, risk score |
| Send Nudge button | Opens the nudge modal for that specific user |

---

#### Tab 3 — Intent Feed
A live urgency-sorted list — highest risk first.

| Section | What It Shows |
|---------|--------------|
| Urgency distribution chart | How many users are Critical / High / Moderate urgency |
| Live urgency trend | Line chart of the top 12 users' urgency scores |
| 3 quick stats | Critical alerts, average urgency, total users tracked |
| Feed rows | Each user with a colour-coded urgency bar, persona badge, prediction badge, and Send Nudge button |

The left edge of each row is colour-coded:
- 🔴 Red = Critical (score ≥ 85)
- 🟡 Amber = High (score 60–84)
- 🟢 Green = Moderate (score < 60)

---

#### Tab 4 — Next Step Nudge+
For users who are ready to move beyond FD into other financial products.

| Section | What It Shows |
|---------|--------------|
| Product interest bar chart | How many users are exploring each product |
| Upgrade readiness radial chart | Strongly ready / Exploring / Hesitant breakdown |
| 3 KPI cards | Nudge CTR, Beyond-FD count, Upgrades this month |
| 4 product cards | Debt MF, Hybrid Fund, Index Fund, Digital Gold — each with an interest progress bar |
| Risk spectrum | Visual ladder from FD (safest) to Stocks (highest risk) |
| SEBI disclaimer | Regulatory note at the bottom |

---

#### Send Nudge Modal
Opens when you click "Send Nudge" on any user.

- Shows the user's name, persona, city, FD amount, and days left
- Shows which behavioral signals triggered the alert
- Displays a pre-written, persona-matched message
- Toggle EN / हिंदी before sending to get the right language
- **Copy** button — copies the message to clipboard
- **Send** button — posts to the backend, logs the nudge, refreshes the table

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

---

## Color Guide

| Color | Means |
|-------|-------|
| 🟢 Green / Teal | Safe, renewing, positive |
| 🔵 Blue | Optimizing, exploring, neutral |
| 🟡 Amber / Gold | Caution, anxious, medium risk |
| 🔴 Red / Coral | Churn risk, critical, immediate action |
| 🟣 Purple | Beyond-FD ready, upgrade pipeline |
