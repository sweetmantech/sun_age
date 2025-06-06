import React, { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWalletClient, useWaitForTransactionReceipt } from 'wagmi';

import { SOLAR_PLEDGE_ADDRESS, USDC_ADDRESS, SolarPledgeABI, USDC_ABI } from '~/lib/contracts';

export function useSolarPledge() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { data: walletClient } = useWalletClient();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isTxError, error: txError } = useWaitForTransactionReceipt({ hash: txHash });

  // Write contract for pledge
  const { writeContract, isPending: isPledgePending } = useWriteContract();

  // Read USDC allowance
  const [allowanceAmount, setAllowanceAmount] = useState<bigint>(BigInt(0));
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address, SOLAR_PLEDGE_ADDRESS],
    query: { enabled: !!address },
  });

  // Read if user has pledged
  const { data: hasPledged, refetch: refetchPledged } = useReadContract({
    address: SOLAR_PLEDGE_ADDRESS,
    abi: SolarPledgeABI,
    functionName: 'hasPledged',
    args: [address],
    query: { enabled: !!address },
  });

  // Approve USDC for a given amount
  const approveUSDC = async (amount: bigint) => {
    setError(null);
    setIsLoading(true);
    setDebugInfo(null);
    try {
      if (!walletClient) throw new Error("No wallet client available");
      const hash = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [SOLAR_PLEDGE_ADDRESS, amount],
      });
      setDebugInfo(hash ? `Tx Hash: ${hash}` : 'No transaction hash returned');
      setTxHash(hash);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to approve USDC'));
      setDebugInfo(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  // Effect: when transaction is confirmed, refetch allowance and update state
  React.useEffect(() => {
    if (isConfirmed && txHash) {
      refetchAllowance();
      setAllowanceAmount(BigInt(0)); // Optionally update this based on new allowance
      setIsLoading(false);
      setTxHash(undefined);
    }
    if (isTxError && txError) {
      setError(txError instanceof Error ? txError : new Error('Transaction failed'));
      setIsLoading(false);
      setTxHash(undefined);
    }
  }, [isConfirmed, isTxError, txError, txHash, refetchAllowance]);

  // Create pledge (records vow and pledge onchain)
  const createPledge = async (commitment: string, farcasterHandle: string, pledgeAmount: number) => {
    setError(null);
    setIsLoading(true);
    try {
      await writeContract({
        address: SOLAR_PLEDGE_ADDRESS,
        abi: SolarPledgeABI,
        functionName: 'createPledge',
        args: [commitment, farcasterHandle, BigInt(pledgeAmount * 1_000_000)],
      });
      await refetchPledged();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create pledge'));
    } finally {
      setIsLoading(false);
    }
  };

  // Check if approved for the current pledge amount
  const isApproved = (amount: number) => {
    if (typeof allowance === 'bigint') {
      return allowance >= BigInt(amount * 1_000_000);
    }
    return false;
  };

  return {
    approveUSDC,
    createPledge,
    isApproved,
    isLoading: isLoading || isPledgePending || isConfirming,
    error,
    hasPledged,
    debugInfo,
    allowance,
  };
} 