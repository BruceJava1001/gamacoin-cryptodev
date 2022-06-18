const { expect } = require('chai');
const { waffle } = require('hardhat');

describe('Initializing', function () {
	let GamaToken;
	let gamaToken;
	let totalSupply;
	let owner;
	let wallet;
	const supplyDefault = 1000;

	beforeEach(async function () {
		[owner, ...wallet] = await ethers.getSigners();
		GamaToken = await ethers.getContractFactory('GamaToken');
		gamaToken = await GamaToken.deploy(supplyDefault);
		await gamaToken.deployed();
	});

	it('Should return the value passed on the constructor as balance.', async function () {
		expect(await gamaToken.balanceOf(owner.address)).to.equal(supplyDefault);
	});

	it('The initial status should be active', async function () {
		expect(await gamaToken.state()).to.equal(1);
	});

	it('The entity that created the contract must be the owner', async function () {
		expect(await gamaToken.whoIsOwner()).to.equal(owner.address);
	});
});

describe('Transfer', function () {
	let GamaToken;
	let gamaToken;
	let totalSupply;
	let owner;
	let wallet;
	const supplyDefault = 1000;
	const zeroWallet = '0x0000000000000000000000000000000000000000';

	beforeEach(async function () {
		[owner, ...wallet] = await ethers.getSigners();
		GamaToken = await ethers.getContractFactory('GamaToken');
		gamaToken = await GamaToken.deploy(supplyDefault);
		await gamaToken.deployed();
	});

	it('Should only transfer if the status is active', async function () {
		await gamaToken.pausable();

		await expect(gamaToken.transfer(wallet[0].address, 10)).to.be.revertedWith(
			'Contract is Paused'
		);
	});

	it('Should not be able to send to a non-existent wallet', async function () {
		await expect(gamaToken.transfer(zeroWallet, 10)).to.be.revertedWith(
			'Account address can not be 0'
		);
	});

	it('Should not be transferred if the amount is 0', async function () {
		await expect(
			gamaToken.connect(wallet[0]).transfer(wallet[1].address, 0)
		).to.be.revertedWith('Amount has to be greater than 0');
	});

	it('Should not be transferred if there is no balance in the wallet', async function () {
		await expect(
			gamaToken.connect(wallet[0]).transfer(wallet[1].address, 10)
		).to.be.revertedWith('Insufficient Balance to Transfer');
	});


	it('Should transfer if there is a balance in the wallet', async function () {
		const valueToTransfer = 10;
		await gamaToken.transfer(wallet[0].address, valueToTransfer);

		let currentBalance = supplyDefault;

		expect(await gamaToken.balanceOf(wallet[0].address)).to.equal(valueToTransfer);
		currentBalance -= valueToTransfer;
		expect(await gamaToken.balanceOf(owner.address)).to.equal(currentBalance);
	});

});

