// scripts/deploy.js
// Localhost
// wallet   0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// datetime 0x5FbDB2315678afecb367f032d93F642f64180aa3
// nifty    0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
// wRome    0x0165878A594ca255338adfa4d48449f69242Eb8F

async function main() {

    const DateTime = await ethers.getContractFactory("DateTime");
    console.log("Deploying DateTime...");
    const datetime = await DateTime.deploy();
    await datetime.deployed();
    console.log("DateTime deployed to:", datetime.address);

    const Nifty = await ethers.getContractFactory('NiftyBuilderInstance');
    console.log("Deploying Nifty...");
    const nifty = await Nifty.deploy(datetime.address, '0xca9fc51835dbb525bb6e6ebfcc67b8be1b08bdfa', '0x33f8cb717384a96c2a5de7964d0c7c1a10777660')
    await nifty.deployed();
    console.log("Nifty deployed to:", nifty.address);

    await nifty.setNumNiftyPermitted(100);
    await nifty.giftNifty('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
    await nifty.giftNifty('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
    await nifty.giftNifty('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

    const wROME = await ethers.getContractFactory("WrappedBustOfRomeOneYear");
    const wRome = await wROME.deploy(nifty.address, datetime.address);
    await wRome.deployed();
    console.log("wROME deployed to:", wRome.address);

    await nifty.setApprovalForAll(wRome.address, 1);
    await wRome.wrap(100010001);
    await wRome.tokenURI(100010001);
  }
  
main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
