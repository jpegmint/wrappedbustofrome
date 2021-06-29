// scripts/deploy.js
// Rinkeby
// datetime 0x1cbF0256e1F25de3baB24Ef2EdB54f9d2Fa46Bb2
// nifty 0xCC8BD232c0bfE22065d227F2c9aed4827699109C
// master 0xca9fc51835dbb525bb6e6ebfcc67b8be1b08bdfa
// registry 0x33f8cb717384a96c2a5de7964d0c7c1a10777660
// wrapped 0xc94dcAe31A7Cb603bdCF0102c21C3c4E05Bd139c
// npx hardhat verify --network rinkeby 0xE1942Eb3123FD9BF77F69EA01F53136B60f40B31 "0xCC8BD232c0bfE22065d227F2c9aed4827699109C" "0x1cbF0256e1F25de3baB24Ef2EdB54f9d2Fa46Bb2"

async function main() {

    const wROME = await ethers.getContractFactory("WrappedBustOfRomeOneYear");
    const wRome = await wROME.deploy('0xCC8BD232c0bfE22065d227F2c9aed4827699109C', '0x1cbF0256e1F25de3baB24Ef2EdB54f9d2Fa46Bb2');
    await wRome.deployed();
    console.log("wROME deployed to:", wRome.address);
  }
  
main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
