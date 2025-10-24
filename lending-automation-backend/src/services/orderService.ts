import Order from "../models/Order";

export const createOrder = async (orderData: any) => {
  try {
    const order = new Order(orderData);
    await order.save();
    return order;
  } catch (error) {
    throw new Error("Error creating order: " + error.message);
  }
};

export const getOrders = async (ethAddress: string) => {
  try {
    const orders = await Order.find({ ethAddress });
    return orders;
  } catch (error) {
    throw new Error("Error retrieving orders: " + error.message);
  }
};

export const updateOrder = async (orderId: any, updateData: any) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });
    return updatedOrder;
  } catch (error) {
    throw new Error("Error updating order: " + error.message);
  }
};

export const deleteOrder = async (orderId) => {
  try {
    await Order.findByIdAndDelete(orderId);
    return { message: "Order deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting order: " + error.message);
  }
};
