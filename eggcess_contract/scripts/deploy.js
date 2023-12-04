const { ethers, upgrades } = require("hardhat");

async function main() {
  const Eggcess = await ethers.getContractFactory("EggcessApp");
  
  // Development
  // batch, treasury, raffles
  // const eggcess = await upgrades.deployProxy(Eggcess, ["0x779B73CAdD7D8532E348ABf093583985647bBF00", "0x796Da3a38e7b6BF8090f285996b72Eb1dC343D99", "0x505EfcaE794e85A96F059800Aac5Db2dF83AaAb6"], {
  //   constructorArgs: [],
  //   initializer: "initialize",
  // });

  // Production
  const eggcess = await upgrades.deployProxy(Eggcess, ["0xbB6b7982aCF048c7A64a28637F236BC90F438f93", "0x98E9eE9d14ce53E9A7b1B43dcA8E6CA9AE11638C", "0x1c4C3B9FE66df73f7985BAe9087371a0aee7C554"], {
    constructorArgs: [],
    initializer: "initialize",
  });

  await eggcess.waitForDeployment();
  console.log("Eggcess deployed to:", await eggcess.getAddress());
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
