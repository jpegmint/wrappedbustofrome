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
        this.contract = await this.wROME.deploy(this.nifty.address);
        await this.contract.deployed();

        this.contract.updateApprovedTokenRange(100010001, 100010671);
    });
    
    describe('wrapping', function () {

        it('reverts if wrapped before approval', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await expect(this.contract.wrap(tokenId)).to.be.revertedWith('wROME: Contract must be given approval to wrap NFT.');
        });

        it('reverts if wrapped without approving tokenId', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.addr1.address, tokenId);
            await this.nifty.connect(this.addr1).approve(this.contract.address, tokenId);
            this.contract.updateApprovedTokenRange(100010671, 100010671);

            await expect(this.nifty.connect(this.addr1)['safeTransferFrom(address,address,uint256)'](this.addr1.address, this.contract.address, tokenId))
                .to.be.revertedWith('wROME: TokenId not approved wrap range.');
            await expect(this.contract.connect(this.addr1).wrap(tokenId))
                .to.be.revertedWith('wROME: TokenId not approved wrap range.');
        });
        
        it('reverts if wrapped after setApprovalForAll', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.setApprovalForAll(this.contract.address, true);

            await expect(this.contract.wrap(tokenId)).to.be.revertedWith('wROME: Contract must be given approval to wrap NFT.');
        });
        
        it('correctly wraps after approve', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await expect(await this.contract.wrap(tokenId))
                .to.emit(this.contract, 'Wrapped')
                .withArgs(this.owner.address, tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.contract.address);
            expect(await this.contract.ownerOf(tokenId)).to.equal(this.owner.address);
        });

        it('reverts if wrapping a fake token', async function () {
            var fake = await this.Nifty.deploy(this.datetime.address);
            await fake.deployed();
            var tokenId = 100010001;
            await fake.mint(this.owner.address, tokenId);
            await fake.approve(this.contract.address, tokenId);
            await this.nifty.mint(this.addr1.address, tokenId);
            await this.nifty.connect(this.addr1).approve(this.contract.address, tokenId);
            
            await expect(fake['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId))
                .to.be.revertedWith('wROME: Unrecognized contract.');
            await expect(this.contract.wrap(tokenId))
                .to.be.revertedWith('wROME: Caller must own NFTs');
        });

        it('reverts if tokenId not in approved range', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await this.contract.updateApprovedTokenRange(100010010, 100010011)
            await expect(this.contract.wrap(tokenId))
                .to.be.revertedWith('wROME: TokenId not approved wrap range.');
        });
    });

    describe('token ranges', function () {
        it('reverts if non-owner updates approved ranges', async function () {
            await expect(this.contract.connect(this.addr1).updateApprovedTokenRange(100010010, 100010011))
                .to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('reverts if min tokenId is larger than max', async function () {
            await expect(this.contract.updateApprovedTokenRange(100010671, 100010001))
                .to.be.revertedWith('wROME: Min tokenId must be less than maxId.');
        });

        it('correctly updates approved token range if equal', async function () {
            var tokenId = 100010010;
            await this.contract.updateApprovedTokenRange(tokenId, tokenId);
            expect(await this.contract.isWrappable(tokenId)).to.be.true;
            expect(await this.contract.isWrappable(tokenId - 1)).to.be.false;
            expect(await this.contract.isWrappable(tokenId + 1)).to.be.false;
        });

        it('correctly updates the approved token ranges', async function () {
            var tokenId = 100010020;
            await this.contract.updateApprovedTokenRange(tokenId, tokenId + 1);
            expect(await this.contract.isWrappable(tokenId)).to.be.true;
            expect(await this.contract.isWrappable(tokenId + 1)).to.be.true;
            expect(await this.contract.isWrappable(tokenId - 1)).to.be.false;
            expect(await this.contract.isWrappable(tokenId - 2)).to.be.false;
        })
    });

    describe('tokenIds', function () {
        it('reverts if tokenId less than MIN', async function () {
            var tokenId = 100010000;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await expect(this.contract.wrap(tokenId))
                .to.be.revertedWith('wROME: TokenId not approved wrap range.');
        });
        
        it('reverts if tokenId greater than MAX', async function () {
            var tokenId = 100010672;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await expect(this.contract.wrap(tokenId))
                .to.be.revertedWith('wROME: TokenId not approved wrap range.');
        });
        
        it('correctly wraps if tokenId equal to MIN', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await this.contract.wrap(tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.contract.address);
            expect(await this.contract.ownerOf(tokenId)).to.equal(this.owner.address);
        });
        
        it('correctly wraps if tokenId equal to MAX', async function () {
            var tokenId = 100010671;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.approve(this.contract.address, tokenId);

            await this.contract.wrap(tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.contract.address);
            expect(await this.contract.ownerOf(tokenId)).to.equal(this.owner.address);
        });

        it('correctly mints first 20 tokens', async function () {
            for (let i = 1; i <= 20; i++) {
                var tokenId = 100010000 + i;
                await this.nifty.mint(this.owner.address, tokenId);
                await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);
                expect(await this.contract.tokenURI(tokenId)).to.contain('#' + (tokenId - 100010000) + '/671');
            }
        });

        it('correctly mints last 20 tokens', async function () {
            for (let i = 1; i <= 20; i++) {
                var tokenId = 100010000 + i + 651;
                await this.nifty.mint(this.owner.address, tokenId);
                await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);
                expect(await this.contract.tokenURI(tokenId)).to.contain('#' + (tokenId - 100010000) + '/671');
                expect(await this.contract.tokenURI(tokenId)).to.contain('"value": ' + (tokenId - 100010000));
            }
        });
    });

    describe('unwrapping', function () {
        it('correctly unwraps', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);

            await this.contract.unwrap(tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.owner.address);
            expect(this.contract.ownerOf(tokenId))
                .to.be.revertedWith('ERC721: owner query for nonexistent token');
        });

        it('reverts if non-existent token', async function () {
            var tokenId = 100010001;
            await expect(this.contract.unwrap(tokenId))
                .to.be.revertedWith('ERC721: owner query for nonexistent token');
        });

        it('reverts if not owner', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);

            await expect(this.contract.connect(this.addr1).unwrap(tokenId))
                .to.be.revertedWith('wROME: Caller does not own wrapped token.');
        });
    });

    describe('tokenURI', function () {
        it('correctly generates tokenURI', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);

            this.datetime.mockSetMonth(5);
            expect(await this.contract.tokenURI(tokenId))
                .to.equal('data:application/json;utf8,{"name": "Eroding and Reforming Bust of Rome (One Year) #1/671","created_by": "Daniel Arsham","description": "**Daniel Arsham** (b. 1980)\\n\\n***Eroding and Reforming Bust of Rome (One Year)***, 2021\\n\\nWith his debut NFT release, Daniel Arsham introduces a concept never before seen on Nifty Gateway. His piece will erode, reform, and change based on the time of year.","external_url": "https://niftygateway.com/collections/danielarsham","image": "https://arweave.net/d8mJGLKJhg1Gl2OW1qQjcH8Y8tYBCvNWUuGH6iXd18U","image_url": "https://arweave.net/d8mJGLKJhg1Gl2OW1qQjcH8Y8tYBCvNWUuGH6iXd18U","animation": "ipfs://QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU","animation_url": "ipfs://QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU","attributes":[{"trait_type": "Edition", "display_type": "number", "value": 1, "max_value": 671}]}');
        });

        it('correctly generates matching image/animation', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);

            var ipfsToArweaveMap = {
                "QmQdb77jfHZSwk8dGpN3mqx8q4N7EUNytiAgEkXrMPbMVw": "iOKh8ppTX5831s9ip169PfcqZ265rlz_kH-oyDXELtA", //State 1
                "QmS3kaQnxb28vcXQg35PrGarJKkSysttZdNLdZp3JquttQ": "4iJ3Igr90bfEkBMeQv1t2S4ctK2X-I18hnbal2YFfWI", //State 2
                "QmX8beRtZAsed6naFWqddKejV33NoXotqZoGTuDaV5SHqN": "y4yuf5VvfAYOl3Rm5DTsAaneJDXwFJGBThI6VG3b7co", //State 3
                "QmQvsAMYzJm8kGQ7YNF5ziWUb6hr7vqdmkrn1qEPDykYi4": "29SOcovLFC5Q4B-YJzgisGgRXllDHoN_l5c8Tan3jHs", //State 4
                "QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU": "d8mJGLKJhg1Gl2OW1qQjcH8Y8tYBCvNWUuGH6iXd18U", //State 5
                "Qmd2MNfgzPYXGMS1ZgdsiWuAkriRRx15pfRXU7ZVK22jce": "siy0OInjmvElSk2ORJ4VNiQC1_dkdKzNRpmkOBBy2hA", //State 6
                "QmWcYzNdUYbMzrM7bGgTZXVE4GBm7v4dQneKb9fxgjMdAX": "5euBxS7JvRrqb7fxh4wLjEW5abPswocAGTHjqlrkyBE", //State 7
                "QmaXX7VuBY1dCeK78TTGEvYLTF76sf6fnzK7TJSni4PHxj": "7IK1u-DsuAj0nQzpwmQpo66dwpWx8PS9i-xv6aS6y6I", //State 8
                "QmaqeJnzF2cAdfDrYRAw6VwzNn9dY9bKTyUuTHg1gUSQY7": "LWpLIs3-PUvV6WvXa-onc5QZ5FeYiEpiIwRfc_u64ss", //State 9
                "QmSZquD6yGy5QvsJnygXUnWKrsKJvk942L8nzs6YZFKbxY": "vzLvsueGrzpVI_MZBogAw57Pi1OdynahcolZPpvhEQI", //State 10
                "QmYtdrfPd3jAWWpjkd24NzLGqH5TDsHNvB8Qtqu6xnBcJF": "iEh79QQjaMjKd0I6d6eM8UYcFw-pj5_gBdGhTOTB54g", //State 11
                "QmesagGNeyjDvJ2N5oc8ykBiwsiE7gdk9vnfjjAe3ipjx4": "b132CTM45LOEMwzOqxnPqtDqlPPwcaQ0ztQ5OWhBnvQ", //State 12
            }

            var month = 1;
            for (let [ipfsHash, arweaveHash] of Object.entries(ipfsToArweaveMap)) {
                this.datetime.mockSetMonth(month++);
                expect(await this.contract.tokenURI(tokenId)).to.contain(ipfsHash).and.contain(arweaveHash);
            }
        });
    });

    describe('recover', function () {

        it('can recover if received via transfer', async function () {
            // Mint nifty and confirm owner owns token.
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.owner.address);
    
            // Transfer to wRome and confirm it is owned by wRome.
            await this.nifty.transferFrom(this.owner.address, this.contract.address, tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.contract.address);
    
            // Check that no wrapped token was minted.
            await expect(this.contract.ownerOf(tokenId)).to.be.revertedWith('ERC721: owner query for nonexistent token');
    
            // Recover the token
            await this.contract.recoverOrphanedToken(tokenId);
            expect(await this.nifty.ownerOf(tokenId)).to.equal(this.owner.address);
        });
    
        it('only admin can recover orphaned tokens', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty.transferFrom(this.owner.address, this.contract.address, tokenId);
            await expect(this.contract.connect(this.addr1).recoverOrphanedToken(tokenId)).to.be.reverted;
        });
    });
});
