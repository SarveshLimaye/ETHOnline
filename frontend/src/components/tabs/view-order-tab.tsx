import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Trash2, Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useBackend } from "../../hooks/useBackend";

import { TransactionModal } from "../Modal";
import { getSymbolFromAddress } from "../../utils/tokens";

interface Order {
  _id: string;
  ethAddress: string;
  collateralAsset: string;
  collateralAmount: number;
  collateralPriceMin: number;
  collateralPriceMax: number;
  loanAsset: string;
  borrowAmount: number;
  orderType: "automatedLeverageManagement" | "stopLoss" | "takeProfit";
  healthRatioToMaintain?: number;
  createdAt: string;
  updatedAt: string;
}

interface ViewOrdersTabProps {
  userAddress: string;
}

interface TransactionStep {
  name: string;
  status: "pending" | "loading" | "success" | "error";
  txHash?: string;
  error?: string;
}

export function ViewOrdersTab({ userAddress }: ViewOrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [transactionSteps, setTransactionSteps] = useState<TransactionStep[]>([
    { name: "Approve", status: "pending" },
    { name: "Repay", status: "pending" },
    { name: "Withdraw", status: "pending" },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    getOrdersByAddress,
    litAutomateRepay,
    litAutomatedApproval,
    litAutomateWithdraw,
    deleteOrder,
  } = useBackend();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const fetchedOrders = await getOrdersByAddress(userAddress);
        setOrders(fetchedOrders as any[]);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  const handleDeleteOrder = async (order: Order) => {
    setIsModalOpen(true);

    updateTransactionStep(0, { status: "loading" });
    const approveResp = await litAutomatedApproval({
      ethAddress: order.ethAddress,
      asset: order.loanAsset,
      amount: order.borrowAmount,
    });

    updateTransactionStep(0, {
      status: "success",
      txHash: approveResp?.txHash || "0x...",
    });

    console.log("Approve Response:", approveResp);

    if (approveResp.status === "success") {
      updateTransactionStep(1, { status: "loading" });
      const repayResp = await litAutomateRepay({
        ethAddress: order.ethAddress,
        asset: order.loanAsset,
        amount: order.borrowAmount,
      });

      updateTransactionStep(1, {
        status: "success",
        txHash: repayResp?.txHash || "0x...",
      });

      console.log("Repay Response:", repayResp);

      if (repayResp.status === "success") {
        updateTransactionStep(2, { status: "loading" });
        const withdrawResp = await litAutomateWithdraw({
          ethAddress: order.ethAddress,
          asset: order.collateralAsset,
          amount: order.collateralAmount,
        });

        console.log("Withdraw Response:", withdrawResp);

        updateTransactionStep(2, {
          status: "success",
          txHash: withdrawResp?.txHash || "0x...",
        });

        if (withdrawResp.status === "success") {
          deleteOrder(order._id);
        }
      }
    }
  };

  const getOrderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      automatedLeverageManagement: "Automated Leverage",
      stopLoss: "Stop Loss",
      takeProfit: "Take Profit",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Orders</h2>
          <p className="text-slate-400">Loading your orders...</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-slate-800/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Tooltip.Provider>
      <div className="space-y-6">
        <TransactionModal
          isOpen={isModalOpen}
          steps={transactionSteps}
          onClose={() => setIsModalOpen(false)}
          title="Deleting Order"
        />
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Orders</h2>
          <p className="text-slate-400">
            {orders.length} order{orders.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-400 mb-4">No orders yet</p>
              <p className="text-sm text-slate-500">
                Create your first order to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card
                key={order._id}
                className="border-slate-800 bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">
                          {getOrderTypeLabel(order.orderType)}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteOrder(order)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-t border-b border-slate-800">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Collateral Asset
                        </p>
                        <p className="text-sm font-semibold text-white mt-1">
                          {getSymbolFromAddress(order.collateralAsset) ||
                            order.collateralAsset}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Collateral Amount
                        </p>
                        <p className="text-sm font-semibold text-white mt-1">
                          {order.collateralAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Loan Asset
                        </p>
                        <p className="text-sm font-semibold text-white mt-1">
                          {getSymbolFromAddress(order.loanAsset) ||
                            order.loanAsset}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Borrow Amount
                        </p>
                        <p className="text-sm font-semibold text-white mt-1">
                          {order.borrowAmount}
                        </p>
                      </div>

                      {order.orderType === "stopLoss" && (
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <div className="cursor-help">
                              <p className="text-xs text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                Min Collateral Price
                                <Info className="w-3 h-3" />
                              </p>
                              <p className="text-sm font-semibold text-white mt-1">
                                ${order.collateralPriceMin}
                              </p>
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Content className="bg-slate-800 text-white text-xs px-3 py-2 rounded border border-slate-700 max-w-xs">
                            When collateral price reaches below this price, your
                            loan will be automatically repaid and collateral
                            will be withdrawn.
                          </Tooltip.Content>
                        </Tooltip.Root>
                      )}

                      {order.orderType === "takeProfit" && (
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <div className="cursor-help">
                              <p className="text-xs text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                Max Collateral Price
                                <Info className="w-3 h-3" />
                              </p>
                              <p className="text-sm font-semibold text-white mt-1">
                                ${order.collateralPriceMax}
                              </p>
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Content className="bg-slate-800 text-white text-xs px-3 py-2 rounded border border-slate-700 max-w-xs">
                            When collateral price reaches this maximum price,
                            your position will be automatically closed to lock
                            in profits.
                          </Tooltip.Content>
                        </Tooltip.Root>
                      )}
                    </div>

                    {/* Health Ratio for Automated Leverage */}
                    {order.orderType === "automatedLeverageManagement" &&
                      order.healthRatioToMaintain && (
                        <div className="p-3 rounded bg-slate-800/50">
                          <p className="text-slate-400 text-xs uppercase tracking-wide">
                            Health Ratio to Maintain
                          </p>
                          <p className="text-white font-semibold mt-1">
                            {order.healthRatioToMaintain}%
                          </p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
}
