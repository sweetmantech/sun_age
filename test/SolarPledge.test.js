const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SolarPledge", function () {
    let solarPledge;
    let usdcToken;
    let owner;
    let treasury;
    let user1;
    let user2;
    let user3;

    const PLEDGE_FEE = ethers.parseUnits("1", 6); // $1 USDC
    const MAX_PLEDGE_AMOUNT = ethers.parseUnits("1000000", 6); // $1M USDC

    beforeEach(async function () {
        // Get signers
        [owner, treasury, user1, user2, user3] = await ethers.getSigners();

        // Deploy mock USDC token
        const MockUSDC = await ethers.getContractFactory("MockERC20");
        usdcToken = await MockUSDC.deploy("USD Coin", "USDC", 6);
        await usdcToken.waitForDeployment();

        // Deploy SolarPledge contract
        const SolarPledge = await ethers.getContractFactory("SolarPledge");
        solarPledge = await SolarPledge.deploy(await usdcToken.getAddress(), treasury.address);
        await solarPledge.waitForDeployment();

        // Mint USDC to users for testing
        await usdcToken.mint(user1.address, ethers.parseUnits("1000", 6));
        await usdcToken.mint(user2.address, ethers.parseUnits("1000", 6));
        await usdcToken.mint(user3.address, ethers.parseUnits("1000", 6));

        // Approve USDC spending
        await usdcToken.connect(user1).approve(await solarPledge.getAddress(), ethers.MaxUint256);
        await usdcToken.connect(user2).approve(await solarPledge.getAddress(), ethers.MaxUint256);
        await usdcToken.connect(user3).approve(await solarPledge.getAddress(), ethers.MaxUint256);
    });

    describe("Initialization", function () {
        it("Should set the correct USDC token address", async function () {
            expect(await solarPledge.usdcToken()).to.equal(await usdcToken.getAddress());
        });

        it("Should set the correct treasury address", async function () {
            expect(await solarPledge.treasuryAddress()).to.equal(treasury.address);
        });

        it("Should initialize with correct constants", async function () {
            expect(await solarPledge.PLEDGE_FEE()).to.equal(PLEDGE_FEE);
            expect(await solarPledge.MAX_PLEDGE_AMOUNT()).to.equal(MAX_PLEDGE_AMOUNT);
        });
    });

    describe("Birth Date Management", function () {
        it("Should allow users to set their birth date", async function () {
            const birthTimestamp = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60; // 1 year ago
            await solarPledge.connect(user1).setBirthDate(birthTimestamp);
            expect(await solarPledge.userBirthTimestamp(user1.address)).to.equal(birthTimestamp);
        });

        it("Should not allow future birth dates", async function () {
            const futureTimestamp = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year in future
            await expect(
                solarPledge.connect(user1).setBirthDate(futureTimestamp)
            ).to.be.revertedWith("Birth date cannot be in future");
        });

        it("Should not allow setting birth date twice", async function () {
            const birthTimestamp = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
            await solarPledge.connect(user1).setBirthDate(birthTimestamp);
            await expect(
                solarPledge.connect(user1).setBirthDate(birthTimestamp)
            ).to.be.revertedWith("Birth date already set");
        });
    });

    describe("Pledge Creation", function () {
        beforeEach(async function () {
            // Set birth dates for users
            const birthTimestamp = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
            await solarPledge.connect(user1).setBirthDate(birthTimestamp);
            await solarPledge.connect(user2).setBirthDate(birthTimestamp);

            // Set up convergence period
            const startTime = Math.floor(Date.now() / 1000) - 3600; // Started 1 hour ago
            const endTime = startTime + 86400; // Ends in 23 hours
            await solarPledge.connect(owner).setConvergencePeriod(
                startTime,
                endTime,
                true
            );
        });

        it("Should create a pledge successfully", async function () {
            const pledgeAmount = ethers.parseUnits("10", 6); // $10 USDC
            const commitment = "Test commitment";
            const farcasterHandle = ethers.encodeBytes32String("test.eth");

            await solarPledge.connect(user1).createPledge(
                commitment,
                farcasterHandle,
                pledgeAmount
            );

            const pledge = await solarPledge.pledges(user1.address);
            expect(pledge.pledger).to.equal(user1.address);
            expect(pledge.usdcPaid).to.equal(pledgeAmount);
            expect(pledge.commitmentText).to.equal(commitment);
            expect(pledge.farcasterHandle).to.equal(farcasterHandle);
        });

        it("Should enforce minimum pledge amount", async function () {
            const smallAmount = ethers.parseUnits("0.5", 6); // $0.5 USDC
            await expect(
                solarPledge.connect(user1).createPledge(
                    "Test commitment",
                    ethers.encodeBytes32String("test.eth"),
                    smallAmount
                )
            ).to.be.revertedWith("Pledge amount too low");
        });

        it("Should enforce maximum pledge amount", async function () {
            const largeAmount = ethers.parseUnits("2000000", 6); // $2M USDC
            await expect(
                solarPledge.connect(user1).createPledge(
                    "Test commitment",
                    ethers.encodeBytes32String("test.eth"),
                    largeAmount
                )
            ).to.be.revertedWith("Pledge amount too high");
        });
    });

    describe("Convergence Period Management", function () {
        it("Should allow owner to set convergence period", async function () {
            const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
            const endTime = startTime + 86400; // 24 hours later

            await solarPledge.connect(owner).setConvergencePeriod(
                startTime,
                endTime,
                true
            );

            expect(await solarPledge.convergenceStart()).to.equal(startTime);
            expect(await solarPledge.convergenceEnd()).to.equal(endTime);
            expect(await solarPledge.convergenceOnly()).to.be.true;
        });

        it("Should allow owner to adjust convergence period", async function () {
            const startTime = Math.floor(Date.now() / 1000) + 3600;
            const endTime = startTime + 86400;
            const newStartTime = startTime + 3600;
            const newEndTime = endTime + 3600;

            await solarPledge.connect(owner).setConvergencePeriod(
                startTime,
                endTime,
                true
            );

            await solarPledge.connect(owner).adjustConvergencePeriod(
                newStartTime,
                newEndTime
            );

            expect(await solarPledge.convergenceStart()).to.equal(newStartTime);
            expect(await solarPledge.convergenceEnd()).to.equal(newEndTime);
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to update treasury address", async function () {
            const newTreasury = user3.address;
            await solarPledge.connect(owner).updateTreasuryAddress(newTreasury);
            expect(await solarPledge.treasuryAddress()).to.equal(newTreasury);
        });

        it("Should allow owner to pause contract", async function () {
            await solarPledge.connect(owner).emergencyPause("Test pause");
            expect(await solarPledge.paused()).to.be.true;
        });

        it("Should allow owner to unpause contract", async function () {
            await solarPledge.connect(owner).emergencyPause("Test pause");
            await solarPledge.connect(owner).emergencyUnpause("Test unpause");
            expect(await solarPledge.paused()).to.be.false;
        });
    });

    describe("Pledge Revocation", function () {
        beforeEach(async function () {
            // Set birth date and create pledge
            const birthTimestamp = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
            await solarPledge.connect(user1).setBirthDate(birthTimestamp);

            // Set up convergence period
            const startTime = Math.floor(Date.now() / 1000) - 3600; // Started 1 hour ago
            const endTime = startTime + 86400; // Ends in 23 hours
            await solarPledge.connect(owner).setConvergencePeriod(
                startTime,
                endTime,
                true
            );
            
            const pledgeAmount = ethers.parseUnits("10", 6);
            await solarPledge.connect(user1).createPledge(
                "Test commitment",
                ethers.encodeBytes32String("test.eth"),
                pledgeAmount
            );

            // Mint USDC to the contract for refunds
            await usdcToken.mint(await solarPledge.getAddress(), pledgeAmount);
        });

        it("Should allow pledge revocation within 24 hours", async function () {
            const initialBalance = await usdcToken.balanceOf(user1.address);
            await solarPledge.connect(user1).revokePledge();
            const pledge = await solarPledge.pledges(user1.address);
            expect(pledge.isActive).to.be.false;
            
            // Check that user received their refund
            const finalBalance = await usdcToken.balanceOf(user1.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should not allow pledge revocation after 24 hours", async function () {
            // Fast forward time by 25 hours
            await ethers.provider.send("evm_increaseTime", [25 * 3600]);
            await ethers.provider.send("evm_mine");

            await expect(
                solarPledge.connect(user1).revokePledge()
            ).to.be.revertedWith("Revocation period expired");
        });
    });
}); 