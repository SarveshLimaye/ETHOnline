import express from "express";
import { createOrder, getOrders } from "../controllers/orderController";

const router = express.Router();

// Route to create a new order
router.post("/orders", createOrder);

router.get("/orders", getOrders);

export default router;
