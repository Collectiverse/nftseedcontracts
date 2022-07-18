// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "./OperatorRole.sol";

contract CollectiverseObjects is ERC1155Upgradeable, OperatorRole {
    using StringsUpgradeable for uint256;

    string public name;
    string public symbol;
    string private baseURI;
    address private settings;

    uint256 private _defaultTimeFrame = 10000;// Seconds probably move to the settings contract
    unit256 private _defaultCost = 100;// Value 

    //mapping(address => address) public planetVerseToVault;
    uint256 public count;

    struct MineRequest {
        uint256 id;
        uint256 qty;
        uint256 timeRequested;
    }

    mapping (address => MineRequest) public mineRequests;

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

        settings = _settings;
        count = 0;

    }
    //Token: 1 - Carbon    

    function mintElement(uint _amount, address _owner)
        external
    {
        //count++;
        //planetVerseToVault[address(this)] = vault;

        _mint(vault, 1, _totalSupply, "");
    }

    function isItMined(uint256 _id) view public returns (bool) {
        return true;
    }

    function claim(uint256 _id) {
        require (_isItMined(_id), 'Not Minted yet');
    }

    function _isItMined(_id) view private returns(bool) {

        if (block.timestamp => timeRequested) {
            return true;
        } else {
            return false;
        }
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
