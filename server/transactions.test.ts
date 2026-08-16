import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const caller = appRouter.createCaller({} as never);

describe("transactions.history", () => {
  it("rejects contact values that are too short to identify a customer", async () => {
    await expect(caller.transactions.history({ contact: "x" })).rejects.toThrow();
  });
});
