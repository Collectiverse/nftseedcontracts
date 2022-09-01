const { ethers, upgrades } = require("hardhat");

const domain = "CollectiverseObjects";
const static = {
  "zero": "0x0000000000000000000000000000000000000000",
  // "usdc": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  "wallet": "0x0000000000000000000000000000000000000001",
  "signer": "0x2b793e780460C88c78057bB6635A1F93d3c1a660",
  "erc20": "0x5447B8a29B6D2684935f2C22854C9cA8774FACDa",
}

async function main() {
  const deployer = await ethers.getSigner();

  const elements = await ethers.getContractAt("CollectiverseElements", "0xE1f9d58E7476c66C5f615cAaDd2D5E1260802528");
  const objects = await ethers.getContractAt("CollectiverseObjects", "0xc2a1813f8cC397F3876b1a32448c8b7049dDD453");

  // await objects.addOperator("0x0F6885dEB17B3FBe844250B0905a084267B81679");
  // await objects.setSettings(static.signer, static.erc20, static.wallet);
  await objects.setURI("https://ipfs.io/ipfs/QmVdYEeyoDUU84xNLMw4k4FV6u6BzsFYBczFhijVqGTstD/{id}.json");

  console.log("DEPLOYMENT LIVE");
  console.log("ERC20   :", static.erc20);
  console.log("Elements:", elements.address);
  console.log("Objects :", objects.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
