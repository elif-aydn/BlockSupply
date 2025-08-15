const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShippingManager", function () {
  let rolesManager, productManager, shippingManager;
  let owner, producer, buyer, shipper, otherShipper;

  beforeEach(async function () {
    [owner, producer, buyer, shipper, otherShipper] = await ethers.getSigners();

    const RolesManager = await ethers.getContractFactory("RolesManager");
    rolesManager = await RolesManager.deploy();
    await rolesManager.waitForDeployment();

    await rolesManager.connect(producer).registerAsProducer();
    await rolesManager.connect(buyer).registerAsBuyer();
    await rolesManager.connect(shipper).registerAsShipper();
    await rolesManager.connect(otherShipper).registerAsShipper();

    const ProductManager = await ethers.getContractFactory("ProductManager");
    productManager = await ProductManager.deploy(await rolesManager.getAddress());
    await productManager.waitForDeployment();

    const ShippingManager = await ethers.getContractFactory("ShippingManager");
    shippingManager = await ShippingManager.deploy(
      await rolesManager.getAddress(),
      await productManager.getAddress()
    );
    await shippingManager.waitForDeployment();

    // Ürün oluştur ve satın al (statü: Sold)
    await productManager.connect(producer).createProduct("TestProduct", 100);
    await productManager.connect(buyer).buyProduct(0, { value: 100 });
  });

  it("should allow shipper to request shipping", async function () {
    await expect(
      shippingManager.connect(shipper).requestShipping(0)
    ).to.emit(shippingManager, "ShippingRequested");
    const requests = await shippingManager.getShippingRequests(0);
    expect(requests[0]).to.equal(shipper.address);
  });

  it("should not allow non-shipper to request shipping", async function () {
    await expect(
      shippingManager.connect(buyer).requestShipping(0)
    ).to.be.revertedWith("Only shipper can apply");
  });

  it("should allow producer to assign shipper and shipper to confirm transport", async function () {
    // Ship başvurusu yapıldı
    await shippingManager.connect(shipper).requestShipping(0);

    await productManager.connect(producer).assignShipper(0, shipper.address);
    let product = await productManager.getProduct(0);
    console.log("Assigned shipper in contract:", product.shipper);
    console.log("Test shipper address:", shipper.address);
    console.log("Eşit mi:", product.shipper === shipper.address);


    // Nakliyeci taşımayı tamamlar
    await expect(
      shippingManager.connect(shipper).confirmTransport(0)
    ).to.emit(shippingManager, "TransportConfirmed");
    product = await productManager.getProduct(0);
    expect(product.status).to.equal(3); // 3: Arrived
  });

});
