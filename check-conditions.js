import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const PLEDGE_CONTRACT = '0x860434EA4e4114B63F44C70a304fa3eD2B32E77c';

const USDC_ABI = [
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

const PLEDGE_ABI = [
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    type: 'function',
    name: 'convergenceOnly',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    type: 'function',
    name: 'convergenceStart',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint96' }]
  },
  {
    type: 'function',
    name: 'convergenceEnd',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint96' }]
  },
  {
    type: 'function',
    name: 'hasBirthDate',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    type: 'function',
    name: 'hasPledge',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    type: 'function',
    name: 'getCurrentConvergencePeriodIndex',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

const owner = '0xc2219d6F28899FF4Da53FA93914acE3069ab15Ee';
const pledgeAmount = 5n * 10n ** 6n; // $5 USDC (6 decimals)

// Helper function to add delay between calls
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const client = createPublicClient({
    chain: base,
    transport: http('https://base-mainnet.g.alchemy.com/v2/gHrXxAuQPZ06FuiG5hy5S'),
  });

  console.log('Checking all conditions...\n');

  try {
    // 1. Check if contract is paused
    const isPaused = await client.readContract({
      address: PLEDGE_CONTRACT,
      abi: PLEDGE_ABI,
      functionName: 'paused',
    });
    console.log('1. Contract paused:', isPaused);
    await delay(1000);

    // 2. Check convergence period
    const isConvergenceOnly = await client.readContract({
      address: PLEDGE_CONTRACT,
      abi: PLEDGE_ABI,
      functionName: 'convergenceOnly',
    });
    console.log('2. Convergence only mode:', isConvergenceOnly);
    await delay(1000);

    if (isConvergenceOnly) {
      const startTime = await client.readContract({
        address: PLEDGE_CONTRACT,
        abi: PLEDGE_ABI,
        functionName: 'convergenceStart',
      });
      await delay(1000);

      const endTime = await client.readContract({
        address: PLEDGE_CONTRACT,
        abi: PLEDGE_ABI,
        functionName: 'convergenceEnd',
      });
      await delay(1000);

      const currentTime = BigInt(Math.floor(Date.now() / 1000));
      console.log('   Current time:', new Date(Number(currentTime) * 1000).toISOString());
      console.log('   Convergence start:', new Date(Number(startTime) * 1000).toISOString());
      console.log('   Convergence end:', new Date(Number(endTime) * 1000).toISOString());
      console.log('   Within convergence period:', currentTime >= startTime && currentTime <= endTime);
    }

    // 3. Check birth date
    const hasBirthDate = await client.readContract({
      address: PLEDGE_CONTRACT,
      abi: PLEDGE_ABI,
      functionName: 'hasBirthDate',
      args: [owner],
    });
    console.log('3. Birth date set:', hasBirthDate);
    await delay(1000);

    // 4. Check existing pledge
    const hasPledge = await client.readContract({
      address: PLEDGE_CONTRACT,
      abi: PLEDGE_ABI,
      functionName: 'hasPledge',
      args: [owner],
    });
    console.log('4. Has existing pledge:', hasPledge);
    await delay(1000);

    // 5. Check current convergence period index
    const currentPeriodIndex = await client.readContract({
      address: PLEDGE_CONTRACT,
      abi: PLEDGE_ABI,
      functionName: 'getCurrentConvergencePeriodIndex',
    });
    console.log('5. Current convergence period index:', currentPeriodIndex.toString());
    await delay(1000);

    // 6. Check USDC balance
    const balance = await client.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [owner],
    });
    console.log('6. USDC Balance:', Number(balance) / 1e6, 'USDC');
    console.log('   Required amount:', Number(pledgeAmount) / 1e6, 'USDC');
    console.log('   Sufficient balance:', balance >= pledgeAmount);
    await delay(1000);

    // 7. Check USDC allowance
    const allowance = await client.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'allowance',
      args: [owner, PLEDGE_CONTRACT],
    });
    console.log('7. USDC Allowance:', Number(allowance) / 1e6, 'USDC');
    console.log('   Required allowance:', Number(pledgeAmount) / 1e6, 'USDC');
    console.log('   Sufficient allowance:', allowance >= pledgeAmount);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error); 