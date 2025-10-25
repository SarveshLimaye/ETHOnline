export interface OrderType {
  ethAddress: string;
  collateralPriceMax: number;
  collateralPriceMin: number;
  collateralAsset: string;
  loanAsset: string;
  orderType: "automatedLeverageManagement" | "stopLoss" | "takeProfit";
  loanTokenPriceMin: { type: Number; required: true };
  loanTokenPriceMax: { type: Number; required: true };
}
