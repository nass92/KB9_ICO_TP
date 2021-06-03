const { expect } = require('chai')
//const { ethers } = require('ethers')

describe('KB9ICO', function () {
  let BenzemaToken, benzematoken, KB9ICO, kb9ico, dev, owner, investor1, investor2
  let TOTAL_SUPPLY = ethers.utils.parseEther('1000')
  let RATE_PRICE = 3
  const NAME = 'BenzemaToken'
  const SYMBOL = 'KB9'
  beforeEach(async function () {
    [BenzemaToken, benzematoken, KB9ICO, kb9ico, dev, owner, onlyOwner,  investor1, investor2] = await ethers.getSigners()
    // Deployement KB9token 
    BenzemaToken = await ethers.getContractFactory('BenzemaToken')
    benzematoken = await BenzemaToken.connect(dev).deploy(TOTAL_SUPPLY, owner.address)
    await benzematoken.deployed()

    //  Deployement KB9ICO
    KB9ICO = await ethers.getContractFactory('KB9ICO')
    kb9ico = await KB9ICO.connect(dev).deploy(benzematoken.address, owner.address, RATE_PRICE)
    await kb9ico.deployed()
  })


  ///////////////// TEST DEPLOYMENT ///////////

  describe('Deployment', function () {
    it('should display the address of the token contract', async function () {
      expect(await kb9ico.tokenContract()).to.equal(benzematoken.address)
    })

    it('should set the supply for the sale', async function () {
      expect(await kb9ico.supplyInSale()).to.equal(TOTAL_SUPPLY)
    })

    it('should set the owner of the ICO', async function () {
      expect(await kb9ico.owner()).to.equal(owner.address)
    })
    it("Should has start counting time until the end of the ico"), async function(){
      await ethers.provider.send('evm_increaseTime', [10]);
      await ethers.provider.send('evm_mine');
      expect (await kb9ico.secondRemaining()).to.equal(1209590)
    }
    it(`Should have tokenPrice ${RATE_PRICE}`, async function () {
      expect(await kb9ico.ratePrice()).to.equal(RATE_PRICE);
    });

  })

/////////////// TEST StartICO //////////////

  describe('startICO', async function () {
    it('Should revert if not owner of tokens', async function () {
      await expect(kb9ico.connect(investor1).startICO()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
    it(`Should open contract`, async function () {
      await kb9ico.connect(owner).startICO();
      expect(await kb9ico.isContractClosed()).to.equal(false);
    });
    /*it(`Should give allowances to ico to transfer from reserve all supply`, async function () {
      await kb9ico.connect(owner).startICO();
      expect(await benzematoken.allowance(kb9ico.address, owner.address)).to.equal(TOTAL_SUPPLY);
    });*/
  });



//////////////// Test BuyToken ////////////

  describe('buyToken', function () {

    ///// la 1eme semaine avec le bonus  ////
    describe('with Bonus', function(){
      beforeEach(async function () {
        await benzematoken.connect(owner).approve(kb9ico.address, TOTAL_SUPPLY)
        await ethers.provider.send('evm_increaseTime', [4801]) 
        await ethers.provider.send('evm_mine')
        await kb9ico.connect(investor1).buyToken({ value: 100 });
        await kb9ico.connect(investor2).buyToken({ value: 100 });
      })
      
      
      it(' should decrease the supply in sale', async function () {
        
        expect(await kb9ico.supplyInSale()).to.equal(TOTAL_SUPPLY.sub((200 * RATE_PRICE) + ((200 * RATE_PRICE) / 2)));
      })
  
      it(' should increase the MarketCap', async function () {
        await ethers.provider.send('evm_increaseTime', [504801]) 
        await ethers.provider.send('evm_mine')
        expect(await kb9ico.MarketCap()).to.equal(200);
      })
      it('should update the token balance of buyer', async function () {
      
        expect(await kb9ico.tokenBalanceOf(investor1.address)).to.equal(((100 * RATE_PRICE) + ((100 * RATE_PRICE) / 2)))
      })
    })
    
///// la 2eme semaine sans  le bonus  ////
describe ('without Bonus', function() {
   beforeEach(async function () {
    await benzematoken.connect(owner).approve(kb9ico.address, TOTAL_SUPPLY)
    await ethers.provider.send('evm_increaseTime', [604901]) 
    await ethers.provider.send('evm_mine')
    await kb9ico.connect(investor1).buyToken({ value: 100 });
    await kb9ico.connect(investor2).buyToken({ value: 100 });
   })
   
    it('should decrease the supply in sale', async function () {
      expect(await kb9ico.supplyInSale()).to.equal(TOTAL_SUPPLY.sub(200 * RATE_PRICE));
    })

    it('should increase the MarketCap', async function () {
      expect(await kb9ico.MarketCap()).to.equal(200);
    })
    it('should update the token balance of buyer', async function () {
      expect(await kb9ico.tokenBalanceOf(investor2.address)).to.equal(100 * RATE_PRICE)
    }) 
  })



//////////////// TEST RECEIVE FUNCTION //////////////

  describe('receive', () => {
    
    beforeEach(async function () {
      await benzematoken.connect(owner).approve(kb9ico.address, TOTAL_SUPPLY)
      await investor1.sendTransaction({ value: 100 , to: kb9ico.address});
    })

    it('should decrease the supply in sale', async function () {
      expect(await kb9ico.supplyInSale()).to.equal(TOTAL_SUPPLY.sub(100 * RATE_PRICE));
    })

    it('should increase the MarketCap', async function () {
      expect(await kb9ico.MarketCap()).to.equal(100);
    })
    it('should update the token balance of buyer', async function () {
      expect(await kb9ico.tokenBalanceOf(investor1.address)).to.equal(100 * RATE_PRICE)
    })
  })



////////////////// TEST WITHDRAW   ////////////////

  describe('withdraw', async function () {
    beforeEach(async function () {
      await benzematoken.connect(owner).approve(kb9ico.address, TOTAL_SUPPLY)
      await kb9ico.connect(investor1).buyToken({ value: 1000 });
      
    });
   it('Should revert if ico not closed', async function () {
      await expect(kb9ico.connect(owner).withdraw()).to.be.revertedWith('KB9ICO : ico is not closed');
    });
    it('Should revert if ICO is empty', async function () {
      // one week = 604800 second, on récupere le time actuellement et on lui ajoute 2 semaine en seconde 
     await ethers.provider.send('evm_increaseTime', [1210000]) 
     await ethers.provider.send('evm_mine') // on mets a jour le nouveau time incrémenté des deux semaines. 
     await expect(kb9ico.connect(owner).withdraw()).to.be.revertedWith('KB9ICO : you can not withdraw empty balance');
   });
   
    it('should revert if the caller is not the owner (Ownable)', async function () {
      await ethers.provider.send('evm_increaseTime', [1210000]) // one week = 604800 second
      await ethers.provider.send('evm_mine')
      await expect(kb9ico.connect(investor2).withdraw()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set the ico balance at zero', async function () {
      expect(await kb9ico.icocontractBalance()).to.equal(0)
    })
/*
    it('Emits Withdrawed event', async function () {
      await ethers.provider.send('evm_increaseTime', [1210000]) // one week = 604800 second
      await ethers.provider.send('evm_mine')
      await expect(kb9ico.connect(owner).withdraw())
        .to.emit(kb9ico, 'Withdrawed')
        .withArgs(owner.address, TOTAL_SUPPLY - (1000 * RATE_PRICE));
    });*/

  });

})
})
