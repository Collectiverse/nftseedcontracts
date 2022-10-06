const { ethers, upgrades } = require("hardhat");

const signer = "0x2b793e780460C88c78057bB6635A1F93d3c1a660";
const wallet = "0x0000000000000000000000000000000000000001";

async function main() {
  const deployer = await ethers.getSigner();

  // asuming 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d on the bsc mainnet
  const ERC20 = await ethers.getContractFactory("MockERC20");
  const erc20 = await ERC20.deploy(100 * (10 ** 6), 18);
  await erc20.deployed();

  const Objects = await ethers.getContractFactory("TestNFT");
  const objects = await upgrades.deployProxy(Objects, ["https://ipfs.io//ipfs/QmQ3WbpWxe3arEa6behBjejE6LXdkESDXsr7N9bpAchVdo/{id}.json", deployer.address]);
  await objects.deployed();

  const Elements = await ethers.getContractFactory("TestNFT");
  const elements = await upgrades.deployProxy(Elements, ["https://ipfs.io/ipfs/QmXDUFYMspQnfZgXay2TRDXZxVMQ7pJ6UUksxxtWVMrfhU/{id}.json", deployer.address]);
  await elements.deployed();

  const Sale = await ethers.getContractFactory("TestSeedSale");
  const sale = await Sale.deploy(elements.address, objects.address, signer, erc20.address, wallet, deployer.address);
  await sale.deployed();

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
