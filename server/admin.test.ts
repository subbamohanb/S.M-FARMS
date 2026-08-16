import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "user" | "admin"): TrpcContext {
  return {
    user: {
      id: role === "admin" ? 99 : 100,
      openId: `${role}-test`,
      name: role === "admin" ? "Admin Test" : "User Test",
      email: `${role}@example.com`,
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin dashboard authorization", () => {
  it("rejects a regular user from the admin dashboard", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.admin.accessCheck()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects negative inventory values at the procedure boundary", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    await expect(caller.admin.updateInventory({ productId: 1, stockQuantity: -1, reorderLevel: 5 })).rejects.toThrow();
  });
});
