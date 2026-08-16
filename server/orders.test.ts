import { describe, expect, it } from "vitest";
import { buildOrderLines } from "./db";
import { appRouter } from "./routers";
import type { Product } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";

const catalog = [
  { id: 1, name: "Test Neem", priceInr: 349, isActive: 1 },
  { id: 2, name: "Test Ghee", priceInr: 699, isActive: 1 },
] as Product[];

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("orders.checkout validation", () => {
  it("rejects an empty cart before database work", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.orders.createPending({ items: [] })).rejects.toThrow();
  });

  it("rejects invalid quantities before database work", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.orders.createPending({ items: [{ productId: 1, quantity: 0 }] })).rejects.toThrow();
  });

  it("rejects unavailable products", () => {
    expect(() => buildOrderLines([{ productId: 99, quantity: 1 }], catalog)).toThrow("unavailable");
  });

  it("aggregates duplicate items and calculates the server-side total", () => {
    const lines = buildOrderLines([
      { productId: 1, quantity: 1 },
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ], catalog);

    expect(lines).toEqual([
      { productId: 1, productName: "Test Neem", unitPriceInr: 349, quantity: 3, lineTotalInr: 1047 },
      { productId: 2, productName: "Test Ghee", unitPriceInr: 699, quantity: 1, lineTotalInr: 699 },
    ]);
    expect(lines.reduce((sum, line) => sum + line.lineTotalInr, 0)).toBe(1746);
  });
});
