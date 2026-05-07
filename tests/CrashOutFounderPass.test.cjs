const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrashOutFounderPass", function () {
  async function deployFixture() {
    const [owner, user, recipient] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("CrashOutFounderPass");
    const contract = await Contract.deploy(
      "Crash Out Founder Pass",
      "COFP",
      10,
      ethers.parseEther("0.01"),
      "ipfs://base/",
      owner.address
    );
    await contract.waitForDeployment();
    return { contract, owner, user, recipient };
  }

  it("deploys with expected config", async function () {
    const { contract } = await deployFixture();
    expect(await contract.name()).to.equal("Crash Out Founder Pass");
    expect(await contract.symbol()).to.equal("COFP");
    expect(await contract.maxSupply()).to.equal(10n);
    expect(await contract.mintPriceWei()).to.equal(ethers.parseEther("0.01"));
    expect(await contract.totalMinted()).to.equal(0n);
  });

  it("allows public mint with exact payment", async function () {
    const { contract, user } = await deployFixture();
    await contract.connect(user).publicMint(2, { value: ethers.parseEther("0.02") });
    expect(await contract.totalMinted()).to.equal(2n);
    expect(await contract.ownerOf(1)).to.equal(user.address);
    expect(await contract.ownerOf(2)).to.equal(user.address);
  });

  it("rejects incorrect payment", async function () {
    const { contract, user } = await deployFixture();
    await expect(
      contract.connect(user).publicMint(1, { value: ethers.parseEther("0.02") })
    ).to.be.revertedWithCustomError(contract, "IncorrectPayment");
  });

  it("enforces max supply", async function () {
    const { contract, owner, user } = await deployFixture();
    await contract.connect(owner).ownerMint(owner.address, 5);
    await contract.connect(owner).ownerMint(user.address, 5);
    await expect(contract.connect(owner).ownerMint(user.address, 1))
      .to.be.revertedWithCustomError(contract, "ExceedsMaxSupply");
  });

  it("only owner can pause and owner mint", async function () {
    const { contract, user } = await deployFixture();
    await expect(contract.connect(user).pause()).to.be.reverted;
    await expect(contract.connect(user).ownerMint(user.address, 1)).to.be.reverted;
  });

  it("blocks public mint while paused", async function () {
    const { contract, owner, user } = await deployFixture();
    await contract.connect(owner).pause();
    await expect(
      contract.connect(user).publicMint(1, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWithCustomError(contract, "EnforcedPause");
  });

  it("builds token URI from base URI", async function () {
    const { contract, owner } = await deployFixture();
    await contract.connect(owner).ownerMint(owner.address, 1);
    expect(await contract.tokenURI(1)).to.equal("ipfs://base/1.json");
  });

  it("allows owner to withdraw mint funds", async function () {
    const { contract, user, recipient } = await deployFixture();
    await contract.connect(user).publicMint(1, { value: ethers.parseEther("0.01") });

    await expect(() => contract.withdraw(recipient.address)).to.changeEtherBalances(
      [contract, recipient],
      [ethers.parseEther("-0.01"), ethers.parseEther("0.01")]
    );
  });
});
