// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 */
describe('ERC721Wrapper', function () {

    before(async function () {
        [this.owner, this.addr1] = await ethers.getSigners();
        this.ERC721 = await ethers.getContractFactory('MockERC721');
        this.WRAPPER = await ethers.getContractFactory('MockERC721Wrapper');
    });

    beforeEach(async function () {
        this.nifty = await this.ERC721.deploy();
        await this.nifty.deployed();
        this.contract = await this.WRAPPER.deploy();
        await this.contract.deployed();

        this.contract.updateApprovedTokenRanges(this.nifty.address, 100010001, 100010671);
    });
    
    describe('wrapping', function () {

        it('reverts if wrapped before approval', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await expect(this.contract.wrap(this.nifty.address, tokenId)).to.be.revertedWith('ERC721Wrapper: Contract must be given approval to wrap NFT.');
        });

        it('reverts if wrapped without approving tokenId', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.addr1.address, tokenId);
            await this.nifty.connect(this.addr1).approve(this.contract.address, tokenId);
            this.contract.updateApprovedTokenRanges(this.nifty.address, 100010671, 100010671);

            await expect(this.nifty.connect(this.addr1)['safeTransferFrom(address,address,uint256)'](this.addr1.address, this.contract.address, tokenId))
                .to.be.revertedWith('ERC721Wrapper: TokenId not within approved range.');
            await expect(this.contract.connect(this.addr1).wrap(this.nifty.address, tokenId))
                .to.be.revertedWith('ERC721Wrapper: TokenId not within approved range.');
        });
        
        it('reverts if wrapped after setApprovalForAll', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.setApprovalForAll(this.contract.address, true);

            await expect(this.contract.wrap(this.nifty.address, tokenId)).to.be.revertedWith('ERC721Wrapper: Contract must be given approval to wrap NFT.');
        });
        
        it('correctly wraps after approve', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await expect(await this.contract.wrap(this.nifty.address, tokenId))
                .to.emit(this.contract, 'Wrapped')
                .withArgs(this.owner.address, tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.contract.address);
            expect(await this.contract.ownerOf(tokenId)).to.equal(this.owner.address);
        });

        it('reverts if wrapping a fake token', async function () {
            var fake = await this.ERC721.deploy();
            await fake.deployed();
            var tokenId = 100010001;
            await fake.mint(this.owner.address, tokenId);
            await fake.approve(this.contract.address, tokenId);
            await this.nifty.mint(this.addr1.address, tokenId);
            await this.nifty.connect(this.addr1).approve(this.contract.address, tokenId);
            
            await expect(fake['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId))
                .to.be.revertedWith('ERC721Wrapper: TokenId not within approved range.');
            await expect(this.contract.wrap(fake.address, tokenId))
                .to.be.revertedWith('ERC721Wrapper: TokenId not within approved range.');
            await expect(this.contract.wrap(this.nifty.address, tokenId))
                .to.be.revertedWith('ERC721Wrapper: Caller must own NFT.');
        });

        it('reverts if tokenId not in approved range', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await this.contract.updateApprovedTokenRanges(this.nifty.address, 100010010, 100010011)
            await expect(this.contract.wrap(this.nifty.address, tokenId))
                .to.be.revertedWith('ERC721Wrapper: TokenId not within approved range.');
        });
    });

    describe('token ranges', function () {
        it('reverts if min tokenId is larger than max', async function () {
            await expect(this.contract.updateApprovedTokenRanges(this.nifty.address, 100010671, 100010001))
                .to.be.revertedWith('ERC721Wrapper: Min tokenId must be less-than/equal to max.');
        });

        it('reverts if uninitialized contract/token range', async function () {
            var tokenId = 0;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);
            expect(await this.contract.isWrappable(this.nifty.address, tokenId)).to.be.false;
            expect(await this.contract.isWrappable(this.contract.address, tokenId)).to.be.false;
            expect(await this.contract.isWrappable(this.addr1.address, tokenId)).to.be.false;
            await expect(this.contract.wrap(this.nifty.address, tokenId))
                .to.be.revertedWith('ERC721Wrapper: TokenId not within approved range.');
        });

        it('correctly updates approved token range if equal', async function () {
            var tokenId = 100010010;
            await this.contract.updateApprovedTokenRanges(this.nifty.address, tokenId, tokenId);
            expect(await this.contract.isWrappable(this.nifty.address, tokenId)).to.be.true;
            expect(await this.contract.isWrappable(this.nifty.address, tokenId - 1)).to.be.false;
            expect(await this.contract.isWrappable(this.nifty.address, tokenId + 1)).to.be.false;
        });

        it('correctly updates the approved token ranges', async function () {
            var tokenId = 100010020;
            await this.contract.updateApprovedTokenRanges(this.nifty.address, tokenId, tokenId + 1);
            expect(await this.contract.isWrappable(this.nifty.address, tokenId)).to.be.true;
            expect(await this.contract.isWrappable(this.nifty.address, tokenId + 1)).to.be.true;
            expect(await this.contract.isWrappable(this.nifty.address, tokenId - 1)).to.be.false;
            expect(await this.contract.isWrappable(this.nifty.address, tokenId - 2)).to.be.false;
        })
    });

    describe('tokenIds', function () {
        it('reverts if tokenId less than MIN', async function () {
            var tokenId = 100010000;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await expect(this.contract.wrap(this.nifty.address, tokenId))
                .to.be.revertedWith('ERC721Wrapper: TokenId not within approved range.');
        });
        
        it('reverts if tokenId greater than MAX', async function () {
            var tokenId = 100010672;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await expect(this.contract.wrap(this.nifty.address, tokenId))
                .to.be.revertedWith('ERC721Wrapper: TokenId not within approved range.');
        });

        it('correctly wraps tokenId 0', async function () {
            var tokenId = 0;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);
            await expect(this.contract.wrap(this.nifty.address, tokenId))
                .to.be.revertedWith('ERC721Wrapper: TokenId not within approved range.');
            
            await this.contract.updateApprovedTokenRanges(this.nifty.address, tokenId, tokenId + 1);
            await expect(await this.contract.wrap(this.nifty.address, tokenId))
                .to.emit(this.contract, 'Wrapped')
                .withArgs(this.owner.address, tokenId);
        });
        
        it('correctly wraps if tokenId equal to MIN', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await this.contract.wrap(this.nifty.address, tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.contract.address);
            expect(await this.contract.ownerOf(tokenId)).to.equal(this.owner.address);
        });
        
        it('correctly wraps if tokenId equal to MAX', async function () {
            var tokenId = 100010671;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await this.contract.wrap(this.nifty.address, tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.contract.address);
            expect(await this.contract.ownerOf(tokenId)).to.equal(this.owner.address);
        });
    });

    describe('unwrapping', function () {
        it('correctly unwraps', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);

            await this.contract.unwrap(this.nifty.address, tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.owner.address);
            expect(this.contract.ownerOf(tokenId))
                .to.be.revertedWith('ERC721: owner query for nonexistent token');
        });

        it('reverts if non-existent token', async function () {
            var tokenId = 100010001;
            await expect(this.contract.unwrap(this.nifty.address, tokenId))
                .to.be.revertedWith('ERC721: owner query for nonexistent token');
        });

        it('reverts if not owner', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);

            await expect(this.contract.connect(this.addr1).unwrap(this.nifty.address, tokenId))
                .to.be.revertedWith('ERC721Wrapper: Caller does not own wrapped token.');
        });
    });
});
