// scripts/deploy.js
// Rinkeby
// wallet   0x7132054de647311714CA95BF6656092b43835e4f
// master   0x52d1B78AC70836D09358a5d543c0988cfF9BC5B5
// npx hardhat verify --network rinkeby 0x52d1B78AC70836D09358a5d543c0988cfF9BC5B5
// registry 0x0872f3821e8A364aa56c8f7Da54b5C936835a08E
// datetime 0xAD763b4D450022921AF98bA9159A46f4eF61BB5C
// npx hardhat verify --network rinkeby 0xAD763b4D450022921AF98bA9159A46f4eF61BB5C
// nifty    0xF5DdA67b9484b25735BBA5a90617a976c0B0e638
// npx hardhat verify --network rinkeby 0xF5DdA67b9484b25735BBA5a90617a976c0B0e638 "0xAD763b4D450022921AF98bA9159A46f4eF61BB5C" "0x52d1B78AC70836D09358a5d543c0988cfF9BC5B5" "0x0872f3821e8A364aa56c8f7Da54b5C936835a08E"
// wrapped  0x273e14fc0AdE9D033BdAc3185E073aECE1cdbe62
// npx hardhat verify --network rinkeby 0x273e14fc0AdE9D033BdAc3185E073aECE1cdbe62 "0xF5DdA67b9484b25735BBA5a90617a976c0B0e638" "0xAD763b4D450022921AF98bA9159A46f4eF61BB5C"

async function main() {

    const wROME = await ethers.getContractFactory("WrappedBustOfRomeOneYear");
    const wRome = await wROME.deploy('0xCC8BD232c0bfE22065d227F2c9aed4827699109C', '0x1cbF0256e1F25de3baB24Ef2EdB54f9d2Fa46Bb2');
    await wRome.deployed();
    console.log("wROME deployed to:", wRome.address);

    await nifty.setNumNiftyPermitted(100);
    await nifty.giftNifty('0x7132054de647311714CA95BF6656092b43835e4f');
    await nifty.giftNifty('0x7132054de647311714CA95BF6656092b43835e4f');
    await nifty.giftNifty('0x7132054de647311714CA95BF6656092b43835e4f');

    const NiftyRegistry = await ethers.getContractFactory("NiftyRegistry");
    const niftyRegistry = await NiftyRegistry.attach('0x0872f3821e8A364aa56c8f7Da54b5C936835a08E');

    const Nifty = await ethers.getContractFactory('NiftyBuilderInstance');
    const nifty = await Nifty.attach('0xF5DdA67b9484b25735BBA5a90617a976c0B0e638');

    const wROME = await ethers.getContractFactory("WrappedBustOfRomeOneYear");
    const wRome = await wROME.attach('0x273e14fc0AdE9D033BdAc3185E073aECE1cdbe62');
  }
  
main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
