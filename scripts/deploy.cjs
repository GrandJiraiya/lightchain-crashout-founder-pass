const hre = require("hardhat");

function requiredNumber(name, fallbackValue) {
  const raw = process.env[name] ?? fallbackValue;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a valid number`);
  }
  return value;
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer signer found. Check DEPLOYER_PRIVATE_KEY in .env.");
  }

  const name = process.env.FOUNDER_PASS_NAME || "Crash Out Founder Pass";
  const symbol = process.env.FOUNDER_PASS_SYMBOL || "COFP";
  const maxSupply = requiredNumber("FOUNDER_PASS_MAX_SUPPLY", "500");
  const mintPriceWei = BigInt(process.env.FOUNDER_PASS_MINT_PRICE_WEI || "0");
  const baseURI = process.env.FOUNDER_PASS_BASE_URI || "https://metadata.example.com/crashout-founder-pass/";

  console.log("Deploying CrashOutFounderPass...");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Max supply:", maxSupply);
  console.log("Mint price wei:", mintPriceWei.toString());
  console.log("Base URI:", baseURI);

  const Contract = await hre.ethers.getContractFactory("CrashOutFounderPass");
  const contract = await Contract.deploy(
    name,
    symbol,
    maxSupply,
    mintPriceWei,
    baseURI,
    deployer.address
  );

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("CrashOutFounderPass deployed to:", address);

  console.log("Constructor args:");
  console.log(JSON.stringify([name, symbol, maxSupply, mintPriceWei.toString(), baseURI, deployer.address], null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
