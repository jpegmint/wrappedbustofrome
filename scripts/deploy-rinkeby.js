// scripts/deploy.js
// Rinkeby
// wallet   0x7132054de647311714CA95BF6656092b43835e4f
// wrapped  0xf132f619967b20Cd97256018e4D29683d54EFb34
// npx hardhat verify --network rinkeby 0xf132f619967b20Cd97256018e4D29683d54EFb34 "0xF5DdA67b9484b25735BBA5a90617a976c0B0e638"

async function main() {

    const wROME = await ethers.getContractFactory("WrappedBustOfRomeOneYear");
    const wRome = await wROME.deploy('0xF5DdA67b9484b25735BBA5a90617a976c0B0e638');
    await wRome.deployed();
    console.log("wROME deployed to:", wRome.address);

    var wRome = await wROME.attach('0xf132f619967b20cd97256018e4d29683d54efb34');

    var Nifty = await ethers.getContractFactory('MockBustOfRome');
    var nifty = await Nifty.attach('0xF5DdA67b9484b25735BBA5a90617a976c0B0e638');
}
  
main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
