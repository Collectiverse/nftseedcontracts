// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./OperatorRole.sol";

import "./CollectiverseElements.sol";

contract CollectiverseObjects is ERC1155Upgradeable, OperatorRole {
    address public elements;
    // object - element - amount
    mapping(uint256 => mapping(uint256 => uint256)) public minableElements;
    // element - amount
    mapping(uint256 => uint256) public minableSupply;

    uint256 public count = 0;
    uint256 public maximumObjects;

    mapping(uint256 => uint256) public usedVouchers;
    struct Voucher {
        uint256 id;
        uint256 price;
        uint256[] elementIds;
        uint256[] elementAmounts;
        uint256 preminedId;
        bytes signature;
    }
    address public signer;

    event ObjectMinted(uint256 id, address owner);
    event UpdatedURI(string uri);

    function initialize(
        string memory _uri,
        uint256 _supply,
        address _elements,
        address _signer
    ) public initializer {
        __OperatorRole_init();
        __ERC1155_init(_uri);

        maximumObjects = _supply;
        elements = _elements;
        signer = _signer;
    }

    // handling of minting
    function mintObject(address _owner, Voucher calldata _voucher)
        external
        payable
        returns (uint256)
    {
        // checking the signature
        // tbd
        // require(signer ==, "signer is not valid");

        // maximum objects reached
        require(count < maximumObjects, "maximum number of objects reached");
        count += 1;

        // check for unused voucher
        require(usedVouchers[_voucher.id] == 0, "element already minted");
        usedVouchers[_voucher.id] = 1;

        // check if enough was paid
        require(msg.value >= _voucher.price, "insufficient payment to redeem");

        // adding the elements to the object
        require(
            _voucher.elementIds.length == _voucher.elementAmounts.length,
            "Ids and Amounts must have the same length"
        );
        for (uint256 i = 0; i < _voucher.elementIds.length; i++) {
            _setMinableElement(
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
            _setMinableElement(_voucher.id, _voucher.preminedId, 0);
        }

        // mint the object
        _mint(_owner, _voucher.id, 1, "");
        emit ObjectMinted(_voucher.id, _owner);

        return _voucher.id;
    }

    // minable elements management
    function setMinableElement(
        uint256 _objectId,
        uint256 _elementId,
        uint256 _amount
    ) external onlyOperator {
        _setMinableElement(_objectId, _elementId, _amount);
    }

    function _setMinableElement(
        uint256 _objectId,
        uint256 _elementId,
        uint256 _amount
    ) internal {
        // calculating element supply
        minableSupply[_elementId] += (_amount -
            minableElements[_objectId][_elementId]);

        minableElements[_objectId][_elementId] = _amount;
    }

    // management functions
    function withdrawAll() external onlyOperator {
        payable(msg.sender).transfer(address(this).balance);
    }

    function setURI(string calldata _uri) external onlyOperator {
        _setURI(_uri);
    }

    function setSigner(address _signer) external onlyOperator {
        signer = _signer;
    }

    function setMaximumObjects(uint256 _maximumObjects) external onlyOperator {
        maximumObjects = _maximumObjects;
    }
}
