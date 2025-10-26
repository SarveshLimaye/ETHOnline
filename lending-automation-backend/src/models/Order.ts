import mongoose, { Schema } from "mongoose";

const orderSchema: Schema = new Schema(
  {
    ethAddress: { type: String, required: true },
    collateralPriceMax: { type: Number, required: true },
    collateralPriceMin: { type: Number, required: true },
    collateralAsset: { type: String, required: true },
    collateralAmount: { type: Number, required: true },
    borrowAmount: { type: Number, required: true },
    loanAsset: { type: String, required: true },
    orderType: {
      type: String,
      enum: ["automatedLeverageManagement", "stopLoss", "takeProfit"],
      required: true,
    },
    healthRatioToMaintain: { type: Number, default: 150 },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
