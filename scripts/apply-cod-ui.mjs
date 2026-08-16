import { readFileSync, writeFileSync } from "node:fs";

const pages = ["Home.tsx", "Shop.tsx", "AgriFarm.tsx", "DairyFarm.tsx"].map((name) => `client/src/pages/${name}`);
for (const file of pages) {
  let source = readFileSync(file, "utf8");
  if (!source.includes('from "@/components/PaymentMethodSelector"')) {
    source = source.replace(/(import \{ CheckoutPaymentButton \} from "@\/components\/CheckoutPaymentButton";\n)/, '$1import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";\n');
  }
  if (!source.includes('const [paymentMethod, setPaymentMethod]')) {
    source = source.replace('const [cartOpen, setCartOpen] = useState(false);', 'const [cartOpen, setCartOpen] = useState(false);\n  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");');
  }
  source = source.replace('aggregateCartItems(cart) });', 'aggregateCartItems(cart), paymentMethod });');
  source = source.replace('aggregateCartItems(cart) });', 'aggregateCartItems(cart), paymentMethod });');
  source = source.replace('if (result.mode === "fallback") {', 'if (result.mode === "cod") { toast.success(`Order #${result.localOrderId} placed`, { description: "Pay cash when your order arrives." }); } else if (result.mode === "fallback") {');
  const buttonPattern = /(<CheckoutPaymentButton[^>]*\/>)/g;
  source = source.replace(buttonPattern, '<PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />\n          $1');
  if (!source.includes("paymentMethod")) throw new Error(`COD update did not apply to ${file}`);
  writeFileSync(file, source);
  console.log(`updated ${file}`);
}
