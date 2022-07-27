const { ethers, upgrades } = require("hardhat");

const domain = "CollectiverseObjects";
const static = {
  "zero": "0x0000000000000000000000000000000000000000",
  "usdc": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  "wallet": "0x0000000000000000000000000000000000000001",
  "signer": "0x0000d468Bc1Db5f25b2C2D9E38658563A97781f1",
  "erc20": "0x3eB3F5c8417527B2538296F57b300b33d286B92a",
}

async function main() {
  const deployer = await ethers.getSigner();

  const elements = await ethers.getContractAt("CollectiverseElements", "0xBe45Ae52233efBa0d4AE9f0a7A470BF9d0137DB4");
  const objects = await ethers.getContractAt("CollectiverseObjects", "0x57250518A7356Ca48B421Ac28ED25d0A7CcfAd89");

  // await objects.setSettings(static.signer, static.erc20, static.wallet);

  console.log("DEPLOYMENT LIVE");
  console.log("ERC20   :", static.erc20);
  console.log("Elements:", elements.address);
  console.log("Objects :", objects.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
