// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

contract CollectiverseNFT is
    AccessControlEnumerableUpgradeable,
    ERC1155SupplyUpgradeable
{
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    function initialize(string memory _uri) public initializer {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __AccessControl_init_unchained();
        __AccessControlEnumerable_init_unchained();
        __ERC1155_init_unchained(_uri);
        __ERC1155Supply_init_unchained();
        _grantRole(
            DEFAULT_ADMIN_ROLE,
            0xf65755190AbC2037d10A7543FE435f54822859e7
        );
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerableUpgradeable, ERC1155Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function mint(
        address _owner,
        uint256 _id,
        uint256 _amount
    ) external onlyRole(OPERATOR_ROLE) {
        _mint(_owner, _id, _amount, "");
    }

    // management functions
    function setURI(string calldata _uri)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setURI(_uri);
    }
}
