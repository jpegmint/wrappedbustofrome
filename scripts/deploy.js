// scripts/deploy.js
// Localhost
// wallet   0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

async function main() {

    const NiftyBuilderMaster = await ethers.getContractFactory("NiftyBuilderMaster");
    console.log("Deploying NiftyBuilderMaster...");
    const masterBuilder = await NiftyBuilderMaster.deploy();
    await masterBuilder.deployed();
    console.log("NiftyBuilderMaster deployed to:", masterBuilder.address);

    const NiftyRegistry = await ethers.getContractFactory("NiftyRegistry");
    console.log("Deploying NiftyRegistry...");
    const niftyRegistry = await NiftyRegistry.deploy(['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'], []);
    await niftyRegistry.deployed();
    console.log("NiftyRegistry deployed to:", niftyRegistry.address);
    await niftyRegistry.addNiftyKey('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

    const DateTime = await ethers.getContractFactory("DateTime");
    console.log("Deploying DateTime...");
    const datetime = await DateTime.deploy();
    await datetime.deployed();
    console.log("DateTime deployed to:", datetime.address);

    const Nifty = await ethers.getContractFactory('NiftyBuilderInstance');
    console.log("Deploying Nifty...");
    const nifty = await Nifty.deploy(datetime.address, masterBuilder.address, niftyRegistry.address)
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

    wRome.on("Wrapped", (from, tokenId) => {
        console.log('Wrapped', from, (tokenId).toString());
    });

    wRome.on("Unwrapped", (from, tokenId) => {
        console.log('Unwrapped', from, (tokenId).toString());
    });

    await nifty.setApprovalForAll(wRome.address, 1);
    await wRome.wrap(100010001);
    await wRome.tokenURI(100010001);
    await wRome.setArweaveGatewayUri('ar://');
    await wRome.setIpfsGatewayUri('ipfs://');
    await wRome.tokenURI(100010001);
    await wRome.unwrap(100010001);
  }
  
main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