describe('TransferFrom', function () {
	let GamaToken;
	let gamaToken;
	let totalSupply;
	let owner;
	let wallet;
	const supplyDefault = 1000;
	const zeroWallet = '0x0000000000000000000000000000000000000000';

	beforeEach(async function () {
		[owner, ...wallet] = await ethers.getSigners();
		GamaToken = await ethers.getContractFactory('GamaToken');
		gamaToken = await GamaToken.deploy(supplyDefault);
		await gamaToken.deployed();
	});

	it('Should only transfer if the wallet is allowed', async function () {
		await gamaToken.pausable();

		await expect(gamaToken.connect(wallet[0]).transferFrom(wallet[1].address,wallet[2].address, 10)).to.be.revertedWith(
			'Must be the allowed'
		);
	});
	

	it('Should only transfer if the status is active', async function () {
		await gamaToken.allowAddress(wallet[0].address)
		await gamaToken.pausable();

		await expect(gamaToken.connect(wallet[0]).transferFrom(wallet[1].address,wallet[2].address, 10)).to.be.revertedWith(
			'Contract is Paused'
		);
	});

	it('Should not be able to send to a non-existent wallet', async function () {
		await gamaToken.allowAddress(wallet[0].address)

		const transfer1 = await gamaToken.transfer(wallet[1].address, 10);
		await transfer1.wait();
		
		await expect(gamaToken.connect(wallet[0]).transferFrom(wallet[1].address,zeroWallet, 10)).to.be.revertedWith(
			'Account address can not be 0'
		);
		await expect(gamaToken.connect(wallet[0]).transferFrom(zeroWallet,wallet[1].address, 10)).to.be.revertedWith(
			'Account address can not be 0'
		);
	});

	it('Should not be transferred if the amount is 0', async function () {
		await gamaToken.allowAddress(wallet[0].address)
		await expect(
			gamaToken.connect(wallet[0]).transferFrom(wallet[1].address,wallet[2].address, 0)
		).to.be.revertedWith('Amount has to be greater than 0');
	});

	it('Should not be transferred if there is no balance in the wallet', async function () {
		await gamaToken.allowAddress(wallet[0].address)
		await expect(
			gamaToken.connect(wallet[0]).connect(wallet[0]).transferFrom(wallet[1].address,wallet[1].address, 10)
		).to.be.revertedWith('Insufficient Balance to Transfer');
	});

	

	it('Should transfer if there is a balance in the wallet', async function () {
		await gamaToken.allowAddress(wallet[0].address)
		let initialBalance = 50;
		await gamaToken.transfer(wallet[1].address, initialBalance)
		expect(await gamaToken.balanceOf(wallet[1].address)).to.equal(initialBalance);

		const valueToTransfer = 10;
		await gamaToken.connect(wallet[0]).transferFrom(wallet[1].address,wallet[2].address, valueToTransfer);


		expect(await gamaToken.balanceOf(wallet[1].address)).to.equal(initialBalance - valueToTransfer);
		expect(await gamaToken.balanceOf(wallet[2].address)).to.equal(valueToTransfer);
	});

});

describe('Mint', function () {
	let GamaToken;
	let gamaToken;
	let totalsupply;
	let owner;
	let wallet;
	const supplyDefault = 1000;
	const zeroWallet = '0x0000000000000000000000000000000000000000';

	beforeEach(async function () {
		[owner, ...wallet] = await ethers.getSigners();
		GamaToken = await ethers.getContractFactory('GamaToken');
		gamaToken = await GamaToken.deploy(supplyDefault);
		await gamaToken.deployed();
	});

	it('Should only minted if the status is active', async function () {
		await gamaToken.pausable();

		await expect(gamaToken.mint(wallet[0].address, 10)).to.be.revertedWith(
			'Contract is Paused'
		);
	});

	it('The minted value must be greater than 0', async function () {
		await expect(gamaToken.mint(wallet[1].address, 0)).to.be.revertedWith(
			'Amount has to be greater than 0'
		);
	});

	it('Only the owner can mint tokens', async function () {
		await expect(gamaToken.connect(wallet[0]).mint(wallet[1].address, 10)).to.be.revertedWith(
			'Must be the owner'
		);
	});

	it('Should not be able to send to a non-existent wallet', async function () {
		await expect(gamaToken.mint(zeroWallet, 10)).to.be.revertedWith(
			'Account address can not be 0'
		);
	});

	it('Should increase totalSupply and wallets balance after mint', async function () {
		totalsupply = supplyDefault;
		const valueToMint = 10;
		await gamaToken.mint(wallet[0].address, valueToMint);

		expect(await gamaToken.balanceOf(wallet[0].address)).to.equal(valueToMint);
		totalsupply += valueToMint;
		expect(await gamaToken.balanceOf(owner.address)).to.equal(totalsupply - valueToMint);
		expect(await gamaToken.totalSupply()).to.equal(totalsupply);
	});

});

