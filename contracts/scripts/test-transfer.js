const hre = require("hardhat");

async function main() {
  // Get signers
  const [signer] = await hre.ethers.getSigners();
  console.log("Signer address:", signer.address);

  // Get USDC contract
  const usdcToken = await hre.ethers.getContractAt(
    "IERC20",
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  );

  // Get SolarPledge contract address
  const solarPledgeAddress = "0xBC42c205fce68300a7C1AC1f6CAEa3D182716c41";

  // Check initial balance
  const initialBalance = await usdcToken.balanceOf(signer.address);
  console.log("Initial USDC balance:", hre.ethers.formatUnits(initialBalance, 6));

  // Try to transfer 1 USDC to SolarPledge contract
  const transferAmount = hre.ethers.parseUnits("1", 6);
  console.log("Attempting to transfer", hre.ethers.formatUnits(transferAmount, 6), "USDC to SolarPledge contract...");
  
  try {
    const tx = await usdcToken.transfer(solarPledgeAddress, transferAmount);
    await tx.wait();
    console.log("Transfer successful!");
  } catch (error) {
    console.error("Transfer failed:", error.message);
  }

  // Check final balance
  const finalBalance = await usdcToken.balanceOf(signer.address);
  console.log("Final USDC balance:", hre.ethers.formatUnits(finalBalance, 6));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 