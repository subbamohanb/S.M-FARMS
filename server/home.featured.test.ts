import { describe, expect, it } from "vitest";
import { mapFeaturedProducts } from "../client/src/pages/Home";

type CatalogProduct = Parameters<typeof mapFeaturedProducts>[0][number];

const fallback = [{
  id: 1,
  name: "Fallback product",
  category: "Organic crop care",
  price: "₹349",
  pack: "500 ml",
  label: "Organic",
  tone: "olive",
  icon: "🌿",
  image: "/fallback.jpg",
  use: "For crops",
  suitability: "Farm input",
}];

const seeded: CatalogProduct[] = [
  {
    id: 101,
    name: "NeemShield Botanical Concentrate",
    category: "Organic crop care",
    priceInr: 349,
    offerLabel: "Save ₹50",
    label: "Organic",
    imageUrl: "/seeded-neem.jpg",
    note: "Botanical support for leaf and fruit crops",
    business: "agri",
    pack: "500 ml",
  },
  {
    id: 102,
    name: "Daily Cow Milk",
    category: "Milk",
    priceInr: 72,
    offerLabel: "Daily essential",
    label: "Farm fresh",
    imageUrl: "/seeded-milk.jpg",
    note: "Chilled milk for breakfast and tea",
    business: "dairy",
    pack: "1 litre",
  },
];

describe("homepage featured products", () => {
  it("maps seeded agri and dairy catalog rows into featured cards", () => {
    const featured = mapFeaturedProducts(seeded, fallback);

    expect(featured).toHaveLength(2);
    expect(featured.map((product) => product.name)).toEqual(["NeemShield Botanical Concentrate", "Daily Cow Milk"]);
    expect(featured[0]).toMatchObject({ price: "₹349", label: "Save ₹50", suitability: "Farm input" });
    expect(featured[1]).toMatchObject({ price: "₹72", label: "Daily essential", suitability: "Dairy essential", icon: "🥛" });
  });

  it("keeps the homepage usable with the existing fallback catalog when the database is empty", () => {
    expect(mapFeaturedProducts([], fallback)).toEqual(fallback);
    expect(mapFeaturedProducts(undefined, fallback)).toEqual(fallback);
  });
});
