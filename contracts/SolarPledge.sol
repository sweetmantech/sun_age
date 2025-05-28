// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SolarPledge
 * @dev Clean, focused pledge contract for Solara cosmic commitments
 * @notice Users pledge $1+ USDC with their solar age commitments
 * @author Solara Team
 */
contract SolarPledge is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STATE VARIABLES ============
    
    IERC20 public immutable usdcToken; // The USDC token contract used for pledges
    address public treasuryAddress;    // Address where base pledge fees are sent
    
    uint256 public constant PLEDGE_FEE = 1 * 10**6; // $1 USDC (6 decimals)
    uint128 public constant MAX_PLEDGE_AMOUNT = 1000000 * 10**6; // $1M USDC max pledge
    
    uint96 public totalPledges;      // Total number of pledges made
    uint128 public communityPool;     // Surplus USDC collected from pledges (not pay-it-forward)
    uint128 public payItForwardPool;  // USDC reserved for sponsoring new pledges (pay-it-forward)
    
    // Convergence period controls
    bool public convergenceOnly; // Whether pledges are only allowed during convergence
    uint96 public convergenceStart; // Start timestamp of current convergence
    uint96 public convergenceEnd;   // End timestamp of current convergence
    
    // Convergence period history
    struct ConvergencePeriod {
        uint96 startTime;
        uint96 endTime;
        uint96 periodTotalPledges; // Renamed to avoid shadowing
        uint256 totalVolume;
        bool isActive;
    }
    
    ConvergencePeriod[] public convergencePeriods;
    mapping(uint96 => uint256) public convergencePeriodIndex; // timestamp => index
    
    // Admin controls
    bool public allowPledgeUpdates;
    bool public allowPledgeRevocations;
    uint96 public minPledgeAmount;
    uint96 public maxPledgeAmount;
    
    // Timelock mechanism
    uint256 public constant TIMELOCK_PERIOD = 1 days;
    mapping(bytes32 => uint256) public queuedTransactions;
    uint256 public timelockNonce;
    
    // Pledge tracking
    mapping(address => mapping(uint256 => bool)) public hasPledgedInPeriod;
    mapping(string => mapping(uint256 => bool)) public fidHasPledgedInPeriod;
    
    // ============ STRUCTS ============
    
    struct Pledge {
        address pledger;        // 20 bytes
        uint96 pledgeNumber;    // 12 bytes - packed with pledger
        uint96 pledgeTimestamp; // 12 bytes - sufficient until year 2106
        uint128 usdcPaid;       // 16 bytes
        uint128 surplusAmount;  // 16 bytes
        uint64 solarAge;        // 8 bytes - sufficient for ~584,942 years
        bytes32 commitmentHash; // 32 bytes
        bytes32 farcasterHandle; // 32 bytes - store as bytes32 instead of string
        string commitmentText;  // dynamic - but limited to 160 chars (tweet length)
        bool isActive;          // 1 byte - packed with other bools
    }
    
    struct Metrics {
        uint96 totalPledges;
        uint128 totalBaseFees;
        uint128 communityPool;
        uint128 payItForwardPool;
        uint96 sponsorshipCapacity;
    }
    
    struct AdminControls {
        bool updatesEnabled;
        bool revocationsEnabled;
        uint96 minAmount;
        uint96 maxAmount;
    }
    
    // ============ MAPPINGS ============
    
    mapping(address => Pledge) public pledges;
    mapping(address => uint96) public userBirthTimestamp; // Changed to uint96
    mapping(address => bool) public subsidizedUsers;
    
    // ============ EVENTS ============
    
    event PledgeCreated(
        address indexed pledger,
        uint64 solarAge,
        bytes32 commitmentHash,
        string farcasterHandle,
        uint128 usdcPaid,
        uint128 surplusAmount,
        string commitment,
        uint96 pledgeNumber,
        uint96 timestamp,
        bool wasSponsored
    );
    
    event PayItForwardContribution(
        address indexed contributor,
        uint128 amount,
        uint128 newBalance
    );
    
    event SponsoredPledge(
        address indexed beneficiary,
        uint128 sponsorshipAmount
    );
    
    event BirthDateSet(
        address indexed user,
        uint96 birthTimestamp,
        uint64 currentSolarAge
    );
    
    event CommitmentUpdated(
        address indexed pledger,
        string oldCommitment,
        string newCommitment,
        bytes32 newCommitmentHash,
        uint96 timestamp
    );
    
    event PledgeRevoked(
        address indexed pledger,
        uint128 refundAmount,
        uint96 timestamp
    );
    
    event ConvergencePeriodSet(
        uint96 startTimestamp,
        uint96 endTimestamp,
        bool convergenceOnly,
        uint256 periodIndex
    );
    
    event ConvergencePeriodEnded(
        uint256 periodIndex,
        uint96 startTimestamp,
        uint96 endTimestamp,
        uint96 totalPledges,
        uint128 totalVolume
    );
    
    event EmergencyPaused(
        address indexed pauser,
        string reason
    );
    
    event EmergencyUnpaused(
        address indexed unpauser,
        string reason
    );
    
    event AdminControlsUpdated(
        bool updatesEnabled,
        bool revocationsEnabled,
        uint96 minAmount,
        uint96 maxAmount
    );
    
    event TransactionQueued(
        bytes32 indexed txHash,
        address indexed target,
        uint256 value,
        string data,
        uint256 eta
    );

    event TransactionExecuted(
        bytes32 indexed txHash,
        address indexed target,
        uint256 value,
        string data
    );

    event TransactionCancelled(
        bytes32 indexed txHash
    );
    
    // ============ MODIFIERS ============
    
    modifier whenNotConvergenceOnly() {
        require(!convergenceOnly, "Only allowed during convergence");
        _;
    }
    
    modifier whenConvergenceActive() {
        require(
            !convergenceOnly || 
            (block.timestamp >= convergenceStart && block.timestamp <= convergenceEnd),
            "Not in convergence period"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _usdcToken, address _treasuryAddress) {
        require(_usdcToken != address(0), "Invalid USDC address");
        require(_treasuryAddress != address(0), "Invalid treasury address");
        usdcToken = IERC20(_usdcToken);
        treasuryAddress = _treasuryAddress;
        allowPledgeUpdates = true;
        allowPledgeRevocations = true;
        minPledgeAmount = uint96(PLEDGE_FEE);
        maxPledgeAmount = uint96(MAX_PLEDGE_AMOUNT);
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Set your birth date to calculate solar age
     * @param _birthTimestamp Unix timestamp of birth date
     */
    function setBirthDate(uint96 _birthTimestamp) external whenNotPaused {
        require(_birthTimestamp < block.timestamp, "Birth date cannot be in future");
        require(_birthTimestamp > 0, "Invalid birth timestamp");
        require(userBirthTimestamp[msg.sender] == 0, "Birth date already set");
        
        userBirthTimestamp[msg.sender] = _birthTimestamp;
        uint64 currentAge = uint64(getCurrentSolarAge(msg.sender));
        
        emit BirthDateSet(msg.sender, _birthTimestamp, currentAge);
    }
    
    /**
     * @notice Create a pledge with your cosmic commitment
     * @param _commitment Your commitment text (max 160 chars, tweet length)
     * @param _farcasterHandle Your Farcaster handle (optional)
     * @param _pledgeAmount USDC amount to pledge (minimum $1)
     */
    function createPledge(
        string calldata _commitment,
        bytes32 _farcasterHandle,  // Changed from string to bytes32
        uint128 _pledgeAmount
    ) external nonReentrant whenNotPaused whenConvergenceActive {
        (uint256 currentPeriodIndex, uint128 surplusAmount, uint64 currentSolarAge, bytes32 commitmentHash) = _validatePledge(_commitment, _farcasterHandle, _pledgeAmount);
        _finalizePledge(_commitment, _farcasterHandle, _pledgeAmount, currentPeriodIndex, surplusAmount, currentSolarAge, commitmentHash);
    }

    function _validatePledge(
        string calldata _commitment,
        bytes32 _farcasterHandle,  // Changed from string to bytes32
        uint128 _pledgeAmount
    ) private returns (uint256 currentPeriodIndex, uint128 surplusAmount, uint64 currentSolarAge, bytes32 commitmentHash) {
        currentPeriodIndex = getCurrentConvergencePeriodIndex();
        require(currentPeriodIndex != type(uint256).max, "No active convergence period");
        require(!hasPledgedInPeriod[msg.sender][currentPeriodIndex], "Address has already pledged in this period");
        require(!fidHasPledgedInPeriod[bytes32ToString(_farcasterHandle)][currentPeriodIndex], "FID has already pledged in this period");
        require(userBirthTimestamp[msg.sender] > 0, "Set birth date first");
        require(bytes(_commitment).length > 0, "Commitment cannot be empty");
        require(bytes(_commitment).length <= 160, "Commitment too long (max 160 chars)"); // Changed to tweet length
        require(_pledgeAmount >= minPledgeAmount, "Pledge amount too low");
        require(_pledgeAmount <= maxPledgeAmount, "Pledge amount too high");
        require(usdcToken.balanceOf(msg.sender) >= _pledgeAmount, "Insufficient USDC balance");

        // Transfer base fee to treasury
        require(
            usdcToken.transferFrom(msg.sender, treasuryAddress, PLEDGE_FEE),
            "USDC transfer to treasury failed"
        );

        surplusAmount = _pledgeAmount - uint128(PLEDGE_FEE);
        if (surplusAmount > 0) {
            _handleSurplus(msg.sender, surplusAmount);
        }

        totalPledges++;
        currentSolarAge = _getCurrentSolarAge(msg.sender);
        commitmentHash = _getCommitmentHash(_commitment, msg.sender);
    }

    function _finalizePledge(
        string calldata _commitment,
        bytes32 _farcasterHandle,  // Changed from string to bytes32
        uint128 _pledgeAmount,
        uint256 currentPeriodIndex,
        uint128 surplusAmount,
        uint64 currentSolarAge,
        bytes32 commitmentHash
    ) private {
        // Assign fields directly to storage
        Pledge storage p = pledges[msg.sender];
        p.pledger = msg.sender;
        p.pledgeNumber = uint96(totalPledges);
        p.pledgeTimestamp = uint96(block.timestamp);
        p.usdcPaid = _pledgeAmount;
        p.surplusAmount = surplusAmount;
        p.solarAge = currentSolarAge;
        p.commitmentHash = commitmentHash;
        p.farcasterHandle = _farcasterHandle;
        p.commitmentText = _commitment;
        p.isActive = true;

        hasPledgedInPeriod[msg.sender][currentPeriodIndex] = true;
        fidHasPledgedInPeriod[bytes32ToString(_farcasterHandle)][currentPeriodIndex] = true;

        // Update convergence period stats if active
        if (convergenceOnly && block.timestamp >= convergenceStart && block.timestamp <= convergenceEnd) {
            _updateConvergencePeriod(_pledgeAmount);
        }

        emit PledgeCreated(
            msg.sender,
            currentSolarAge,
            commitmentHash,
            bytes32ToString(_farcasterHandle),
            _pledgeAmount,
            surplusAmount,
            _commitment,
            uint96(totalPledges),
            uint96(block.timestamp),
            false
        );
    }

    function _getCurrentSolarAge(address user) private view returns (uint64) {
        require(userBirthTimestamp[user] > 0, "Birth date not set");
        return uint64((block.timestamp - userBirthTimestamp[user]) / 86400);
    }

    function _getCommitmentHash(string calldata _commitment, address user) private view returns (bytes32) {
        return keccak256(abi.encodePacked(_commitment, user, block.timestamp));
    }

    function _updateConvergencePeriod(uint128 _pledgeAmount) private {
        uint256 currentIndex = convergencePeriods.length - 1;
        convergencePeriods[currentIndex].periodTotalPledges++;
        convergencePeriods[currentIndex].totalVolume += _pledgeAmount;
    }

    function _handleSurplus(address pledger, uint128 surplusAmount) private {
        uint128 payItForwardAmount = surplusAmount / 2;
        payItForwardPool += payItForwardAmount;
        require(
            usdcToken.transferFrom(pledger, address(this), surplusAmount),
            "USDC transfer for surplus failed"
        );
        communityPool += surplusAmount;
        emit PayItForwardContribution(pledger, payItForwardAmount, payItForwardPool);
    }
    
    /**
     * @notice Create a sponsored pledge (free for user, paid by community)
     * @param _commitment Your commitment text (max 500 chars)
     * @param _farcasterHandle Your Farcaster handle (optional)
     */
    function createSponsoredPledge(
        string calldata _commitment,
        string calldata _farcasterHandle
    ) external nonReentrant {
        require(pledges[msg.sender].pledger == address(0), "Already pledged");
        require(userBirthTimestamp[msg.sender] > 0, "Set birth date first");
        require(bytes(_commitment).length > 0, "Commitment cannot be empty");
        require(bytes(_commitment).length <= 500, "Commitment too long");
        require(payItForwardPool >= PLEDGE_FEE, "No sponsorship funds available");
        
        // Check if we're in convergence period if required
        if (convergenceOnly) {
            require(
                block.timestamp >= convergenceStart && 
                block.timestamp <= convergenceEnd,
                "Pledges only allowed during convergence"
            );
        }
        
        uint64 currentSolarAge = uint64(getCurrentSolarAge(msg.sender));
        bytes32 commitmentHash = keccak256(abi.encodePacked(_commitment, msg.sender, block.timestamp));
        
        // Use pay-it-forward funds
        payItForwardPool -= uint128(PLEDGE_FEE);
        subsidizedUsers[msg.sender] = true;
        totalPledges++;
        
        pledges[msg.sender] = Pledge({
            pledger: msg.sender,
            pledgeNumber: uint96(totalPledges),
            pledgeTimestamp: uint96(block.timestamp),
            usdcPaid: 0,
            surplusAmount: 0,
            solarAge: currentSolarAge,
            commitmentHash: commitmentHash,
            farcasterHandle: stringToBytes32(_farcasterHandle),
            commitmentText: _commitment,
            isActive: true
        });
        
        emit PledgeCreated(
            msg.sender, 
            currentSolarAge, 
            commitmentHash, 
            _farcasterHandle, 
            0,
            0,
            _commitment,
            uint96(totalPledges),
            uint96(block.timestamp),
            true
        );
        
        emit SponsoredPledge(msg.sender, uint128(PLEDGE_FEE));
    }
    
    /**
     * @notice Update your commitment text
     * @param _newCommitment New commitment text (max 500 chars)
     */
    function updateCommitment(string calldata _newCommitment) external {
        require(pledges[msg.sender].pledger != address(0), "No pledge found");
        require(pledges[msg.sender].isActive, "Pledge is not active");
        require(bytes(_newCommitment).length > 0, "Commitment cannot be empty");
        require(bytes(_newCommitment).length <= 500, "Commitment too long");
        
        string memory oldCommitment = pledges[msg.sender].commitmentText;
        bytes32 newCommitmentHash = keccak256(abi.encodePacked(_newCommitment, msg.sender, block.timestamp));
        
        pledges[msg.sender].commitmentText = _newCommitment;
        pledges[msg.sender].commitmentHash = newCommitmentHash;
        
        emit CommitmentUpdated(
            msg.sender,
            oldCommitment,
            _newCommitment,
            newCommitmentHash,
            uint96(block.timestamp)
        );
    }
    
    /**
     * @notice Revoke your pledge and get a refund
     * @dev Can only be called within 24 hours of pledge creation
     */
    function revokePledge() external nonReentrant whenNotPaused {
        require(allowPledgeRevocations, "Revocations disabled");
        Pledge storage p = pledges[msg.sender];
        require(p.isActive, "No active pledge");
        require(block.timestamp <= p.pledgeTimestamp + 24 hours, "Revocation period expired");

        uint128 refundAmount = p.surplusAmount; // Only refund the surplus amount
        p.isActive = false;

        if (refundAmount > 0) {
            require(usdcToken.transfer(msg.sender, refundAmount), "Refund failed");
        }

        emit PledgeRevoked(msg.sender, refundAmount, uint96(block.timestamp));
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Calculate current solar age in days
     * @param user Address to calculate solar age for
     * @return Solar age in days
     */
    function getCurrentSolarAge(address user) public view returns (uint64) {
        require(userBirthTimestamp[user] > 0, "Birth date not set");
        return uint64((block.timestamp - userBirthTimestamp[user]) / 86400);
    }
    
    /**
     * @notice Get pledge details for a user
     * @param _pledger Address of the pledger
     * @return Pledge struct with all details
     */
    function getPledge(address _pledger) external view returns (Pledge memory) {
        return pledges[_pledger];
    }
    
    /**
     * @notice Check if user has set their birth date
     * @param _user Address to check
     * @return True if birth date is set
     */
    function hasBirthDate(address _user) external view returns (bool) {
        return userBirthTimestamp[_user] > 0;
    }
    
    /**
     * @notice Check if user has made a pledge
     * @param _user Address to check
     * @return True if user has pledged
     */
    function hasPledge(address _user) external view returns (bool) {
        return pledges[_user].pledger != address(0);
    }
    
    /**
     * @notice Check if user was sponsored
     * @param _user Address to check
     * @return True if user received sponsored pledge
     */
    function wasUserSponsored(address _user) external view returns (bool) {
        return subsidizedUsers[_user];
    }
    
    /**
     * @notice Get available pay-it-forward balance
     * @return USDC amount available for sponsoring pledges
     */
    function getPayItForwardBalance() external view returns (uint128) {
        return payItForwardPool;
    }
    
    /**
     * @notice Get number of users that can be sponsored
     * @return Number of potential sponsored pledges
     */
    function getSponsorshipCapacity() external view returns (uint96) {
        return uint96(payItForwardPool / PLEDGE_FEE);
    }
    
    /**
     * @notice Get community pool balance (for convergence events)
     * @return USDC amount in community pool
     */
    function getCommunityPool() public view returns (uint128) {
        return communityPool;
    }
    
    /**
     * @notice Get all key metrics in one call
     * @return metrics All key metrics in one call
     */
    function getMetrics() external view returns (Metrics memory metrics) {
        uint128 totalBaseFees = uint128(totalPledges * PLEDGE_FEE);
        uint96 sponsorshipCapacity = uint96(payItForwardPool / PLEDGE_FEE);
        return Metrics({
            totalPledges: totalPledges,
            totalBaseFees: totalBaseFees,
            communityPool: communityPool,
            payItForwardPool: payItForwardPool,
            sponsorshipCapacity: sponsorshipCapacity
        });
    }
    
    /**
     * @notice Get details of a specific convergence period
     * @param periodIndex Index of the convergence period
     * @return period Period details
     */
    function getConvergencePeriod(uint256 periodIndex) external view returns (ConvergencePeriod memory period) {
        require(periodIndex < convergencePeriods.length, "Invalid period index");
        return convergencePeriods[periodIndex];
    }
    
    /**
     * @notice Get total number of convergence periods
     * @return Number of periods
     */
    function getConvergencePeriodCount() external view returns (uint256) {
        return convergencePeriods.length;
    }
    
    /**
     * @notice Get current convergence period index
     * @return Index of current period, or type(uint256).max if none
     */
    function getCurrentConvergencePeriodIndex() public view returns (uint256) {
        if (!convergenceOnly || convergencePeriods.length == 0) {
            return type(uint256).max;
        }
        
        for (uint256 i = convergencePeriods.length; i > 0; i--) {
            ConvergencePeriod storage period = convergencePeriods[i - 1];
            if (period.isActive && 
                block.timestamp >= period.startTime && 
                block.timestamp <= period.endTime) {
                return i - 1;
            }
        }
        return type(uint256).max;
    }
    
    /**
     * @notice Get current admin control settings
     * @return controls Current admin control settings
     */
    function getAdminControls() external view returns (AdminControls memory controls) {
        return AdminControls({
            updatesEnabled: allowPledgeUpdates,
            revocationsEnabled: allowPledgeRevocations,
            minAmount: minPledgeAmount,
            maxAmount: maxPledgeAmount
        });
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Update admin controls
     * @param _updatesEnabled Whether to allow pledge updates
     * @param _revocationsEnabled Whether to allow pledge revocations
     * @param _minAmount Minimum pledge amount
     * @param _maxAmount Maximum pledge amount
     */
    function setAdminControls(
        bool _updatesEnabled,
        bool _revocationsEnabled,
        uint96 _minAmount,
        uint96 _maxAmount
    ) external onlyOwner {
        require(_minAmount >= PLEDGE_FEE, "Min amount must be >= pledge fee");
        require(_maxAmount <= MAX_PLEDGE_AMOUNT, "Max amount too high");
        
        allowPledgeUpdates = _updatesEnabled;
        allowPledgeRevocations = _revocationsEnabled;
        minPledgeAmount = _minAmount;
        maxPledgeAmount = _maxAmount;
        
        emit AdminControlsUpdated(
            _updatesEnabled,
            _revocationsEnabled,
            _minAmount,
            _maxAmount
        );
    }
    
    /**
     * @notice Transfer community pool funds to convergence manager
     * @param _to Address to transfer to
     * @param _amount Amount to transfer
     */
    function transferCommunityPool(address _to, uint128 _amount) external onlyOwner {
        uint128 availablePool = communityPool - payItForwardPool;
        require(_amount <= availablePool, "Insufficient community pool");
        require(_to != address(0), "Invalid recipient");
        
        require(usdcToken.transfer(_to, _amount), "Transfer failed");
    }
    
    /**
     * @notice Update treasury address
     * @param _newTreasury New treasury address
     */
    function updateTreasuryAddress(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasuryAddress = _newTreasury;
    }
    
    /**
     * @notice Emergency function to withdraw stuck tokens
     * @param _token Token address to withdraw
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        require(_token != address(usdcToken) || _amount <= getCommunityPool(), "Cannot withdraw operational funds");
        IERC20(_token).transfer(msg.sender, _amount);
    }
    
    /**
     * @notice Set the convergence period and control
     * @param _startTimestamp Start of convergence period
     * @param _endTimestamp End of convergence period
     * @param _convergenceOnly Whether pledges are only allowed during convergence
     */
    function setConvergencePeriod(
        uint96 _startTimestamp,
        uint96 _endTimestamp,
        bool _convergenceOnly
    ) external onlyOwner {
        require(_startTimestamp < _endTimestamp, "Invalid period");
        require(_endTimestamp > block.timestamp, "Period must be in future");
        
        // End current period if exists
        if (convergencePeriods.length > 0) {
            ConvergencePeriod storage currentPeriod = convergencePeriods[convergencePeriods.length - 1];
            if (currentPeriod.isActive) {
                currentPeriod.isActive = false;
                emit ConvergencePeriodEnded(
                    convergencePeriods.length - 1,
                    currentPeriod.startTime,
                    currentPeriod.endTime,
                    currentPeriod.periodTotalPledges,
                    uint128(currentPeriod.totalVolume)
                );
            }
        }
        
        // Create new period
        convergencePeriods.push(ConvergencePeriod({
            startTime: _startTimestamp,
            endTime: _endTimestamp,
            periodTotalPledges: 0,
            totalVolume: 0,
            isActive: true
        }));
        
        convergenceStart = _startTimestamp;
        convergenceEnd = _endTimestamp;
        convergenceOnly = _convergenceOnly;
        
        emit ConvergencePeriodSet(
            _startTimestamp, 
            _endTimestamp, 
            _convergenceOnly,
            convergencePeriods.length - 1
        );
    }
    
    /**
     * @notice Adjust the current convergence period
     * @param _newStartTimestamp New start timestamp
     * @param _newEndTimestamp New end timestamp
     */
    function adjustConvergencePeriod(
        uint96 _newStartTimestamp,
        uint96 _newEndTimestamp
    ) external onlyOwner {
        require(_newStartTimestamp < _newEndTimestamp, "Invalid period");
        require(_newEndTimestamp > block.timestamp, "Period must be in future");
        
        // Update current period
        uint256 currentIndex = convergencePeriods.length - 1;
        ConvergencePeriod storage currentPeriod = convergencePeriods[currentIndex];
        currentPeriod.startTime = _newStartTimestamp;
        currentPeriod.endTime = _newEndTimestamp;
        
        convergenceStart = _newStartTimestamp;
        convergenceEnd = _newEndTimestamp;
        
        emit ConvergencePeriodSet(
            _newStartTimestamp, 
            _newEndTimestamp, 
            convergenceOnly,
            currentIndex
        );
    }
    
    /**
     * @notice Emergency pause the contract
     * @param _reason Reason for pausing
     */
    function emergencyPause(string calldata _reason) external onlyOwner {
        _pause();
        emit EmergencyPaused(msg.sender, _reason);
    }
    
    /**
     * @notice Unpause the contract
     * @param _reason Reason for unpausing
     */
    function emergencyUnpause(string calldata _reason) external onlyOwner {
        _unpause();
        emit EmergencyUnpaused(msg.sender, _reason);
    }
    
    /**
     * @notice Queue a transaction for execution after the timelock period
     * @param _target Address to call
     * @param _value Value to send
     * @param _data Data to send
     */
    function queueTransaction(
        address _target,
        uint256 _value,
        string calldata _data
    ) external onlyOwner {
        timelockNonce++;
        bytes32 txHash = keccak256(abi.encodePacked(_target, _value, _data, block.timestamp, timelockNonce));
        uint256 eta = block.timestamp + TIMELOCK_PERIOD;
        queuedTransactions[txHash] = eta;
        emit TransactionQueued(txHash, _target, _value, _data, eta);
    }
    
    /**
     * @notice Execute a queued transaction after the timelock period
     * @param _target Address to call
     * @param _value Value to send
     * @param _data Data to send
     */
    function executeTransaction(
        address _target,
        uint256 _value,
        string calldata _data,
        uint256 _nonce
    ) external onlyOwner {
        bytes32 txHash = keccak256(abi.encodePacked(_target, _value, _data, block.timestamp - TIMELOCK_PERIOD, _nonce));
        require(queuedTransactions[txHash] != 0, "Transaction not queued");
        require(block.timestamp >= queuedTransactions[txHash], "Timelock not expired");
        delete queuedTransactions[txHash];
        (bool success, ) = _target.call{value: _value}(abi.encodeWithSignature(_data));
        require(success, "Transaction execution failed");
        emit TransactionExecuted(txHash, _target, _value, _data);
    }
    
    /**
     * @notice Cancel a queued transaction
     * @param _target Address to call
     * @param _value Value to send
     * @param _data Data to send
     */
    function cancelTransaction(
        address _target,
        uint256 _value,
        string calldata _data,
        uint256 _nonce
    ) external onlyOwner {
        bytes32 txHash = keccak256(abi.encodePacked(_target, _value, _data, block.timestamp - TIMELOCK_PERIOD, _nonce));
        require(queuedTransactions[txHash] != 0, "Transaction not queued");
        delete queuedTransactions[txHash];
        emit TransactionCancelled(txHash);
    }

    // Helper function to convert bytes32 to string for events and mappings
    function bytes32ToString(bytes32 _bytes) private pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes[i] != 0; i++) {
            bytesArray[i] = _bytes[i];
        }
        return string(bytesArray);
    }

    // Helper function to convert string to bytes32 for storage
    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }
} 