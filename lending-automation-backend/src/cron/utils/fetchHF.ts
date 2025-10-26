import { ethers } from "ethers";
import { AaveV3BaseSepolia } from "@bgd-labs/aave-address-book";
import dotenv from "dotenv";

dotenv.config();

const POOL_DATA_PROVIDER_ABI = [
  "function getUserAccountData(address user) view returns (uint256,uint256,uint256,uint256,uint256,uint256)",
];

const provider = new ethers.providers.JsonRpcProvider(
  process.env.BASE_SEPOLIA_RPC as string
);

export const fetchHF = async (userAddress: `0x${string}`): Promise<number> => {
  const dataProvider = new ethers.Contract(
    AaveV3BaseSepolia.POOL as `0x${string}`,
    POOL_DATA_PROVIDER_ABI,
    provider
  );

  const [, , , , , healthFactor] = await dataProvider.getUserAccountData(
    userAddress
  );

  // Aave returns healthFactor with 18 decimals (ray units)
  const hf = Number(ethers.utils.formatUnits(healthFactor, 18));

  return hf;
};
