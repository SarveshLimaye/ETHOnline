import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Wallet } from "lucide-react";
import { useBackend } from "../hooks/useBackend";

export function LoginPage() {
  const { getJwt } = useBackend();

  const handleWalletConnect = async () => {
    getJwt();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              LiquiShield
            </CardTitle>
            <CardDescription className="text-slate-400">
              Automated liquidation management for DeFi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-slate-300 text-center">
                Connect your wallet to manage your automated collateral
                positions
              </p>
            </div>
            <Button
              onClick={handleWalletConnect}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-6 rounded-lg transition-all"
            >
              Connect with Vincet
            </Button>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 text-center">
                Powered by Lit Protocol, Hedera and Pyth
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
