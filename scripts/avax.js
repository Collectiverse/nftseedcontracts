const { ethers, upgrades } = require("hardhat");

async function main() {
  const deployer = await ethers.getSigner();

  const elements = await ethers.getContractAt("CollectiverseNFT", "0x2674F116d2d2b73AEbc625ed368F378e831A3BA8");
  const objects = await ethers.getContractAt("CollectiverseNFT", "0xa0074136173DfFa94bB1d7885A43Cbd291884A39");
  const sale = await ethers.getContractAt("CollectiverseSeedSale", "0x388A5b3a6220E7e88A3021cfC50c05C6C5Ea90bB");

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