describe('Burn', function () {
	let GamaToken;
	let gamaToken;
	let totalsupply;
	let owner;
	let wallet;
	const supplyDefault = 1000;
	const zeroWallet = '0x0000000000000000000000000000000000000000';

	beforeEach(async function () {
		[owner, ...wallet] = await ethers.getSigners();
		GamaToken = await ethers.getContractFactory('GamaToken');
		gamaToken = await GamaToken.deploy(supplyDefault);
		await gamaToken.deployed();
	});

	it('Should only burn if the status is active', async function () {
		await gamaToken.pausable();

		await expect(gamaToken.burn(wallet[0].address, 10)).to.be.revertedWith(
			'Contract is Paused'
		);
	});

	it('the wallet must have funds to burn', async function () {
		await expect(gamaToken.burn(wallet[1].address, 10)).to.be.revertedWith(
			'Account does not have enough funds'
		);
	});

	it('Only the owner can burn tokens', async function () {
		await expect(gamaToken.connect(wallet[0]).burn(wallet[1].address, 10)).to.be.revertedWith(
			'Must be the owner'
		);
	});

	it('Should not be able to send to a non-existent wallet', async function () {
		await expect(gamaToken.burn(zeroWallet, 10)).to.be.revertedWith(
			'Account address can not be 0'
		);
	});

	it('Should decrease totalSupply and wallets balance after burn', async function () {
		const valueToMint = 20;
		const valueToBurn = 10;
		const oldSupply = supplyDefault;
		let totalsupply = supplyDefault;

		await gamaToken.mint(wallet[0].address, valueToMint);
		totalsupply += valueToMint;

		await gamaToken.burn(wallet[0].address, valueToBurn);

		totalsupply -= valueToBurn;

		expect(await gamaToken.balanceOf(wallet[0].address)).to.equal(10);
		expect(await gamaToken.balanceOf(owner.address)).to.equal(oldSupply);
		expect(await gamaToken.totalSupply()).to.equal(totalsupply);
	});

});

describe('Pausable', function () {
	let GamaToken;
	let gamaToken;
	let totalsupply;
	let owner;
	let wallet;
	const supplyDefault = 1000;
	const zeroWallet = '0x0000000000000000000000000000000000000000';

	beforeEach(async function () {
		[owner, ...wallet] = await ethers.getSigners();
		GamaToken = await ethers.getContractFactory('GamaToken');
		gamaToken = await GamaToken.deploy(supplyDefault);
		await gamaToken.deployed();
	});


	it('Should not pause the contract if it is already paused', async function () {
		const pausable = await gamaToken.pausable();
		await pausable.wait();

		await expect(gamaToken.pausable()).to.be.revertedWith('Contract is already Paused');
	});

	it('Should not be able to pause the contract if it is not the owner', async function () {
		await expect(gamaToken.connect(wallet[0]).pausable()).to.be.revertedWith(
			'Must be the owner'
		);
	});

	it('The owner should be able to pause the contract', async function () {
		await gamaToken.pausable();

		expect(await gamaToken.state()).to.be.equal(0);
	});



});

describe('Activate', function () {
	let GamaToken;
	let gamaToken;
	let totalsupply;
	let owner;
	let wallet;
	const supplyDefault = 1000;
	const zeroWallet = '0x0000000000000000000000000000000000000000';

	beforeEach(async function () {
		[owner, ...wallet] = await ethers.getSigners();
		GamaToken = await ethers.getContractFactory('GamaToken');
		gamaToken = await GamaToken.deploy(supplyDefault);
		await gamaToken.deployed();
	});

	it('Should not pause the contract if it is already actived', async function () {

		await expect(gamaToken.activate()).to.be.revertedWith("Contract is already Active");
	});

	it('Should not be able to activate the contract if it is not the owner', async function () {
		await expect(gamaToken.connect(wallet[0]).activate()).to.be.revertedWith(
			'Must be the owner'
		);
	});

	it('The owner should be able to activate the contract', async function () {
		await gamaToken.pausable();
		expect(await gamaToken.state()).to.be.equal(0);

		await gamaToken.activate()
		expect(await gamaToken.state()).to.be.equal(1);
	});

});


describe('Kill', function () {
	let GamaToken;
	let gamaToken;
	let totalsupply;
	let owner;
	let wallet;
	const supplyDefault = 1000;
	const zeroWallet = '0x0000000000000000000000000000000000000000';

	beforeEach(async function () {
		[owner, ...wallet] = await ethers.getSigners();
		GamaToken = await ethers.getContractFactory('GamaToken');
		gamaToken = await GamaToken.deploy(supplyDefault);
		await gamaToken.deployed();
	});

	it("Should not be able to kill if the contract is Active", async function () {
		await expect(gamaToken.kill()).to.be.revertedWith(
			'Contract needs to be Paused'
		);
	})

	it("Contract should be dead after kill", async function () {
		await gamaToken.pausable();
		expect(await gamaToken.state()).to.be.equal(0);
		await gamaToken.kill();
		await expect(gamaToken.balanceOf(owner.address)).to.be.revertedWith(0);
		await expect(gamaToken.totalSupply()).to.be.revertedWith(0);
	})
});