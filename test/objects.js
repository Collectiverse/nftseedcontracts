const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

const domain = "CollectiverseObjects";
const wallet = "0x0000000000000000000000000000000000000001";
const chainId = 43114;

async function loadContracts() {
  const signer = await ethers.getSigner();

  const USDC = await ethers.getContractFactory("MockERC20");
  const usdc = await USDC.deploy(5000000 * (10 ** 6), 6);
  await usdc.deployed();

  const Elements = await ethers.getContractFactory("CollectiverseElements");
  const elements = await upgrades.deployProxy(Elements, [""]);
  await elements.deployed();

  const Objects = await ethers.getContractFactory("CollectiverseObjects");
  const objects = await upgrades.deployProxy(Objects, ["", 1000, elements.address, signer.address, usdc.address, wallet, domain]);
  await objects.deployed();

  await elements.addOperator(objects.address);

  return { signer, usdc, elements, objects };
}

describe("Objects", function () {
  it("Creating a voucher and using it", async function () {
    let { signer, usdc, elements, objects } = await loadContracts();

    /*
        uint256 id;
        uint256 price;
        uint256[] elementIds;
        uint256[] elementAmounts;
        uint256 preminedId;
        bytes signature;
    */

    await usdc.approve(objects.address, 100 * (10 ** 6));

    const voucher = { id: 1, price: 100 * (10 ** 6), elementIds: [1, 2], elementAmounts: [200, 300], preminedId: 1 };
    const ethersDomain = {
      name: domain,
      version: "1",
      chainId: chainId,
      verifyingContract: objects.address
    };
    const types = {
      Voucher: [
        { name: "id", type: "uint256" },
        { name: "price", type: "uint256" },
        { name: "elementIds", type: "uint256[]" },
        { name: "elementAmounts", type: "uint256[]" },
        { name: "preminedId", type: "uint256" },
      ]
    }
    const signature = await signer._signTypedData(ethersDomain, types, voucher)
    console.log({ ...voucher, signature })

    await objects.mintObject(signer.address, { ...voucher, signature });
  });
})
