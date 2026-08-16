type PaymentMethod = "razorpay" | "cod";

type PaymentMethodSelectorProps = {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <fieldset className="mt-5 rounded-2xl border border-[#d9d4c8] bg-[#f8f5ee] p-3">
      <legend className="px-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8a7358]">Choose payment</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { id: "razorpay" as const, title: "Pay online", detail: "UPI, cards, and net banking" },
          { id: "cod" as const, title: "Cash on Delivery", detail: "Pay when your order arrives" },
        ].map((option) => (
          <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${value === option.id ? "border-[#203c2b] bg-white" : "border-transparent bg-white/50 hover:border-[#c8c2b3]"}`}>
            <input type="radio" name="payment-method" value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} className="mt-1 accent-[#203c2b]" />
            <span><span className="block text-xs font-extrabold text-[#203c2b]">{option.title}</span><span className="mt-1 block text-[11px] leading-4 text-[#657164]">{option.detail}</span></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
