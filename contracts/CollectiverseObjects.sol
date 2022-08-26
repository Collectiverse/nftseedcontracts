// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2; // required to accept structs as function parameters

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "./OperatorRole.sol";

import "./CollectiverseElements.sol";

contract CollectiverseObjects is
    ERC1155Upgradeable,
    OperatorRole,
    EIP712Upgradeable
{
    using ECDSAUpgradeable for bytes32;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // eip712 domain separator
    string private constant SIGNATURE_VERSION = "1";
    string private signDomain;

    address public elements;
    // object - element - amount
    mapping(uint256 => mapping(uint256 => uint256)) public minableElements;
    // element - amount
    mapping(uint256 => uint256) public minableSupply;

    uint256 public count;
    uint256 public maximumObjects;

    mapping(uint256 => uint256) public usedVouchers;
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

    address public erc20;
    address public wallet;

    // whitelidted addresses
    mapping(address => uint256) public whitelist;
    mapping(address => uint256) public whitelistPurchased;

    event ObjectMinted(uint256 id, address owner);
    event UpdatedURI(string uri);

    function initialize(
        string memory _uri,
        uint256 _supply,
        address _elements,
        address _signer,
        address _erc20,
        address _wallet,
        string memory _signDomain
    ) public initializer {
        __EIP712_init(_signDomain, SIGNATURE_VERSION);

        __OperatorRole_init();
        __ERC1155_init(_uri);

        signDomain = _signDomain;

        maximumObjects = _supply;
        elements = _elements;
        signer = _signer;
        erc20 = _erc20;
        wallet = _wallet;

        count = 0;
    }

    // public facing minting functions
    function mintObject(address _owner, Voucher calldata _voucher)
        external
        returns (uint256)
    {
        return _mintObject(_owner, _voucher);
    }

    function mintObjects(address _owner, Voucher[] calldata _voucher)
        external
        returns (uint256[] memory)
    {
        uint256[] memory _ids = new uint256[](_voucher.length);
        for (uint256 i = 0; i < _voucher.length; i++) {
            _ids[i] = (_mintObject(_owner, _voucher[i]));
        }
        return _ids;
    }

    // handling of minting
    function _mintObject(address _owner, Voucher calldata _voucher)
        internal
        returns (uint256)
    {
        // checking the signature
        address voucherSigner = _verify(_voucher);
        require(signer == voucherSigner, "voucher is not signed by the signer");

        // maximum objects reached
        require(count < maximumObjects, "maximum number of objects reached");
        count += 1;

        // check for unused voucher
        require(usedVouchers[_voucher.id] == 0, "object already minted");
        usedVouchers[_voucher.id] = 1;

        // check whitelist requirement
        if (_voucher.useWhitelist) {
            whitelistPurchased[_owner] += 1;
            require(
                (whitelistPurchased[_owner]) <= whitelist[_owner],
                "personal whitelisted purchase limit reached"
            );
        }

        // make payment
        IERC20Upgradeable(erc20).safeTransferFrom(
            msg.sender,
            wallet,
            _voucher.price
        );

        // adding the elements to the object
        require(
            _voucher.elementIds.length == _voucher.elementAmounts.length,
            "element ids and amounts must have the same length"
        );
        for (uint256 i = 0; i < _voucher.elementIds.length; i++) {
            _addMinableElement(
                _voucher.id,
                _voucher.elementIds[i],
                _voucher.elementAmounts[i]
            );
        }

        // premining element
        if (minableElements[_voucher.id][_voucher.preminedId] > 0) {
            CollectiverseElements(elements).mintElement(
                _owner,
                _voucher.preminedId,
                minableElements[_voucher.id][_voucher.preminedId]
            );
            _removeMinableElement(
                _voucher.id,
                _voucher.preminedId,
                minableElements[_voucher.id][_voucher.preminedId]
            );
        }

        // mint the object
        _mint(_owner, _voucher.id, 1, "");
        emit ObjectMinted(_voucher.id, _owner);

        return _voucher.id;
    }

    // minable elements management
    function addMinableElement(
        uint256 _objectId,
        uint256 _elementId,
        uint256 _amount
    ) external onlyOperator {
        _addMinableElement(_objectId, _elementId, _amount);
    }

    function _addMinableElement(
        uint256 _objectId,
        uint256 _elementId,
        uint256 _amount
    ) internal {
        minableSupply[_elementId] += _amount;
        minableElements[_objectId][_elementId] += _amount;
    }

    function removeMinableElement(
        uint256 _objectId,
        uint256 _elementId,
        uint256 _amount
    ) external onlyOperator {
        _removeMinableElement(_objectId, _elementId, _amount);
    }

    function _removeMinableElement(
        uint256 _objectId,
        uint256 _elementId,
        uint256 _amount
    ) internal {
        require(
            minableElements[_objectId][_elementId] >= _amount,
            "not enough elements"
        );
        minableSupply[_elementId] -= _amount;
        minableElements[_objectId][_elementId] -= _amount;
    }

    function getMinableElement(uint256 _objectId, uint256 _elementId)
        external
        view
        returns (uint256)
    {
        return minableElements[_objectId][_elementId];
    }

    // management functions
    function setURI(string calldata _uri) external onlyOperator {
        _setURI(_uri);
    }

    function setSettings(
        address _signer,
        address _erc20,
        address _wallet
    ) external onlyOperator {
        signer = _signer;
        erc20 = _erc20;
        wallet = _wallet;
    }

    function setMaximumObjects(uint256 _maximumObjects) external onlyOperator {
        maximumObjects = _maximumObjects;
    }

    // whitelist addresses
    function whitelistAddresses(address[] memory _addresses, uint256 _amount)
        external
        onlyOperator
        returns (bool)
    {
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(_addresses[i] != address(0x0), "Zero Address: Not Allowed");
            whitelist[_addresses[i]] = _amount;
        }
        return true;
    }

    // voucher verification functions & other
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

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
        return ECDSAUpgradeable.recover(digest, voucher.signature);
    }
}
