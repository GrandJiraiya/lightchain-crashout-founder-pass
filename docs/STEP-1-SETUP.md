# Step 1 — Local Smart Contract Setup

This step gets the smart contract repo running locally before touching Lightchain mainnet.

## Commands

```bash
npm install
npm run compile
npm test
```

## Acceptance criteria

- Dependencies install successfully.
- Hardhat compiles `CrashOutFounderPass.sol`.
- Tests pass.
- `.env` exists locally but is not committed.

## Mainnet gate

Before deployment, verify:

```bash
npm run verify:rpc
```

Do not deploy until the printed chain ID matches the official Lightchain mainnet chain ID from the wallet/network prompt or official docs.
