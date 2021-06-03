# Test Unitaire. 
Dans ce dossier vous trouverez deux fichier de test unitaire: 
- Les test du token ERC20
- Les test du contract de l'ICO. 

## KB9 test : 

On test, ici, différente fonction du Token ERC-20 que nous avons crée à partir de la librairie OpenZeppelin. 

Tout d'abord, on verrifie si le Nom et le Symbole sont correct. 

```js 
 it(`Should have name ${NAME}`, async function () {
    expect(await benzematoken.name()).to.equal(NAME);
  });
  it(`Should have symbol ${SYMBOL}`, async function () {
    expect(await benzematoken.symbol()).to.equal(SYMBOL);
  });
  ```

  Ensuite on verifie que l' adresse owner correspond bien à celui du contract. De meme avec la balance et le totalSupply.  

  ```js 
  it('should transfer the total supply to owner', async function () {
    expect(await benzematoken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY)
  })

  it('should set the owner', async function () {
    expect(await benzematoken.owner()).to.equal(owner.address)
  })
  ```

  On test aussi les emites, afin de verifier qu'on recupere les bonne data. 

  ```js 
   it('should emit a Transer event', async function () {
    expect(benzematoken.deployTransaction)
      .to.emit(benzematoken, 'Transfer')
      .withArgs( owner.address, TOTAL_SUPPLY)
  })
  ```

  ## KB9_ICO_TEST : 
 ICI, nous testons les differentes fonction de l'ICO. 

 Les tests, sont décomposés en 5 grandes parties: 

 #### Deployement : 

 Dans "deployement", on test les differentes fonctions lors du déploiement du smart contract de l'ico. On verifie:  

  - l'addresse du contract du token, 

    ```js 
        it('should display the address of the token contract', async function () {
        expect(await kb9ico.tokenContract()).to.equal(benzematoken.address)
        })
    ```
  - Si le nombre de token en vente est bien égale au TOTAL_SUPPLY. 

    ```js 
        it('should set the supply for the sale', async function () {
        expect(await kb9ico.supplyInSale()).to.equal(TOTAL_SUPPLY)
        })
    ```
  - Si le compteur de temps fonctionne (Si oui, alors le test affiche pending)

    ```js 
    it("Should has start counting time until the end of the ico"), async function(){
        await ethers.provider.send('evm_increaseTime', [10]);
        await ethers.provider.send('evm_mine');
        expect (await kb9ico.secondRemaining()).to.equal(1209590)
        }
    ```

  - Si le taux de conversion est bien définie. 

    ```js 
    it(`Should have tokenPrice ${RATE_PRICE}`, async function () {
        expect(await kb9ico.ratePrice()).to.equal(RATE_PRICE);
        });
    ```
#### startICO : 

Dans "startICO", on test les differentes fonctions lors du lancement de l'ico. On verifie:

- Seul l'owner peut lancer le début de l'ico, 
```js
it('Should revert if not owner of tokens', async function () {
      await expect(kb9ico.connect(investor1).startICO()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
```
- L'ICO est bien lancée, 
```js 
 it(`Should open contract`, async function () {
      await kb9ico.connect(owner).startICO();
      expect(await kb9ico.isContractClosed()).to.equal(false);
    });
```

#### buyToken et receive : 

Les function buyToken et receive exécute les mêmes parametres. La difference qu'avec receive l'utilisateur envoyer ses ether directement à l'adresse du smart-contract de l'ico.
Ces fonctions permettent à un utilistauer d'acquerire notre token. 
Ici, nous effectuons differents tests. Avant chacun de ces tests, nous simullons deux investissement afin d'etre sur que nos fonction s'exécutent correctement. 

```js
    beforeEach(async function () {
      await benzematoken.connect(owner).approve(kb9ico.address, TOTAL_SUPPLY)
      await kb9ico.connect(investor1).buyToken({ value: 100 });
      await kb9ico.connect(investor2).buyToken({ value: 100 });
    })
```

Ensuite nous testons que; la balance du nombre de token disponible se décremente, la balance du marketCap s'incrémente, et la balance de l'investisseur s'actualise. 
```js
   it('should decrease the supply in sale', async function () {
      expect(await kb9ico.supplyInSale()).to.equal(TOTAL_SUPPLY.sub(200 * RATE_PRICE));
    })

    it('should increase the MarketCap', async function () {
      expect(await kb9ico.MarketCap()).to.equal(200);
    })
    it('should update the token balance of buyer', async function () {
      expect(await kb9ico.tokenBalanceOf(investor1.address)).to.equal(100 * RATE_PRICE)
    })
```

#### Withdraw : 

L'owner peut retirer les ethers reçut sur sa balance, uniquement si l'ICO est terminée. 
Dans ce cas, on commence par tester, la réponse, en cas d'appel de la function, alors que l'ico n'est pas fini.
```js 
  it('Should revert if ico not closed', async function () {
      await expect(kb9ico.connect(owner).withdraw()).to.be.revertedWith('KB9ICO : ico is not closed');
    });
```

Ensuite on verifie que la blance n'est pas vide. 

```js
   it('Should revert if ICO is empty', async function () {
       // one week = 604800 second, on récupere le time actuellement et on lui ajoute 2 semaine en seconde 
      await ethers.provider.send('evm_increaseTime', [1210000]) 
      await ethers.provider.send('evm_mine') // on mets a jour le nouveau time incrémenté des deux semaines. 
      await expect(kb9ico.connect(owner).withdraw()).to.be.revertedWith('KB9ICO : you can not withdraw empty balance');
    });
```
Puis on test, que la fonction reverte bien, si quelqu'un dautre que l'owner appel cette function. 

```js
  it('should revert if the caller is not the owner (Ownable)', async function () {
      await ethers.provider.send('evm_increaseTime', [1210000]) // one week = 604800 second
      await ethers.provider.send('evm_mine')
      await expect(kb9ico.connect(investor2).withdraw()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
```
Enfin, on verifie que la balance du contract se met bien à zero apres le transfert des fond vers l'owner.

```js
it('should set the ico balance at zero', async function () {
      expect(await kb9ico.icocontractBalance()).to.equal(0)
    })
```


 
