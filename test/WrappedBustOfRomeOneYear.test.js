// Load dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 */
describe('WrappedBustOfRomeOneYear', function () {

    const ipfsToArweaveMap = {
         3: { "ipfs": "QmQdb77jfHZSwk8dGpN3mqx8q4N7EUNytiAgEkXrMPbMVw", "ar": "iOKh8ppTX5831s9ip169PfcqZ265rlz_kH-oyDXELtA"}, //State 1
         4: { "ipfs": "QmS3kaQnxb28vcXQg35PrGarJKkSysttZdNLdZp3JquttQ", "ar": "4iJ3Igr90bfEkBMeQv1t2S4ctK2X-I18hnbal2YFfWI"}, //State 2
         5: { "ipfs": "QmX8beRtZAsed6naFWqddKejV33NoXotqZoGTuDaV5SHqN", "ar": "y4yuf5VvfAYOl3Rm5DTsAaneJDXwFJGBThI6VG3b7co"}, //State 3
         6: { "ipfs": "QmQvsAMYzJm8kGQ7YNF5ziWUb6hr7vqdmkrn1qEPDykYi4", "ar": "29SOcovLFC5Q4B-YJzgisGgRXllDHoN_l5c8Tan3jHs"}, //State 4
         7: { "ipfs": "QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU", "ar": "d8mJGLKJhg1Gl2OW1qQjcH8Y8tYBCvNWUuGH6iXd18U"}, //State 5
         8: { "ipfs": "Qmd2MNfgzPYXGMS1ZgdsiWuAkriRRx15pfRXU7ZVK22jce", "ar": "siy0OInjmvElSk2ORJ4VNiQC1_dkdKzNRpmkOBBy2hA"}, //State 6
         9: { "ipfs": "QmWcYzNdUYbMzrM7bGgTZXVE4GBm7v4dQneKb9fxgjMdAX", "ar": "5euBxS7JvRrqb7fxh4wLjEW5abPswocAGTHjqlrkyBE"}, //State 7
        10: { "ipfs": "QmaXX7VuBY1dCeK78TTGEvYLTF76sf6fnzK7TJSni4PHxj", "ar": "7IK1u-DsuAj0nQzpwmQpo66dwpWx8PS9i-xv6aS6y6I"}, //State 8
        11: { "ipfs": "QmaqeJnzF2cAdfDrYRAw6VwzNn9dY9bKTyUuTHg1gUSQY7", "ar": "LWpLIs3-PUvV6WvXa-onc5QZ5FeYiEpiIwRfc_u64ss"}, //State 9
        12: { "ipfs": "QmSZquD6yGy5QvsJnygXUnWKrsKJvk942L8nzs6YZFKbxY", "ar": "vzLvsueGrzpVI_MZBogAw57Pi1OdynahcolZPpvhEQI"}, //State 10
         1: { "ipfs": "QmYtdrfPd3jAWWpjkd24NzLGqH5TDsHNvB8Qtqu6xnBcJF", "ar": "iEh79QQjaMjKd0I6d6eM8UYcFw-pj5_gBdGhTOTB54g"}, //State 11
         2: { "ipfs": "QmesagGNeyjDvJ2N5oc8ykBiwsiE7gdk9vnfjjAe3ipjx4", "ar": "b132CTM45LOEMwzOqxnPqtDqlPPwcaQ0ztQ5OWhBnvQ"}  //State 12
    }

    before(async function () {
        [this.owner, this.addr1] = await ethers.getSigners();
        this.Nifty = await ethers.getContractFactory('MockBustOfRome');
        this.wROME = await ethers.getContractFactory('WrappedBustOfRomeOneYear');
    });

    beforeEach(async function () {
        this.nifty = await this.Nifty.deploy();
        await this.nifty.deployed();
        this.contract = await this.wROME.deploy(this.nifty.address);
        await this.contract.deployed();
        this.contract.updateApprovedTokenRanges(this.nifty.address, 100010001, 100010671);
    });

    describe('token ranges', function () {
        it('reverts if non-owner updates approved ranges', async function () {
            await expect(this.contract.connect(this.addr1).updateApprovedTokenRanges(this.nifty.address, 100010010, 100010011))
                .to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('correctly updates approved range if owner', async function () {

        });
    });

    describe('tokenIds', function () {
        it('correctly wraps first 20 tokens', async function () {
            for (let i = 1; i <= 20; i++) {
                var tokenId = 100010000 + i;
                await this.nifty.mint(this.owner.address, tokenId);
                await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);
                expect(await this.contract.tokenURI(tokenId)).to.contain('#' + (tokenId - 100010000) + '/671');
                expect(await this.contract.tokenURI(tokenId)).to.contain('"value": ' + (tokenId - 100010000));
            }
        });

        it('correctly wraps last 20 tokens', async function () {
            for (let i = 1; i <= 20; i++) {
                var tokenId = 100010000 + i + 651;
                await this.nifty.mint(this.owner.address, tokenId);
                await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);
                expect(await this.contract.tokenURI(tokenId)).to.contain('#' + (tokenId - 100010000) + '/671');
                expect(await this.contract.tokenURI(tokenId)).to.contain('"value": ' + (tokenId - 100010000));
            }
        });
    });

    describe('tokenURI', function () {
        it('correctly generates tokenURI', async function () {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);

            this.nifty.mockSetMonth(4);
            expect(await this.contract.tokenURI(tokenId))
                .to.equal('data:application/json;utf8,{"name": "Eroding and Reforming Bust of Rome (One Year) #1/671","created_by": "Daniel Arsham","description": "**Daniel Arsham** (b. 1980)\\n\\n***Eroding and Reforming Bust of Rome (One Year)***, 2021\\n\\nWith his debut NFT release, Daniel Arsham introduces a concept never before seen on Nifty Gateway. His piece will erode, reform, and change based on the time of year.","external_url": "https://niftygateway.com/collections/danielarsham","image": "https://arweave.net/d8mJGLKJhg1Gl2OW1qQjcH8Y8tYBCvNWUuGH6iXd18U","image_url": "https://arweave.net/d8mJGLKJhg1Gl2OW1qQjcH8Y8tYBCvNWUuGH6iXd18U","animation": "ipfs://QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU","animation_url": "ipfs://QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU","attributes":[{"trait_type": "Edition", "display_type": "number", "value": 1, "max_value": 671}]}');
        });

        it.only('correctly generates metadata for every month', async function() {
            var tokenId = 100010001;
            await this.nifty.mint(this.owner.address, tokenId);
            await this.nifty['safeTransferFrom(address,address,uint256)'](this.owner.address, this.contract.address, tokenId);

            var timestamps = [
                1610733600000, // Jan -> 11
                1613412000000, // Feb -> 12
                1615827600000, // Mar -> 1
                1618506000000,
                1621098000000,
                1623776400000,
                1626368400000,
                1629046800000,
                1631725200000,
                1634317200000,
                1636999200000,
                1639591200000
            ];

            for (let i = 0; i < 12; i++) {
                let date = new Date(timestamps[i]),
                    month = date.getMonth() + 1,
                    hashes = ipfsToArweaveMap[month];

                await this.nifty.mockSetMonth(month);
                let ipfsHash = await this.nifty.tokenIPFSHash(tokenId),
                    arweaveHash = ipfsToArweaveMap[ipfsHash];
                
                expect(await this.contract.tokenURI(tokenId)).to.contain(hashes["ipfs"]).and.contain(hashes["ar"]);
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
