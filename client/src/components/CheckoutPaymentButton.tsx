import { Loader2 } from "lucide-react";

type CheckoutPaymentButtonProps = {
  isPreparing: boolean;
  isInitializing: boolean;
  isVerifying: boolean;
  onClick: () => void;
  tone?: "green" | "clay";
};

export function CheckoutPaymentButton({ isPreparing, isInitializing, isVerifying, onClick, tone = "green" }: CheckoutPaymentButtonProps) {
  const disabled = isPreparing || isInitializing || isVerifying;
  const background = tone === "clay" ? "bg-[#5c3023]" : "bg-[#203c2b]";
  const hover = tone === "clay" ? "hover:bg-[#6f3a2b]" : "hover:bg-[#2d563d]";
  return (
    <button disabled={disabled} onClick={onClick} className={`inline-flex w-full items-center justify-center gap-2 rounded-full ${background} py-4 text-sm font-extrabold text-white transition ${hover} disabled:cursor-not-allowed disabled:opacity-60`}>
      {isPreparing ? "Preparing checkout…" : isInitializing ? <><Loader2 size={16} className="animate-spin" /> Loading secure checkout…</> : isVerifying ? "Verifying payment…" : "Continue to payment"}
    </button>
  );
}
