import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getProductsByBusiness } from "./db";
import { withCatalogFallback } from "../client/src/lib/catalogFallback";

describe("catalog offers", () => {
  it("exposes expanded Agri Farm and Dairy Farm products with compare-at pricing", async () => {
    const [agri, dairy] = await Promise.all([getProductsByBusiness("agri"), getProductsByBusiness("dairy")]);
    expect(agri.some((product) => product.name === "SoilSpark Humic Granules" && product.compareAtPriceInr === 549 && product.offerLabel === "Save ₹100")).toBe(true);
    expect(dairy.some((product) => product.name === "Farm Fresh Buttermilk" && product.compareAtPriceInr === 89 && product.offerLabel === "Save ₹20")).toBe(true);
    expect(new Set(agri.filter((product) => ["Grains", "Pulses", "Fresh fruits", "Fresh vegetables", "Oilseeds", "Spices"].includes(product.category)).map((product) => product.category))).toEqual(new Set(["Grains", "Pulses", "Fresh fruits", "Fresh vegetables", "Oilseeds", "Spices"]));
    expect(["Sonam Rice Grains", "Premium Red Lentils", "Alphonso Mangoes", "Red Tomatoes", "Yellow Mustard Seed", "Turmeric Powder"].every((name) => agri.some((product) => product.name === name))).toBe(true);
    expect(new Set(dairy.filter((product) => ["Milk", "Cultured dairy", "Butter & cream", "Cheese", "Ghee", "Frozen & sweets"].includes(product.category)).map((product) => product.category))).toEqual(new Set(["Milk", "Cultured dairy", "Butter & cream", "Cheese", "Ghee", "Frozen & sweets"]));
    expect(["Farm Fresh Whole Milk", "Fresh Curd", "Table Butter", "Fresh Paneer", "Pure Cow Ghee", "Traditional Milk Sweets"].every((name) => dairy.some((product) => product.name === name))).toBe(true);
  });

  it("seeds representative sample products for both businesses", async () => {
    const [agri, dairy] = await Promise.all([getProductsByBusiness("agri"), getProductsByBusiness("dairy")]);
    expect(agri.some((product) => product.name === "NeemShield Botanical Concentrate" && product.stockQuantity > 0)).toBe(true);
    expect(agri.some((product) => product.category === "Fresh fruits")).toBe(true);
    expect(dairy.some((product) => product.name === "Daily Cow Milk" && product.stockQuantity > 0)).toBe(true);
    expect(dairy.some((product) => product.category === "Ice cream & sweets")).toBe(true);
  });

  it("keeps the new catalog controls and promotional sections in both farm pages", () => {
    const agri = readFileSync(new URL("../client/src/pages/AgriFarm.tsx", import.meta.url), "utf8");
    const dairy = readFileSync(new URL("../client/src/pages/DairyFarm.tsx", import.meta.url), "utf8");
    const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    for (const page of [agri, dairy]) {
      expect(page).toContain("Sort: Featured");
      expect(page).toContain("Most available");
      expect(page).toContain("in stock");
      expect(page).toContain("Search");
    }
    expect(agri).toContain("Freshness for the week.");
    expect(dairy).toContain("Good dairy belongs in the everyday.");
    expect(home).toContain("Fresh starts for every farm.");
    expect(home).toContain("Featured farm picks");
    expect(home).toContain("trpc.products.all.useQuery");
  });

  it("shows fallback products when a business catalog response is empty", () => {
    const fallback = [{ name: "Fallback product" }];
    expect(withCatalogFallback([], fallback)).toEqual(fallback);
    expect(withCatalogFallback(undefined, fallback)).toEqual(fallback);
    expect(withCatalogFallback(null as unknown as { name: string }[], fallback)).toEqual(fallback);
    expect(withCatalogFallback([{ name: "Live product" }], fallback)).toEqual([{ name: "Live product" }]);
  });
});
