import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { guidanceFor } from "../client/src/pages/ProductDetail";
import { filterAndSortProducts } from "../client/src/pages/Shop";

describe("product detail guidance", () => {
  it("provides ingredient, storage, and usage guidance for agri and chilled dairy products", () => {
    const agri = guidanceFor({ business: "agri", category: "Soil & nutrition", deliveryType: "standard" });
    const dairy = guidanceFor({ business: "dairy", category: "Milk", deliveryType: "chilled" });
    expect(agri.ingredients).toContain("Product-specific");
    expect(agri.storage).toContain("cool, dry");
    expect(dairy.storage).toContain("refrigerated");
    expect(dairy.usage).toContain("pack");
  });

  it("filters by category and sorts by price", () => {
    const items = [
      { id: 1, name: "Mangoes", category: "Fresh fruits", price: "₹200", priceInr: 200, pack: "1 kg", label: "Fresh", image: "", use: "", suitability: "", stockQuantity: 3, business: "agri" as const, deliveryType: "chilled" },
      { id: 2, name: "Milk", category: "Milk", price: "₹80", priceInr: 80, pack: "1 litre", label: "Fresh", image: "", use: "", suitability: "", stockQuantity: 8, business: "dairy" as const, deliveryType: "chilled" },
    ];
    expect(filterAndSortProducts(items, "Milk", "", "price-low")[0]?.name).toBe("Milk");
    expect(filterAndSortProducts(items, "All products", "mango", "featured")).toHaveLength(1);
  });

  it("registers the detail route and Shop catalog controls", () => {
    const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
    const shop = readFileSync(new URL("../client/src/pages/Shop.tsx", import.meta.url), "utf8");
    expect(app).toContain("/product/:id");
    expect(shop).toContain("Sort: Featured");
    expect(shop).toContain("Most available");
    expect(shop).toContain("Select a delivery slot");
    expect(shop).toContain("deliverySlot");
  });
});
