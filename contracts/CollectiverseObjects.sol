// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "./OperatorRole.sol";
// Add a reference to the elements contract

contract CollectiverseObjects is ERC1155Upgradeable, OperatorRole {
    using StringsUpgradeable for uint256;

    string public name;
    string public symbol;
    string private baseURI;
    address private settings;

    //mapping(address => address) public planetVerseToVault;
    uint256 public count;
    uint256 private _totalSupply;


    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;

    event NewPlanetMinted(uint256 newItemId, address _owner);
    event UpdatedURI(string uri);

    function initialize(
        string memory _metaDataUri,
        string memory _name,
        string memory _symbol,
        uint256 _startingSupply,
        address _settings
    ) public initializer {   

        __OperatorRole_init();
        __ERC1155_init(_metaDataUri);

        name = _name;
        symbol = _symbol;
         _totalSupply = _startingSupply;

         settings = _settings;
         count = 0;

    }

    ///1. Pre-mine (lazy mint), mine the object and a random element 
    function mintObject(address _owner, string memory _objectMetaData, string memory _randmomElementMetaData, bytes memory data)
        external
        
    {
        /* _randmomElementMetaData = {
            name: "Carbon"
        }*/

        /* _objectMetaData = {
            attributes: {
                carbon: 1bt
                hydrogen: 1tt
            }
        }*/
        
        require(msg.value == miningFee * qty * time);

        _mint(msg.sender, _id, 1,data);
        CollectiverseElements(addr).mine()
        emit NewPlanetMinted(0, _owner);
    }

    

    function updateBaseUri(string calldata base) external onlyOperator {
        baseURI = base;

        emit UpdatedURI(baseURI);
    }

    function uri(uint256 id) public view override returns (string memory) {
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, id.toString()))
                : baseURI;
    }

    function totalElementSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        require(ids.length == 1, "too long");
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
