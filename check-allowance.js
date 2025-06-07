import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_ABI = [
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [
      { name: '', type: 'uint256' }
    ]
  }
];

const owner = '0xc2219d6F28899FF4Da53FA93914acE3069ab15Ee';
const spender = '0x860434EA4e4114B63F44C70a304fa3eD2B32E77c';

async function main() {
  const client = createPublicClient({
    chain: base,
    transport: http(),
  });

  const allowance = await client.readContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [owner, spender],
  });

  console.log(`USDC Allowance for ${spender} by ${owner}:`, allowance.toString());
}

main().catch(console.error); 