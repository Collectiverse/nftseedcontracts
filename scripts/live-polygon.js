const { ethers, upgrades } = require("hardhat");

async function main() {
  const deployer = await ethers.getSigner();

  const elements = await ethers.getContractAt("TestNFT", "0x2674F116d2d2b73AEbc625ed368F378e831A3BA8");
  const objects = await ethers.getContractAt("TestNFT", "0xcCB7DF3f5120Eed7081225Fb60731f9887D373ce");
  const sale = await ethers.getContractAt("TestSeedSale", "0xa0074136173DfFa94bB1d7885A43Cbd291884A39");

  console.log(await elements.getRoleMember("0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929", 0))
  console.log(await objects.getRoleMember("0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929", 0))

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
