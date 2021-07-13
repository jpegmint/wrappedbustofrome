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
        this.DateTime = await ethers.getContractFactory("MockDateTime");
        this.Nifty = await ethers.getContractFactory('MockBustOfRome');
        this.wROME = await ethers.getContractFactory('WrappedBustOfRomeOneYear');
    });

    beforeEach(async function () {
        this.datetime = await this.DateTime.deploy();
        await this.datetime.deployed();
        this.nifty = await this.Nifty.deploy(this.datetime.address);
        await this.nifty.deployed();
        this.wRome = await this.wROME.deploy(this.nifty.address);
        await this.wRome.deployed();
    });
    
    describe('wrapping', function () {

        it('reverts if wrapped before approval', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await expect(this.wRome.wrap(tokenId)).to.be.revertedWith('ERC721: transfer caller is not owner nor approved');
        });

        it('reverts if wrapped without MINTER_ROLE', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.addr1.address, tokenId);
            await this.nifty.connect(this.addr1).setApprovalForAll(this.wRome.address, true);

            await expect(this.nifty.connect(this.addr1)['safeTransferFrom(address,address,uint256)'](this.addr1.address, this.wRome.address, tokenId))
                .to.be.revertedWith('wROME: unauthorized to wrap');
            await expect(this.wRome.connect(this.addr1).wrap(tokenId))
                .to.be.revertedWith('wROME: unauthorized to wrap');
        });
        
        it('correctly wraps after setApprovalForAll', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.setApprovalForAll(this.wRome.address, true);

            await expect(await this.wRome.wrap(tokenId))
                .to.emit(this.wRome, 'TokenWrapped')
                .withArgs(this.owner.address, tokenId);
            expect(await this.wRome.totalSupply()).to.equal(1);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.wRome.address);
            expect(await this.wRome.ownerOf(tokenId)).to.equal(this.owner.address);
        });
        
        it('correctly wraps after approve', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.wRome.address, tokenId);

            await expect(await this.wRome.wrap(tokenId))
                .to.emit(this.wRome, 'TokenWrapped')
                .withArgs(this.owner.address, tokenId);
            expect(await this.wRome.totalSupply()).to.equal(1);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.wRome.address);
            expect(await this.wRome.ownerOf(tokenId)).to.equal(this.owner.address);
        });
    });

    describe('tokenIds', function () {
        it('reverts if tokenId less than MIN', async function () {
            var tokenId = 100010000;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.wRome.address, tokenId);

            await expect(this.wRome.wrap(tokenId))
                .to.be.revertedWith('wROME: unrecognized tokenId');
        });
        
        it('reverts if tokenId greater than MAX', async function () {
            var tokenId = 100010672;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.wRome.address, tokenId);

            await expect(this.wRome.wrap(tokenId))
                .to.be.revertedWith('wROME: unrecognized tokenId');
        });
        
        it('correctly wraps if tokenId equal to MIN', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.wRome.address, tokenId);

            await this.wRome.wrap(tokenId);
            expect(await this.wRome.totalSupply()).to.equal(1);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.wRome.address);
            expect(await this.wRome.ownerOf(tokenId)).to.equal(this.owner.address);
        });
        
        it('correctly wraps if tokenId equal to MAX', async function () {
            var tokenId = 100010671;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.wRome.address, tokenId);

            await this.wRome.wrap(tokenId);
            expect(await this.wRome.totalSupply()).to.equal(1);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.wRome.address);
            expect(await this.wRome.ownerOf(tokenId)).to.equal(this.owner.address);
        });
    });

    describe('unwrapping', function () {
        it('correctly unwraps', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.wRome.address, tokenId);

            expect(await this.wRome.totalSupply()).to.equal(1);
            await this.wRome.unwrap(tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.owner.address);
            expect(this.wRome.ownerOf(tokenId)).to.be.reverted;
        });

        it('reverts if non-existent token', async function () {
            var tokenId = 100010001;
            await expect(this.wRome.unwrap(tokenId)).to.be.reverted;
        });

        it('reverts if not owner', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.wRome.address, tokenId);

            await expect(this.wRome.connect(this.addr1).unwrap(tokenId)).to.be.reverted;
        });
    });

    describe('tokenURI', function () {
        it.only('correctly generates tokenURI', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.wRome.address, tokenId);

            this.datetime.mockSetMonth(5);
            expect(await this.wRome.tokenURI(tokenId))
                .to.equal('data:application/json;utf8,{"name": "Eroding and Reforming Bust of Rome (One Year) #1/671","created_by": "Daniel Arsham","description": "**Daniel Arsham** (b. 1980)\\n***Eroding and Reforming Bust of Rome (One Year)***, 2021\\n\\nWith his debut NFT release, Daniel Arsham introduces a concept never before seen on Nifty Gateway. His *Eroding and Reforming Bust of Rome (One Year)* piece will erode, reform, and change based on the time of year.","external_url": "https://niftygateway.com/collections/danielarsham","image": "https://arweave.net/d8mJGLKJhg1Gl2OW1qQjcH8Y8tYBCvNWUuGH6iXd18U","image_url": "https://arweave.net/d8mJGLKJhg1Gl2OW1qQjcH8Y8tYBCvNWUuGH6iXd18U","animation": "ipfs://QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU","animation_url": "ipfs://QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU","attributes":[{"trait_type": "Edition", "display_type": "number", "value": 1, "max_value": 671}]}');
        });
    });

    describe('recover', function () {

        it('can recover if received via transfer', async function () {
            // Mint nifty and confirm owner owns token.
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
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
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.transferFrom(this.owner.address, this.wRome.address, tokenId);
            await expect(this.wRome.connect(this.addr1).recoverOrphanedToken(tokenId)).to.be.reverted;
        });
    });
});
