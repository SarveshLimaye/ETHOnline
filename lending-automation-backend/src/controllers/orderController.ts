import { Request, Response } from "express";
import Order from "../models/Order";
import { OrderType } from "../types";
import { addMarketApproval } from "../lit-automated-jobs/erc20Approval";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData: OrderType = req.body;
    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({ message: "Error creating order", error });
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
