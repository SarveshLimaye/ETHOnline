import mongoose, { Schema } from "mongoose";

const orderSchema: Schema = new Schema(
  {
    ethAddress: { type: String, required: true },
    collateralPriceMax: { type: Number, required: true },
    collateralPriceMin: { type: Number, required: true },
    collateralMarketAddress: { type: String, required: true },
    loanTokenMarketAddress: { type: String, required: true },
    loanTokenPriceMin: { type: Number, required: true },
    loanTokenPriceMax: { type: Number, required: true },
    orderType: {
      type: String,
      enum: ["automatedLeverageManagement", "stopLoss", "takeProfit"],
      required: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
