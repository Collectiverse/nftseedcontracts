// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "./prefab/OperatorRole.sol";

contract CollectiverseNFT is ERC1155SupplyUpgradeable, OperatorRole {
    function initialize(string memory _uri) public initializer {
        __OperatorRole_init();
        __ERC1155_init(_uri);
    }

    function mint(
        address _owner,
        uint256 _id,
        uint256 _amount
    ) external onlyOperator {
        _mint(_owner, _id, _amount, "");
    }

    // management functions
    function setURI(string calldata _uri) external onlyOperator {
        _setURI(_uri);
    }
}
