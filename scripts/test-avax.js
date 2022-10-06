const { ethers, upgrades } = require("hardhat");

const erc20 = "0xFeD8D59b083AB4AC3FCBB8C5b6d89579bB637Ab9";
const signer = "0x2b793e780460C88c78057bB6635A1F93d3c1a660";

async function main() {
  const deployer = await ethers.getSigner();

  const elements = await ethers.getContractAt("CollectiverseNFT", "0xE58Aa1081fff34b97abb64b7552c41edEBE313fF");
  const objects = await ethers.getContractAt("CollectiverseNFT", "0xF87A8358cddc11604153d797A162d8bc9ca32EFb");
  const sale = await ethers.getContractAt("CollectiverseSeedSale", "0xfbE32fdEf555Fe8A80C716D9431B19dc2A221a62");

  console.log("DEPLOYMENT LIVE");
  console.log("ERC20   :", erc20);
  console.log("Elements:", elements.address);
  console.log("Objects :", objects.address);
  console.log("Sale    :", sale.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
