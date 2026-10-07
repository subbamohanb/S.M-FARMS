import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, Search, XCircle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const statusCopy = {
  paid: { label: "Successful", tone: "border-[#bfd8c2] bg-[#edf8ee] text-[#27633a]", icon: CheckCircle2 },
  failed: { label: "Failed", tone: "border-[#e7c5b7] bg-[#fff2ed] text-[#8f3828]", icon: XCircle },
  cancelled: { label: "Cancelled", tone: "border-[#e6d5aa] bg-[#fff8e6] text-[#8a5a12]", icon: XCircle },
  pending: { label: "Pending", tone: "border-[#e6d5aa] bg-[#fff8e6] text-[#8a5a12]", icon: Clock3 },
} as const;

export default function TransactionHistory() {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [submittedLookup, setSubmittedLookup] = useState({ orderId: 0, contact: "" });
  const history = trpc.transactions.history.useQuery(
    submittedLookup,
    { enabled: submittedLookup.orderId > 0 && submittedLookup.contact.length >= 5 },
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = contact.trim();
    const normalizedOrderId = Number(orderId.trim());
    if (normalized.length < 5 || !Number.isInteger(normalizedOrderId) || normalizedOrderId <= 0) return;
    setSubmittedLookup({ orderId: normalizedOrderId, contact: normalized });
  };

  return (
    <div className="min-h-screen bg-[#f8f5ee] text-[#26352c]">
      <div className="bg-[#203c2b] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5e9d3]">Private payment history · S.M FARMS</div>
      <header className="border-b border-[#d9d4c8] bg-[#f8f5ee]/95">
        <div className="container flex h-[76px] items-center justify-between gap-4">
          <Link href="/" className="font-serif text-2xl font-bold tracking-[-0.04em] text-[#203c2b]">S.M FARMS</Link>
          <nav className="flex items-center gap-5 text-xs font-bold text-[#506154]">
            <Link href="/track-order" className="hover:text-[#203c2b]">Track order</Link>
            <Link href="/shop" className="hover:text-[#203c2b]">Shop</Link>
          </nav>
        </div>
      </header>

      <main className="container max-w-5xl py-14 md:py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#b84f35]"><ArrowLeft size={15} /> Back to S.M FARMS</Link>
        <div className="mt-8 grid gap-10 md:grid-cols-[.72fr_1.28fr] md:items-start">
          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b84f35]">Payment records</p>
            <h1 className="mt-4 font-serif text-5xl font-bold leading-[.92] tracking-[-.06em] text-[#203c2b] md:text-7xl">Your transaction history.</h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#657164]">Enter the same email address or phone number used at checkout. We’ll show your payment attempts without displaying private contact details.</p>
            <form onSubmit={submit} className="mt-8 rounded-[26px] border border-[#ded9ce] bg-[#fffdf8] p-5 shadow-[0_16px_40px_rgba(49,59,43,.06)]">
              <label className="text-xs font-bold text-[#506154]">Order number<input inputMode="numeric" value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="e.g. 30001" className="mt-2 h-12 w-full rounded-xl border border-[#d9d4c8] bg-white px-4 text-sm outline-none focus:border-[#203c2b]" /></label><label className="mt-4 block text-xs font-bold text-[#506154]">Email or phone number<input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="you@example.com or +91…" className="mt-2 h-12 w-full rounded-xl border border-[#d9d4c8] bg-white px-4 text-sm outline-none focus:border-[#203c2b]" /></label>
              <button type="submit" disabled={contact.trim().length < 5 || !Number.isInteger(Number(orderId)) || Number(orderId) <= 0 || history.isFetching} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#203c2b] px-5 text-sm font-bold text-white transition hover:bg-[#2d563d] disabled:cursor-not-allowed disabled:opacity-50"><Search size={16} /> {history.isFetching ? "Loading history…" : "View payment history"}</button>
            </form>
            <p className="mt-4 text-xs leading-5 text-[#8a8d7f]">For help with a payment, contact <a className="font-bold text-[#203c2b]" href="mailto:subbamohanb@gmail.com">subbamohanb@gmail.com</a>.</p>
          </section>

          <section aria-live="polite">
            {!submittedLookup.contact && <div className="rounded-[28px] border border-dashed border-[#c8c2b3] bg-[#fffdf8]/60 p-10 text-center"><CreditCard className="mx-auto text-[#b84f35]" size={30} /><h2 className="mt-5 font-serif text-3xl font-bold text-[#203c2b]">No history loaded yet.</h2><p className="mt-3 text-sm leading-6 text-[#657164]">Use the form to securely find your successful, failed, cancelled, and pending attempts.</p></div>}
            {submittedLookup.contact && history.isFetching && <div className="rounded-[28px] bg-[#f1e9da] p-10 text-center text-sm font-bold text-[#657164]">Checking your payment records…</div>}
            {submittedLookup.contact && history.isError && <div role="alert" className="rounded-[28px] border border-[#e7c5b7] bg-[#fff2ed] p-8 text-sm leading-6 text-[#8f3828]">We couldn’t load your payment history right now. Please check your details and try again, or contact our team for help.</div>}
            {submittedLookup.contact && !history.isFetching && !history.isError && history.data?.length === 0 && <div className="rounded-[28px] border border-dashed border-[#c8c2b3] bg-[#fffdf8]/60 p-10 text-center"><h2 className="font-serif text-3xl font-bold text-[#203c2b]">No transactions found.</h2><p className="mt-3 text-sm leading-6 text-[#657164]">We couldn’t find payment attempts for that email or phone number. Use the exact details from checkout.</p></div>}
            {history.data && history.data.length > 0 && <div className="space-y-4"><div className="flex items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b84f35]">Payment attempts</p><h2 className="mt-2 font-serif text-3xl font-bold text-[#203c2b]">{history.data.length} record{history.data.length === 1 ? "" : "s"}</h2></div><span className="rounded-full bg-[#f1e9da] px-3 py-2 text-[11px] font-bold text-[#506154]">Private lookup</span></div>{history.data.map((transaction) => { const config = statusCopy[transaction.status]; const Icon = config.icon; return <article key={transaction.id} className="rounded-[24px] border border-[#ded9ce] bg-[#fffdf8] p-5 shadow-[0_12px_30px_rgba(49,59,43,.05)]"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b84f35]">Order #{transaction.id}</p><p className="mt-2 text-sm font-bold text-[#203c2b]">{new Date(transaction.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div><span className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-2 text-xs font-bold ${config.tone}`}><Icon size={15} /> {config.label}</span></div><div className="mt-5 grid gap-3 border-t border-[#eee8dc] pt-4 text-sm sm:grid-cols-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8d7f]">Amount</p><p className="mt-1 font-extrabold text-[#203c2b]">₹{transaction.amountInr.toLocaleString("en-IN")}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8d7f]">Payment ID</p><p className="mt-1 truncate font-semibold text-[#506154]">{transaction.razorpayPaymentId || "Not completed"}</p></div></div></article>; })}</div>}
          </section>
        </div>
      </main>
      <footer className="border-t border-[#d9d4c8] bg-[#f1e9da] py-6"><div className="container flex flex-col justify-between gap-2 text-xs text-[#657164] md:flex-row"><span>© 2026 S.M FARMS</span><div className="flex gap-4"><Link href="/track-order" className="font-bold text-[#203c2b]">Track order</Link><a href="tel:+918096413082" className="font-bold text-[#203c2b]">+91 80964 13082</a></div></div></footer>
    </div>
  );
}
