const hre = require("hardhat");

async function main() {
  // Get the deployed contract instance
  const solarPledge = await hre.ethers.getContractAt(
    "SolarPledge",
    "0xBC42c205fce68300a7C1AC1f6CAEa3D182716c41"
  );

  // Get signers
  const signers = await hre.ethers.getSigners();
  console.log("Signers:", signers.map(s => s.address));
  let owner, user;
  if (signers.length >= 2) {
    [owner, user] = signers;
  } else if (signers.length === 1) {
    owner = user = signers[0];
    console.log("Only one signer available, using it for both owner and user.");
  } else {
    throw new Error("No signers available");
  }
  console.log("Owner address:", owner.address);
  console.log("User address:", user.address);

  // Get USDC contract
  const usdcToken = await hre.ethers.getContractAt(
    "IERC20",
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  );

  // Check if birth date is already set
  const hasBirthDate = await solarPledge.hasBirthDate(user.address);
  if (!hasBirthDate) {
    const birthTimestamp = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60; // 1 year ago
    console.log("Setting birth date...");
    await solarPledge.connect(user).setBirthDate(birthTimestamp);
    console.log("Birth date set successfully");
  } else {
    console.log("Birth date already set, skipping...");
  }

  // Set convergence period as owner
  const startTime = Math.floor(Date.now() / 1000) - 3600; // Started 1 hour ago
  const endTime = startTime + 86400; // Ends in 23 hours
  console.log("Setting convergence period...");
  await solarPledge.connect(owner).setConvergencePeriod(
    startTime,
    endTime,
    true
  );
  console.log("Convergence period set successfully");

  // Create pledge
  const pledgeAmount = hre.ethers.parseUnits("1", 6); // $1 USDC (equal to base fee, no surplus)
  const commitment = "Test commitment";
  const farcasterHandle = hre.ethers.encodeBytes32String("test.eth");

  // Approve USDC spending
  console.log("Approving USDC spending...");
  const baseFee = hre.ethers.parseUnits("1", 6); // $1 USDC base fee
  const totalAmount = pledgeAmount + baseFee; // Total amount needed (pledge + base fee)
  const highAllowance = hre.ethers.parseUnits("100", 6); // Approve 100 USDC to rule out allowance issues
  const currentAllowance = await usdcToken.allowance(user.address, solarPledge.target);
  console.log("Current USDC allowance:", hre.ethers.formatUnits(currentAllowance, 6));
  
  if (currentAllowance < highAllowance) {
    console.log("Approving high amount of USDC...");
    const approveTx = await usdcToken.connect(user).approve(solarPledge.target, highAllowance);
    await approveTx.wait();
    console.log("USDC approved successfully");
    
    // Log allowance and balance after approval
    const allowanceAfter = await usdcToken.allowance(user.address, solarPledge.target);
    const balanceAfter = await usdcToken.balanceOf(user.address);
    console.log("USDC allowance after approval:", hre.ethers.formatUnits(allowanceAfter, 6));
    console.log("USDC balance after approval:", hre.ethers.formatUnits(balanceAfter, 6));
  } else {
    console.log("USDC already approved with sufficient amount");
  }

  // Check USDC balance and allowance before pledge
  const balance = await usdcToken.balanceOf(user.address);
  const allowance = await usdcToken.allowance(user.address, solarPledge.target);
  console.log("\nBefore pledge creation:");
  console.log("USDC balance:", hre.ethers.formatUnits(balance, 6));
  console.log("USDC allowance:", hre.ethers.formatUnits(allowance, 6));
  console.log("Pledge amount:", hre.ethers.formatUnits(pledgeAmount, 6));
  console.log("Base fee:", hre.ethers.formatUnits(baseFee, 6));
  console.log("Total amount needed:", hre.ethers.formatUnits(totalAmount, 6));
  console.log("Contract address:", solarPledge.target);

  // Create pledge
  console.log("\nCreating pledge...");
  const tx = await solarPledge.connect(user).createPledge(
    commitment,
    farcasterHandle,
    pledgeAmount
  );
  await tx.wait();
  console.log("Pledge created successfully");

  // Get pledge details
  const pledge = await solarPledge.pledges(user.address);
  console.log("Final pledge status:");
  console.log("- Active:", pledge.isActive);
  console.log("- Amount pledged:", hre.ethers.formatUnits(pledge.usdcPaid, 6), "USDC");
  console.log("- Commitment:", pledge.commitmentText);
  console.log("- Farcaster handle:", hre.ethers.decodeBytes32String(pledge.farcasterHandle));

  // Try to revoke pledge
  console.log("Attempting to revoke pledge...");
  await solarPledge.connect(user).revokePledge();
  console.log("Pledge revoked successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 