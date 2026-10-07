declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: (response: unknown) => void) => void };
  }
}

let razorpayScript: Promise<void> | null = null;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScript) return razorpayScript;
  razorpayScript = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve();
      else {
        razorpayScript = null;
        reject(new Error("Razorpay Checkout loaded without becoming available"));
      }
    };
    script.onerror = () => {
      razorpayScript = null;
      reject(new Error("Razorpay Checkout could not load"));
    };
    document.body.appendChild(script);
  });
  return razorpayScript;
}

export async function openRazorpayCheckout(input: { keyId: string; orderId: string; amount: number; currency: string; localOrderId: number; onSuccess: (response: unknown) => void | Promise<void>; onFailure: () => void; onCancel: () => void }) {
  try {
    await loadRazorpayScript();
  } catch {
    throw new Error("Payment gateway could not load. Check your internet connection, disable blocking extensions, or try again shortly.");
  }
  if (!window.Razorpay) throw new Error("Payment gateway is unavailable. Please try again shortly.");
  const checkout = new window.Razorpay({
    key: input.keyId,
    amount: input.amount,
    currency: input.currency,
    name: "S.M FARMS",
    description: `S.M FARMS order #${input.localOrderId}`,
    order_id: input.orderId,
    handler: input.onSuccess,
    modal: { ondismiss: input.onCancel },
    theme: { color: "#203c2b" },
  });
  checkout.on("payment.failed", input.onFailure);
  checkout.open();
}
