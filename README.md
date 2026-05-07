# Lightchain Crash Out Founder Pass

Starter Hardhat project for a capped ERC-721 Founder Pass contract intended for safe Lightchain.ai deployment.

## What this includes

- `contracts/CrashOutFounderPass.sol`
- Hardhat config with env-based Lightchain mainnet settings
- Local tests
- RPC verification script
- Deployment script
- `.env.example`

## Safety rules

- Never paste your seed phrase anywhere.
- Never commit `.env`.
- Use a fresh deployer wallet.
- Test locally before mainnet.
- Verify Lightchain RPC and chain ID before deploying.

## Install

```bash
npm install
```

## Configure

```bash
cp .env.example .env
```

Fill:

```env
LIGHTCHAIN_MAINNET_RPC_URL=
LIGHTCHAIN_MAINNET_CHAIN_ID=
DEPLOYER_PRIVATE_KEY=
```

## Compile and test

```bash
npm run compile
npm test
```

## Verify Lightchain RPC

```bash
npm run verify:rpc
```

Expected result:

- prints network name
- prints chain ID
- prints current block
- prints deployer address and balance

## Local deployment test

Terminal 1:

```bash
npx hardhat node
```

Terminal 2:

```bash
npm run deploy:local
```

## Lightchain mainnet deployment

Only after RPC verification and test pass:

```bash
npm run deploy:lightchain
```

## Contract verification

Lightscan appears Blockscout-based. The config uses:

```text
https://mainnet.lightscan.app/api
https://mainnet.lightscan.app
```

Run after deployment if API verification is supported:

```bash
npx hardhat verify --network lightchainMainnet <DEPLOYED_ADDRESS> \
  "Crash Out Founder Pass" \
  "COFP" \
  500 \
  0 \
  "https://metadata.example.com/crashout-founder-pass/" \
  "<DEPLOYER_ADDRESS>"
```

If explorer verification fails, use Lightscan's browser verifier manually and paste the flattened source or standard JSON input.
