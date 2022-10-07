const { ethers, upgrades } = require("hardhat");

const erc20 = "0xAbC2EAFC19671c5704d5b0eCE78934a962E0366F";
const signer = "0x2b793e780460C88c78057bB6635A1F93d3c1a660";

async function main() {
  const deployer = await ethers.getSigner();

  const elements = await ethers.getContractAt("TestNFT", "0xa0074136173DfFa94bB1d7885A43Cbd291884A39");
  const objects = await ethers.getContractAt("TestNFT", "0x2674F116d2d2b73AEbc625ed368F378e831A3BA8");
  const sale = await ethers.getContractAt("TestSeedSale", "0x388A5b3a6220E7e88A3021cfC50c05C6C5Ea90bB");

  console.log("TEST DEPLOYMENT LIVE");
  console.log("ERC20   :", erc20);
  console.log("Elements:", elements.address);
  console.log("Objects :", objects.address);
  console.log("Sale    :", sale.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});