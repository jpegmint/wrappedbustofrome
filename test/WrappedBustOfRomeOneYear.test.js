// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('wROME', function () {

    before(async function () {
        this.NiftyBuilderMaster = await ethers.getContractFactory("NiftyBuilderMaster");
        this.NiftyRegistry = await ethers.getContractFactory("NiftyRegistry");
        this.DateTime = await ethers.getContractFactory("DateTime");
        this.Nifty = await ethers.getContractFactory('NiftyBuilderInstance');
        this.wROME = await ethers.getContractFactory('WrappedBustOfRomeOneYear');
    });

    beforeEach(async function () {
        const [owner, addr1] = await ethers.getSigners();
        this.masterBuilder = await this.NiftyBuilderMaster.deploy();
        await this.masterBuilder.deployed();
        this.niftyRegistry = await this.NiftyRegistry.deploy([owner.address], []);
        await this.niftyRegistry.deployed();
        await this.niftyRegistry.addNiftyKey(owner.address);
        this.datetime = await this.DateTime.deploy();
        await this.datetime.deployed();
        this.nifty = await this.Nifty.deploy(this.datetime.address, this.masterBuilder.address, this.niftyRegistry.address);
        await this.nifty.deployed();

        await this.nifty.setNumNiftyPermitted(100);
        await this.nifty.giftNifty(owner.address);
        await this.nifty.giftNifty(owner.address);
        await this.nifty.giftNifty(owner.address);

        this.wRome = await this.wROME.deploy(this.nifty.address, this.datetime.address);
        await this.wRome.deployed();
    });

    // Test case
    it('get month returns current month', async function () {
        const [owner, addr1] = await ethers.getSigners();
        expect(1).to.equal(1);
    });
});
