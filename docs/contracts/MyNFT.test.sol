// SPDX-License-Identifier: UNLICENSED
  pragma solidity ^0.8.13;

  import "forge-std/console.sol";
  import "forge-std/Test.sol";

  import "./MyNFT.sol";

  contract MyContractTest is Test {
  	MyNFT public mock;

  	function setUp() public {
  		mock = new MyNFT();
  	}

  	function testMint() public {
  		address minter = makeAddr("minter");
  		assertEq(mock.balanceOf(minter), 0);
  		vm.prank(minter);
  		mock.mint(1);
  		assertEq(mock.balanceOf(minter), 1);
  	}
  }
    