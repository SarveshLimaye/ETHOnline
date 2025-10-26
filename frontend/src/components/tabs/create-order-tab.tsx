import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import { TOKENS } from "../../utils/tokens";
import {
  fetchOraclePrice,
  getOracleAddress,
} from "../../utils/fetchPrice/fetchPrice";
import { getMaxLTV } from "../../utils/aave/ltv";

import { TransactionModal } from "../Modal";

interface CreateOrderTabProps {
  userAddress: string;
}

interface StopLossFormData {
  collateralAsset: string;
  debtAsset: string;
  collateralAmount: string;
  borrowAmount: string;
  minCollateralPrice: string;
}

interface TakeProfitFormData {
  collateralAsset: string;
  debtAsset: string;
  collateralAmount: string;
  borrowAmount: string;
  maxCollateralPrice: string;
}

interface LeveragedAutomationFormData {
  healthRatioToMaintain: string;
  collateralAsset: string;
  debtAsset: string;
  collateralAmount: string;
  borrowAmount: string;
}

interface TransactionStep {
  name: string;
  status: "pending" | "loading" | "success" | "error";
  txHash?: string;
  error?: string;
}

export function CreateOrderTab({ userAddress }: CreateOrderTabProps) {
  const [orderType, setOrderType] = useState<
    "stopLoss" | "takeProfit" | "automatedLeverageManagement"
  >("stopLoss");

  const {
    createOrder,
    litAutomatedApproval,
    litAutomatedSupply,
    litAutomatedBorrow,
  } = useBackend();

  const [stopLossForm, setStopLossForm] = useState<StopLossFormData>({
    collateralAsset: "cbETH",
    debtAsset: "USDC",
    collateralAmount: "",
    borrowAmount: "",
    minCollateralPrice: "",
  });

  const [takeProfitForm, setTakeProfitForm] = useState<TakeProfitFormData>({
    collateralAsset: "cbETH",
    debtAsset: "USDC",
    collateralAmount: "",
    borrowAmount: "",
    maxCollateralPrice: "",
  });

  const [leveragedForm, setLeveragedForm] =
    useState<LeveragedAutomationFormData>({
      healthRatioToMaintain: "",
      collateralAsset: "cbETH",
      debtAsset: "USDC",
      collateralAmount: "",
      borrowAmount: "",
    });

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submittingType, setSubmittingType] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const [maxBorrowLeveraged, setMaxBorrowLeveraged] = useState<number>(0);
  const [maxBorrowStopLoss, setMaxBorrowStopLoss] = useState<number>(0);
  const [maxBorrowTakeProfit, setMaxBorrowTakeProfit] = useState<number>(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionSteps, setTransactionSteps] = useState<TransactionStep[]>([
    { name: "Approve", status: "pending" },
    { name: "Supply", status: "pending" },
    { name: "Borrow", status: "pending" },
  ]);

  // Fetch max borrow when relevant inputs change
  useEffect(() => {
    const fetchMaxBorrow = async () => {
      if (
        orderType === "stopLoss" &&
        stopLossForm.collateralAsset &&
        stopLossForm.debtAsset &&
        stopLossForm.collateralAmount
      ) {
        await calculateMaxBorrowAmount(
          "stopLoss",
          TOKENS.baseSepolia[
            stopLossForm.collateralAsset as keyof typeof TOKENS.baseSepolia
          ],
          TOKENS.baseSepolia[
            stopLossForm.debtAsset as keyof typeof TOKENS.baseSepolia
          ],
          stopLossForm.collateralAmount
        );
      } else if (
        orderType === "automatedLeverageManagement" &&
        leveragedForm.collateralAsset &&
        leveragedForm.debtAsset &&
        leveragedForm.collateralAmount &&
        leveragedForm.healthRatioToMaintain
      ) {
        await calculateMaxBorrowAmount(
          "automatedLeverageManagement",
          TOKENS.baseSepolia[
            leveragedForm.collateralAsset as keyof typeof TOKENS.baseSepolia
          ],
          TOKENS.baseSepolia[
            leveragedForm.debtAsset as keyof typeof TOKENS.baseSepolia
          ],
          leveragedForm.collateralAmount,
          Number.parseFloat(leveragedForm.healthRatioToMaintain)
        );
      } else if (orderType === "takeProfit" && takeProfitForm.collateralAsset) {
        await calculateMaxBorrowAmount(
          "takeProfit",
          TOKENS.baseSepolia[
            takeProfitForm.collateralAsset as keyof typeof TOKENS.baseSepolia
          ],
          TOKENS.baseSepolia[
            takeProfitForm.debtAsset as keyof typeof TOKENS.baseSepolia
          ],
          takeProfitForm.collateralAmount
        );
      }
    };

    fetchMaxBorrow();
  }, [
    leveragedForm.collateralAsset,
    leveragedForm.debtAsset,
    leveragedForm.collateralAmount,
    leveragedForm.healthRatioToMaintain,
    stopLossForm.collateralAsset,
    stopLossForm.debtAsset,
    stopLossForm.collateralAmount,
    stopLossForm.minCollateralPrice,
    takeProfitForm.collateralAsset,
    takeProfitForm.debtAsset,
    takeProfitForm.collateralAmount,
  ]);

  const calculateMaxBorrowAmount = async (
    orderType: string,
    collateralToken: string,
    borrowToken: string,
    collateralAmount: string,
    healthRatioToMaintain?: number
  ): Promise<number> => {
    const collateralPrice = await fetchOraclePrice(
      getOracleAddress(collateralToken) as string
    );

    const resp = await getMaxLTV(collateralToken);

    let borrowAmount;

    if (orderType === "automatedLeverageManagement" && healthRatioToMaintain) {
      console.log(collateralAmount, collateralPrice, healthRatioToMaintain);
      borrowAmount =
        (Number(collateralAmount) *
          Number(collateralPrice) *
          Number(resp.ltv)) /
        healthRatioToMaintain;

      console.log("Max Borrow (Leverage):", borrowAmount);

      setMaxBorrowLeveraged(borrowAmount);
    } else if (orderType === "stopLoss") {
      borrowAmount =
        (Number(collateralAmount) *
          Number(stopLossForm.minCollateralPrice) *
          Number(resp.ltv)) /
        100;

      console.log("Max Borrow (Stop Loss):", borrowAmount);
      setMaxBorrowStopLoss(borrowAmount);
    } else if (orderType === "takeProfit") {
      borrowAmount =
        (Number(collateralAmount) *
          Number(collateralPrice) *
          Number(resp.ltv)) /
        100;

      console.log("Max Borrow (Take Profit):", borrowAmount);
      setMaxBorrowTakeProfit(borrowAmount);
    }

    return borrowAmount || 0;
  };

  const validateBorrowAmount = (
    borrowAmount: string,
    maxBorrow: number
  ): boolean => {
    if (!borrowAmount) return false;
    return Number.parseFloat(borrowAmount) <= maxBorrow;
  };

  const updateTransactionStep = (
    stepIndex: number,
    updates: Partial<TransactionStep>
  ) => {
    setTransactionSteps((prev) =>
      prev.map((step, idx) =>
        idx === stepIndex ? { ...step, ...updates } : step
      )
    );
  };

  const handleStopLossSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingType("stopLoss");
    setSubmitStatus("idle");
    const orderType = "stopLoss";
    const collateralTokenAddress: string =
      TOKENS.baseSepolia[
        stopLossForm.collateralAsset as keyof typeof TOKENS.baseSepolia
      ] ?? "";

    const debtTokenAddress: string =
      TOKENS.baseSepolia[
        stopLossForm.debtAsset as keyof typeof TOKENS.baseSepolia
      ] ?? "";

    if (!validateBorrowAmount(stopLossForm.borrowAmount, maxBorrowStopLoss)) {
      setSubmitStatus("error");
      setSubmittingType(null);
      return;
    }

    const collateralPriceMax = 0;
    const collateralPriceMin = Number.parseFloat(
      stopLossForm.minCollateralPrice
    );

    setIsModalOpen(true);
    updateTransactionStep(0, { status: "loading" });
    const approvalResp = await litAutomatedApproval({
      ethAddress: userAddress,
      asset: collateralTokenAddress,
      amount: Number.parseFloat(stopLossForm.collateralAmount),
    });

    updateTransactionStep(0, {
      status: "success",
      txHash: approvalResp?.txHash || "0x...",
    });

    // Step 2: Supply
    updateTransactionStep(1, { status: "loading" });
    const supplyResp = await litAutomatedSupply({
      ethAddress: userAddress,
      asset: collateralTokenAddress,
      amount: Number.parseFloat(stopLossForm.collateralAmount),
    });

    console.log("Supply Tx Hash:", supplyResp);

    updateTransactionStep(1, {
      status: "success",
      txHash: supplyResp?.txHash || "0x...",
    });

    if (supplyResp.status === "success") {
      updateTransactionStep(2, { status: "loading" });
      const borrowResp = await litAutomatedBorrow({
        ethAddress: userAddress,
        asset: debtTokenAddress,
        amount: Number.parseFloat(stopLossForm.borrowAmount),
      });

      updateTransactionStep(2, {
        status: "success",
        txHash: borrowResp?.txHash || "0x...",
      });

      console.log("Borrow", borrowResp);

      createOrder({
        ethAddress: userAddress,
        collateralAsset: collateralTokenAddress,
        loanAsset: debtTokenAddress,
        collateralPriceMax,
        collateralPriceMin,
        orderType,
        collateralAmount: Number.parseFloat(stopLossForm.collateralAmount),
        borrowAmount: Number.parseFloat(stopLossForm.borrowAmount),
      });

      setSubmitStatus("success");
      setSubmittingType(null);
    }
  };

  const handleTakeProfitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingType("takeProfit");
    setSubmitStatus("idle");
    const collateralTokenAddress: string =
      TOKENS.baseSepolia[
        takeProfitForm.collateralAsset as keyof typeof TOKENS.baseSepolia
      ] ?? "";

    const debtTokenAddress: string =
      TOKENS.baseSepolia[
        takeProfitForm.debtAsset as keyof typeof TOKENS.baseSepolia
      ] ?? "";

    const orderType = "takeProfit";

    if (
      !validateBorrowAmount(takeProfitForm.borrowAmount, maxBorrowTakeProfit)
    ) {
      setSubmitStatus("error");
      setSubmittingType(null);
      return;
    }

    const collateralPriceMax = Number.parseFloat(
      takeProfitForm.maxCollateralPrice
    );
    const collateralPriceMin = 0;

    setIsModalOpen(true);
    updateTransactionStep(0, { status: "loading" });
    const approvalResp = await litAutomatedApproval({
      ethAddress: userAddress,
      asset: collateralTokenAddress,
      amount: Number.parseFloat(takeProfitForm.collateralAmount),
    });

    updateTransactionStep(0, {
      status: "success",
      txHash: approvalResp?.txHash || "0x...",
    });

    console.log("Approval Tx Hash:", approvalResp);

    // Step 2: Supply
    updateTransactionStep(1, { status: "loading" });

    const supplyResp = await litAutomatedSupply({
      ethAddress: userAddress,
      asset: collateralTokenAddress,
      amount: Number.parseFloat(takeProfitForm.collateralAmount),
    });

    console.log("Supply Tx Hash:", supplyResp);

    updateTransactionStep(1, {
      status: "success",
      txHash: supplyResp?.txHash || "0x...",
    });

    if (supplyResp.status === "success") {
      createOrder({
        ethAddress: userAddress,
        collateralAsset: collateralTokenAddress,
        loanAsset: debtTokenAddress,
        collateralPriceMax,
        collateralPriceMin,
        orderType,
        collateralAmount: Number.parseFloat(takeProfitForm.collateralAmount),
        borrowAmount: Number.parseFloat(takeProfitForm.borrowAmount),
      });

      updateTransactionStep(2, { status: "loading" });

      const borrowResp = await litAutomatedBorrow({
        ethAddress: userAddress,
        asset: debtTokenAddress,
        amount: Number.parseFloat(takeProfitForm.borrowAmount),
      });

      updateTransactionStep(2, {
        status: "success",
        txHash: borrowResp?.txHash || "0x...",
      });

      console.log("Borrow Tx Hash:", borrowResp);

      setSubmitStatus("success");
      setSubmittingType(null);
    }
  };

  const handleLeveragedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingType("automatedLeverageManagement");
    setSubmitStatus("idle");

    const healthRatio = Number.parseFloat(leveragedForm.healthRatioToMaintain);
    if (healthRatio <= 100) {
      setSubmitStatus("error");
      setSubmittingType(null);
      return;
    }

    const collateralTokenAddress: string =
      TOKENS.baseSepolia[
        leveragedForm.collateralAsset as keyof typeof TOKENS.baseSepolia
      ] ?? "";

    const debtTokenAddress: string =
      TOKENS.baseSepolia[
        leveragedForm.debtAsset as keyof typeof TOKENS.baseSepolia
      ] ?? "";

    const orderType = "automatedLeverageManagement";

    if (!validateBorrowAmount(leveragedForm.borrowAmount, maxBorrowLeveraged)) {
      setSubmitStatus("error");
      setSubmittingType(null);
      return;
    }

    const collateralPriceMax = 0;
    const collateralPriceMin = 0;

    setIsModalOpen(true);
    updateTransactionStep(0, { status: "loading" });
    const approvalResp = await litAutomatedApproval({
      ethAddress: userAddress,
      asset: collateralTokenAddress,
      amount: Number.parseFloat(leveragedForm.collateralAmount),
    });

    updateTransactionStep(0, {
      status: "success",
      txHash: approvalResp?.txHash || "0x...",
    });

    console.log("Approval Tx Hash:", approvalResp);

    // Step 2: Supply
    updateTransactionStep(1, { status: "loading" });
    const supplyResp = await litAutomatedSupply({
      ethAddress: userAddress,
      asset: collateralTokenAddress,
      amount: Number.parseFloat(leveragedForm.collateralAmount),
    });

    console.log("Supply Tx Hash:", supplyResp);

    updateTransactionStep(1, {
      status: "success",
      txHash: supplyResp?.txHash || "0x...",
    });

    if (supplyResp.status === "success") {
      createOrder({
        ethAddress: userAddress,
        collateralAsset: collateralTokenAddress,
        loanAsset: debtTokenAddress,
        collateralPriceMax,
        collateralPriceMin,
        orderType,
        collateralAmount: Number.parseFloat(leveragedForm.collateralAmount),
        borrowAmount: Number.parseFloat(leveragedForm.borrowAmount),
      });

      updateTransactionStep(2, { status: "loading" });

      const borrowResp = await litAutomatedBorrow({
        ethAddress: userAddress,
        asset: debtTokenAddress,
        amount: Number.parseFloat(leveragedForm.borrowAmount),
      });

      updateTransactionStep(2, {
        status: "success",
        txHash: borrowResp?.txHash || "0x...",
      });

      console.log("Borrow Tx Hash:", borrowResp.txHash);

      setSubmitStatus("success");
      setSubmittingType(null);
    }
  };

  const MaxBorrowTooltip = () => (
    <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 z-10 shadow-lg">
      <p className="font-semibold text-white mb-2">Max Borrow Calculation</p>
      <p className="text-xs">
        Formula:{" "}
        <span className="text-emerald-400">
          Collateral Amount × Collateral Price × 0.8 (80% LTV)
        </span>
      </p>
      <p className="text-xs mt-2">
        This ensures your position maintains a healthy loan-to-value ratio and
        reduces liquidation risk.
      </p>
      <div className="absolute top-full left-4 w-2 h-2 bg-slate-800 border-r border-b border-slate-700 transform rotate-45"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <TransactionModal
        isOpen={isModalOpen}
        steps={transactionSteps}
        onClose={() => setIsModalOpen(false)}
        title="Creating Order"
      />

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Create New Order</h2>
        <p className="text-slate-400">
          Choose an order type and configure your automated position management
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Select Order Type</Label>
        <Select value={orderType} onValueChange={(v: any) => setOrderType(v)}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="stopLoss">Stop Loss</SelectItem>
            <SelectItem value="takeProfit">Take Profit</SelectItem>
            <SelectItem value="automatedLeverageManagement">
              Leverage Management
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Messages */}
      {submitStatus === "success" && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-400">Order created successfully!</p>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">
            {submittingType === "leveraged"
              ? "Health ratio must be greater than 100%"
              : "Borrow amount exceeds maximum allowed. Please check your inputs."}
          </p>
        </div>
      )}

      {orderType === "stopLoss" && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">Stop Loss</CardTitle>
            <CardDescription>
              Repay all of your loan when collateral price hits the configured
              low
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStopLossSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Collateral Token */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Collateral Token</Label>
                  <Select
                    value={stopLossForm.collateralAsset}
                    onValueChange={(v) =>
                      setStopLossForm({ ...stopLossForm, collateralAsset: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="cbETH">cbETH</SelectItem>
                      <SelectItem value="WBTC">WBTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Debt Token */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Debt Token</Label>
                  <Select
                    value={stopLossForm.debtAsset}
                    onValueChange={(v) =>
                      setStopLossForm({ ...stopLossForm, debtAsset: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Collateral Price */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-300">
                    Minimum Price of Collateral ({stopLossForm.collateralAsset})
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1500"
                    value={stopLossForm.minCollateralPrice}
                    onChange={(e) =>
                      setStopLossForm({
                        ...stopLossForm,
                        minCollateralPrice: e.target.value,
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                </div>

                {/* Collateral Amount */}
                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Amount of Collateral ({stopLossForm.collateralAsset})
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={stopLossForm.collateralAmount}
                    onChange={(e) =>
                      setStopLossForm({
                        ...stopLossForm,
                        collateralAmount: e.target.value,
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                </div>

                {/* Borrow Amount with Tooltip */}
                <div className="space-y-2 relative">
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-300">
                      Borrow Amount ({stopLossForm.debtAsset})
                    </Label>
                    <button
                      type="button"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="relative"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors" />
                      {showTooltip && <MaxBorrowTooltip />}
                    </button>
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      placeholder={`Max: ${maxBorrowStopLoss.toFixed(2)}`}
                      value={stopLossForm.borrowAmount}
                      onChange={(e) =>
                        setStopLossForm({
                          ...stopLossForm,
                          borrowAmount: e.target.value,
                        })
                      }
                      className={`bg-slate-800 border-slate-700 text-white placeholder-slate-500 ${
                        stopLossForm.borrowAmount &&
                        !validateBorrowAmount(
                          stopLossForm.borrowAmount,
                          maxBorrowStopLoss
                        )
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    <p className="text-xs text-slate-400">
                      Max allowed: {maxBorrowStopLoss.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingType === "stopLoss"
                  ? "Creating Stop Loss Order..."
                  : "Create Stop Loss Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {orderType === "takeProfit" && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">Take Profit</CardTitle>
            <CardDescription>
              Close your position when collateral price reaches a maximum value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTakeProfitSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Collateral Token */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Collateral Token</Label>
                  <Select
                    defaultValue="cbETH"
                    value={takeProfitForm.collateralAsset}
                    onValueChange={(v) =>
                      setTakeProfitForm({
                        ...takeProfitForm,
                        collateralAsset: v,
                      })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="cbETH">cbETH</SelectItem>
                      <SelectItem value="WBTC">WBTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Debt Token */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Debt Token</Label>
                  <Select
                    value={takeProfitForm.debtAsset}
                    defaultValue="USDT"
                    onValueChange={(v) =>
                      setTakeProfitForm({ ...takeProfitForm, debtAsset: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Collateral Price */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-300">
                    Maximum Price of Collateral (
                    {takeProfitForm.collateralAsset})
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 3000"
                    value={takeProfitForm.maxCollateralPrice}
                    onChange={(e) =>
                      setTakeProfitForm({
                        ...takeProfitForm,
                        maxCollateralPrice: e.target.value,
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                </div>

                {/* Collateral Amount */}
                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Amount of Collateral ({takeProfitForm.collateralAsset})
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={takeProfitForm.collateralAmount}
                    onChange={(e) =>
                      setTakeProfitForm({
                        ...takeProfitForm,
                        collateralAmount: e.target.value,
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                </div>

                {/* Borrow Amount with Tooltip */}
                <div className="space-y-2 relative">
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-300">
                      Borrow Amount ({takeProfitForm.debtAsset})
                    </Label>
                    <button
                      type="button"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="relative"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors" />
                      {showTooltip && <MaxBorrowTooltip />}
                    </button>
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      placeholder={`Max: ${maxBorrowTakeProfit.toFixed(2)}`}
                      value={takeProfitForm.borrowAmount}
                      onChange={(e) =>
                        setTakeProfitForm({
                          ...takeProfitForm,
                          borrowAmount: e.target.value,
                        })
                      }
                      className={`bg-slate-800 border-slate-700 text-white placeholder-slate-500 ${
                        takeProfitForm.borrowAmount &&
                        !validateBorrowAmount(
                          takeProfitForm.borrowAmount,
                          maxBorrowTakeProfit
                        )
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    <p className="text-xs text-slate-400">
                      Max allowed: {maxBorrowTakeProfit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                // disabled={!isTakeProfitValid || submittingType === "takeProfit"}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingType === "takeProfit"
                  ? "Creating Take Profit Order..."
                  : "Create Take Profit Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {orderType === "automatedLeverageManagement" && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              Leveraged Automation
            </CardTitle>
            <CardDescription>
              Automatically adjust leverage based on price movements to maintain
              your target health ratio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLeveragedSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Health Ratio */}
                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Health Ratio to Maintain (%)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 150"
                    value={leveragedForm.healthRatioToMaintain}
                    onChange={async (e) => {
                      setLeveragedForm({
                        ...leveragedForm,
                        healthRatioToMaintain: e.target.value,
                      });
                    }}
                    className={`bg-slate-800 border-slate-700 text-white placeholder-slate-500 ${
                      leveragedForm.healthRatioToMaintain &&
                      Number.parseFloat(leveragedForm.healthRatioToMaintain) <=
                        100
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <p className="text-xs text-slate-400">
                    Must be greater than 100%
                  </p>
                </div>

                {/* Collateral Token */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Collateral Token</Label>
                  <Select
                    value={leveragedForm.collateralAsset}
                    onValueChange={(v) =>
                      setLeveragedForm({ ...leveragedForm, collateralAsset: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="cbETH">cbETH</SelectItem>
                      <SelectItem value="WBTC">WBTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Debt Token */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Debt Token</Label>
                  <Select
                    value={leveragedForm.debtAsset}
                    defaultValue="USDT"
                    onValueChange={(v) =>
                      setLeveragedForm({ ...leveragedForm, debtAsset: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Collateral Amount */}
                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Collateral Amount ({leveragedForm.collateralAsset})
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={leveragedForm.collateralAmount}
                    onChange={(e) =>
                      setLeveragedForm({
                        ...leveragedForm,
                        collateralAmount: e.target.value,
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                </div>

                {/* Borrow Amount with Tooltip */}
                <div className="space-y-2 relative">
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-300">
                      Borrow Amount ({leveragedForm.debtAsset})
                    </Label>
                    <button
                      type="button"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="relative"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors" />
                      {showTooltip && <MaxBorrowTooltip />}
                    </button>
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      placeholder={`Max: ${maxBorrowLeveraged.toFixed(2)}`}
                      value={leveragedForm.borrowAmount}
                      onChange={(e) =>
                        setLeveragedForm({
                          ...leveragedForm,
                          borrowAmount: e.target.value,
                        })
                      }
                      className={`bg-slate-800 border-slate-700 text-white placeholder-slate-500 ${
                        leveragedForm.borrowAmount &&
                        !validateBorrowAmount(
                          leveragedForm.borrowAmount,
                          maxBorrowLeveraged
                        )
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    <p className="text-xs text-slate-400">
                      Max allowed: {maxBorrowLeveraged.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                // disabled={
                //   !isLeveragedValid ||
                //   submittingType === "automatedLeverageManagement"
                // }
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingType === "automatedLeverageManagement"
                  ? "Creating Automated Leverage Management Order..."
                  : "Create Leveraged Automation Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
