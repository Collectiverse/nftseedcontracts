const { ethers, upgrades } = require("hardhat");

async function main() {
  const deployer = await ethers.getSigner();

  const elements = await ethers.getContractAt("TestNFT", "0x388A5b3a6220E7e88A3021cfC50c05C6C5Ea90bB");
  const objects = await ethers.getContractAt("TestNFT", "0xa0074136173DfFa94bB1d7885A43Cbd291884A39");
  const sale = await ethers.getContractAt("TestSeedSale", "0xAfda93b664d0255B17495eF252e7E59de6C94Fa4");

  console.log("DEPLOYMENT LIVE");
  console.log("Elements:", elements.address);
  console.log("Objects :", objects.address);
  console.log("Sale    :", sale.address);
  console.log("Multisig:", await sale.owner())
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
