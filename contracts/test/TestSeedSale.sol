// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TestNFT.sol";

contract TestSeedSale is Ownable, EIP712 {
    using SafeERC20 for IERC20;

    struct Voucher {
        uint256 id;
        uint256 price;
        uint256[] elementIds;
        uint256[] elementAmounts;
        uint256 preminedId;
        bool useWhitelist;
        bytes signature;
    }
    address public signer;
    address public immutable erc20;
    address public wallet;

    address public immutable elements;
    address public immutable objects;

    uint256 public minimumPrice;
    uint256 public maximumPrice;

    // object - element - amount
    mapping(uint256 => mapping(uint256 => uint256)) public minable;

    mapping(address => uint256) public whitelist;
    mapping(address => uint256) public whitelistPurchased;

    // TEST: ALLOWS DYNAMIC ERC20, WALLET, OWNER
    constructor(
        address _elements,
        address _objects,
        address _signer,
        address _erc20,
        address _wallet,
        address _owner
    ) EIP712("CollectiverseObjects", "1") {
        elements = _elements;
        objects = _objects;
        signer = _signer;

        // usdc avax address
        erc20 = _erc20;
        wallet = _wallet;
        _transferOwnership(_owner);

        // 50 usdc
        minimumPrice = 50000000;

        // 2000 usdc
        maximumPrice = 2000000000;
    }

    // minting objects
    function mintObject(address _owner, Voucher calldata _voucher)
        external
        returns (uint256)
    {
        uint256 _id = _voucher.id;
        uint256 _pre = _voucher.preminedId;

        // checking the signature, voucher & whitelist
        address voucherSigner = _verify(_voucher);
        require(signer == voucherSigner, "voucher is not signed by the signer");

        require(TestNFT(objects).totalSupply(_id) < 1, "exist alredy");

        if (_voucher.useWhitelist) {
            whitelistPurchased[_owner] += 1;
            require(
                (whitelistPurchased[_owner]) <= whitelist[_owner],
                "whitelist limit"
            );
        }

        // payment, elements, premining & minting
        require(_voucher.price >= minimumPrice, "not minimum price");
        require(_voucher.price <= maximumPrice, "not maximum price");
        IERC20(erc20).safeTransferFrom(msg.sender, wallet, _voucher.price);

        require(_voucher.elementIds.length == _voucher.elementAmounts.length);
        for (uint256 i = 0; i < _voucher.elementIds.length; i++) {
            minable[_id][_voucher.elementIds[i]] = _voucher.elementAmounts[i];
        }

        TestNFT(elements).mint(_owner, _pre, minable[_id][_pre]);
        minable[_id][_pre] = 0;

        TestNFT(objects).mint(_owner, _id, 1);
        return _id;
    }

    // management functions
    function setSettings(
        address _signer,
        address _wallet,
        uint256 _minimumPrice,
        uint256 _maximumPrice
    ) external onlyOwner {
        signer = _signer;
        wallet = _wallet;
        minimumPrice = _minimumPrice;
        maximumPrice = _maximumPrice;
    }

    function whitelistAddresses(address[] memory _addresses, uint256 _amount)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = _amount;
        }
    }

    // EIP 712
    function _hash(Voucher calldata voucher) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Voucher(uint256 id,uint256 price,uint256[] elementIds,uint256[] elementAmounts,uint256 preminedId,bool useWhitelist)"
                        ),
                        voucher.id,
                        voucher.price,
                        keccak256(abi.encodePacked(voucher.elementIds)),
                        keccak256(abi.encodePacked(voucher.elementAmounts)),
                        voucher.preminedId,
                        voucher.useWhitelist
                    )
                )
            );
    }

    function _verify(Voucher calldata voucher) internal view returns (address) {
        bytes32 digest = _hash(voucher);
        return ECDSA.recover(digest, voucher.signature);
    }
}
