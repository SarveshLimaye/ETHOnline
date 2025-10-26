//@ts-ignore
import { aaveOperation } from "../../lit-automated-jobs/aave/aaveOperations";
import { addMarketApproval } from "../../lit-automated-jobs/erc20Approval";
import { OrderType } from "../../types";
import dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";
import { AaveV3BaseSepolia } from "@bgd-labs/aave-address-book";
import { deleteOrder } from "../../services/orderService";
import { fetchHF } from "./fetchHF";
import { getMaxLTV } from "./fetchLtv";

export const handleStopLoss = async (
  order: any,
  currCollateralPrice: number
) => {
  try {
    if (order.collateralPriceMin <= currCollateralPrice) {
      const ERC20_ABI = ["function decimals() view returns (uint8)"];

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.BASE_SEPOLIA_RPC
      );

      // Create a token contract instance
      const tokenContract = new ethers.Contract(
        order.loanAsset,
        ERC20_ABI,
        provider
      );

      const decimals: number = await tokenContract.decimals();
      // First approve the Aave market to spend the debt asset
      const approvalResp = await addMarketApproval({
        ethAddress: order.ethAddress as `0x${string}`,
        marketAddress: AaveV3BaseSepolia.POOL as `0x${string}`,
        tokenAddress: order.loanAsset as `0x${string}`,
        tokenAmount: Number(order.borrowAmount) * 10 ** decimals,
        decimals: decimals, // Fetch dynamically if needed
        chainId: AaveV3BaseSepolia.CHAIN_ID, // Sepolia chain ID
        rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
      });

      console.log("Approval Response:", approvalResp);

      // Repay the debt
      const repayResp = await aaveOperation({
        ethAddress: order.ethAddress as `0x${string}`,
        asset: order.loanAsset as `0x${string}`,
        amount: order.borrowAmount,
        rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
        chain: "baseSepolia",
        operation: "repay",
      });

      console.log("Repay Response:", repayResp);

      // Withdraw the collateral
      const withdrawResp = await aaveOperation({
        ethAddress: order.ethAddress as `0x${string}`,
        asset: order.collateralAsset as `0x${string}`,
        amount: order.collateralAmount,
        rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
        chain: "baseSepolia",
        operation: "withdraw",
      });

      console.log("Withdraw Response:", withdrawResp);

      deleteOrder(order._id);
    }
  } catch (error) {
    console.error("Error in handleStopLoss:", error);
  }
};

export const handleTakeProfit = async (
  order: any,
  currCollateralPrice: number
) => {
  try {
    if (order.collateralPriceMin <= currCollateralPrice) {
      const ERC20_ABI = ["function decimals() view returns (uint8)"];

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.BASE_SEPOLIA_RPC
      );

      // Create a token contract instance
      const tokenContract = new ethers.Contract(
        order.loanAsset,
        ERC20_ABI,
        provider
      );

      const decimals: number = await tokenContract.decimals();
      // First approve the Aave market to spend the debt asset
      const approvalResp = addMarketApproval({
        ethAddress: order.ethAddress as `0x${string}`,
        marketAddress: AaveV3BaseSepolia.POOL as `0x${string}`,
        tokenAddress: order.loanAsset as `0x${string}`,
        tokenAmount: Number(order.borrowAmount) * 10 ** decimals,
        decimals: decimals, // Fetch dynamically if needed
        chainId: AaveV3BaseSepolia.CHAIN_ID, // Sepolia chain ID
        rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
      });

      console.log("Approval Response:", approvalResp);

      // Repay the debt
      const repayResp = await aaveOperation({
        ethAddress: order.ethAddress as `0x${string}`,
        asset: order.loanAsset as `0x${string}`,
        amount: order.borrowAmount,
        rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
        chain: "baseSepolia",
        operation: "repay",
      });

      console.log("Repay Response:", repayResp);

      // Withdraw the collateral
      const withdrawResp = await aaveOperation({
        ethAddress: order.ethAddress as `0x${string}`,
        asset: order.collateralAsset as `0x${string}`,
        amount: order.collateralAmount,
        rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
        chain: "baseSepolia",
        operation: "withdraw",
      });

      console.log("Withdraw Response:", withdrawResp);
    }
  } catch (error) {
    console.error("Error in handleStopLoss:", error);
  }
};

export const handleAutomatedLeverageManagement = async (
  order: any,
  collateralPrice: number,
  debtTokenPrice: number
) => {
  const currentHF = await fetchHF(order.ethAddress as `0x${string}`);

  if (currentHF <= order.healthRatioToMaintain / 100) {
    const ERC20_ABI = ["function decimals() view returns (uint8)"];

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.BASE_SEPOLIA_RPC
    );

    // Create a token contract instance
    const tokenContract = new ethers.Contract(
      order.loanAsset,
      ERC20_ABI,
      provider
    );

    const decimals: number = await tokenContract.decimals();

    console.log(`Current HF of ${order.ethAddress}: ${currentHF}`);

    // maintain ratio as percent → convert to Aave HF scale
    console.log(
      order.collateralAmount,
      "collateral amount for ",
      order.ethAddress
    );
    const collateralValue = order.collateralAmount * collateralPrice;

    console.log(`Collateral value for ${order.ethAddress}: ${collateralValue}`);
    const ltvResp = await getMaxLTV(order.collateralAsset as `0x${string}`);
    const borrowToMaintain =
      (collateralValue * ltvResp.ltv) / order.healthRatioToMaintain;

    const repayAmount = order.borrowAmount - borrowToMaintain;

    // First approve the Aave market to spend the debt asset
    const approvalResp = await addMarketApproval({
      ethAddress: order.ethAddress as `0x${string}`,
      marketAddress: AaveV3BaseSepolia.POOL as `0x${string}`,
      tokenAddress: order.loanAsset as `0x${string}`,
      tokenAmount: Number(repayAmount) * 10 ** decimals,
      decimals: decimals, // Fetch dynamically if needed
      chainId: AaveV3BaseSepolia.CHAIN_ID, // Sepolia chain ID
      rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
    });

    console.log("Approval Response:", approvalResp);

    // Repay the debt
    const repayResp = await aaveOperation({
      ethAddress: order.ethAddress as `0x${string}`,
      asset: order.loanAsset as `0x${string}`,
      amount: order.repayAmount,
      rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
      chain: "baseSepolia",
      operation: "repay",
    });

    console.log("Repay Response:", repayResp);
  }
};
