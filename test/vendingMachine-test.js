const { expect } = require('chai');
const { waffle } = require('hardhat');
const { BigNumber } = require('ethers')
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
	it('should return the values passed on the constructor', async () => {
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

		const valueToTransfer = BigNumber.from(web3.utils.toWei('2', 'ether'));
		const valueToTransfer2 = BigNumber.from((web3.utils.toWei('-2', 'ether')));
		await expect(await vendingMachine.connect(wallets[0]).buyTokens(1, { value: valueToTransfer })).to.changeEtherBalances([vendingMachine, wallets[0]], [valueToTransfer, valueToTransfer2])
		expect(await gamaToken.balanceOf(wallets[0].address)).to.be.equal(1);
		expect(await gamaToken.balanceOf(vendingMachine.address)).to.be.equal(99);
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
		expect(await gamaToken.balanceOf(vendingMachine.address)).to.be.equal(100);
		let valueToTransfer = web3.utils.toWei('2', 'ether');
		await vendingMachine.connect(wallets[1]).buyTokens(1, { value: valueToTransfer })
		expect(await gamaToken.balanceOf(wallets[1].address)).to.be.equal(1);

		valueToTransfer = web3.utils.toWei('-1', 'ether');
		const valueToTransfer2 = web3.utils.toWei('1', 'ether');
		await expect(await vendingMachine.connect(wallets[1]).sellTokens(1)).to.changeEtherBalances([vendingMachine, wallets[1]], [valueToTransfer, valueToTransfer2])
		expect(await gamaToken.balanceOf(wallets[1].address)).to.be.equal(0);
		expect(await gamaToken.balanceOf(vendingMachine.address)).to.be.equal(100);
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

	it('should withdraw ethers', async () => {
		expect(await gamaToken.balanceOf(admin.address)).to.be.equal(1000);
		await vendingMachine.loadTokens(100)
		expect(await gamaToken.balanceOf(admin.address)).to.be.equal(900);
		const valueToTransfer = web3.utils.toWei('2', 'ether');
		await vendingMachine.connect(wallets[2]).buyTokens(1, { value: valueToTransfer })
		expect(await gamaToken.balanceOf(wallets[2].address)).to.be.equal(1);
		
		const valueToTransfer2 = web3.utils.toWei('-2', 'ether');
		await expect(await vendingMachine.withdrawEthers()).to.changeEtherBalances([admin, vendingMachine], [valueToTransfer, valueToTransfer2])
		expect(await provider.getBalance(vendingMachine.address)).to.be.equal(0)
	})

})

describe('changeSellPrice', () => {
	//apenas o admin pode utilizar
	//deve retornar erro caso o price seja zero
	//deve retornar erro caso o price seja igual ao price atual
	//deve retornar erro caso o price seja maior que o buyingprice
	//deve alterar o preço

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
		await expect(vendingMachine.connect(wallets[1]).changeSellPrice(5)).to.be.revertedWith("Must be the admin");
	})

	it('should revert if the amount is zero', async () => {
		await expect(vendingMachine.changeSellPrice(0)).to.be.revertedWith('The price can not be 0');
	})

	it('should revert if the amount is equal current price', async () => {
		await expect(vendingMachine.changeSellPrice(web3.utils.toWei('1', 'ether'))).to.be.revertedWith('The price has to be different');
	})

	it('should revert if the amount is greater than the buying price', async () => {
		await expect(vendingMachine.changeSellPrice(web3.utils.toWei('3', 'ether'))).to.be.revertedWith('The selling price can not be greater than the buying price');
	})

	it('should change price', async () => {
		expect(await vendingMachine.sellingPrice()).to.be.equal(web3.utils.toWei('1', 'ether'));
		await vendingMachine.changeSellPrice(web3.utils.toWei('2', 'ether'));
		expect(await vendingMachine.sellingPrice()).to.be.equal(web3.utils.toWei('2', 'ether'));
	})

})

