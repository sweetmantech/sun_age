import { useReadContract } from 'wagmi';
import { SOLAR_PLEDGE_ADDRESS, SolarPledgeABI } from '~/lib/contracts';

// Define the ConvergencePeriod type
export type ConvergencePeriod = {
  startTime: bigint;
  endTime: bigint;
  periodTotalPledges: bigint;
  totalVolume: bigint;
  isActive: boolean;
};

export function useConvergenceStats() {
  // Get the current convergence period index
  const { data: currentPeriodIndex } = useReadContract({
    address: SOLAR_PLEDGE_ADDRESS,
    abi: SolarPledgeABI,
    functionName: 'getCurrentConvergencePeriodIndex',
    args: [],
    query: { enabled: true },
  });

  // Get the convergence period details
  const { data: periodRaw } = useReadContract({
    address: SOLAR_PLEDGE_ADDRESS,
    abi: SolarPledgeABI,
    functionName: 'getConvergencePeriod',
    args: currentPeriodIndex !== undefined ? [currentPeriodIndex] : [BigInt(0)],
    query: { 
      enabled: currentPeriodIndex !== undefined && 
               currentPeriodIndex !== null && 
               currentPeriodIndex !== BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') 
    },
  });
  const period = periodRaw as ConvergencePeriod | undefined;

  // Parse stats
  let numVows: number | undefined = undefined;
  let totalPooled: number | undefined = undefined;
  let daysRemaining: number | undefined = undefined;

  if (period) {
    numVows = Number(period.periodTotalPledges);
    totalPooled = Number(period.totalVolume) / 1e6;
    const now = Math.floor(Date.now() / 1000);
    daysRemaining = Math.max(0, Math.ceil((Number(period.endTime) - now) / 86400));
  }

  return { numVows, totalPooled, daysRemaining };
} 