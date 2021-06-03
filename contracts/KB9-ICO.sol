// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./KB9coin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
contract KB9ICO is Ownable {
    BenzemaToken private _token;
    uint256 private _currentTime;
    uint256 private _supplyInSale;
    uint256 private _MarketCap; 
    uint256 private _ratePrice; 
    uint256 private _icoClosed;
    mapping(address => uint256) private _tokenBalances;

    event KB9TokenBought(address indexed buyer, uint256 amount, uint256 totalSupplyBought);
    event StartIco(address indexed owner, address indexed icoContract, uint256 supplyInSale);
    event Withdrawed(address indexed sender, uint256 amount);

    constructor(address kb9TokenAddress, address owner_, uint256 ratePrice_) Ownable() {
        _token = BenzemaToken(kb9TokenAddress);
        _supplyInSale = _token.totalSupply();
        transferOwnership(owner_);
        _currentTime = block.timestamp;
        _ratePrice = ratePrice_; 
    }


 modifier icoOpen() {
        require((block.timestamp < (_currentTime + 2 weeks) ), "ICO : icoo is not open");
        _;
    }

  modifier icoClosed() {
        require((block.timestamp > (_currentTime + 2 weeks) ), "KB9ICO : ico is not closed");
        _;
    }


/**
* @notice Cette fonction peut etre appelé uniquement s' il reste des tokens à vendre,
* et/ou que l'ico est encore ouverte. 
*
*Lorsqu'un utilisateur appelle cette fonction : 
* - le nombre de token diminue en fonction de la demande. 
* - Le MarketCap augmente 
* - l'investisseur recoit les tokens demandés. 
* le Montant de token à recevoir est égale au nombre d'ether envoyés mul par le taux (ratePrice) definit par l'owner. 
 */

  function buyToken() public payable icoOpen {
      if(block.timestamp < (_currentTime + 1 weeks)){
          uint256 amountKB9 = ((msg.value * _ratePrice) + ((msg.value * _ratePrice) / 2)); 
        require(_supplyInSale != 0, "KB9ICO: there is no more token available.");
        _tokenBalances[msg.sender] += amountKB9;
        _supplyInSale -= amountKB9;
        _MarketCap += msg.value;
      _token.transferFrom(owner(), msg.sender, amountKB9 ); 
      emit KB9TokenBought(msg.sender, msg.value, amountKB9);
      } else {
          uint256 amountKB9 = msg.value * _ratePrice; 
        require(_supplyInSale != 0, "KB9ICO: there is no more token available.");
        _tokenBalances[msg.sender] += amountKB9;
        _supplyInSale -= amountKB9;
        _MarketCap += msg.value;
      _token.transferFrom(owner(), msg.sender, amountKB9 ); 
      emit KB9TokenBought(msg.sender, msg.value, amountKB9);
      }
      
       /*uint256 amountKB9 = msg.value * _ratePrice; 
        require(_supplyInSale != 0, "KB9ICO: there is no more token available.");
        _tokenBalances[msg.sender] += amountKB9;
        _supplyInSale -= amountKB9;
        _MarketCap += msg.value;
      _token.transferFrom(owner(), msg.sender, amountKB9 ); 
      emit KB9TokenBought(msg.sender, msg.value, amountKB9);
     **/
    }

    /**
    * @notice Cette fonction produit le même resultat que la fonction buyToken. 
    * Or, ou lieu qu'elle soit appeller a traver une interface, 
    * l'utilisateur peut envoyer directement ces ether aux smart-contract. 
     */

receive() external payable icoOpen {
    uint256 amountKB9 = msg.value * _ratePrice; 
        require(_supplyInSale != 0, "KB9ICO: there is no more token available.");
        _tokenBalances[msg.sender] += amountKB9;
        _supplyInSale -=  amountKB9;
        _MarketCap += msg.value;
      _token.transferFrom(owner(), msg.sender, amountKB9 ); 
      emit KB9TokenBought(msg.sender, msg.value, amountKB9);
}


/**
* @notice Cette fonction permet à l'Owner de withdraw toute la balance du smart contract ICO lorsque l'ICO sera terminée, 
* c'est à dire 2 semaines après le déploiement.
 */

 function withdraw() public onlyOwner icoClosed {
        uint256 icoBalance = _token.balanceOf(address(this));
        require(icoBalance != 0, "KB9ICO : you can not withdraw empty balance");
        payable(msg.sender).transfer(icoBalance);
        emit Withdrawed(msg.sender, icoBalance);
    }

   function startICO() public onlyOwner {
        (block.timestamp > (_currentTime + 2 weeks));
        _token.approve(address(this), _token.totalSupply());
        emit StartIco(owner(), address(this), _supplyInSale);
    }

// function view 

    function tokenContract() public view returns (address) {
        return address(_token);
    }

    function supplyInSale() public view returns (uint256) {
        return _supplyInSale;
    }

    function tokenBalanceOf(address account) public view returns (uint256) {
        return _tokenBalances[account];
    }
    function MarketCap() public view returns (uint256) {
        return _MarketCap;
    }
     function ratePrice() public view returns (uint256) {
        return _ratePrice;
    }
     
      function icocontractBalance() public view returns (uint256) {
        return  _token.balanceOf(address(this));
    }
    function isContractClosed() public view returns (bool) {
        if((block.timestamp > (_currentTime + 2 weeks) )) {
return true;
        }
        
    }
}

