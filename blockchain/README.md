# Intent Mirror — On-chain Credentials

The `IntentCredential` contract is an **ERC-5192 soulbound token**. It stores a
holder's money persona + intent score on **Base Sepolia**. It's minted by an
*issuer* wallet (the Intent Mirror backend) so end users never pay gas — but the
credential is bound to, and owned by, the user's wallet forever and can never be
transferred or sold.

## How the app behaves

| State | What happens |
|---|---|
| **No contract configured** | The app mints a *simulated* credential locally (real keccak256 hash, zero setup). Perfect for demos. |
| **Contract + issuer configured** | The backend mints a **real** credential on Base Sepolia; the dashboard shows the live tx hash. |

Nothing in the React app changes between the two — it's the same graceful-fallback
pattern the rest of Intent Mirror uses.

## Deploy it for real (≈5 minutes)

```bash
cd blockchain
npm install
cp .env.example .env          # then edit .env

# 1. Create / pick a deployer wallet and put its private key in .env
# 2. Fund that wallet with free Base Sepolia ETH:
#       https://www.alchemy.com/faucets/base-sepolia   (or Coinbase faucet)
# 3. Compile + deploy
npm run compile
npm run deploy                # deploys to Base Sepolia
```

The deploy script prints the contract address. Wire it up:

```bash
# server side (mints credentials)  — create ../.env or export these:
ISSUER_PRIVATE_KEY=0x...            # same wallet you funded
CREDENTIAL_CONTRACT=0xDEPLOYED...
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# frontend label (shows "BASE SEPOLIA" instead of "SIMULATED") — in ../.env:
VITE_CREDENTIAL_CONTRACT=0xDEPLOYED...
```

Restart the backend + Vite, mint from the **Identity** tab, and the credential is
now live on Base Sepolia. View it on https://sepolia.basescan.org.

## Files
- `contracts/IntentCredential.sol` — the soulbound credential
- `scripts/deploy.cjs` — deploy + print wiring instructions
- `hardhat.config.cjs` — Base Sepolia network config
