const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const issuer = process.env.ISSUER_ADDRESS || deployer.address;

  console.log("Network :", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Issuer  :", issuer, "(the wallet allowed to mint credentials)");

  const Factory = await hre.ethers.getContractFactory("IntentCredential");
  const contract = await Factory.deploy(issuer);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n✅ IntentCredential deployed to:", address);
  console.log("\nWire it up:");
  console.log("  • server env  →  CREDENTIAL_CONTRACT=" + address);
  console.log("  • frontend env →  VITE_CREDENTIAL_CONTRACT=" + address);
  console.log("\nThe issuer wallet must hold a little Base Sepolia ETH to pay mint gas.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
