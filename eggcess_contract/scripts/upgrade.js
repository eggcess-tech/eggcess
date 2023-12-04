// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
    const Eggcess2 = await ethers.getContractFactory("EggcessApp");
  const eggcess = await upgrades.upgradeProxy("0xF34107f32833fbAB8083C635cca9BA51d574E5f2", Eggcess2 );
  await eggcess.waitForDeployment();
  console.log("Eggcess deployed to:", await eggcess.getAddress());
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});