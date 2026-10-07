export type ConfirmationItem = { productName: string; quantity: number; lineTotalInr: number };

export type OrderConfirmation = {
  localOrderId: number;
  amountInr: number;
  paymentMethod: "cod";
  invoiceToken: string;
  invoiceTokenExpiresAt: string | Date;
  items: ConfirmationItem[];
};

const STORAGE_KEY = "sm-farms:last-order-confirmation";

export function saveOrderConfirmation(value: OrderConfirmation) {
  if (typeof window !== "undefined") window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function readOrderConfirmation(): OrderConfirmation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrderConfirmation;
    if (!parsed.localOrderId || parsed.paymentMethod !== "cod" || !parsed.invoiceToken || !parsed.invoiceTokenExpiresAt || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}
