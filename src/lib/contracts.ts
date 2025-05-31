export const SOLAR_PLEDGE_ADDRESS = process.env.NEXT_PUBLIC_SOLAR_PLEDGE_ADDRESS as `0x${string}`;
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

// Import ABIs
import SolarPledgeArtifact from '../../artifacts/contracts/SolarPledge.sol/SolarPledge.json';
import USDCArtifact from '../../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json';

export const SolarPledgeABI = SolarPledgeArtifact.abi;
export const USDC_ABI = USDCArtifact.abi; 