const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const SolarPledge = await hre.ethers.getContractFactory("SolarPledge");

  // USDC addresses for different networks
  const USDC_ADDRESSES = {
    "base-sepolia": "0x8a04d904055528a69f3e4594dda308a31aeb8457", // Base Sepolia USDC
    "base": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"  // Base Mainnet USDC
  };

  // Treasury address
  const TREASURY_ADDRESS = "0x4F6b2EDa862e15DA6863449922322Bd65d125CD6";

  // Get the network
  const network = hre.network.name;
  const usdcAddress = USDC_ADDRESSES[network] || USDC_ADDRESSES["base-sepolia"];

  console.log(`Deploying SolarPledge to ${network}...`);
  console.log(`Using USDC address: ${usdcAddress}`);
  console.log(`Using Treasury address: ${TREASURY_ADDRESS}`);

  // Deploy the contract
  const solarPledge = await SolarPledge.deploy(usdcAddress, TREASURY_ADDRESS);
  await solarPledge.waitForDeployment();

  const address = await solarPledge.getAddress();
  console.log(`SolarPledge deployed to: ${address}`);

  // Verify the contract on Basescan
  if (network !== "hardhat" && network !== "localhost") {
    console.log("Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [usdcAddress, TREASURY_ADDRESS],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 