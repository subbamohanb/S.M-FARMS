import { chromium } from "playwright";

const baseUrl = process.env.PREVIEW_URL ?? "https://3000-iiymowtje41xeci3gxr8s-bfd4cbc5.sg1.manus.computer";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage();
try {
  await page.goto(`${baseUrl}/shop`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.getByRole("button", { name: "Open cart" }).click();
  await page.getByRole("radio", { name: /Cash on Delivery/i }).check();
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await page.getByText(/placed/i).waitFor({ state: "visible", timeout: 15000 });
  console.log("COD preview flow: verified");
} finally {
  await browser.close();
}
