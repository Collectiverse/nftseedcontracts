const { ethers, upgrades } = require("hardhat");

const erc20 = "0xdDa89E273f83CD183c45230b9a8444857BE75dB9";
const signer = "0x2b793e780460C88c78057bB6635A1F93d3c1a660";

async function main() {
  const deployer = await ethers.getSigner();

  const elements = await ethers.getContractAt("TestNFT", "0x0148fc0e3606D36ec60262792fd5EFeC2366E36f");
  const objects = await ethers.getContractAt("TestNFT", "0x9DA8d0f7f4eA86A41be2D651723975094305dE78");
  const sale = await ethers.getContractAt("TestSeedSale", "0xD6222F2A346C73956b0Ca35648F007e2338AD8FF");

  await elements.grantRole("0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929", sale.address);
  await objects.grantRole("0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929", sale.address);

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