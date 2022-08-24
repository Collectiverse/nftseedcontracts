const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

const domain = "CollectiverseObjects";
const wallet = "0x0000000000000000000000000000000000000001";
const chainId = 43114;

/*
    uint256 id;
    uint256 price;
    uint256[] elementIds;
    uint256[] elementAmounts;
    uint256 preminedId;
    bool useWhitelist;
    bytes signature;
*/
const types = {
  Voucher: [
    { name: "id", type: "uint256" },
    { name: "price", type: "uint256" },
    { name: "elementIds", type: "uint256[]" },
    { name: "elementAmounts", type: "uint256[]" },
    { name: "preminedId", type: "uint256" },
    { name: "useWhitelist", type: "bool" },
  ]
}

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
  it("Using a voucher without whitelist", async function () {
    let { signer, usdc, elements, objects } = await loadContracts();

    await usdc.approve(objects.address, 100 * (10 ** 6));

    const voucher = { id: 1, price: 100 * (10 ** 6), elementIds: [1, 2], elementAmounts: [200, 300], preminedId: 1, useWhitelist: false };
    const ethersDomain = {
      name: domain,
      version: "1",
      chainId: chainId,
      verifyingContract: objects.address
    };
    const signature = await signer._signTypedData(ethersDomain, types, voucher)
    // console.log({ ...voucher, signature })

    await objects.mintObject(signer.address, { ...voucher, signature });
  });

  it("Using a voucher with whitelist", async function () {
    let { signer, usdc, elements, objects } = await loadContracts();

    await usdc.approve(objects.address, 100 * (10 ** 6));

    const voucher = { id: 1, price: 100 * (10 ** 6), elementIds: [1, 2], elementAmounts: [200, 300], preminedId: 1, useWhitelist: true };
    const ethersDomain = {
      name: domain,
      version: "1",
      chainId: chainId,
      verifyingContract: objects.address
    };
    const signature = await signer._signTypedData(ethersDomain, types, voucher)

    await objects.addOperator(signer.address);
    await objects.whitelistAddresses([signer.address], 1);

    await objects.mintObject(signer.address, { ...voucher, signature });
  });

  it("Trying to buy without being whitelisted", async function () {
    let { signer, usdc, elements, objects } = await loadContracts();

    await usdc.approve(objects.address, 100 * (10 ** 6));

    const voucher = { id: 1, price: 100 * (10 ** 6), elementIds: [1, 2], elementAmounts: [200, 300], preminedId: 1, useWhitelist: true };
    const ethersDomain = {
      name: domain,
      version: "1",
      chainId: chainId,
      verifyingContract: objects.address
    };
    const signature = await signer._signTypedData(ethersDomain, types, voucher)

    try {
      await objects.mintObject(signer.address, { ...voucher, signature });
      expect(false).to.equal(true)
    } catch (e) { }
  });
})
