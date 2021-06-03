const { expect } = require('chai')

describe('benzematoken', function () {
  let BenzemaToken, benzematoken, dev, owner
  let TOTAL_SUPPLY = ethers.utils.parseEther('1000000')
  let ZERO_ADDRESS = ethers.constants.AddressZero
  const NAME = 'BenzemaToken'
  const SYMBOL = 'KB9'
  beforeEach(async function () {
    ;[dev, owner] = await ethers.getSigners()
    BenzemaToken = await ethers.getContractFactory('BenzemaToken')
    benzematoken = await BenzemaToken.connect(dev).deploy(TOTAL_SUPPLY, owner.address)
    await benzematoken.deployed()
  })
  it(`Should have name ${NAME}`, async function () {
    expect(await benzematoken.name()).to.equal(NAME);
  });
  it(`Should have symbol ${SYMBOL}`, async function () {
    expect(await benzematoken.symbol()).to.equal(SYMBOL);
  });

  it('should emit a Transer event', async function () {
    expect(benzematoken.deployTransaction)
      .to.emit(benzematoken, 'Transfer')
      .withArgs(ZERO_ADDRESS, owner.address, TOTAL_SUPPLY)
  })

  it('should transfer the total supply to owner', async function () {
    expect(await benzematoken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY)
  })

  it('should set the owner', async function () {
    expect(await benzematoken.owner()).to.equal(owner.address)
  })
})
