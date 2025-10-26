//@ts-ignore
import { ethers } from "ethers";
import { AaveV3BaseSepolia } from "@bgd-labs/aave-address-book";

import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(
  process.env.BASE_SEPOLIA_RPC
);

const ABI = [
  "function getReserveConfigurationData(address asset) external view returns (uint256 decimals, uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen)",
];

export async function getMaxLTV(assetAddress: string) {
  console.log("Fetching LTV for asset:", assetAddress);
  const dataProvider = new ethers.Contract(
    AaveV3BaseSepolia.AAVE_PROTOCOL_DATA_PROVIDER,
    ABI,
    provider
  );

  const config = await dataProvider.getReserveConfigurationData(assetAddress);

  // LTV is returned in basis points (e.g., 8000 = 80%)
  const ltvBasisPoints = config.ltv;
  const ltvPercentage = Number(ltvBasisPoints) / 100;

  return {
    ltv: ltvPercentage,
    liquidationThreshold: Number(config.liquidationThreshold) / 100,
    usageAsCollateralEnabled: config.usageAsCollateralEnabled,
    isActive: config.isActive,
  };
}
