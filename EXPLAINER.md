# Intent Mirror — Simple Explainer

---

## What Is This?

A personal money copilot that puts **all your money in one place** — crypto, stocks, mutual funds and your fixed deposit — reads how you behave with it, tells you what you're about to do **before** you do it, and gives you suggestions to grow and protect it.

The twist: **you own your financial profile**, not a bank. You log in with just an email, a secure wallet is created for you behind the scenes (no MetaMask, no seed phrase, no crypto to buy), and your money persona becomes a credential that lives in *your* wallet.

It also has a **kids' mode** — because money isn't taught in school and children can't open bank accounts, every child gets a safe first wallet and bite-sized "learn-by-doing" money missions.

---

## The Problem It Solves

Most money apps have one of two problems:

- **Bank/finance apps watch you.** They own your behavioural data and use it to sell you things.
- **Crypto apps assume you're already an expert.** They need MetaMask, seed phrases and test funds — so normal people never get in.

And almost none of them actually **coach** you — they show numbers, not intent.

**Intent Mirror fixes all of this:** it's Web3 that doesn't feel like Web3, it reads your intent (not just your balances), and you own your data.

---

## How It Works — In 4 Steps

1. **Sign in** — Enter an email. A real wallet is created silently in your browser. No wallet apps, no gas.
2. **See everything** — Your net worth across crypto, stocks, mutual funds and FD, in one view, with a money persona (Optimizer / Protector / Anxious Saver / Exiter) that describes how you actually behave.
3. **Get coached** — It reads your recent behaviour ("you searched how to sell fast and opened the app 14 times today — that's a panic-sell pattern") and gives suggestions matched to your persona.
4. **Own it** — Your persona + intent score is minted as a soulbound credential in your wallet — portable across banks and apps, and it can never be taken or sold.

---

## The Sections

### ◉ My Money
The main screen.

| Part | What It Does |
|------|-------------|
| Verified net worth | Only holdings you've **verified** count toward your net worth — crypto "proves on-chain" via your wallet, stocks/MF link & verify. The total, P&L and donut update live as you verify. |
| Holdings | Every asset across crypto / stocks / mutual funds / FD, with live prices and gain/loss. |
| Your money persona | How you behave with money, with the reasoning behind it. |
| What you're about to do | A behavioural feed that reads intent, not just balances. |
| Suggestions for you | Personalised, plain-English coaching matched to your persona. |
| Grow — what if you invested? | A compound-growth calculator: pick an amount, asset and horizon → see how your money could multiply. |

---

### ◈ Wealth Hub
Your launchpad beyond the FD.

- **Top Stocks** — live NSE/BSE board
- **Mutual Funds** — start a SIP from ₹100
- **Insurance & Protection** — term, health, life, gold
- **Financial Literacy** — 2-minute, jargon-free reads
- **Your Pathway** — the investment route matched to your persona

---

### ◐ Family — Money Quest *(for kids)*
A safe, gamified money journey for children, with parent guardrails.

- **Parent panel** — set the child's name, weekly allowance and a savings goal
- **Learn → Do missions** — saving, compounding, spotting scams, needs vs wants — each lesson ends in a real action
- **XP, levels and daily streaks** to keep them coming back
- **A savings goal** the child funds from pocket money
- **A "Money Explorer" badge** — a soulbound credential the child owns and grows with

---

### ⬡ Identity *(Web3)*
Where you actually own your data.

- Mint your money persona + intent score as a **soulbound credential** (ERC-5192) in your wallet
- It's **non-transferable** (you can't sell your reputation) and **portable** (any bank or app can request to read it — you approve in one tap)
- The app sponsors the gas, so you stay gasless
- Works simulated out of the box; goes fully on-chain on **Base Sepolia** once a contract is configured

---

## Things That Apply Everywhere

| Feature | What It Does |
|---------|-------------|
| EN / हिंदी toggle | Switches the whole app to Hindi — including the persona reasoning, activity feed and suggestions |
| ☀ / 🌙 button | Dark / light theme |
| Wallet menu | Your address + sign out |

---

## Under the Hood

- **Frontend:** React + Vite, charts via Recharts, embedded wallet via viem
- **Backend:** an Express API that serves the portfolio (persona + suggestions + verified net worth), persists holding verification, runs the kids' Money Quest, and mints the on-chain credential — with input validation and graceful fallback everywhere
- **Smart contract:** `IntentCredential.sol`, an ERC-5192 soulbound token, deployable to Base Sepolia with Hardhat
- **Design rule:** everything degrades gracefully — the app works fully even if the backend or chain is offline (simulated), and goes live the moment they're configured

---

## The One-Line Version

> *Track all your money, see what you're about to do before you do it, get coached to grow it — and own your financial identity. Simple enough for a newcomer, and even has a mode that teaches kids.*
