import crypto from "node:crypto";
import { ENV } from "./_core/env";

export type RazorpayOrder = {
  id: string;
  entity: "order";
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
};

export function verifyRazorpayPaymentSignature(input: { orderId: string; paymentId: string; signature: string }) {
  const expected = crypto.createHmac("sha256", ENV.razorpayKeySecret).update(`${input.orderId}|${input.paymentId}`).digest("hex");
  const provided = Buffer.from(input.signature);
  const expectedBuffer = Buffer.from(expected);
  if (provided.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, provided);
}

export async function createRazorpayOrder(input: { amountInr: number; receipt: string }) {
  if (!ENV.razorpayKeyId || !ENV.razorpayKeySecret) {
    throw new Error("Razorpay credentials are not configured");
  }
  if (!Number.isInteger(input.amountInr) || input.amountInr <= 0) {
    throw new Error("Razorpay order amount must be a positive whole INR amount");
  }

  const auth = Buffer.from(`${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountInr * 100,
      currency: "INR",
      receipt: input.receipt,
      payment_capture: 1,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[Razorpay] Order creation failed", response.status, detail.slice(0, 500));
    throw new Error("Razorpay order creation failed");
  }

  return (await response.json()) as RazorpayOrder;
}
