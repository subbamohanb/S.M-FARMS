import { beforeEach, describe, expect, it, vi } from "vitest";

const { createPendingOrder, createRazorpayOrder } = vi.hoisted(() => ({
  createPendingOrder: vi.fn(),
  createRazorpayOrder: vi.fn(),
}));

vi.mock("./db", () => ({
  createPendingOrder,
  attachRazorpayOrderId: vi.fn(),
  createRazorpayOrder: vi.fn(),
  getAllProducts: vi.fn(),
  getProductsByBusiness: vi.fn(),
  getCustomerTransactionHistory: vi.fn(),
  getOrderForTracking: vi.fn(),
  markOrderPaid: vi.fn(),
  registerPushToken: vi.fn(),
  getAdminDashboardData: vi.fn(),
  updateAdminOrder: vi.fn(),
  updateAdminProductInventory: vi.fn(),
}));

vi.mock("./razorpay", () => ({
  createRazorpayOrder,
  verifyRazorpayPaymentSignature: vi.fn(),
}));

import { appRouter } from "./routers";

const caller = appRouter.createCaller({} as never);

describe("orders.checkout COD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createPendingOrder.mockResolvedValue({ orderId: 77, amountInr: 699, items: [{ productId: 4, productName: "Cold-Pressed Cow Ghee", unitPriceInr: 699, quantity: 1, lineTotalInr: 699 }] });
  });

  it("creates a pending COD order without calling Razorpay", async () => {
    const result = await caller.orders.checkout({
      items: [{ productId: 4, quantity: 1 }],
      paymentMethod: "cod",
    });

    expect(result).toEqual({ mode: "cod", localOrderId: 77, amountInr: 699, items: [{ productId: 4, productName: "Cold-Pressed Cow Ghee", unitPriceInr: 699, quantity: 1, lineTotalInr: 699 }] });
    expect(createPendingOrder).toHaveBeenCalledWith(expect.objectContaining({ paymentMethod: "cod" }));
    expect(createRazorpayOrder).not.toHaveBeenCalled();
  });
});
