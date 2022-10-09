const { ethers, upgrades } = require("hardhat");

const erc20 = "0x349F302d547984752ec86a7F7b56AE87975Cde7a";
const signer = "0x2b793e780460C88c78057bB6635A1F93d3c1a660";

async function main() {
  const deployer = await ethers.getSigner();

  const elements = await ethers.getContractAt("TestNFT", "0xdDa89E273f83CD183c45230b9a8444857BE75dB9");
  const objects = await ethers.getContractAt("TestNFT", "0xc931fb1EF7F02eaE2B8e83E9580711d20Ed5Bbd7");
  const sale = await ethers.getContractAt("TestSeedSale", "0x9DA8d0f7f4eA86A41be2D651723975094305dE78");

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