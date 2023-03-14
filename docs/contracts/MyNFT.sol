// SPDX-License-Identifier: UNLICENSED
  pragma solidity ^0.8.13;

  import "erc721a/contracts/ERC721A.sol";

  contract MyNFT is ERC721A {
  	constructor() ERC721A("My NFT", "NFT") {}

  	// We prefer tokenIds to start at 1
  	function _startTokenId() internal pure override returns (uint256) {
  		return 1;
  	}

  	function mint(uint256 quantity) external payable {
  		_mint(msg.sender, quantity);
  	}

  	/**
  	 * @dev override both ERC721A and ERC2981
  	 */
  	function supportsInterface(
  		bytes4 interfaceId
  	) public view override(ERC721A) returns (bool) {
  		return ERC721A.supportsInterface(interfaceId);
  	}
  }
    