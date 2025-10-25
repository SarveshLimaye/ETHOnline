import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Trash2, Copy, CheckCircle } from "lucide-react";

interface Order {
  id: string;
  orderType: "automatedLeverageManagement" | "stopLoss" | "takeProfit";
  collateralAsset: string;
  loanAsset: string;
  collateralPriceMin: number;
  collateralPriceMax: number;
  loanTokenPriceMin: number;
  loanTokenPriceMax: number;
  createdAt: string;
  status: "active" | "completed" | "cancelled";
}

interface ViewOrdersTabProps {
  userAddress: string;
}

export function ViewOrdersTab({ userAddress }: ViewOrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching orders
    setTimeout(() => {
      setOrders([
        {
          id: "0x1234...5678",
          orderType: "automatedLeverageManagement",
          collateralAsset: "ETH",
          loanAsset: "USDC",
          collateralPriceMin: 1500,
          collateralPriceMax: 3000,
          loanTokenPriceMin: 0.95,
          loanTokenPriceMax: 1.05,
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "active",
        },
        {
          id: "0x9876...5432",
          orderType: "stopLoss",
          collateralAsset: "BTC",
          loanAsset: "USDC",
          collateralPriceMin: 35000,
          collateralPriceMax: 50000,
          loanTokenPriceMin: 0.98,
          loanTokenPriceMax: 1.02,
          createdAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "active",
        },
        {
          id: "0xabcd...ef01",
          orderType: "takeProfit",
          collateralAsset: "ETH",
          loanAsset: "DAI",
          collateralPriceMin: 2000,
          collateralPriceMax: 4000,
          loanTokenPriceMin: 0.99,
          loanTokenPriceMax: 1.01,
          createdAt: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "completed",
        },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id));
  };

  const getOrderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      automatedLeverageManagement: "Automated Leverage",
      stopLoss: "Stop Loss",
      takeProfit: "Take Profit",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status] || colors.active;
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
    <div className="space-y-6">
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
              key={order.id}
              className="border-slate-800 bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {getOrderTypeLabel(order.orderType)}
                        </p>
                        <p className="text-sm text-slate-400 font-mono">
                          {order.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getStatusColor(order.status)} border`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Collateral
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">
                        {order.collateralAsset}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Loan Asset
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">
                        {order.loanAsset}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Collateral Range
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">
                        ${order.collateralPriceMin.toLocaleString()} - $
                        {order.collateralPriceMax.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Created
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Price Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded bg-slate-800/50">
                      <p className="text-slate-400">Loan Price Range</p>
                      <p className="text-white font-semibold mt-1">
                        ${order.loanTokenPriceMin.toFixed(2)} - $
                        {order.loanTokenPriceMax.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 rounded bg-slate-800/50">
                      <p className="text-slate-400">Status</p>
                      <p className="text-emerald-400 font-semibold mt-1">
                        {order.status === "active"
                          ? "🟢 Active"
                          : "✓ Completed"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleCopyId(order.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      {copiedId === order.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy ID
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleDeleteOrder(order.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
