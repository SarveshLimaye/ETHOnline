export interface OrderType {
  ethAddress: string;
  collateralPriceMax: number;
  collateralPriceMin: number;
  collateralAsset: string;
  loanAsset: string;
  orderType: "automatedLeverageManagement" | "stopLoss" | "takeProfit";
  healthRatioToMaintain?: number;
  collateralAmount: number;
  borrowAmount: number;
}
