// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CollectiverseNFT.sol";

contract CollectiverseSeedSale is Ownable, EIP712 {
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

    // object - element - amount
    mapping(uint256 => mapping(uint256 => uint256)) public minable;

    mapping(address => uint256) public whitelist;
    mapping(address => uint256) public whitelistPurchased;

    constructor(
        address _elements,
        address _objects,
        address _signer
    ) EIP712("CollectiverseObjects", "1") {
        elements = _elements;
        objects = _objects;
        signer = _signer;

        // usdc avax address
        erc20 = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
        wallet = 0x233E70CdE8FeAb985CCAA5938C579cc47B1ffAeD;
        _transferOwnership(0x233E70CdE8FeAb985CCAA5938C579cc47B1ffAeD);

        // 50 usdc
        minimumPrice = 50000000;
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

        require(CollectiverseNFT(objects).totalSupply(_id) < 1, "exist alredy");

        if (_voucher.useWhitelist) {
            whitelistPurchased[_owner] += 1;
            require(
                (whitelistPurchased[_owner]) <= whitelist[_owner],
                "whitelist limit"
            );
        }

        // payment, elements, premining & minting
        require(_voucher.price >= minimumPrice, "not minimum price");
        IERC20(erc20).safeTransferFrom(msg.sender, wallet, _voucher.price);

        require(_voucher.elementIds.length == _voucher.elementAmounts.length);
        bool preInElements = false;
        for (uint256 i = 0; i < _voucher.elementIds.length; i++) {
            minable[_id][_voucher.elementIds[i]] = _voucher.elementAmounts[i];
            if (_voucher.elementIds[i] == _pre) {
                preInElements = true;
            }
        }
        require(
            preInElements,
            "Incorrectly signed Voucher, preminedId was not found in elementIds."
        );

        CollectiverseNFT(elements).mint(_owner, _pre, minable[_id][_pre]);
        minable[_id][_pre] = 0;

        CollectiverseNFT(objects).mint(_owner, _id, 1);
        return _id;
    }

    // management functions
    function setSettings(
        address _signer,
        address _wallet,
        uint256 _minimumPrice
    ) external onlyOwner {
        signer = _signer;
        wallet = _wallet;
        minimumPrice = _minimumPrice;
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
