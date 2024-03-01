// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const Eggcess2 = await ethers.getContractFactory("EggcessApp");
  // Blast address
  const eggcess = await upgrades.upgradeProxy("0x23cEa68B56d83f133403EA75dF21768c0BDc6fd1", Eggcess2 );
  await eggcess.waitForDeployment();
  console.log("Eggcess deployed to:", await eggcess.getAddress());
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});