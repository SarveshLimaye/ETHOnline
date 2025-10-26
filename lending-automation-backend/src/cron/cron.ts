//@ts-ignore
import { CHAINLINK_ABI } from "../utils/abi/chainlink";
import Order from "../models/Order";
import { ethers } from "ethers";
import dotenv from "dotenv";

import { AaveV3BaseSepolia } from "@bgd-labs/aave-address-book";
import {
  handleAutomatedLeverageManagement,
  handleStopLoss,
  handleTakeProfit,
} from "./utils/helper";

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(
  process.env.BASE_SEPOLIA_RPC
);

export const rebalancePositions = async () => {
  try {
    console.log("Rebalancing positions...");
    const orders = await Order.find();
    console.log("Fetched orders:", orders.length);
    for (const order of orders) {
      console.log("Processing order:", order);
      const { ethAddress, collateralAsset, loanAsset, healthRatioToMaintain } =
        order;

      console.log(collateralAsset, loanAsset);
      const collateralOracleAddress = getOracleAddress(
        collateralAsset as string
      );

      console.log("Collateral Oracle Address:", collateralOracleAddress);

      const loanOracleAddress = getOracleAddress(loanAsset as string);

      const oracleAddress = collateralOracleAddress && loanOracleAddress;
      if (!oracleAddress) continue;

      const [collateralPrice, loanPrice] = await Promise.all([
        fetchOraclePrice(collateralOracleAddress as string),
        fetchOraclePrice(loanOracleAddress as string),
      ]);

      console.log(
        `Collateral Price: ${collateralPrice}, Loan Price: ${loanPrice}`
      );

      if (order.orderType === "takeProfit") {
        handleTakeProfit(order, collateralPrice);
      } else if (order.orderType === "stopLoss") {
        handleStopLoss(order, collateralPrice);
      } else if (order.orderType === "automatedLeverageManagement") {
        handleAutomatedLeverageManagement(order, collateralPrice, loanPrice);
      }
    }
  } catch (error) {
    console.error("Error in rebalancePositions:", error);
  }
};

const getOracleAddress = (assetAddress: string) => {
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

const fetchOraclePrice = async (oracleAddress: string): Promise<number> => {
  const oracle = new ethers.Contract(oracleAddress, CHAINLINK_ABI, provider);

  const [, answer] = await oracle.latestRoundData();
  const decimals = await oracle.decimals();

  return Number(answer) / Math.pow(10, Number(decimals));
};
