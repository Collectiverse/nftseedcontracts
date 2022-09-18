const { ethers, upgrades } = require("hardhat");

const static = {
  "signer": "0x1Ad3aED9101A2e9fC0D376a8cA7a74d5Cee13136",
}

async function main() {
  const deployer = await ethers.getSigner();

  // TBD URI
  const Elements = await ethers.getContractFactory("CollectiverseNFT");
  const elements = await upgrades.deployProxy(Elements, [""]);
  await elements.deployed();

  // TBD URI
  const Objects = await ethers.getContractFactory("CollectiverseNFT");
  const objects = await upgrades.deployProxy(Objects, [""]);
  await objects.deployed();

  // TBD SIGNER
  const Sale = await ethers.getContractFactory("CollectiverseSeedSale");
  const sale = await Sale.deploy(elements.address, objects.address, static.signer);
  await sale.deployed();

  console.log("DEPLOYMENT SUCCESSFUL");
  console.log("Elements:", elements.address);
  console.log("Objects :", objects.address);
  console.log("Sale    :", sale.address);
  // console.log("Multisig:", await sale.owner())
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
