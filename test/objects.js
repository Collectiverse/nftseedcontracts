const { expect, assert } = require("chai");
const { ethers, upgrades } = require("hardhat");

const domain = "CollectiverseObjects";
const wallet = "0x0000000000000000000000000000000000000001";
const chainId = 43114;

// Async chai helper
const expectThrowsAsync = async (method) => {
  try {
    await method()
  } catch (e) {
    return true
  }
  return false
}

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

  const Elements = await ethers.getContractFactory("CollectiverseNFT");
  const elements = await upgrades.deployProxy(Elements, [""]);
  await elements.deployed();

  const Objects = await ethers.getContractFactory("CollectiverseNFT");
  const objects = await upgrades.deployProxy(Objects, [""]);
  await objects.deployed();

  const Sale = await ethers.getContractFactory("CollectiverseSeedSale");
  const sale = await Sale.deploy(elements.address, objects.address, usdc.address, wallet, signer.address);
  await sale.deployed();

  await elements.addOperator(sale.address);
  await objects.addOperator(sale.address);

  return { signer, usdc, elements, objects, sale };
}

describe("Objects", function () {
  it("Using a voucher without whitelist", async function () {
    let { signer, usdc, elements, objects, sale } = await loadContracts();

    await usdc.approve(sale.address, 100 * (10 ** 6));

    const voucher = { id: 1, price: 100 * (10 ** 6), elementIds: [1, 2], elementAmounts: [200, 300], preminedId: 1, useWhitelist: false };
    const ethersDomain = {
      name: domain,
      version: "1",
      chainId: chainId,
      verifyingContract: sale.address
    };
    const signature = await signer._signTypedData(ethersDomain, types, voucher)
    // console.log({ ...voucher, signature })

    await sale.mintObject(signer.address, { ...voucher, signature });
  });

  it("Using a voucher with whitelist", async function () {
    let { signer, usdc, elements, objects, sale } = await loadContracts();

    await usdc.approve(sale.address, 100 * (10 ** 6));

    const voucher = { id: 1, price: 100 * (10 ** 6), elementIds: [1, 2], elementAmounts: [200, 300], preminedId: 1, useWhitelist: true };
    const ethersDomain = {
      name: domain,
      version: "1",
      chainId: chainId,
      verifyingContract: sale.address
    };
    const signature = await signer._signTypedData(ethersDomain, types, voucher)

    await sale.whitelistAddresses([signer.address], 1);

    await sale.mintObject(signer.address, { ...voucher, signature });
  });

  it("Trying to buy without being whitelisted", async function () {
    let { signer, usdc, elements, objects, sale } = await loadContracts();

    await usdc.approve(sale.address, 100 * (10 ** 6));

    const voucher = { id: 1, price: 100 * (10 ** 6), elementIds: [1, 2], elementAmounts: [200, 300], preminedId: 1, useWhitelist: true };
    const ethersDomain = {
      name: domain,
      version: "1",
      chainId: chainId,
      verifyingContract: sale.address
    };
    const signature = await signer._signTypedData(ethersDomain, types, voucher)

    expect(await expectThrowsAsync(() => sale.mintObject(signer.address, { ...voucher, signature }))).to.equal(true);
  });

  it("Trying to redeem same voucher twice", async function () {
    let { signer, usdc, elements, objects, sale } = await loadContracts();

    await usdc.approve(sale.address, 500 * (10 ** 6));

    const voucher = { id: 1, price: 100 * (10 ** 6), elementIds: [1, 2], elementAmounts: [200, 300], preminedId: 1, useWhitelist: false };
    const ethersDomain = {
      name: domain,
      version: "1",
      chainId: chainId,
      verifyingContract: sale.address
    };
    const signature = await signer._signTypedData(ethersDomain, types, voucher)
    // console.log({ ...voucher, signature })

    await sale.mintObject(signer.address, { ...voucher, signature });
    expect(await expectThrowsAsync(() => sale.mintObject(signer.address, { ...voucher, signature }))).to.equal(true);
  });

  it("Checking Element access", async function () {
    let { signer, usdc, elements, objects, sale } = await loadContracts();

    await usdc.approve(sale.address, 100 * (10 ** 6));

    const voucher = { id: 1, price: 100 * (10 ** 6), elementIds: [1, 2], elementAmounts: [200, 300], preminedId: 1, useWhitelist: false };
    const ethersDomain = {
      name: domain,
      version: "1",
      chainId: chainId,
      verifyingContract: sale.address
    };
    const signature = await signer._signTypedData(ethersDomain, types, voucher)
    // console.log({ ...voucher, signature })

    await sale.mintObject(signer.address, { ...voucher, signature });
    expect((await sale.minable(1, 2)).toNumber()).to.equal(300)
  });
})
