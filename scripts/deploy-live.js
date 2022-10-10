const { ethers, upgrades } = require("hardhat");

const signer = "0x1ad3aed9101a2e9fc0d376a8ca7a74d5cee13136";

async function main() {
  const deployer = await ethers.getSigner();

  const Objects = await ethers.getContractFactory("CollectiverseNFT");
  const objects = await upgrades.deployProxy(Objects, ["https://ipfs.io//ipfs/QmQ3WbpWxe3arEa6behBjejE6LXdkESDXsr7N9bpAchVdo/{id}.json"]);
  await objects.deployed();

  console.log("Objects :", objects.address);

  const Elements = await ethers.getContractFactory("CollectiverseNFT");
  const elements = await upgrades.deployProxy(Elements, ["https://ipfs.io/ipfs/QmXDUFYMspQnfZgXay2TRDXZxVMQ7pJ6UUksxxtWVMrfhU/{id}.json"]);
  await elements.deployed();

  console.log("Elements:", elements.address);

  const Sale = await ethers.getContractFactory("CollectiverseSeedSale");
  // elements, objects, signer
  const sale = await Sale.deploy(elements.address, objects.address, signer);
  await sale.deployed();

  console.log("Sale    :", sale.address);

  console.log("DEPLOYMENT SUCCESSFUL");
  console.log("Elements:", elements.address);
  console.log("Objects :", objects.address);
  console.log("Sale    :", sale.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
