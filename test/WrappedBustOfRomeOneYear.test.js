// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @todo test tokenURI for accuracy.
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

        this.wRome = await this.wROME.deploy(this.nifty.address);
        await this.wRome.deployed();
    });
    
    describe('wrapping', function () {

        it('reverts if wrapped before approval', async function () {
            await this.nifty.giftNifty(this.owner.address);
            var tokenId = await this.nifty.tokenOfOwnerByIndex(this.owner.address, 0);
            await expect(this.wRome.wrap(tokenId)).to.be.revertedWith('ERC721: transfer caller is not owner nor approved');
        });

        it('reverts if wrapped without MINTER_ROLE', async function () {
            await this.nifty.giftNifty(this.addr1.address);
            var tokenId = await this.nifty.tokenOfOwnerByIndex(this.addr1.address, 0);
            await this.nifty.connect(this.addr1).setApprovalForAll(this.wRome.address, true);
            await expect(this.wRome.connect(this.addr1).wrap(tokenId))
                .to.be.revertedWith('AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6');
        });
        
        it('correctly wraps after setApprovalForAll', async function () {
            await this.nifty.giftNifty(this.owner.address);
            var tokenId = await this.nifty.tokenOfOwnerByIndex(this.owner.address, 0);
            await this.nifty.setApprovalForAll(this.wRome.address, true);

            await expect(await this.wRome.wrap(tokenId))
                .to.emit(this.wRome, 'TokenWrapped')
                .withArgs(this.owner.address, tokenId);
            expect(await this.wRome.totalSupply()).to.equal(1);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.wRome.address);
            expect(await this.wRome.ownerOf(tokenId)).to.equal(this.owner.address);
        });
        
        it('correctly wraps after approve', async function () {
            await this.nifty.giftNifty(this.owner.address);
            var tokenId = await this.nifty.tokenOfOwnerByIndex(this.owner.address, 0);
            await this.nifty.approve(this.wRome.address, tokenId);

            await expect(await this.wRome.wrap(tokenId))
                .to.emit(this.wRome, 'TokenWrapped')
                .withArgs(this.owner.address, tokenId);
            expect(await this.wRome.totalSupply()).to.equal(1);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.wRome.address);
            expect(await this.wRome.ownerOf(tokenId)).to.equal(this.owner.address);
        });
    });

    describe('unwrapping', function () {
        it('correctly unwraps', async function () {
            await this.nifty.giftNifty(this.owner.address);
            var tokenId = await this.nifty.tokenOfOwnerByIndex(this.owner.address, 0);
            await this.nifty.setApprovalForAll(this.wRome.address, true);
            await this.wRome.wrap(tokenId);
            expect(await this.wRome.totalSupply()).to.equal(1);
            await this.wRome.unwrap(tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.owner.address);
            expect(this.wRome.ownerOf(tokenId)).to.be.reverted;
        });
    });

    describe('tokenURI', function () {
        it('correctly generates tokenURI', async function () {
            await this.nifty.giftNifty(this.owner.address);
            var tokenId = await this.nifty.tokenOfOwnerByIndex(this.owner.address, 0);
            await this.nifty.setApprovalForAll(this.wRome.address, true);
            await this.wRome.wrap(tokenId)

            expect(await this.wRome.tokenURI(tokenId)).to.equal('data:application/json;utf8,{"name": "Eroding and Reforming Bust of Rome (One Year)","description": "With his debut NFT release, Daniel Arsham introduces a concept never before seen on Nifty Gateway. His *Eroding and Reforming Bust of Rome (One Year)* piece will erode, reform, and change based on the time of year.","external_url": "https://niftygateway.com/collections/danielarsham","image": "ipfs://QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU","animation_url": "ipfs://QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU"}');
        });
    });

    describe('recover', function () {

        it('can recover if received via transfer', async function () {
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
});
