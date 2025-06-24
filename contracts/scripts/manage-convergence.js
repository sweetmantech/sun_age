const hre = require("hardhat");

async function main() {
  // Duration in days for the new convergence period.
  // You can change this value as needed.
  const DURATION_IN_DAYS = 30;

  // The address of your deployed SolarPledge contract
  const CONTRACT_ADDRESS = "0x860434EA4e4114B63F44C70a304fa3eD2B32E77c";

  console.log(`Connecting to contract at: ${CONTRACT_ADDRESS}`);

  // Get the contract factory and attach it to the deployed contract
  const SolarPledge = await hre.ethers.getContractFactory("SolarPledge");
  const solarPledge = SolarPledge.attach(CONTRACT_ADDRESS);

  console.log(`Setting convergence period to ${DURATION_IN_DAYS} days.`);

  // Calculate timestamps
  const startTime = Math.floor(Date.now() / 1000);
  const endTime = startTime + (DURATION_IN_DAYS * 24 * 60 * 60);

  // Get current gas price and increase it by 20% for faster confirmation
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;
  const increasedGasPrice = gasPrice ? (gasPrice * 120n) / 100n : undefined;


  // Call the adjustConvergencePeriod function
  const tx = await solarPledge.adjustConvergencePeriod(
    startTime,
    endTime,
    { gasPrice: increasedGasPrice }
  );

  console.log(`Transaction sent with hash: ${tx.hash}`);
  console.log("Waiting for transaction to be mined...");

  await tx.wait();

  console.log("✅ Convergence period successfully adjusted!");
  console.log(`New Start Time: ${new Date(startTime * 1000).toLocaleString()}`);
  console.log(`New End Time:   ${new Date(endTime * 1000).toLocaleString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("An error occurred:", error);
    process.exit(1);
  }); 