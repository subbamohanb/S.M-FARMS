import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type CodInvoice = {
  id: number;
  status: "pending" | "paid" | "failed" | "cancelled";
  paymentMethod: "razorpay" | "cod";
  fulfillmentStatus: string;
  amountInr: number;
  customerName: string | null;
  createdAt: Date;
  items: Array<{ productName: string; unitPriceInr: number; quantity: number; lineTotalInr: number }>;
};

export async function createCodInvoicePdf(invoice: CodInvoice) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const darkGreen = rgb(0.125, 0.235, 0.17);
  const clay = rgb(0.72, 0.31, 0.21);
  const muted = rgb(0.34, 0.39, 0.33);

  page.drawText("S.M FARMS", { x: 48, y: 780, size: 25, font: bold, color: darkGreen });
  page.drawText("FARM INPUTS · DAIRY · INDIA", { x: 50, y: 758, size: 9, font: bold, color: clay });
  page.drawText("CASH ON DELIVERY INVOICE", { x: 365, y: 778, size: 10, font: bold, color: clay });
  page.drawText(`Order #${invoice.id}`, { x: 365, y: 758, size: 11, font: regular, color: muted });
  page.drawText(`Issued ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`, { x: 365, y: 742, size: 10, font: regular, color: muted });
  page.drawLine({ start: { x: 48, y: 718 }, end: { x: 547, y: 718 }, thickness: 1, color: rgb(0.85, 0.83, 0.77) });

  page.drawText(`Bill to: ${invoice.customerName || "S.M FARMS customer"}`, { x: 48, y: 688, size: 11, font: bold, color: darkGreen });
  page.drawText("Payment method: Cash on Delivery", { x: 48, y: 670, size: 10, font: regular, color: muted });
  page.drawText("Please keep the amount ready for delivery.", { x: 48, y: 654, size: 10, font: regular, color: muted });

  let y = 610;
  page.drawText("ITEM", { x: 48, y, size: 9, font: bold, color: clay });
  page.drawText("QTY", { x: 390, y, size: 9, font: bold, color: clay });
  page.drawText("AMOUNT", { x: 465, y, size: 9, font: bold, color: clay });
  y -= 24;
  for (const item of invoice.items) {
    page.drawText(item.productName.slice(0, 48), { x: 48, y, size: 10, font: regular, color: darkGreen });
    page.drawText(String(item.quantity), { x: 395, y, size: 10, font: regular, color: muted });
    page.drawText(`INR ${item.lineTotalInr.toLocaleString("en-IN")}`, { x: 465, y, size: 10, font: regular, color: darkGreen });
    y -= 22;
  }
  page.drawLine({ start: { x: 360, y: y - 8 }, end: { x: 547, y: y - 8 }, thickness: 1, color: rgb(0.85, 0.83, 0.77) });
  page.drawText("TOTAL DUE", { x: 360, y: y - 34, size: 11, font: bold, color: clay });
  page.drawText(`INR ${invoice.amountInr.toLocaleString("en-IN")}`, { x: 465, y: y - 34, size: 13, font: bold, color: darkGreen });
  page.drawText("Thank you for choosing S.M FARMS. Keep this invoice for your records.", { x: 48, y: 90, size: 9, font: regular, color: muted });

  return pdf.save();
}

export async function downloadCodInvoice(invoice: CodInvoice) {
  const bytes = await createCodInvoicePdf(invoice);
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `sm-farms-cod-invoice-${invoice.id}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
