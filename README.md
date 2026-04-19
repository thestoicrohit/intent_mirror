# Intent Mirror v3.0
> Behavioral intelligence dashboard for FD-heavy banks and NBFCs

---

## What It Does
Tracks 50,000 FD customers, reads their behavior, and tells your retention team exactly who is about to leave — before they do.

## Stack
- **Frontend** — React 18 + Vite + TailwindCSS + Recharts
- **Backend** — Express.js (port 3001) with JSON file persistence
- **No external DB** — all data is in-memory with `server/store.json` for nudges/contacts

---

## Quick Start

### Option 1 — One click
Double-click **`🚀 Launch Intent Mirror.bat`**
Opens both servers and the browser automatically.

### Option 2 — Manual
```bash
# Terminal 1 — Backend
npm run server

# Terminal 2 — Frontend
npm run dev
```

- Frontend → http://localhost:5180
- API → http://localhost:3001/api/health

> The dashboard works even without the backend — it falls back to local mock data automatically.

---

## Project Structure

```
intent-mirror/
├── server/
│   ├── index.js          ← Express API (port 3001)
│   └── store.json        ← Persisted nudges + contacts
├── src/
│   ├── App.jsx           ← Root: view routing + theme + context
│   ├── theme.js          ← DARK / LIGHT color tokens
│   ├── i18n.js           ← EN / HI label maps
│   ├── api.js            ← API client (all fetch calls)
│   ├── hooks/
│   │   └── useApi.jsx    ← useApi hook + Spinner + ApiError
│   ├── data/
│   │   ├── users.js      ← 30 mock FD users
│   │   ├── personas.js   ← Persona definitions + cohort data
│   │   ├── signals.js    ← 6 behavioral signals
│   │   └── products.js   ← MF / Gold / Index products
│   └── components/
│       ├── LandingPage.jsx
│       ├── DemoPage.jsx
│       ├── Header.jsx
│       ├── HealthScore.jsx
│       ├── MetricsBar.jsx
│       ├── TabNav.jsx
│       ├── NudgeModal.jsx
│       ├── SearchOverlay.jsx
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

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Server status |
| GET | `/api/users` | List users (filter, sort, search params) |
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
  id, name, city,
  fdAmount,       // "₹5.1L"
  daysLeft,       // 1–30
  persona,        // "Protector" | "Optimizer" | "Anxious Saver" | "Exiter"
  prediction,     // "Churn" | "Withdraw" | "Upgrade" | "Renew"
  riskScore,      // 0–100
  urgency,        // 0–100
  signals,        // array of signal keys
  detectedHrsAgo
}
```

---

## Features
- **4 Personas** — Protector, Optimizer, Anxious Saver, Exiter
- **6 Behavioral Signals** — withdrawal visits, safety checks, rate comparisons, MF browsing, stock searches, inactivity
- **Bilingual** — EN / हिंदी toggle on all labels and nudge messages
- **Dark / Light mode** — teal-navy dark, sage-green light
- **NL Search** — plain English queries like "show churn risk users in Mumbai"
- **Send Nudge** — persona-matched message posted to backend, logged permanently
- **Offline fallback** — every tab works without the backend server

---

## Build

```bash
npm run build
# Output in /dist — ready to deploy as a static site (frontend only)
```

---

## License
MIT — built for the Blostem AI Builder Hackathon (Data Analytics & Insights track)
