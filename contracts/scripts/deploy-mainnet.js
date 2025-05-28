const hre = require("hardhat");

async function main() {
  console.log("Starting deployment to Base mainnet...");

  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // USDC contract address on Base mainnet
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base mainnet USDC
  const TREASURY_ADDRESS = deployer.address; // Replace with actual treasury address

  // Deploy SolarPledge
  console.log("Deploying SolarPledge contract...");
  const SolarPledge = await hre.ethers.getContractFactory("SolarPledge");
  const solarPledge = await SolarPledge.deploy(USDC_ADDRESS, TREASURY_ADDRESS);
  await solarPledge.waitForDeployment();
  console.log("SolarPledge deployed to:", solarPledge.target);

  // Wait for a few blocks to ensure deployment is confirmed
  console.log("Waiting for deployment confirmation...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

  // Verify contract
  console.log("Verifying contract on Basescan...");
  try {
    await hre.run("verify:verify", {
      address: solarPledge.target,
      constructorArguments: [USDC_ADDRESS, TREASURY_ADDRESS],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Verification failed:", error);
  }

  // Set initial parameters with higher gas price
  console.log("Setting initial parameters...");
  
  // Set admin controls
  const minAmount = hre.ethers.parseUnits("1", 6); // $1 USDC minimum
  const maxAmount = hre.ethers.parseUnits("1000000", 6); // $1M USDC maximum
  
  // Get current gas price and increase it by 20%
  const gasPrice = await hre.ethers.provider.getFeeData();
  const increasedGasPrice = gasPrice.gasPrice * 120n / 100n;
  
  await solarPledge.setAdminControls(
    true, 
    true, 
    minAmount, 
    maxAmount,
    { gasPrice: increasedGasPrice }
  );
  console.log("Admin controls set");

  // Set initial convergence period
  const startTime = Math.floor(Date.now() / 1000);
  const endTime = startTime + (30 * 24 * 60 * 60); // 30 days from now
  await solarPledge.setConvergencePeriod(
    startTime, 
    endTime, 
    true,
    { gasPrice: increasedGasPrice }
  );
  console.log("Initial convergence period set");

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("SolarPledge Contract:", solarPledge.target);
  console.log("USDC Token:", USDC_ADDRESS);
  console.log("Treasury Address:", TREASURY_ADDRESS);
  console.log("Deployer:", deployer.address);
  console.log("\nContract is ready for use!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 