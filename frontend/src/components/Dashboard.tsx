import { useState } from "react";
import { Button } from "./ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { CreateOrderTab } from "./tabs/create-order-tab";
import { ViewOrdersTab } from "./tabs/view-order-tab";

interface DashboardPageProps {
  userAddress: string;
  onLogout: () => void;
}

type TabType = "create" | "view" | "wallet";

export function DashboardPage({ userAddress, onLogout }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "create" as TabType, label: "Create Order", icon: "➕" },
    { id: "view" as TabType, label: "View Orders", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <span className="text-white font-bold text-lg">LS</span>
              </div>
              <h1 className="text-xl font-bold text-white hidden sm:block">
                Liquishield
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400">Connected:</span>
                <span className="text-sm font-mono text-emerald-400">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </span>
              </div>
              <Button
                onClick={onLogout}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden text-slate-400 hover:text-white"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/30 backdrop-blur sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex gap-1 ${
              isMobileMenuOpen ? "flex-col" : "flex-row"
            } sm:flex-row`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "create" && <CreateOrderTab userAddress={userAddress} />}
        {activeTab === "view" && <ViewOrdersTab userAddress={userAddress} />}
      </div>
    </div>
  );
}
