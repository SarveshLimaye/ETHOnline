import { env } from "../../config/env";
import { CHAINLINK_ABI } from "../abi/chainlink";
import { ethers } from "ethers";
import { AaveV3BaseSepolia } from "@bgd-labs/aave-address-book";
const { VITE_BASE_SEPOLIA_RPC } = env;

const provider = new ethers.providers.JsonRpcProvider(VITE_BASE_SEPOLIA_RPC);

export const getOracleAddress = (assetAddress: string) => {
  console.log("Getting oracle for asset:", assetAddress);
  switch (assetAddress.toLowerCase()) {
    case AaveV3BaseSepolia.ASSETS.USDC.UNDERLYING.toLowerCase():
      return AaveV3BaseSepolia.ASSETS.USDC.ORACLE;
    case AaveV3BaseSepolia.ASSETS.USDT.UNDERLYING.toLowerCase():
      return AaveV3BaseSepolia.ASSETS.USDT.ORACLE;
    case AaveV3BaseSepolia.ASSETS.cbETH.UNDERLYING.toLowerCase():
      return AaveV3BaseSepolia.ASSETS.cbETH.ORACLE;
    case AaveV3BaseSepolia.ASSETS.WBTC.UNDERLYING.toLowerCase():
      return AaveV3BaseSepolia.ASSETS.WBTC.ORACLE;
    default:
      return null;
  }
};

export const fetchOraclePrice = async (
  oracleAddress: string
): Promise<number> => {
  console.log("Fetching price from oracle:", oracleAddress);
  const oracle = new ethers.Contract(oracleAddress, CHAINLINK_ABI, provider);

  const [, answer] = await oracle.latestRoundData();
  const decimals = await oracle.decimals();

  return Number(answer) / Math.pow(10, Number(decimals));
};
