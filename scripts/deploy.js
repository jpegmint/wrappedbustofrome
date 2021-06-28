// scripts/deploy.js
// Rinkeby
// datetime 0x1cbF0256e1F25de3baB24Ef2EdB54f9d2Fa46Bb2
// master 0xca9fc51835dbb525bb6e6ebfcc67b8be1b08bdfa
// registry 0x33f8cb717384a96c2a5de7964d0c7c1a10777660
// nifty 0xCC8BD232c0bfE22065d227F2c9aed4827699109C
// wrapped 0xc94dcAe31A7Cb603bdCF0102c21C3c4E05Bd139c
// npx hardhat verify --network rinkeby 0xc94dcAe31A7Cb603bdCF0102c21C3c4E05Bd139c "0xCC8BD232c0bfE22065d227F2c9aed4827699109C"

// Localhost
// datetime 0x5FbDB2315678afecb367f032d93F642f64180aa3
// nifty 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

async function main() {

    // We get the contract to deploy
    const DateTime = await ethers.getContractFactory("DateTime");
    console.log("Deploying DateTime...");
    const datetime = await DateTime.deploy();
    await datetime.deployed();
    console.log("DateTime deployed to:", datetime.address);

    const Nifty = await ethers.getContractFactory('NiftyBuilderInstance');
    console.log("Deploying Nifty...");
    const nifty = await Nifty.deploy('0x1cbF0256e1F25de3baB24Ef2EdB54f9d2Fa46Bb2', '0xca9fc51835dbb525bb6e6ebfcc67b8be1b08bdfa', '0x33f8cb717384a96c2a5de7964d0c7c1a10777660')
    await nifty.deployed();
    console.log("Nifty deployed to:", nifty.address);

    await nifty.setNumNiftyPermitted(100);

    await nifty.giftNifty('0x59b9076BBb9Ea20D50C65419F46a4b8fc1f41033');

    const WBR1 = await ethers.getContractFactory("WrappedBustOfRomeOneYear");
    const wbr1 = await WBR1.deploy('0xCC8BD232c0bfE22065d227F2c9aed4827699109C');
    await wbr1.deployed();
    console.log("WBR1 deployed to:", wbr1.address);
  }
  
main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
