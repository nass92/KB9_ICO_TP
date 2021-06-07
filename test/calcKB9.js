const { expect } = require('chai')

describe('CalcKB9', function () {
let  BenzemaToken, benzematoken, KB9ICO, kb9ico, CALC, calc,  dev, owner, investor1, investor2, investor3
const TOTAL_SUPPLY = ethers.utils.parseEther('1000')
  beforeEach(async function () {
    [BenzemaToken, benzematoken, KB9ICO, kb9ico, CALC, calc,  dev, owner, investor1, investor2, investor3] = await ethers.getSigners();

    BenzemaToken = await ethers.getContractFactory('BenzemaToken')
    benzematoken = await BenzemaToken.connect(dev).deploy(TOTAL_SUPPLY, owner.address)
    await benzematoken.deployed()
    await benzematoken.connect(owner).approve(kb9ico.address, TOTAL_SUPPLY)
    await benzematoken.connect(owner).transfer(investor1.address, 200)
    await benzematoken.connect(owner).transfer(investor2.address, 200)

    CALC = await ethers.getContractFactory('CalcKB9');
    calc = await CALC.connect(owner).deploy(benzematoken.address);
    await calc.deployed();
    await benzematoken.connect(investor1).approve(calc.address, TOTAL_SUPPLY);
    await benzematoken.connect(investor2).approve(calc.address, TOTAL_SUPPLY);
  });

  /**
   * Le premier test consiste à verifier: 
   * - si la balane de l'utilisateur est suffisante pour faire une OP.
   * - Si la transaction de 'lutilisateur vers l'owner s'éxécute correctement. 
   * - Si la balance Profit de l'owner s'incrémente bien.
   * - La balance Profit, ne peut être appéllé que par l'owner du contract. 
   */
  describe('Check Balance, increase profit, .', function () {
    it("should revert if msg.sender does not have any KB9coin", async function () {
      await benzematoken.connect(investor3).approve(calc.address,TOTAL_SUPPLY);
      await expect(calc.connect(investor3).add(1, 2)).to.revertedWith("CalcKB9: not enought money, you need pay at least 1 KB9coin to execute the function")
    });
    it("should send 1 token as fees to the owner", async function () {
      await expect(() => calc.connect(investor1).add(1,2).to.changeTokenBalance('BenzemaToken', [investor1.address, calc.owner()], 1));
    });
    it("Return the Total of Profit generated", async function () {
      await calc.connect(investor2).add(2,2);
      await calc.connect(investor1).sub(2,2);
      await calc.connect(investor1).mul(2,2);
      await calc.connect(investor2).mod(6,4);
      expect(await calc.connect(owner).seeProfit()).to.equal(4)
    });
    it("Revert if not called by the owner", async function () {
      await expect( calc.connect(investor3).seeProfit()).to.revertedWith("Ownable: caller is not the owner")
    });
  });

/**
 * Ensuite nous vérifions, si les opérations, tel que:  2 + 1 = 3, fonctionnent correctement. 
 */

  describe('Addition', function() {
    it("Return the result of the addition of both parameters and emit event 'Added'", async function () {
      await expect(calc.connect(investor2).add(1,2)).to.emit(calc, "Added").withArgs(investor2.address, 3)
    });
  })
  describe('Substraction', function() {
    it("Return the result of the substraction of both parameters and emit event 'Subbed'", async function () {
      await expect(calc.connect(investor2).sub(1,2)).to.emit(calc, "Subbed").withArgs(investor2.address, -1)
    });
  })

  describe('Multiplication', function() {
    it("Return the result of the multiplication of both parameters and emit event 'Muled'", async function () {
      await expect(calc.connect(investor1).mul(4,2)).to.emit(calc, "Muled").withArgs(investor1.address, 8)
    });
  });


  describe('Division', function() {
    it("Return the result of the division of both parameters and emit event 'Divided'", async function () {
      await expect(calc.connect(investor1).div(10,2)).to.emit(calc, "Divided").withArgs(investor1.address, 5)
    });
  });


  describe('Modulo', function() {
    it("Return the rest of the moduled operation of both parameters and emit event 'Moduled'", async function () {
      await expect(calc.connect(investor2).mod(6,4)).to.emit(calc, "Moduled").withArgs(investor2.address, 2)
    });
  });
});
