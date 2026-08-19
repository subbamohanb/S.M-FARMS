import React from "react";
import { Check, Clock3, Copy, Download, PackageCheck, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { downloadCodInvoice } from "@/lib/invoicePdf";
import { readOrderConfirmation, saveOrderConfirmation, type OrderConfirmation } from "@/lib/orderConfirmation";

function formatExpiry(value: string | Date) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export default function OrderConfirmation() {
  const [confirmation, setConfirmation] = React.useState<OrderConfirmation | null>(() => readOrderConfirmation());
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isCopying, setIsCopying] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [invoiceMessage, setInvoiceMessage] = React.useState<string | null>(null);
  const regenerateToken = trpc.tracking.regenerate.useMutation();
  const invoiceQuery = trpc.invoices.getCod.useQuery(
    confirmation ? { orderId: confirmation.localOrderId, invoiceToken: confirmation.invoiceToken } : { orderId: 0, invoiceToken: "invoice-preview-token-placeholder" },
    { enabled: Boolean(confirmation), retry: false },
  );

  if (!confirmation) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f8f5ee] px-6 text-center"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b84f35]">S.M FARMS</p><h1 className="mt-4 font-serif text-5xl font-bold text-[#203c2b]">No recent COD order.</h1><p className="mt-4 text-sm text-[#657164]">Place an order first and your confirmation will appear here.</p><Link href="/shop" className="mt-7 inline-flex rounded-full bg-[#203c2b] px-6 py-3 text-sm font-bold text-white">Browse the shop</Link></div></main>;
  }

  const copyTrackingToken = async () => {
    setIsCopying(true);
    try {
      await copyText(confirmation.invoiceToken);
      setInvoiceMessage("Tracking token copied. Keep it private; it opens your order details.");
    } catch {
      setInvoiceMessage("Copy was blocked by your browser. Select the token and copy it manually.");
    } finally {
      setIsCopying(false);
    }
  };

  const regenerateTrackingToken = async () => {
    setIsRegenerating(true);
    setInvoiceMessage(null);
    try {
      const next = await regenerateToken.mutateAsync({ orderId: confirmation.localOrderId, trackingToken: confirmation.invoiceToken });
      if (!next) {
        setInvoiceMessage("This token has expired or is no longer valid. Place a new order to receive a fresh token.");
        return;
      }
      const updated = { ...confirmation, invoiceToken: next.invoiceToken, invoiceTokenExpiresAt: next.invoiceTokenExpiresAt };
      setConfirmation(updated);
      saveOrderConfirmation(updated);
      setInvoiceMessage("A new tracking token was created. The previous token no longer works.");
    } catch {
      setInvoiceMessage("We could not regenerate the token right now. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const downloadInvoice = async () => {
    if (!invoiceQuery.data) return;
    setIsDownloading(true);
    setInvoiceMessage(null);
    try {
      await downloadCodInvoice(invoiceQuery.data);
      setInvoiceMessage("Invoice downloaded successfully.");
    } catch {
      setInvoiceMessage("We could not create the invoice right now. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return <main className="min-h-screen overflow-hidden bg-[#f8f5ee] text-[#26352c]"><div className="bg-[#203c2b] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5e9d3]">Order received · Cash on Delivery</div><section className="container max-w-4xl py-14 md:py-24"><div className="relative overflow-hidden rounded-[32px] bg-[#203c2b] px-6 py-12 text-center text-white shadow-[0_24px_70px_rgba(32,60,43,.22)] md:px-16"><div className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-[#d5962b]/25 blur-2xl" /><div className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-[#b84f35]/30 blur-2xl" /><div className="relative mx-auto flex h-24 w-24 animate-in zoom-in rounded-full bg-[#d5962b] text-[#203026] shadow-[0_0_0_12px_rgba(213,150,43,.18)] duration-500"><Check className="m-auto" size={48} strokeWidth={3} /></div><Sparkles className="absolute left-[20%] top-14 animate-pulse text-[#f4ce7b]" size={22} /><Sparkles className="absolute right-[20%] top-24 animate-pulse text-[#f4ce7b]" size={16} /><p className="relative mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f4ce7b]">Thank you for choosing S.M FARMS</p><h1 className="relative mt-4 font-serif text-5xl font-bold leading-[.94] tracking-[-.05em] md:text-7xl">Your order is on its way.</h1><p className="relative mx-auto mt-5 max-w-lg text-sm leading-6 text-[#e9efe5]">We’ve saved your order. Please keep the cash ready when our delivery partner arrives.</p></div><div className="mt-7 grid gap-6 md:grid-cols-[1.2fr_.8fr]"><section className="rounded-[26px] border border-[#ded9ce] bg-[#fffdf8] p-6"><div className="flex items-center justify-between border-b border-[#eee8dc] pb-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b84f35]">Confirmation summary</p><h2 className="mt-1 font-serif text-3xl font-bold text-[#203c2b]">Order #{confirmation.localOrderId}</h2></div><PackageCheck className="text-[#b84f35]" size={28} /></div><div className="divide-y divide-[#eee8dc]">{confirmation.items.map((item) => <div key={item.productName} className="flex items-center justify-between gap-4 py-4 text-sm"><div><p className="font-bold text-[#203c2b]">{item.productName}</p><p className="mt-1 text-xs text-[#8a8d7f]">Quantity {item.quantity}</p></div><p className="font-extrabold text-[#203c2b]">₹{item.lineTotalInr.toLocaleString("en-IN")}</p></div>)}</div><div className="mt-5 rounded-2xl border border-[#ded9ce] bg-[#f1e9da] p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b84f35]">Private tracking token</p><p className="mt-2 break-all font-mono text-sm font-bold text-[#203c2b]">{confirmation.invoiceToken}</p></div><button type="button" onClick={copyTrackingToken} disabled={isCopying} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#203c2b] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"><Copy size={14} />{isCopying ? "Copying…" : "Copy"}</button></div><p className="mt-3 text-xs leading-5 text-[#506154]">Save this token privately. Use it with your order number on Track order; S.M FARMS will never ask you to post it publicly.</p><div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-[#506154]"><span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> Expires {formatExpiry(confirmation.invoiceTokenExpiresAt)}</span><button type="button" onClick={regenerateTrackingToken} disabled={isRegenerating} className="inline-flex items-center gap-1.5 text-[#b84f35] hover:underline disabled:opacity-60"><RefreshCw size={13} className={isRegenerating ? "animate-spin" : ""} />{isRegenerating ? "Regenerating…" : "Regenerate token"}</button></div></div></section><aside className="rounded-[26px] bg-[#f1e9da] p-6"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b84f35]">Amount due on delivery</p><p className="mt-3 font-serif text-5xl font-bold tracking-[-.06em] text-[#203c2b]">₹{confirmation.amountInr.toLocaleString("en-IN")}</p><div className="mt-5 rounded-2xl bg-[#fffdf8]/70 p-4 text-sm leading-6 text-[#506154]"><strong className="text-[#203c2b]">Payment method:</strong> Cash on Delivery<br />{confirmation.deliverySlot && <><strong className="text-[#203c2b]">Delivery slot:</strong> {confirmation.deliverySlot}<br /></>}<strong className="text-[#203c2b]">Status:</strong> Order placed</div><button type="button" onClick={downloadInvoice} disabled={!invoiceQuery.data || isDownloading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#b84f35] px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-55"><Download size={16} />{isDownloading ? "Preparing invoice…" : invoiceQuery.isLoading ? "Loading invoice…" : invoiceQuery.data ? "Download PDF invoice" : "Invoice unavailable"}</button>{invoiceMessage && <p className="mt-3 text-center text-xs font-bold text-[#506154]" role="status">{invoiceMessage}</p>}<Link href={`/track-order?order=${confirmation.localOrderId}&token=${confirmation.invoiceToken}`} className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#203c2b] px-5 py-3.5 text-sm font-bold text-white">Track this order</Link><Link href="/shop" className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#c8c2b3] px-5 py-3.5 text-sm font-bold text-[#203c2b]">Continue shopping</Link></aside></div></section></main>;
}
