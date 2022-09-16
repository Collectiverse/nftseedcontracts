const { ethers, upgrades } = require("hardhat");

const static = {
  "zero": "0x0000000000000000000000000000000000000000",
  "usdc": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  "wallet": "0x0000000000000000000000000000000000000001",
  "signer": "0x0000000000000000000000000000000000000002",
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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
