const { ethers, upgrades } = require("hardhat");

const erc20 = "0xEA2Aa82E154e57D848076259816c511bc3A98658";
const signer = "0x2b793e780460C88c78057bB6635A1F93d3c1a660";

async function main() {
  const deployer = await ethers.getSigner();

  const elements = await ethers.getContractAt("CollectiverseNFT", "0xe6E05aE821f81B20b29238D214f21f4334657084");
  const objects = await ethers.getContractAt("CollectiverseNFT", "0x39FfbeCe8f38C07b98d5CE9a697636af7De90665");
  const sale = await ethers.getContractAt("CollectiverseSeedSale", "0x24c91b57B10ADF1E8087014025571b8eECb3904A");

  console.log(await sale.erc20())

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
