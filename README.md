# Intent Mirror

> **Your money, your mirror.** Track crypto, stocks, mutual funds and your FD in one place — see what you're about to do *before* you do it, get suggestions matched to how you behave with money, and **own your financial profile on-chain**.

Built for the **Blostem AI Builder Hackathon** · Built 100% with AI tools.

---

## The idea

Most finance apps watch *you*. A bank scores your behaviour, owns the profile, and sells you products. **Intent Mirror flips that.**

It's a personal money copilot that:
- **Unifies your money** — crypto, stocks, mutual funds and your FD in one net-worth view.
- **Reads your intent** — not just your balances. It catches the behaviour that comes *before* a money mistake ("you searched how to sell fast and opened the app 14 times today — that's a panic-sell pattern").
- **Coaches you** — personalised, plain-English suggestions matched to your *money persona*.
- **Gives you ownership** — your persona + intent score is minted as a **soulbound credential you hold in your own wallet**, portable across any bank or app — with no MetaMask, no seed phrase, no gas.

The "Web3 without the friction" part is the whole point: a finance newcomer logs in with an email and never realises they're using a blockchain — yet they genuinely own their data.

---

## The 4 money personas

Intent Mirror classifies how *you* behave with money — and adapts.

| Persona | Behaviour | What the app does |
|---|---|---|
| 📊 **Optimizer** | Return-chaser, high crypto, checks often | Full cockpit, aggressive-growth pathways, rebalance nudges |
| 🛡 **Protector** | Safety-first, parks capital in FDs | Beat-inflation steps, calm UI, safety signals |
| 😌 **Anxious Saver** | Watches closely, hesitates to commit | "Automate so you don't have to decide" — SIP nudges |
| 🚪 **Exiter** | Showing exit behaviour | "Before you exit, see the full picture" — transparency |

---

## Features

### 💰 My Money
Net-worth hero + live allocation donut, holdings across all four asset classes (with live crypto price simulation), your **money persona** with the reasoning behind it, a behavioural **"what you're about to do"** feed, and **AI suggestions** matched to your persona.

### ⬡ On-chain Identity *(Web3)*
Mint your profile as a **soulbound ERC-5192 credential**. Non-transferable, owned by you, portable. The backend (issuer) pays the gas, so you stay gasless. Works simulated out of the box; goes fully on-chain on **Base Sepolia** once configured.

### 📈 Wealth Hub
Live NSE/BSE stock board, mutual funds, insurance, financial-literacy cards, and **Your Pathway** — an investment route matched to your persona.

### 👨‍👩‍👧 Family — Money Quest *(for kids)*
The biggest gap in finance worldwide: money isn't taught in school, and kids can't open bank accounts. Money Quest gives every child a **safe first wallet** and learns-by-doing missions, with parent guardrails.
- **Parent panel** — set the child's name, weekly allowance and a savings goal.
- **Learn → Do missions** — saving, compounding, spotting scams, needs vs wants — each lesson ends in a real action.
- **XP, levels, daily streaks** and a **savings goal** the kid funds from pocket money.
- **A soulbound "Money Explorer" badge** the child owns — a financial passport that grows with them.
- All progress is persisted server-side and fully **bilingual**.

### 🌐 Bilingual EN / हिंदी · 🌗 Dark / Light
Every screen toggles instantly between English and Hindi, including persona reasoning, the activity feed, AI suggestions and the kids' Money Quest.

---

## Web3 architecture

```
Email login ─▶ Embedded wallet (viem, in-browser, no popups)
                     │
ML / persona ───▶ Intent profile ──▶ Backend issuer mints ──▶ IntentCredential (ERC-5192)
                                        (pays gas)                on Base Sepolia
                     │                                                  │
              Your wallet  ◀───────────  you own it, soulbound  ◀───────┘
```

**Graceful fallback (the core design rule):**

| Configured? | Behaviour |
|---|---|
| No contract / issuer | Credential mints *locally* with a real keccak256 hash — zero setup, perfect for demos |
| Contract + issuer set | Backend mints a **real** soulbound token on Base Sepolia; the dashboard shows the live tx |

Nothing in the React app changes between the two.

