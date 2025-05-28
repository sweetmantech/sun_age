const hre = require("hardhat");

async function main() {
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

  // Check if we have an existing token address in the environment
  const existingTokenAddress = process.env.MOCK_TOKEN_ADDRESS;
  let mockToken;

  if (existingTokenAddress) {
    console.log("Using existing mock token at:", existingTokenAddress);
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    mockToken = MockERC20.attach(existingTokenAddress);
  } else {
    console.log("No existing token found, deploying new MockERC20...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Mock USDC", "mUSDC", 6);
    await mockToken.waitForDeployment();
    console.log("MockERC20 deployed to:", mockToken.target);
    console.log("IMPORTANT: Save this address as MOCK_TOKEN_ADDRESS for future use");
  }

  // Check if user already has tokens
  const initialBalance = await mockToken.balanceOf(user.address);
  if (initialBalance < hre.ethers.parseUnits("100", 6)) {
    console.log("Minting 100 mock USDC to user...");
    await mockToken.mint(user.address, hre.ethers.parseUnits("100", 6));
    console.log("Minted 100 mock USDC to user");
  } else {
    console.log("User already has sufficient mock USDC balance");
  }

  // Deploy SolarPledge with mock token
  const SolarPledge = await hre.ethers.getContractFactory("SolarPledge");
  const treasuryAddress = owner.address; // Use owner as treasury for testing
  const solarPledge = await SolarPledge.deploy(mockToken.target, treasuryAddress);
  await solarPledge.waitForDeployment();
  console.log("SolarPledge deployed to:", solarPledge.target);

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
  const endTime = startTime + 86400;
  console.log("Setting convergence period...");
  await solarPledge.connect(owner).setConvergencePeriod(startTime, endTime, true);
  console.log("Convergence period set successfully");

  // Approve mock token spending
  console.log("Approving mock token spending...");
  const pledgeAmount = hre.ethers.parseUnits("1", 6); // $1 mock USDC
  const highAllowance = hre.ethers.parseUnits("100", 6); // Approve 100 mock USDC
  const currentAllowance = await mockToken.allowance(user.address, solarPledge.target);
  console.log("Current mock token allowance:", hre.ethers.formatUnits(currentAllowance, 6));
  
  if (currentAllowance < highAllowance) {
    console.log("Approving high amount of mock token...");
    const approveTx = await mockToken.connect(user).approve(solarPledge.target, highAllowance);
    await approveTx.wait();
    console.log("Mock token approved successfully");
    
    // Log allowance and balance after approval
    const allowanceAfter = await mockToken.allowance(user.address, solarPledge.target);
    const balanceAfter = await mockToken.balanceOf(user.address);
    console.log("Mock token allowance after approval:", hre.ethers.formatUnits(allowanceAfter, 6));
    console.log("Mock token balance after approval:", hre.ethers.formatUnits(balanceAfter, 6));
  } else {
    console.log("Mock token already approved with sufficient amount");
  }

  // Check mock token balance and allowance before pledge
  const currentBalance = await mockToken.balanceOf(user.address);
  const allowance = await mockToken.allowance(user.address, solarPledge.target);
  console.log("\nBefore pledge creation:");
  console.log("Mock token balance:", hre.ethers.formatUnits(currentBalance, 6));
  console.log("Mock token allowance:", hre.ethers.formatUnits(allowance, 6));
  console.log("Pledge amount:", hre.ethers.formatUnits(pledgeAmount, 6));
  console.log("Contract address:", solarPledge.target);

  // Create pledge
  console.log("\nCreating pledge...");
  const commitment = "Test commitment";
  const farcasterHandle = hre.ethers.encodeBytes32String("test.eth");
  const tx = await solarPledge.connect(user).createPledge(commitment, farcasterHandle, pledgeAmount);
  await tx.wait();
  console.log("Pledge created successfully");

  // Get pledge details
  const pledge = await solarPledge.pledges(user.address);
  console.log("Final pledge status:");
  console.log("- Active:", pledge.isActive);
  console.log("- Amount pledged:", hre.ethers.formatUnits(pledge.usdcPaid, 6), "mock USDC");
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