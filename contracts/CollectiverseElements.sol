// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "./OperatorRole.sol";

contract CollectiverseElements is ERC1155Upgradeable, OperatorRole {
    event ElementMinted(uint256 newItemId, address _owner);
    event UpdatedURI(string uri);

    mapping(uint256 => uint256) public supply;

    function initialize(string memory _uri) public initializer {
        __OperatorRole_init();
        __ERC1155_init(_uri);
    }

    // minting & burning elements
    function mintElement(
        address _owner,
        uint256 _elementId,
        uint256 _amount
    ) external onlyOperator {
        _mint(_owner, _elementId, _amount, "");
        supply[_elementId] += _amount;
    }

    function burnElement(
        address _owner,
        uint256 _elementId,
        uint256 _amount
    ) external onlyOperator {
        _burn(_owner, _elementId, _amount);
        supply[_elementId] -= _amount;
    }

    // management functions
    function setURI(string calldata _uri) external onlyOperator {
        _setURI(_uri);
    }
}
