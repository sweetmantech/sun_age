import React, { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWalletClient, useWaitForTransactionReceipt } from 'wagmi';
import { useFrameSDK } from './useFrameSDK';

import { SOLAR_PLEDGE_ADDRESS, USDC_ADDRESS, SolarPledgeABI, USDC_ABI } from '~/lib/contracts';

export function useSolarPledge() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isApprovalPending, setIsApprovalPending] = useState(false);
  const [isApprovalConfirmed, setIsApprovalConfirmed] = useState(false);
  const { data: walletClient } = useWalletClient();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { isInFrame } = useFrameSDK();
  const { writeContract } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isTxError, error: txError } = useWaitForTransactionReceipt({ hash: txHash });

  // Write contract for pledge
  const { isPending: isPledgePending } = useWriteContract();

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
    if (!walletClient && !isInFrame) {
      setError(new Error("No wallet client available"));
      return;
    }

    setError(null);
    setIsLoading(true);
    setIsApprovalPending(true);
    setIsApprovalConfirmed(false);
    setDebugInfo(null);
    try {
      setDebugInfo(`Starting USDC approval for amount: ${amount}`);
      // If in Farcaster frame, use writeContract directly to trigger the frame wallet
      if (isInFrame) {
        setDebugInfo('In Farcaster frame, using writeContract directly');
        const result = await writeContract({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [SOLAR_PLEDGE_ADDRESS, amount],
        });
        setDebugInfo('writeContract called successfully');
        // The transaction hash will be handled by the useWaitForTransactionReceipt hook
      } else {
        setDebugInfo('Using wallet client for approval');
        // For regular wallets, use the wallet client
        if (!walletClient) {
          setError(new Error("No wallet client available"));
          setIsLoading(false);
          setIsApprovalPending(false);
          return;
        }
        const hash = await walletClient.writeContract({
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [SOLAR_PLEDGE_ADDRESS, amount],
        });
        setDebugInfo(hash ? `Tx Hash: ${hash}` : 'No transaction hash returned');
        setTxHash(hash);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to approve USDC'));
      setDebugInfo(`Error in approveUSDC: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
      setIsApprovalPending(false);
    }
  };

  // Effect: when transaction is confirmed, refetch allowance and update state
  React.useEffect(() => {
    if (isConfirmed && txHash) {
      setDebugInfo(`Transaction confirmed: ${txHash}`);
      refetchAllowance();
      setAllowanceAmount(BigInt(0)); // Optionally update this based on new allowance
      setIsLoading(false);
      setIsApprovalPending(false);
      setIsApprovalConfirmed(true);
      setTxHash(undefined);
    }
    if (isTxError && txError) {
      setError(txError instanceof Error ? txError : new Error('Transaction failed'));
      setDebugInfo(`Transaction error: ${txError instanceof Error ? txError.message : String(txError)}`);
      setIsLoading(false);
      setIsApprovalPending(false);
      setTxHash(undefined);
    }
  }, [isConfirmed, isTxError, txError, txHash, refetchAllowance]);

  // Create pledge (records vow and pledge onchain)
  const createPledge = async (commitment: string, farcasterHandle: string, pledgeAmount: number) => {
    if (!isApprovalConfirmed) {
      setError(new Error('Please wait for USDC approval to complete'));
      return;
    }

    if (!walletClient && !isInFrame) {
      setError(new Error("No wallet client available"));
      return;
    }

    setError(null);
    setIsLoading(true);
    setDebugInfo(null);
    try {
      setDebugInfo(`Starting pledge creation for amount: ${pledgeAmount}`);
      // If in Farcaster frame, use writeContract directly to trigger the frame wallet
      if (isInFrame) {
        setDebugInfo('In Farcaster frame, using writeContract for pledge');
        const result = await writeContract({
          address: SOLAR_PLEDGE_ADDRESS,
          abi: SolarPledgeABI,
          functionName: 'createPledge',
          args: [commitment, farcasterHandle, BigInt(pledgeAmount * 1_000_000)],
        });
        setDebugInfo('writeContract for pledge called successfully');
        // The transaction hash will be handled by the useWaitForTransactionReceipt hook
      } else {
        setDebugInfo('Using wallet client for pledge');
        // For regular wallets, use the wallet client
        if (!walletClient) {
          setError(new Error("No wallet client available"));
          setIsLoading(false);
          return;
        }
        const hash = await walletClient.writeContract({
          address: SOLAR_PLEDGE_ADDRESS,
          abi: SolarPledgeABI,
          functionName: 'createPledge',
          args: [commitment, farcasterHandle, BigInt(pledgeAmount * 1_000_000)],
        });
        setDebugInfo(hash ? `Pledge Tx Hash: ${hash}` : 'No pledge transaction hash returned');
        setTxHash(hash);
      }
      await refetchPledged();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create pledge'));
      setDebugInfo(`Error in createPledge: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  // Check if approved for the current pledge amount
  const isApproved = (amount: number) => {
    if (typeof allowance === 'bigint') {
      const isApproved = allowance >= BigInt(amount * 1_000_000);
      setDebugInfo(`Checking approval: amount=${amount}, allowance=${allowance}, isApproved=${isApproved}`);
      return isApproved;
    }
    setDebugInfo('No allowance data available');
    return false;
  };

  // Effect: refetch allowance when address changes
  React.useEffect(() => {
    if (address) {
      refetchAllowance();
    }
  }, [address, refetchAllowance]);

  return {
    approveUSDC,
    createPledge,
    isApproved,
    isLoading: isLoading || isPledgePending || isConfirming,
    error,
    hasPledged,
    debugInfo,
    allowance,
    isApprovalPending,
    isApprovalConfirmed,
  };
} 