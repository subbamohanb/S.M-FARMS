import { chromium } from "playwright";

const baseUrl = process.env.SMFARMS_PREVIEW_URL || "https://3000-ikrubikrk4w84c1pfltno-4562b105.sg1.manus.computer";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const cases = [
  { path: "/", cartLabel: "Open cart" },
  { path: "/shop", cartLabel: "Open cart" },
  { path: "/agri-farm", cartLabel: "Open cart" },
  { path: "/dairy-farm", cartLabel: "Open dairy cart" },
];

for (const testCase of cases) {
  await page.goto(`${baseUrl}${testCase.path}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await page.getByRole("button", { name: testCase.cartLabel }).click();
  await page.getByRole("button", { name: /Continue to payment/ }).click();
  await page.getByText("Payment is temporarily unavailable.").waitFor({ state: "visible", timeout: 20_000 });
  console.log(`${testCase.path}: safe fallback checkout passed`);
}

await browser.close();
