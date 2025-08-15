const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RolesManager", function () {
  let rolesManager, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const RolesManager = await ethers.getContractFactory("RolesManager");
    rolesManager = await RolesManager.deploy();
    await rolesManager.waitForDeployment();
  });

  it("should register as Producer", async function () {
    await rolesManager.connect(addr1).registerAsProducer();
    expect(await rolesManager.hasRole(addr1.address, 0)).to.equal(true); // 0: Producer
  });

  it("should register as Shipper", async function () {
    await rolesManager.connect(addr1).registerAsShipper();
    expect(await rolesManager.hasRole(addr1.address, 1)).to.equal(true); // 1: Shipper
  });

  it("should register as Buyer", async function () {
    await rolesManager.connect(addr1).registerAsBuyer();
    expect(await rolesManager.hasRole(addr1.address, 2)).to.equal(true); // 2: Buyer
  });

  it("should allow multiple roles for same address", async function () {
    await rolesManager.connect(addr1).registerAsProducer();
    await rolesManager.connect(addr1).registerAsBuyer();
    expect(await rolesManager.hasRole(addr1.address, 0)).to.equal(true);
    expect(await rolesManager.hasRole(addr1.address, 2)).to.equal(true);
  });

  it("should not allow duplicate role registration", async function () {
    await rolesManager.connect(addr1).registerAsProducer();
    await expect(
      rolesManager.connect(addr1).registerAsProducer()
    ).to.be.revertedWith("The address is already registered as a manufacturer");
  });
});