### The contract — `blockchain/contracts/IntentCredential.sol`
A real **ERC-5192 soulbound token** (OpenZeppelin v5, solc 0.8.28):
- `issue(to, persona, intentScore, signals, uri)` — only the issuer can mint
- One credential per holder, refreshed in place as behaviour changes
- Transfers revert — your reputation can't be sold or moved
- `getByHolder(address)` — one-call read for the frontend

See [blockchain/README.md](blockchain/README.md) for the ~5-minute deploy.

---

## Backend API

A focused Express server (`server/index.js`) — every route validates input, never crashes the process, and persists family state atomically.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Status + on-chain config |
| GET | `/api/missions` | Money Quest mission catalogue (bilingual) |
| GET | `/api/family/:address` | Read a family/kid profile (creates default) |
| PUT | `/api/family/:address` | Parent updates name / allowance / goal / kid-mode |
| POST | `/api/family/:address/mission` | Complete a mission (idempotent — no double XP) |
| POST | `/api/family/:address/save` | Move pocket money into the savings goal |
| POST | `/api/credential/mint` | Issuer mints the soulbound credential (gasless for the user) |
| GET | `/api/credential/:address` | Read a credential on-chain |

Invalid input → `400`, unknown route → `404`, never a stack-trace crash.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Charts | Recharts |
| Wallet / chain | viem (embedded wallet + on-chain reads/writes) |
| Contract | Solidity 0.8.28 · ERC-5192 soulbound · OpenZeppelin v5 · Hardhat |
| Chain | Base Sepolia (testnet) |
| Backend | Express.js (issuer-pays mint + reads) |
| i18n | Custom EN / HI label maps |

---

## Project structure

```
intent-mirror/
├── blockchain/                  ← Hardhat project (Solidity)
│   ├── contracts/IntentCredential.sol   ← ERC-5192 soulbound credential
│   ├── scripts/deploy.cjs
│   └── hardhat.config.cjs        ← Base Sepolia
├── server/
│   └── index.js                  ← Express: family/kids + viem issuer-mint
└── src/
    ├── App.jsx                   ← Shell: onboarding → dashboard, theme/lang
    ├── i18n.js                   ← EN / HI labels
    ├── theme.js                  ← dark / light tokens
    ├── suggestions.js            ← bilingual suggestion engine
    ├── familyApi.js              ← Money Quest API client
    ├── web3/
    │   ├── wallet.js             ← embedded wallet (viem)
    │   └── credential.js         ← mint (backend-aware) + read
    ├── data/portfolio.js         ← holdings, persona, intent, signals
    └── components/
        ├── Onboarding.jsx        ← email → invisible wallet
        ├── MyMoney.jsx           ← net worth, persona, intent, suggestions
        ├── IdentityCard.jsx      ← mint + view the soulbound credential
        ├── FamilyMode.jsx        ← parent panel + kids' Money Quest
        └── WealthHub.jsx         ← stocks / MF / insurance / literacy / pathway
```

---

## Quick start

```bash
# 1. Frontend + backend deps
npm install

# 2. Frontend (Vite dev server)
npm run dev          # → http://localhost:5180

# 3. Backend (issuer-mint + reads) — optional; app works without it
npm run server       # → http://localhost:3001
```

Log in with any email → an embedded wallet is created → explore **My Money**,
**Wealth Hub**, and mint your credential in **Identity**.

### Go fully on-chain (optional, ~5 min)
```bash
cd blockchain && npm install
cp .env.example .env          # add a deployer key, fund it from a Base Sepolia faucet
npm run compile && npm run deploy
```
Then set `ISSUER_PRIVATE_KEY` + `CREDENTIAL_CONTRACT` (server) and
`VITE_CREDENTIAL_CONTRACT` (frontend), restart, and the Identity tab mints for
real on Base Sepolia. Full steps in [blockchain/README.md](blockchain/README.md).

---

## What makes it different

**Most Web3 finance apps** assume you already have MetaMask and test ETH. Intent Mirror is built for the person who has *neither* — email login, invisible wallet, sponsored gas — while still giving genuine on-chain ownership.

**Most portfolio trackers** show you numbers. Intent Mirror reads your *intent* and tells you what you're about to do before you do it.

**Most apps own your data.** Here, your financial reputation is a soulbound credential in your wallet — yours to carry anywhere.

---

## License

MIT — Blostem AI Builder Hackathon · 2025
