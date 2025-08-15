const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductManager", function () {
  let rolesManager, productManager, owner, producer, buyer, shipper;

  beforeEach(async function () {
    [owner, producer, buyer, shipper] = await ethers.getSigners();

    const RolesManager = await ethers.getContractFactory("RolesManager");
    rolesManager = await RolesManager.deploy();
    await rolesManager.waitForDeployment();

    await rolesManager.connect(producer).registerAsProducer();
    await rolesManager.connect(buyer).registerAsBuyer();
    await rolesManager.connect(shipper).registerAsShipper();

    const ProductManager = await ethers.getContractFactory("ProductManager");
    productManager = await ProductManager.deploy(await rolesManager.getAddress());
    await productManager.waitForDeployment();
  });

  it("should allow producer to create product", async function () {
    await expect(
      productManager.connect(producer).createProduct("TestProduct", 100)
    ).to.emit(productManager, "ProductCreated");
    const product = await productManager.getProduct(0);
    expect(product.name).to.equal("TestProduct");
    expect(product.price).to.equal(100);
    expect(product.producer).to.equal(producer.address);
  });

  it("should not allow non-producer to create product", async function () {
    await expect(
      productManager.connect(buyer).createProduct("TestProduct", 100)
    ).to.be.revertedWith("Only producer can create product");
  });

  it("should allow buyer to buy product", async function () {
    await productManager.connect(producer).createProduct("TestProduct", 100);
    await expect(
      productManager.connect(buyer).buyProduct(0, { value: 100 })
    ).to.emit(productManager, "ProductPurchased");
    const product = await productManager.getProduct(0);
    expect(product.buyer).to.equal(buyer.address);
    expect(product.status).to.equal(1); // 1: Sold
  });

  it("should not allow buying with wrong value", async function () {
    await productManager.connect(producer).createProduct("TestProduct", 100);
    await expect(
      productManager.connect(buyer).buyProduct(0, { value: 50 })
    ).to.be.revertedWith("Wrong value sent");
  });
});
