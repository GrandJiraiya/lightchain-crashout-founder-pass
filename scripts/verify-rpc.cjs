const hre = require("hardhat");

async function main() {
  const provider = hre.ethers.provider;
  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();

  console.log("Network name:", hre.network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Current block:", blockNumber);

  const [deployer] = await hre.ethers.getSigners();
  if (deployer) {
    console.log("Deployer:", deployer.address);
    console.log("Balance:", hre.ethers.formatEther(await provider.getBalance(deployer.address)));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
