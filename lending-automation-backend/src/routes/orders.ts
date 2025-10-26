import express from "express";
import {
  createOrder,
  getOrders,
  litAutomatedApproval,
  litAutomatedBorrow,
  litAutomatedSupply,
} from "../controllers/orderController";

const router = express.Router();

// Route to create a new order
router.post("/orders", createOrder);

router.get("/orders", getOrders);
router.post("/orders/lit-approve", litAutomatedApproval);
router.post("/orders/lit-supply", litAutomatedSupply);
router.post("/orders/lit-borrow", litAutomatedBorrow);

export default router;
