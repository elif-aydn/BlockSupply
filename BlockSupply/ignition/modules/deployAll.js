// ignition/modules/deployAll.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // 1. RolesManager'ı deploy et
  const RolesManager = await hre.ethers.getContractFactory("RolesManager");
  const rolesManager = await RolesManager.deploy();
  await rolesManager.waitForDeployment();
  const rolesManagerAddress = await rolesManager.getAddress();
  console.log("RolesManager deployed to:", rolesManagerAddress);

  // 2. ProductManager'ı deploy et (rolesManager adresi ile)
  const ProductManager = await hre.ethers.getContractFactory("ProductManager");
  const productManager = await ProductManager.deploy(rolesManagerAddress);
  await productManager.waitForDeployment();
  const productManagerAddress = await productManager.getAddress();
  console.log("ProductManager deployed to:", productManagerAddress);

  // 3. ShippingManager'ı deploy et (rolesManager ve productManager adresleri ile)
  const ShippingManager = await hre.ethers.getContractFactory("ShippingManager");
  const shippingManager = await ShippingManager.deploy(
    rolesManagerAddress,
    productManagerAddress
  );
  await shippingManager.waitForDeployment();
  const shippingManagerAddress = await shippingManager.getAddress();
  console.log("ShippingManager deployed to:", shippingManagerAddress);

  // 4. Adresleri JSON dosyasına kaydet (frontend için)
  const addresses = {
    RolesManager: rolesManagerAddress,
    ProductManager: productManagerAddress,
    ShippingManager: shippingManagerAddress
  };
  const filePath = path.join(__dirname, "../deployedAddresses.json");
  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));
  console.log("Tüm kontrat adresleri deployedAddresses.json dosyasına kaydedildi.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
