// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @todo test tokenURI for accuracy.
 * @todo test arweave assets match main assets.
 * @todo test wrap function.
 * @test test wrap function MINTER_ROLE.
 * @todo test unwrap function
 * @todo test unwrap function from various.
 * @todo test wrap via safeTransferFrom.
 */
describe('wROME', function () {

    before(async function () {
        [this.owner, this.addr1] = await ethers.getSigners();
        this.NiftyBuilderMaster = await ethers.getContractFactory("NiftyBuilderMaster");
        this.NiftyRegistry = await ethers.getContractFactory("NiftyRegistry");
        this.DateTime = await ethers.getContractFactory("DateTime");
        this.Nifty = await ethers.getContractFactory('NiftyBuilderInstance');
        this.wROME = await ethers.getContractFactory('WrappedBustOfRomeOneYear');
    });

    beforeEach(async function () {
        this.masterBuilder = await this.NiftyBuilderMaster.deploy();
        await this.masterBuilder.deployed();
        this.niftyRegistry = await this.NiftyRegistry.deploy([this.owner.address], []);
        await this.niftyRegistry.deployed();
        await this.niftyRegistry.addNiftyKey(this.owner.address);
        this.datetime = await this.DateTime.deploy();
        await this.datetime.deployed();
        this.nifty = await this.Nifty.deploy(this.datetime.address, this.masterBuilder.address, this.niftyRegistry.address);
        await this.nifty.deployed();
        await this.nifty.setNumNiftyPermitted(100);

        this.wRome = await this.wROME.deploy(this.nifty.address, this.datetime.address);
        await this.wRome.deployed();
    });
    
    it('cannot wrap before approval', async function () {
        await this.nifty.giftNifty(this.owner.address);
        var tokenId = await this.nifty.tokenOfOwnerByIndex(this.owner.address, 0);
        await expect(this.wRome.wrap(tokenId)).to.be.revertedWith('ERC721: transfer caller is not owner nor approved');
    });

    it('can recover if received via transferFrom', async function () {
        // Mint nifty and confirm owner owns token.
        await this.nifty.giftNifty(this.owner.address);
        var tokenId = await this.nifty.tokenOfOwnerByIndex(this.owner.address, 0);
        expect(await this.nifty.ownerOf(tokenId)).to.equal(this.owner.address);

        // Transfer to wRome and confirm it is owned by wRome.
        await this.nifty.transferFrom(this.owner.address, this.wRome.address, tokenId);
        expect(await this.nifty.ownerOf(tokenId)).to.equal(this.wRome.address);

        // Check that no wrapped token was minted.
        expect(await this.wRome.totalSupply()).to.equal(0);
        await expect(this.wRome.ownerOf(tokenId)).to.be.revertedWith('ERC721: owner query for nonexistent token');

        // Recover the token
        await this.wRome.recoverOrphanedToken(tokenId);
        expect(await this.nifty.ownerOf(tokenId)).to.equal(this.owner.address);
    });

    it('only admin can recover orphaned tokens', async function () {
        await this.nifty.giftNifty(this.owner.address);
        var tokenId = await this.nifty.tokenOfOwnerByIndex(this.owner.address, 0);
        await this.nifty.transferFrom(this.owner.address, this.wRome.address, tokenId);
        await expect(this.wRome.connect(this.addr1).recoverOrphanedToken(tokenId)).to.be.reverted;
    });
});
