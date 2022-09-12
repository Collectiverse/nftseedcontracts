const { ethers, upgrades } = require("hardhat");

const domain = "CollectiverseObjects";
const static = {
  "zero": "0x0000000000000000000000000000000000000000",
  "usdc": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  "wallet": "0x0000000000000000000000000000000000000001",
  "signer": "0x0000d468Bc1Db5f25b2C2D9E38658563A97781f1",
}

async function main() {
  const deployer = await ethers.getSigner();

  const ERC20 = await ethers.getContractFactory("MockERC20");
  const erc20 = await ERC20.deploy(5000000 * (10 ** 6), 6);
  await erc20.deployed();

  const Elements = await ethers.getContractFactory("CollectiverseNFT");
  const elements = await upgrades.deployProxy(Elements, [""]);
  await elements.deployed();

  const Objects = await ethers.getContractFactory("CollectiverseNFT");
  const objects = await upgrades.deployProxy(Objects, [""]);
  await objects.deployed();

  const Sale = await ethers.getContractFactory("CollectiverseSeedSale");
  const sale = await Sale.deploy(elements.address, objects.address, erc20.address, static.wallet, static.signer);
  await sale.deployed();

  await elements.addOperator(sale.address);
  await objects.addOperator(sale.address);

  console.log("DEPLOYMENT SUCCESSFUL");
  console.log("ERC20   :", erc20.address);
  console.log("Elements:", elements.address);
  console.log("Objects :", objects.address);
  console.log("Sale    :", sale.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
