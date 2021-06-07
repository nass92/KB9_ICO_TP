// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./KB9coin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CalcKB9 is Ownable {

     BenzemaToken private _token;
    uint256 private _profit;
    uint256 private _counter;

    event Added(address indexed account, int256 res);
    event Subbed(address indexed account, int256 res);
    event Muled(address indexed account, int256 res);
    event Divided(address indexed account, int256 res);
    event Moduled(address indexed account, int256 res);



     /// @dev make sure that the sender has SRO tokens.
    modifier payourOP() {
        require(_token.balanceOf(msg.sender) >= 1, "CalcKB9: not enought money, you need pay at least 1 KB9coin to execute the function");
        _token.transferFrom(msg.sender, owner(), 1);
        _profit++;
        _;
    }

    /// @dev revert if the sender does not already approved this contract.
    modifier approved() {
        if(_token.allowance(msg.sender, address(this)) < 1) {
            revert("CalcKB9: you have to approve this contract first to use functions");    
        }
        _; 
    }


    constructor ( address kb9TokenAddress) {
        _token = BenzemaToken(kb9TokenAddress);
    }
    
     
    function add(int256 nb1, int256 nb2) public payourOP() approved() returns(int256) {
        emit Added(msg.sender, nb1 + nb2);
        return nb1 + nb2;
    }

    
    function sub(int256 nb1, int256 nb2) public approved() payourOP() returns(int256) {
        emit Subbed(msg.sender, nb1 - nb2);
        return nb1 - nb2;
    }
    
   
    function mul(int256 nb1, int256 nb2) public approved() payourOP() returns(int256) {
        emit Muled(msg.sender, nb1 * nb2);
        return nb1 * nb2;
    }

    function div(int256 nb1, int256 nb2) public approved() payourOP() returns(int256) {
        emit Divided(msg.sender, nb1 / nb2);
        return nb1 / nb2;
    }
    
    function mod(int256 nb1, int256 nb2) public approved() payourOP() returns(int256) {
        emit Moduled(msg.sender, nb1 % nb2);
        return nb1 % nb2;
    }

 /// @dev see how many moula the owner has won since the deployment.
    function seeProfit() public view onlyOwner() returns(uint256) {
        return _profit;
    }

}
