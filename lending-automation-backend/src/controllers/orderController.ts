import { Request, Response } from "express";
import Order from "../models/Order";
import { OrderType } from "../types";
import { AaveV3BaseSepolia } from "@bgd-labs/aave-address-book";
import { addMarketApproval } from "../lit-automated-jobs/erc20Approval";
import { aaveOperation } from "../lit-automated-jobs/aave/aaveOperations";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

export const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData: OrderType = req.body;
    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json({
      order: newOrder,
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({ message: "Error creating order", error });
  }
};

export const litAutomatedApproval = async (req: Request, res: Response) => {
  try {
    const ERC20_ABI = ["function decimals() view returns (uint8)"];

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.BASE_SEPOLIA_RPC
    );

    // Create a token contract instance
    const tokenContract = new ethers.Contract(
      req.body.asset,
      ERC20_ABI,
      provider
    );

    // Fetch decimals dynamically
    const decimals: number = await tokenContract.decimals();

    const approvalTx = await addMarketApproval({
      ethAddress: req.body.ethAddress,
      marketAddress: AaveV3BaseSepolia.POOL,
      tokenAddress: req.body.asset,
      tokenAmount: Number(req.body.amount) * 10 ** decimals,
      decimals: decimals,
      chainId: AaveV3BaseSepolia.CHAIN_ID,
      rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
    });

    console.log("Approval Tx:", approvalTx);

    let approvalResp =
      approvalTx === undefined ? "Already enough approval" : approvalTx;

    res.status(200).json({ txHash: approvalResp, status: "success" });
  } catch (error) {
    console.error("Error in approval:", error);
    res.status(500).json({ message: "Error during approval", error });
  }
};

export const litAutomatedSupply = async (req: Request, res: Response) => {
  try {
    const supplyTx = await aaveOperation({
      ethAddress: req.body.ethAddress,
      operation: "supply",
      asset: req.body.asset,
      amount: req.body.amount,
      chain: "baseSepolia",
      rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
    });

    console.log("Supply Tx:", supplyTx);

    res.status(200).json({ txHash: supplyTx, status: "success" });
  } catch (error) {
    console.error("Error in supply:", error);
    res.status(500).json({ message: "Error during supply", error });
  }
};

export const litAutomateRepay = async (req: Request, res: Response) => {
  try {
    const repayTx = await aaveOperation({
      ethAddress: req.body.ethAddress,
      operation: "repay",
      asset: req.body.asset,
      amount: req.body.amount,
      chain: "baseSepolia",
      rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
    });

    res.status(200).json({ txHash: repayTx, status: "success" });
  } catch (error) {
    console.error("Error in repay:", error);
    res.status(500).json({ message: "Error during repay", error });
  }
};

export const litAutomateWithdraw = async (req: Request, res: Response) => {
  try {
    const withdrawTx = await aaveOperation({
      ethAddress: req.body.ethAddress,
      operation: "withdraw",
      asset: req.body.asset,
      amount: req.body.amount,
      chain: "baseSepolia",
      rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
    });

    res.status(200).json({ txHash: withdrawTx, status: "success" });
  } catch (error) {
    console.error("Error in withdraw:", error);
    res.status(500).json({ message: "Error during withdraw", error });
  }
};

export const litAutomatedBorrow = async (req: Request, res: Response) => {
  try {
    const borrowTx = await aaveOperation({
      ethAddress: req.body.ethAddress,
      operation: "borrow",
      asset: req.body.asset,
      amount: req.body.amount,
      chain: "baseSepolia",
      rpcUrl: process.env.BASE_SEPOLIA_RPC as string,
    });

    res.status(200).json({ txHash: borrowTx, status: "success" });
  } catch (error) {
    console.error("Error in borrow:", error);
    res.status(500).json({ message: "Error during borrow", error });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
};

export const getOrdersByAddress = async (req: Request, res: Response) => {
  try {
    const { ethAddress } = req.params;

    console.log("Fetching orders for address:", ethAddress);

    // Remove the 'where' wrapper - just pass the query object directly
    const orders = await Order.find({ ethAddress: ethAddress });

    console.log("Fetched orders:", orders);
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders by address", error });
  }
};
