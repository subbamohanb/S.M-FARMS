import { beforeEach, describe, expect, it, vi } from "vitest";
import { openRazorpayCheckout } from "../client/src/lib/razorpay";

describe("Razorpay browser loader", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("window", { Razorpay: undefined });
    vi.stubGlobal("document", {
      createElement: () => ({ async: false, src: "", onload: undefined, onerror: undefined }),
      body: { appendChild: (script: { onerror?: () => void }) => script.onerror?.() },
    });
  });

  it("returns a clear gateway-load error when the checkout script fails", async () => {
    await expect(openRazorpayCheckout({
      keyId: "rzp_test_placeholder",
      orderId: "order_test",
      amount: 100,
      currency: "INR",
      localOrderId: 1,
      onSuccess: vi.fn(),
      onFailure: vi.fn(),
      onCancel: vi.fn(),
    })).rejects.toThrow("Payment gateway could not load");
  });
});