describe('changeBuyPrice', () => {
	//apenas o admin pode utilizar
	//deve retornar erro caso o price seja zero
	//deve retornar erro caso o price seja igual ao price atual
	//deve retornar erro caso o pŕice seja menor que o buyingprice
	//deve alterar o preço
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
		await expect(vendingMachine.connect(wallets[1]).changeBuyPrice(5)).to.be.revertedWith("Must be the admin");
	})

	it('should revert if the amount is zero', async () => {
		await expect(vendingMachine.changeBuyPrice(0)).to.be.revertedWith('The price can not be 0');
	})

	it('should revert if the amount is equal current price', async () => {
		await expect(vendingMachine.changeBuyPrice(web3.utils.toWei('2', 'ether'))).to.be.revertedWith('The price has to be different');
	})

	it('should revert if the amount is less than the selling price', async () => {
		await expect(vendingMachine.changeBuyPrice(web3.utils.toWei('0.5', 'ether'))).to.be.revertedWith('The buying price can not be less than the selling price');
	})

	it('should change price', async () => {
		expect(await vendingMachine.buyingPrice()).to.be.equal(web3.utils.toWei('2', 'ether'));
		await vendingMachine.changeBuyPrice(web3.utils.toWei('3', 'ether'));
		expect(await vendingMachine.buyingPrice()).to.be.equal(web3.utils.toWei('3', 'ether'));
	})

})

describe('loadTokens', () => {
	//apenas o admin pode utilizar
	//deve retornar erro caso o amount seja zero
	//deve transferir o amount da carteira do admin para o contrato
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
		await expect(vendingMachine.connect(wallets[1]).loadTokens(5)).to.be.revertedWith("Must be the admin");
	})

	it('should revert if the amount is zero', async () => {
		await expect(vendingMachine.loadTokens(0)).to.be.revertedWith('Amount has to be greater than 0');
	})

	it('should load tokens', async () => {
		expect(await gamaToken.balanceOf(admin.address)).to.be.equal(1000);
		expect(await gamaToken.balanceOf(vendingMachine.address)).to.be.equal(0);
		await vendingMachine.loadTokens(100)
		expect(await gamaToken.balanceOf(admin.address)).to.be.equal(900);
		expect(await gamaToken.balanceOf(vendingMachine.address)).to.be.equal(100);
	})
})

describe('loadEthers', () => {
	//apenas o admin pode utilizar
	//deve retornar erro caso o value seja zero
	//deve transferir o valor de ethers da carteira do admin para o contrato

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
		await expect(vendingMachine.connect(wallets[1]).loadEthers()).to.be.revertedWith("Must be the admin");
	})

	it('should revert if the value is zero', async () => {
		await expect(vendingMachine.loadEthers({ value: 0 })).to.be.revertedWith('Value has to be greater than 0');
	})

	it('should load Ethers', async () => {
		valueToTransfer = web3.utils.toWei('1000', 'wei');
		await expect(await vendingMachine.loadEthers({ value: valueToTransfer })).to.changeEtherBalances([admin, vendingMachine], [-valueToTransfer, valueToTransfer])
	})
})

describe('kill', () => {
	//apenas o admin pode utilizar
	//transferir o saldo total de tokens e ethers do contrato para o admin
	//checar se o contrato morreu
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
		await expect(vendingMachine.connect(wallets[1]).kill()).to.be.revertedWith("Must be the admin");
	})

	it('should transfer ether and tokens to admin and kill the contract', async () => {
		expect(await gamaToken.balanceOf(admin.address)).to.be.equal(1000);
		expect(await gamaToken.balanceOf(vendingMachine.address)).to.be.equal(0);
		await vendingMachine.loadTokens(100)
		expect(await gamaToken.balanceOf(admin.address)).to.be.equal(900);
		expect(await gamaToken.balanceOf(vendingMachine.address)).to.be.equal(100);

		valueToTransfer = web3.utils.toWei('1000', 'wei');
		await expect(await vendingMachine.loadEthers({ value: valueToTransfer })).to.changeEtherBalances([admin, vendingMachine], [-valueToTransfer, valueToTransfer])

		await expect(await vendingMachine.kill()).to.changeEtherBalances([admin, vendingMachine], [valueToTransfer, -valueToTransfer])
		expect(await gamaToken.balanceOf(admin.address)).to.be.equal(1000);
		expect(await gamaToken.balanceOf(vendingMachine.address)).to.be.equal(0);
		await expect(vendingMachine.buyingPrice()).to.be.revertedWith(0);
	})
})