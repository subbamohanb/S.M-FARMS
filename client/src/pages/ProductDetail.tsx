import { ArrowLeft, Box, ChevronRight, Leaf, Loader2, Snowflake, ShoppingBag } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

const logoImage = "/manus-storage/sm-farms-logo_30b01d3b.png";

function guidanceFor(product: { ingredients?: string | null; storageInstructions?: string | null; usageGuidance?: string | null; deliveryType?: string | null; business: "agri" | "dairy"; category: string }) {
  return {
    ingredients: product.ingredients || (product.business === "dairy" ? "Milk or dairy base; see the pack label for allergens and complete ingredients." : "Product-specific formulation; see the pack label for complete ingredients."),
    storage: product.storageInstructions || (product.deliveryType === "chilled" ? "Keep refrigerated between 2°C and 8°C. Do not refreeze after opening." : "Store sealed in a cool, dry place away from direct sunlight."),
    usage: product.usageGuidance || (product.business === "dairy" ? "Serve chilled and consume within the period shown on the pack after opening." : "Follow the pack label, use the recommended quantity, and keep away from children and food."),
  };
}

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const id = Number(params?.id);
  const { data: product, isLoading } = trpc.products.byId.useQuery({ id }, { enabled: Number.isInteger(id) && id > 0 });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#f8f5ee] text-[#203c2b]"><Loader2 className="animate-spin" size={28} /></div>;
  if (!product) return <div className="min-h-screen bg-[#f8f5ee] px-6 py-20 text-center text-[#203c2b]"><h1 className="font-serif text-5xl font-bold">Product not found</h1><Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#203c2b] px-5 py-3 text-sm font-bold text-white">Back to shop</Link></div>;

  const guidance = guidanceFor(product);
  const isChilled = product.deliveryType === "chilled";
  return <div className="min-h-screen bg-[#f8f5ee] text-[#26352c]">
    <header className="border-b border-[#d9d4c8] bg-[#f8f5ee]/95"><div className="container flex h-[76px] items-center justify-between"><Link href="/" className="flex items-center gap-3"><img src={logoImage} className="h-11 w-11 object-contain" alt="S.M FARMS seed mark" /><span className="font-serif text-2xl font-bold text-[#203c2b]">S.M FARMS</span></Link><Link href="/shop" className="inline-flex items-center gap-2 rounded-full border border-[#d9d4c8] px-4 py-2.5 text-xs font-bold text-[#506154]"><ShoppingBag size={15} /> Shop all</Link></div></header>
    <main className="container py-10 md:py-16"><Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-[#b84f35]"><ArrowLeft size={15} /> Back to catalog</Link><div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start"><div className="overflow-hidden rounded-[32px] bg-[#e7dfcf]"><img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" /></div><div><div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#b84f35]"><span>{product.business === "dairy" ? "Dairy Farm" : "Agri Farm"}</span><ChevronRight size={14} /><span>{product.category}</span></div><h1 className="mt-5 font-serif text-5xl font-bold leading-[.94] tracking-[-.06em] text-[#203c2b] md:text-7xl">{product.name}</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#657164]">{product.note}</p><div className="mt-7 flex flex-wrap items-end gap-4"><span className="font-serif text-4xl font-bold text-[#203c2b]">₹{product.priceInr}</span><span className="rounded-full bg-[#e8d9b8] px-3 py-1.5 text-xs font-bold text-[#506154]">{product.pack}</span>{product.offerLabel && <span className="rounded-full bg-[#b84f35] px-3 py-1.5 text-xs font-bold text-white">{product.offerLabel}</span>}</div><div className="mt-8 flex flex-wrap gap-3"><Link href="/shop" className="inline-flex items-center gap-2 rounded-full bg-[#203c2b] px-6 py-3.5 text-sm font-extrabold text-white">Add from shop <ShoppingBag size={16} /></Link><span className="inline-flex items-center gap-2 rounded-full border border-[#d9d4c8] px-5 py-3.5 text-sm font-bold text-[#506154]">{isChilled ? <Snowflake size={16} /> : <Box size={16} />}{isChilled ? "Chilled delivery" : "Standard delivery"}</span></div><div className="mt-10 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-[#f1e9da] p-4"><Leaf size={18} className="text-[#b84f35]" /><p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#203c2b]">Ingredients</p><p className="mt-2 text-xs leading-5 text-[#657164]">{guidance.ingredients}</p></div><div className="rounded-2xl bg-[#f1e9da] p-4"><Snowflake size={18} className="text-[#b84f35]" /><p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#203c2b]">Storage</p><p className="mt-2 text-xs leading-5 text-[#657164]">{guidance.storage}</p></div><div className="rounded-2xl bg-[#f1e9da] p-4"><Box size={18} className="text-[#b84f35]" /><p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#203c2b]">How to use</p><p className="mt-2 text-xs leading-5 text-[#657164]">{guidance.usage}</p></div></div></div></div></main>
  </div>;
}

export { guidanceFor };
