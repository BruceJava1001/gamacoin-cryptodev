const { expect } = require('chai');
const { waffle } = require('hardhat');
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
	const provider = waffle.provider;
	beforeEach(async function () {
		[admin, ...wallets] = await ethers.getSigners();
		GamaToken = await ethers.getContractFactory('GamaToken');
		gamaToken = await GamaToken.deploy(1000);
		gamaToken.deployed();
		VendingMachine = await ethers.getContractFactory('VendingMachine');
		vendingMachine = await VendingMachine.deploy(gamaToken.address);
		vendingMachine.deployed();
		await gamaToken.allowAddress(vendingMachine.address)
	})
	it('should revert if the amount is zero', async () => {
		await expect(vendingMachine.buyTokens(0)).to.be.revertedWith('Amount has to be greater than 0');
	})
	it('should revert if the transaction value is lower than the expected', async () => {
		await expect(vendingMachine.buyTokens(1, { value: web3.utils.toWei('1', 'ether') })).to.be.revertedWith('The trasaction value was lower than expected');
	})
	it('should revert if the availabeSupply is less than the amount', async () => {
		await expect(vendingMachine.buyTokens(1, { value: web3.utils.toWei('2', 'ether') })).to.be.revertedWith('Not enough tokens in stock');
	})
	it('should be able to buy tokens', async () => {
		expect(await gamaToken.balanceOf(admin.address)).to.be.equal(1000);
		await vendingMachine.loadTokens(100)
		expect(await gamaToken.balanceOf(admin.address)).to.be.equal(900);
		expect(await provider.getBalance(wallets[0].address)).to.be.equal(web3.utils.toWei('10000', 'ether').toString())
		const walletBalanceBefore = await provider.getBalance(wallets[0].address);
		const valueToTransfer = web3.utils.toWei('2', 'ether');
		await vendingMachine.connect(wallets[0]).buyTokens(1, { value: valueToTransfer })
		expect(await gamaToken.balanceOf(wallets[0].address)).to.be.equal(1);
		const walletBalanceAfter = await provider.getBalance(wallets[0].address);
		const etherBalance = (Number(walletBalanceBefore) - Number(walletBalanceAfter))
		const gas = etherBalance - Number(valueToTransfer)
		expect(etherBalance - gas).to.be.equal(Number(valueToTransfer))
	})
})

	describe('SellTokens', () => {

	//deve retornar erro caso o amount seja  zero
	//deve retornar erro caso o balanço seja menor do que o esperado
	//deve transferir os token e aumenta o saldo de ethers

	let admin
	let wallets
	let GamaToken
	let gamaToken
	let VendingMachine
	let vendingMachine
	const provider = waffle.provider;
	beforeEach(async function () {
		[admin, ...wallets] = await ethers.getSigners();
		GamaToken = await ethers.getContractFactory('GamaToken');
		gamaToken = await GamaToken.deploy(1000);
		gamaToken.deployed();
		VendingMachine = await ethers.getContractFactory('VendingMachine');
		vendingMachine = await VendingMachine.deploy(gamaToken.address);
		vendingMachine.deployed();
		await gamaToken.allowAddress(vendingMachine.address)
	})
	it('should revert if the amount is zero', async () => {
		await expect(vendingMachine.sellTokens(0)).to.be.revertedWith('Amount has to be greater than 0');
	})
	it('should revert if the transaction value is lower than the expected', async () => {
		await expect(vendingMachine.sellTokens(1)).to.be.revertedWith('The machine does not have enough Ether');
	})

	it('should be able to sell tokens', async () => {
		expect(await gamaToken.balanceOf(admin.address)).to.be.equal(1000);
		await vendingMachine.loadTokens(100)
		expect(await gamaToken.balanceOf(admin.address)).to.be.equal(900);
		expect(await provider.getBalance(wallets[1].address)).to.be.equal(web3.utils.toWei('10000', 'ether').toString())
		let valueToTransfer = web3.utils.toWei('2', 'ether');
		await vendingMachine.connect(wallets[1]).buyTokens(1, { value: valueToTransfer })
		expect(await gamaToken.balanceOf(wallets[1].address)).to.be.equal(1);

		let walletBalanceBefore = await provider.getBalance(wallets[1].address);
		valueToTransfer = web3.utils.toWei('1', 'ether');
		await vendingMachine.connect(wallets[1]).sellTokens(1)
		expect(await gamaToken.balanceOf(wallets[1].address)).to.be.equal(0);
		let walletBalanceAfter = await provider.getBalance(wallets[1].address);
		let etherBalance = (Number(walletBalanceAfter) - Number(walletBalanceBefore))
		let gas = Number(valueToTransfer) - etherBalance
		expect(etherBalance + gas).to.be.equal(Number(valueToTransfer))
	})

})

	describe('withdrawEthers', () => {

	//apenas o admin pode utilizar
	//deve retornar erro caso o balanço de ethers seja zero
	//deve transferir os ethers e aumenta o saldo de ethers

	let admin
	let wallets
	let GamaToken
	let gamaToken
	let VendingMachine
	let vendingMachine
	const provider = waffle.provider;
	beforeEach(async function () {
		[admin, ...wallets] = await ethers.getSigners();
		GamaToken = await ethers.getContractFactory('GamaToken');
		gamaToken = await GamaToken.deploy(1000);
		gamaToken.deployed();
		VendingMachine = await ethers.getContractFactory('VendingMachine');
		vendingMachine = await VendingMachine.deploy(gamaToken.address);
		vendingMachine.deployed();
		await gamaToken.allowAddress(vendingMachine.address)
	})

	it('should revert if not admin', async () => {
		await expect(vendingMachine.connect(wallets[1]).withdrawEthers()).to.be.revertedWith("Must be the admin");
	})

	it('should revert if the machine current balance is 0', async () => {
		await expect(vendingMachine.withdrawEthers()).to.be.revertedWith("The machine current balance is 0");
	})
	/*  it('should revert if the transaction value is lower than the expected', async() => {
		 await expect(vendingMachine.sellTokens(1)).to.be.revertedWith('The machine does not have enough Ether');
	 }) */


})





//apenas o admin pode utilizar
//deve retornar erro caso o price seja zero
//deve retornar erro caso o price seja igual ao price atual
//deve retornar erro caso o pŕice seja maior que o buyingprice
//deve alterar o preço
//
//apenas o admin pode utilizar
//deve retornar erro caso o price seja zero
//deve retornar erro caso o price seja igual ao price atual
//deve retornar erro caso o pŕice seja menor que o buyingprice
//deve alterar o preço
//
//apenas o admin pode utilizar
//deve retornar erro caso o amount seja zero
//deve transferir o amount da carteira do admin para o contrato
//
//apenas o admin pode utilizar
//deve retornar erro caso o value seja zero
//deve transferir o valor de ethers da carteira do admin para o contrato
//
//apenas o admin pode utilizar
//transferir o saldo total de tokens e ethers do contrato para o admin
//checar se o contrato morreu