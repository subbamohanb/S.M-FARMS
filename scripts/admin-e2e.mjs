import { chromium } from "playwright";

const baseUrl = process.env.SMFARMS_PREVIEW_URL || "https://3000-ikrubikrk4w84c1pfltno-4562b105.sg1.manus.computer";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Admin workspace." }).waitFor({ state: "visible" });
await page.getByRole("button", { name: "Orders" }).click();
await page.getByRole("heading", { name: "Move every order forward." }).waitFor({ state: "visible" });
await page.getByRole("button", { name: "Inventory" }).click();
await page.getByRole("heading", { name: "Track what is on hand." }).waitFor({ state: "visible" });
console.log("/admin: authenticated overview, order management, and inventory views passed");
await browser.close();
