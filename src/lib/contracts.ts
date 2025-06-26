export const SOLAR_PLEDGE_ADDRESS = process.env.NEXT_PUBLIC_SOLAR_PLEDGE_ADDRESS as `0x${string}`;
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

// Define ABIs directly instead of importing artifacts
export const SolarPledgeABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_usdcToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_treasuryAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint96",
        "name": "_newStartTimestamp",
        "type": "uint96"
      },
      {
        "internalType": "uint96",
        "name": "_newEndTimestamp",
        "type": "uint96"
      }
    ],
    "name": "adjustConvergencePeriod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentConvergencePeriodIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "getConvergencePeriod",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint96",
            "name": "startTime",
            "type": "uint96"
          },
          {
            "internalType": "uint96",
            "name": "endTime",
            "type": "uint96"
          },
          {
            "internalType": "uint96",
            "name": "periodTotalPledges",
            "type": "uint96"
          },
          {
            "internalType": "uint256",
            "name": "totalVolume",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct SolarPledge.ConvergencePeriod",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_pledger",
        "type": "address"
      }
    ],
    "name": "getPledge",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "pledger",
            "type": "address"
          },
          {
            "internalType": "uint96",
            "name": "pledgeNumber",
            "type": "uint96"
          },
          {
            "internalType": "uint96",
            "name": "pledgeTimestamp",
            "type": "uint96"
          },
          {
            "internalType": "uint128",
            "name": "usdcPaid",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "surplusAmount",
            "type": "uint128"
          },
          {
            "internalType": "uint64",
            "name": "solarAge",
            "type": "uint64"
          },
          {
            "internalType": "bytes32",
            "name": "commitmentHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "farcasterHandle",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "commitmentText",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct SolarPledge.Pledge",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "hasPledge",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const USDC_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const; 