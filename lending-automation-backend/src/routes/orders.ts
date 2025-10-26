import express from "express";
import {
  createOrder,
  deleteOrder,
  getOrders,
  getOrdersByAddress,
  litAutomatedApproval,
  litAutomatedBorrow,
  litAutomatedSupply,
  litAutomateRepay,
  litAutomateWithdraw,
} from "../controllers/orderController";
import { de } from "@bgd-labs/aave-address-book/dist/ChainlinkEthereum-D8TcJjne";

const router = express.Router();

// Route to create a new order
router.post("/orders", createOrder);

router.get("/orders", getOrders);
router.get("/orders/user/:ethAddress", getOrdersByAddress);
router.post("/orders/lit-approve", litAutomatedApproval);
router.post("/orders/lit-supply", litAutomatedSupply);
router.post("/orders/lit-borrow", litAutomatedBorrow);
router.post("/orders/lit-withdraw", litAutomateWithdraw);
router.post("/orders/lit-repay", litAutomateRepay);
router.delete("/orders/:id", deleteOrder);

export default router;
