import { CheckCircle, Clock, AlertCircle, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface TransactionStep {
  name: string;
  status: "pending" | "loading" | "success" | "error";
  txHash?: string;
  error?: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  steps: TransactionStep[];
  onClose: () => void;
  title?: string;
}

export function TransactionModal({
  isOpen,
  steps,
  onClose,
  title = "Transaction Progress",
}: TransactionModalProps) {
  const getStepIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "loading":
        return (
          <div className="w-5 h-5 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
        );
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  const allStepsComplete = steps.every((step) => step.status === "success");
  const hasError = steps.some((step) => step.status === "error");

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-slate-900 border border-slate-800 rounded-lg shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-white">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Steps */}
          <div className="space-y-4 py-4">
            {steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-3">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {step.name}
                    </p>
                    {step.status === "loading" && (
                      <p className="text-xs text-slate-400">Processing...</p>
                    )}
                    {step.status === "success" && step.txHash && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-emerald-400">
                          Tx successful
                        </p>
                        <a
                          href={`https://sepolia.basescan.org/tx/${step.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          View on Explorer
                        </a>
                      </div>
                    )}
                    {step.status === "error" && step.error && (
                      <p className="text-xs text-red-400">{step.error}</p>
                    )}
                  </div>
                </div>

                {/* Progress line between steps */}
                {index < steps.length - 1 && (
                  <div className="ml-2.5 h-6 border-l-2 border-slate-700"></div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            {allStepsComplete && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition-colors"
              >
                Done
              </button>
            )}
            {hasError && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent rounded-md transition-colors"
              >
                Close
              </button>
            )}
            {!allStepsComplete && !hasError && (
              <p className="text-xs text-slate-400 w-full text-center py-2">
                Please wait while your transaction is being processed...
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
