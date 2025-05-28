# Solar Pledge Smart Contracts

This directory contains the smart contracts for the Solara solar pledge system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
# Network RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your-project-id

# Private key of the deployer account (without 0x prefix)
PRIVATE_KEY=your-private-key-here

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your-etherscan-api-key

# Treasury address for the contract
TREASURY_ADDRESS=your-treasury-address
```

## Development

- Compile contracts:
```bash
npm run compile
```

- Run tests:
```bash
npm run test
```

## Deployment

- Deploy to local network:
```bash
npm run deploy:local
```

- Deploy to Sepolia testnet:
```bash
npm run deploy:testnet
```

- Deploy to mainnet:
```bash
npm run deploy:mainnet
```

## Contract Addresses

After deployment, the contract addresses will be:

- Sepolia: [To be deployed]
- Mainnet: [To be deployed]

## Contract Functions

### Core Functions
- `setBirthDate(uint256 _birthTimestamp)`: Set your birth date to calculate solar age
- `createPledge(string _commitment, string _farcasterHandle, uint256 _pledgeAmount)`: Create a pledge with your cosmic commitment
- `createSponsoredPledge(string _commitment, string _farcasterHandle)`: Create a sponsored pledge (free for user)

### View Functions
- `getCurrentSolarAge(address user)`: Calculate current solar age in days
- `getPledge(address _pledger)`: Get pledge details for a user
- `hasBirthDate(address _user)`: Check if user has set their birth date
- `hasPledge(address _user)`: Check if user has made a pledge
- `wasUserSponsored(address _user)`: Check if user was sponsored
- `getPayItForwardBalance()`: Get available pay-it-forward balance
- `getSponsorshipCapacity()`: Get number of users that can be sponsored
- `getCommunityPool()`: Get community pool balance
- `getStats()`: Get comprehensive contract statistics

### Admin Functions
- `transferCommunityPool(address _to, uint256 _amount)`: Transfer community pool funds
- `updateTreasuryAddress(address _newTreasury)`: Update treasury address
- `emergencyWithdraw(address _token, uint256 _amount)`: Emergency function to withdraw stuck tokens 