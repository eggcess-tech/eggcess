const { ethers, upgrades } = require("hardhat");
const fs = require('fs');

async function main() {


    // Deploy ThunderChatMessageContract
  const EggcessContract = await ethers.getContractFactory("eggcess");
  const eggcessContract = await upgrades.deployProxy(EggcessContract, ["0x779B73CAdD7D8532E348ABf093583985647bBF00", "0x796Da3a38e7b6BF8090f285996b72Eb1dC343D99", "0x505EfcaE794e85A96F059800Aac5Db2dF83AaAb6" ], {
    initializer: "initialize",
  });
  await eggcessContract.deployed();
  console.log("EggcessContract deployed to:", eggcessContract.address);

}
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });