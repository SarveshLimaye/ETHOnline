import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

export const delegateeSigner = new ethers.Wallet(
  process.env.VINCENT_DELEGATEE_PRIVATE_KEY as string,
  new ethers.providers.StaticJsonRpcProvider(
    process.env.CHRONICLE_YELLOWSTONE_RPC
  )
);

export const readOnlySigner = new ethers.Wallet(
  ethers.Wallet.createRandom().privateKey,
  new ethers.providers.JsonRpcProvider(process.env.CHRONICLE_YELLOWSTONE_RPC)
);
