import React from "react";
import { Banknote, RefreshCcw } from "lucide-react";

type PaymentRecoveryPromptProps = { onSwitchToCod: () => void };

export function PaymentRecoveryPrompt({ onSwitchToCod }: PaymentRecoveryPromptProps) {
  return (
    <div role="alert" className="mt-4 rounded-2xl border border-[#e6c6b6] bg-[#fff4ed] p-4 text-xs leading-5 text-[#8f3828]">
      <p className="font-extrabold">Online payment could not be loaded.</p>
      <p className="mt-1">You can retry Razorpay or switch to Cash on Delivery to place this order now.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-full border border-[#c98d79] px-3 py-2 font-bold text-[#8f3828]"><RefreshCcw size={13} /> Retry online payment</button>
        <button type="button" onClick={onSwitchToCod} className="inline-flex items-center gap-2 rounded-full bg-[#8f3828] px-3 py-2 font-bold text-white"><Banknote size={13} /> Use Cash on Delivery</button>
      </div>
    </div>
  );
}
