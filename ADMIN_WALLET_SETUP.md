# Admin Wallet Setup Guide

This guide explains how to set up the admin wallet for distributing SOLAR tokens to users who claim them.

## Overview

The notification system automatically sends Farcaster notifications to users when they share their first journal entry. When users claim their tokens, the system needs an admin wallet to actually transfer the SOLAR tokens to their wallet address.

## Setup Steps

### 1. Create Admin Wallet

You have several options for the admin wallet:

#### Option A: Hardware Wallet (Recommended)
- Use a hardware wallet like Ledger or Trezor
- Create a new account specifically for token distribution
- This is the most secure option

#### Option B: Software Wallet
- Create a new MetaMask wallet
- Use it only for token distribution
- Keep the private key secure

#### Option C: Contract Wallet
- Use a smart contract wallet like Safe
- Requires more setup but offers advanced features

### 2. Fund the Admin Wallet

1. **Get SOLAR tokens**: You need SOLAR tokens to distribute to users
   - Contract: `0x746042147240304098C837563aAEc0F671881B07`
   - Network: Base mainnet
   - Each claim requires 10,000 SOLAR tokens

2. **Get ETH for gas**: You need ETH on Base mainnet for transaction fees
   - Bridge ETH from Ethereum mainnet to Base
   - Or buy ETH directly on Base

### 3. Environment Variables

Add these to your `.env.local` file:

```bash
# Admin wallet private key (keep this secret!)
ADMIN_WALLET_PRIVATE_KEY=your_private_key_here

# RPC URL for Base mainnet
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
```

### 4. Security Considerations

⚠️ **IMPORTANT**: Never commit your private key to version control!

- Store the private key securely
- Use environment variables
- Consider using a dedicated wallet with limited funds
- Monitor the wallet regularly

### 5. Testing

1. **Test with small amounts first**
2. **Use the test script**:
   ```bash
   node scripts/test-notification-flow.js
   ```

3. **Check the logs** to ensure transactions are working

### 6. Monitoring

The system will:
- Log all token transfers
- Record transaction hashes in the database
- Show success/error messages

## Token Distribution Flow

1. User shares first journal entry
2. System sends Farcaster notification
3. User clicks notification → goes to `/claim`
4. User enters wallet address
5. System verifies eligibility
6. Admin wallet transfers 10,000 SOLAR tokens
7. Transaction is recorded in database

## Troubleshooting

### Common Issues

1. **"Insufficient tokens in admin wallet"**
   - Add more SOLAR tokens to the admin wallet

2. **"Insufficient ETH for gas"**
   - Add more ETH to the admin wallet

3. **"Invalid wallet address"**
   - Check the wallet address format

4. **"Already claimed"**
   - User has already claimed tokens

### Development Mode

If no admin wallet is configured, the system will:
- Simulate transactions (no real tokens transferred)
- Generate fake transaction hashes
- Still record claims in the database

This is useful for testing without using real tokens.

## Production Deployment

For production:

1. **Use a hardware wallet** for maximum security
2. **Monitor the wallet balance** regularly
3. **Set up alerts** for low balances
4. **Backup private keys** securely
5. **Test thoroughly** before going live

## Support

If you encounter issues:
1. Check the logs in your application
2. Verify wallet balances
3. Test with the provided scripts
4. Contact the development team 