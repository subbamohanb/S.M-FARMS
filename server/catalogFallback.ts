import type { Product } from "../drizzle/schema";

const fallbackDate = new Date(0);

type FallbackFields = Omit<Product, "id" | "createdAt" | "updatedAt">;

function makeProduct(id: number, fields: FallbackFields): Product {
  return { ...fields, id, createdAt: fallbackDate, updatedAt: fallbackDate };
}

const common = {
  ingredients: "See product label for complete ingredients.",
  storageInstructions: "Store in a cool, dry place away from direct sunlight.",
  usageGuidance: "Follow the product label and use only as directed.",
  isActive: 1,
  stockQuantity: 18,
  reorderLevel: 5,
} as const;

export const catalogFallback: Product[] = [
  makeProduct(1, { ...common, business: "agri", name: "NeemShield Botanical Concentrate", category: "Organic crop care", priceInr: 349, compareAtPriceInr: null, offerLabel: null, pack: "500 ml", label: "Organic", imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=900&q=85", note: "For leaf & fruit crops", deliveryType: "standard" }),
  makeProduct(2, { ...common, business: "agri", name: "RootRise Bio Fertiliser", category: "Soil & nutrition", priceInr: 499, compareAtPriceInr: null, offerLabel: null, pack: "1 kg", label: "Bio-based", imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=900&q=85", note: "For soil recovery", deliveryType: "standard" }),
  makeProduct(3, { ...common, business: "agri", name: "KisanGuard Pest Control", category: "Crop protection", priceInr: 279, compareAtPriceInr: null, offerLabel: null, pack: "250 ml", label: "Field tested", imageUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=900&q=85", note: "For pest pressure", deliveryType: "standard" }),
  makeProduct(4, { ...common, business: "agri", name: "CompostCraft Organic Manure", category: "Soil & nutrition", priceInr: 389, compareAtPriceInr: null, offerLabel: null, pack: "5 kg", label: "Organic", imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=85", note: "For kitchen gardens", deliveryType: "standard" }),
  makeProduct(5, { ...common, business: "agri", name: "SoilSpark Humic Granules", category: "Soil & nutrition", priceInr: 449, compareAtPriceInr: 549, offerLabel: "Save ₹100", pack: "1 kg", label: "Value pack", imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=900&q=85", note: "For soil structure and root zones", deliveryType: "standard" }),
  makeProduct(6, { ...common, business: "agri", name: "BioBloom Seaweed Extract", category: "Organic crop care", priceInr: 399, compareAtPriceInr: 499, offerLabel: "20% off", pack: "500 ml", label: "Seasonal offer", imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=900&q=85", note: "For foliar feeding routines", deliveryType: "standard" }),
  makeProduct(7, { ...common, business: "agri", name: "FieldFlow Neem Cake", category: "Soil & nutrition", priceInr: 329, compareAtPriceInr: 399, offerLabel: "Save ₹70", pack: "5 kg", label: "Farm essential", imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=85", note: "For garden and field soil preparation", deliveryType: "standard" }),
  makeProduct(8, { ...common, business: "agri", name: "SpraySure Knapsack Sprayer", category: "Farm supplies", priceInr: 899, compareAtPriceInr: 1099, offerLabel: "Save ₹200", pack: "16 litre", label: "Practical tool", imageUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=900&q=85", note: "For measured crop-care application", deliveryType: "standard" }),
  makeProduct(101, { ...common, business: "dairy", name: "Cold-Pressed Cow Ghee", category: "Daily dairy", priceInr: 699, compareAtPriceInr: null, offerLabel: null, pack: "500 ml", label: "Farm fresh", imageUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=900&q=85", note: "Slow-cooked richness", deliveryType: "standard" }),
  makeProduct(102, { ...common, business: "dairy", name: "A2 Cow Milk", category: "Fresh milk", priceInr: 89, compareAtPriceInr: null, offerLabel: null, pack: "1 litre", label: "Morning delivery", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=85", note: "For everyday homes", deliveryType: "chilled" }),
  makeProduct(103, { ...common, business: "dairy", name: "Farmhouse Paneer", category: "Fresh dairy", priceInr: 249, compareAtPriceInr: null, offerLabel: null, pack: "500 g", label: "Made fresh", imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85", note: "Soft, high-protein staple", deliveryType: "chilled" }),
  makeProduct(104, { ...common, business: "dairy", name: "Cultured Farm Curd", category: "Fresh dairy", priceInr: 119, compareAtPriceInr: null, offerLabel: null, pack: "500 g", label: "Cultured", imageUrl: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=900&q=85", note: "For daily meals", deliveryType: "chilled" }),
  makeProduct(105, { ...common, business: "dairy", name: "Farm Fresh Buttermilk", category: "Fresh dairy", priceInr: 69, compareAtPriceInr: 89, offerLabel: "Save ₹20", pack: "1 litre", label: "Daily value", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=85", note: "Chilled everyday refreshment", deliveryType: "chilled" }),
  makeProduct(106, { ...common, business: "dairy", name: "Village Butter", category: "Daily dairy", priceInr: 199, compareAtPriceInr: 249, offerLabel: "20% off", pack: "200 g", label: "Seasonal offer", imageUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=900&q=85", note: "For breakfast and home cooking", deliveryType: "chilled" }),
  makeProduct(107, { ...common, business: "dairy", name: "Paneer Family Pack", category: "Fresh dairy", priceInr: 449, compareAtPriceInr: 549, offerLabel: "Save ₹100", pack: "1 kg", label: "Family pack", imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85", note: "For family meals and gatherings", deliveryType: "chilled" }),
  makeProduct(108, { ...common, business: "dairy", name: "Cattle Care Mineral Mix", category: "Dairy care", priceInr: 299, compareAtPriceInr: 349, offerLabel: "Save ₹50", pack: "1 kg", label: "Farm essential", imageUrl: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=900&q=85", note: "For dairy-farm feed planning", deliveryType: "standard" }),
];

export function getFallbackProductsByBusiness(business: "agri" | "dairy") {
  return catalogFallback.filter((product) => product.business === business);
}
