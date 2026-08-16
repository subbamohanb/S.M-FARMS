import { chromium } from "playwright";

const baseUrl = process.env.SMFARMS_PREVIEW_URL || "https://3000-ikrubikrk4w84c1pfltno-4562b105.sg1.manus.computer";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

for (const path of ["/agri-farm", "/dairy-farm"]) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.getByRole("button", { name: /Open(?: dairy)? cart/i }).click();
  await page.getByRole("button", { name: "Save order and continue" }).click();
  await page.getByText(/Order #\d+ saved/).waitFor({ state: "visible", timeout: 10000 });
  console.log(`${path}: pending order flow passed`);
}

await browser.close();
