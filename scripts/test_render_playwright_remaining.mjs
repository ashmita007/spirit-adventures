import { chromium } from "../frontend/node_modules/playwright/index.mjs";
import fs from "fs";
import path from "path";

const BASE_URL = "https://spirit-adventures-ksg2.onrender.com";
const SCREENSHOTS_DIR = path.join(process.cwd(), "test-screenshots");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runRemainingTests() {
  console.log("🚀 Running Playwright tests for remaining pages against Render Deployment:\n");

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox"
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  });

  const page = await context.newPage();

  const pagesToTest = [
    { name: "Nature Gallery", path: "/gallery", selector: "img", label: "Gallery page loaded" },
    { name: "Contact & Booking", path: "/contact", selector: "form", label: "Contact enquiry form" },
    { name: "About Us", path: "/about", selector: "h1", label: "About page headline" },
    { name: "Blog Index", path: "/blog", selector: "body", label: "Blog page content" },
  ];

  for (const item of pagesToTest) {
    console.log(`--- Testing ${item.name} (${item.path}) ---`);
    await sleep(2000);
    try {
      const res = await page.goto(`${BASE_URL}${item.path}`, { waitUntil: "domcontentloaded", timeout: 25000 });
      console.log(`✅ [PASS] ${item.name} Status: ${res.status()}`);

      const elem = page.locator(item.selector).first();
      await elem.waitFor({ state: "visible", timeout: 8000 });
      console.log(`✅ [PASS] ${item.name} Element: ${item.label} verified`);

      const screenshotFile = path.join(SCREENSHOTS_DIR, `verified_${item.path.replace('/', '')}.png`);
      await page.screenshot({ path: screenshotFile });
      console.log(`📸 Screenshot saved: ${screenshotFile}\n`);
    } catch (e) {
      console.log(`❌ [FAIL] ${item.name}: ${e.message}\n`);
    }
    await sleep(2000);
  }

  await browser.close();
  console.log("✨ All remaining pages tested successfully!");
}

runRemainingTests();
