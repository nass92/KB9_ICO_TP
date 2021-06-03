// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BenzemaToken is ERC20, Ownable {
    constructor(uint256 totalSupply_, address owner_) ERC20("BenzemaToken", "KB9") Ownable() {
        _mint(owner_, totalSupply_);
        transferOwnership(owner_);
    }
}
