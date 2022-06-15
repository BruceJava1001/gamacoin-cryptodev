const { expect } = require('chai');

require("@nomiclabs/hardhat-web3");
describe('Initializing', () => {
    //checar se carregou os valores corretos
    //espera que retorne to total supply
    //espera que retorne o buyingPrice
    //espera que retorne o sellingPrice
    let admin
    let wallets
    let GamaToken
    let gamaToken
    let VendingMachine
    let vendingMachine
    beforeEach(async function () {
        const [admin, wallets] = await ethers.getSigners();
        GamaToken = await ethers.getContractFactory('GamaToken');
        gamaToken = await GamaToken.deploy(1000);
        gamaToken.deployed();
        VendingMachine = await ethers.getContractFactory('VendingMachine');
        vendingMachine = await VendingMachine.deploy(gamaToken.address);
        vendingMachine.deployed();
    })
    it('should return the values passed on constructor', async () => {
        expect(await vendingMachine.buyingPrice()).to.be.equal(web3.utils.toWei('2', 'ether'));
        expect(await vendingMachine.sellingPrice()).to.be.equal(web3.utils.toWei('1', 'ether'));
        expect(await vendingMachine.availableSupply()).to.be.equal(0);
    })
})
describe('BuyTokens', () => {
    //deve retornar erro caso o amount seja zero
    //deve retornar erro caso o valor seja menor do que o esperado
    //deve retornar erro caso o supply seja menor que o amount
    //deve transferir os token e diminui o saldo de ethers
    let admin
    let wallets
    let GamaToken
    let gamaToken
    let VendingMachine
    let vendingMachine
    beforeEach(async function () {
        const [admin, wallets] = await ethers.getSigners();
        GamaToken = await ethers.getContractFactory('GamaToken');
        gamaToken = await GamaToken.deploy(1000);
        gamaToken.deployed();
        VendingMachine = await ethers.getContractFactory('VendingMachine');
        vendingMachine = await VendingMachine.deploy(gamaToken.address);
        vendingMachine.deployed();
        await gamaToken.allowAddress(vendingMachine.address)
    })
    it('should revert if the amount is zero', async () => {
        // console.log(await vendingMachine.buyTokens(0))
        expect(await vendingMachine.buyTokens(0)).to.be.revertedWith('Amount has to be greater than 0');
    })
})
//deve retornar erro caso o amount seja menor que zero
//deve retornar erro caso o balanço seja menor do que o esperado
//deve transferir os token e aumenta o saldo de ethers
//apenas o admin pode utilizar
//deve retornar erro caso o balanço de ethers seja zero
//deve transferir os ethers e aumenta o saldo de ethers
//apenas o admin pode utilizar
//deve retornar erro caso o price seja zero
//deve retornar erro caso o price seja igual ao price atual
//deve retornar erro caso o pŕice seja maior que o buyingprice
//deve alterar o preço
//apenas o admin pode utilizar
//deve retornar erro caso o price seja zero
//deve retornar erro caso o price seja igual ao price atual
//deve retornar erro caso o pŕice seja menor que o buyingprice
//deve alterar o preço
//apenas o admin pode utilizar
//deve retornar erro caso o amount seja zero
//deve transferir o amount da carteira do admin para o contrato
//apenas o admin pode utilizar
//deve retornar erro caso o value seja zero
//deve transferir o valor de ethers da carteira do admin para o contrato
//apenas o admin pode utilizar
//transferir o saldo total de tokens e ethers do contrato para o admin
//checar se o contrato morreu












