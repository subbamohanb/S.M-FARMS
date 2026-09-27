import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, create } from "react-test-renderer";

const queryState = { data: [] as Array<Record<string, unknown>> };

vi.mock("@/lib/trpc", () => ({
  trpc: {
    products: { all: { useQuery: () => queryState } },
    orders: {
      checkout: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }) },
      verifyPayment: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }) },
    },
  },
}));
vi.mock("@/lib/checkout", () => ({ aggregateCartItems: (items: unknown[]) => items }));
vi.mock("@/lib/orderConfirmation", () => ({ saveOrderConfirmation: vi.fn() }));
vi.mock("@/lib/razorpay", () => ({ openRazorpayCheckout: vi.fn() }));
vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));
vi.mock("@/components/CheckoutPaymentButton", () => ({ CheckoutPaymentButton: () => React.createElement("button", null, "Checkout") }));
vi.mock("@/components/PaymentMethodSelector", () => ({ PaymentMethodSelector: () => React.createElement("div", null, "Payment method") }));
vi.mock("@/components/PaymentRecoveryPrompt", () => ({ PaymentRecoveryPrompt: () => React.createElement("div", null, "Recovery") }));

import Home from "../client/src/pages/Home";

const seeded = [
  { id: 1, business: "agri", name: "NeemShield Botanical Concentrate", category: "Organic crop care", priceInr: 349, pack: "500 ml", label: "Organic", offerLabel: "Save ₹50", imageUrl: "/neem.jpg", note: "Botanical support" },
  { id: 2, business: "dairy", name: "Daily Cow Milk", category: "Milk", priceInr: 72, pack: "1 litre", label: "Farm fresh", offerLabel: "Daily essential", imageUrl: "/milk.jpg", note: "Chilled milk" },
];

function textOf(node: ReturnType<typeof create>) {
  return String(JSON.stringify(node.toJSON()));
}

describe("Home rendered featured products", () => {
  beforeEach(() => {
    queryState.data = seeded;
  });

  it("renders seeded catalog products in the featured section and adds one to the cart", () => {
    let renderer!: ReturnType<typeof create>;
    act(() => { renderer = create(React.createElement(Home)); });
    const output = textOf(renderer);

    expect(output).toContain("Featured farm picks");
    expect(output).toContain("NeemShield Botanical Concentrate");
    expect(output).toContain("Daily Cow Milk");
    expect(renderer.root.findAll((node) => node.props.className?.includes("hero-reel-frame"))).toHaveLength(3);

    const addButtons = renderer.root.findAll((node) => node.type === "button" && node.children.includes("Add"));
    expect(addButtons.length).toBeGreaterThan(0);
    const onClick = addButtons[0]?.props.onClick;
    expect(typeof onClick).toBe("function");
    act(() => { (onClick as () => void)(); });
    const cartButton = renderer.root.findAll((node) => node.type === "button" && node.props["aria-label"] === "Open cart")[0];
    expect(cartButton).toBeTruthy();
    act(() => { (cartButton?.props.onClick as () => void)(); });
    const cartHeading = renderer.root.findAll((node) => node.type === "h2" && node.children.includes("Cart ("))[0];
    expect(cartHeading?.children).toEqual(["Cart (", "1", ")"]);
  });

  it("renders the existing fallback cards when the live catalog is empty", () => {
    queryState.data = [];
    let renderer!: ReturnType<typeof create>;
    act(() => { renderer = create(React.createElement(Home)); });
    expect(textOf(renderer)).toContain("NeemShield Botanical Concentrate");
    expect(textOf(renderer)).toContain("Featured farm picks");
  });
});
