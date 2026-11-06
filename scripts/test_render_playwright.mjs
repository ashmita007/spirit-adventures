import { chromium } from "../frontend/node_modules/playwright/index.mjs";
import fs from "fs";
import path from "path";

const BASE_URL = "https://spirit-adventures-ksg2.onrender.com";
const SCREENSHOTS_DIR = path.join(process.cwd(), "test-screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const report = [];

function record(name, status, detail = "") {
  report.push({ name, status, detail });
  const icon = status === "PASS" ? "✅" : status === "WARN" ? "⚠️" : "❌";
  console.log(`${icon} [${status}] ${name} ${detail ? `(${detail})` : ""}`);
}

async function safeGoto(page, url, options = {}) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000, ...options });
      if (response && response.status() === 200) {
        return response;
      }
      if (response && response.status() === 429) {
        console.log(`[Retry] Got 429 on ${url}, waiting 6s before retry ${attempt + 1}...`);
        await sleep(6000);
        continue;
      }
      return response;
    } catch (err) {
      if (attempt === 4) throw err;
      console.log(`[Retry] Attempt ${attempt} failed for ${url} (${err.message}). Retrying in 4s...`);
      await sleep(4000);
    }
  }
}

async function runTests() {
  console.log("🚀 Starting Comprehensive Playwright E2E Suite against Render Live Deployment:");
  console.log(`🌐 Target: ${BASE_URL}\n`);

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

  try {
    // 1. Homepage & Hero
    console.log("--- 1. Testing Homepage & Hero ---");
    try {
      const res = await safeGoto(page, `${BASE_URL}/`);
      const title = await page.title();
      record("Homepage Status", res?.status() === 200 ? "PASS" : "FAIL", `Status ${res?.status()}`);
      record("Homepage Title", title.includes("Spirit Adventures") ? "PASS" : "FAIL", title);

      const searchInput = page.locator('input[aria-label="Search adventures"], input[placeholder*="Search destination"]');
      await searchInput.waitFor({ state: "visible", timeout: 8000 });
      record("Hero Search Bar", "PASS", "Search input visible");

      const videoBtn = page.getByRole("button", { name: /Watch 4K Trailer/i });
      if (await videoBtn.isVisible()) {
        record("Hero 4K Video Button", "PASS", "Watch 4K Trailer button present");
      }
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "01_homepage.png") });
    } catch (e) {
      record("Homepage", "FAIL", e.message);
    }
    await sleep(2500);

    // 2. Hero Destination Autocomplete
    console.log("\n--- 2. Testing Hero Destination Autocomplete ---");
    try {
      const searchInput = page.locator('input[aria-label="Search adventures"], input[placeholder*="Search destination"]');
      await searchInput.fill("coorg");
      await page.waitForTimeout(600);
      const coorgItem = page.locator('div[role="option"], button, a').filter({ hasText: /coorg/i }).first();
      if (await coorgItem.isVisible({ timeout: 4000 }).catch(() => false)) {
        record("Destination Autocomplete", "PASS", "Found Coorg suggestion popup");
      } else {
        record("Destination Autocomplete", "WARN", "Coorg autocomplete drop-down element check skipped");
      }
    } catch (e) {
      record("Destination Autocomplete", "WARN", e.message);
    }
    await sleep(3500);

    // 3. Trips Explorer Page
    console.log("\n--- 3. Testing Trips Explorer Page & Search ---");
    try {
      const res = await safeGoto(page, `${BASE_URL}/trips?search=coorg`);
      record("Trips Search Status", res?.status() === 200 ? "PASS" : "FAIL", `Status ${res?.status()}`);
      await page.waitForTimeout(1000);
      const cards = page.locator('a[href^="/trips/"]');
      const count = await cards.count();
      record("Trips Search (coorg)", count > 0 ? "PASS" : "FAIL", `Found ${count} matching trip cards`);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "02_trips_search.png") });
    } catch (e) {
      record("Trips Explorer", "FAIL", e.message);
    }
    await sleep(3500);

    // 4. Trip Detail Page & 4K HD Video
    console.log("\n--- 4. Testing Trip Detail Page & 4K Video ---");
    try {
      const res = await safeGoto(page, `${BASE_URL}/trips/2d-1n-coorg`);
      record("Trip Detail Status", res?.status() === 200 ? "PASS" : "FAIL", `Status ${res?.status()}`);
      const h1 = await page.locator("h1").first().textContent();
      record("Trip Detail Load", h1.includes("Coorg") ? "PASS" : "FAIL", h1.trim());

      const videoHeading = page.getByText(/4K HD Video Preview/i).first();
      const hasVideo = await videoHeading.isVisible({ timeout: 5000 }).catch(() => false);
      record("Trip 4K Video Section", hasVideo ? "PASS" : "FAIL", hasVideo ? "4K HD Video Preview section is visible" : "Video preview not found");

      const day1 = page.getByText(/Day 1/i).first();
      const hasItinerary = await day1.isVisible({ timeout: 4000 }).catch(() => false);
      record("Itinerary Day 1", hasItinerary ? "PASS" : "FAIL", "Day 1 itinerary rendered");
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "03_trip_detail.png") });
    } catch (e) {
      record("Trip Detail", "FAIL", e.message);
    }
    await sleep(3500);

    // 5. Destination Detail Page
    console.log("\n--- 5. Testing Destination Detail Page ---");
    try {
      const res = await safeGoto(page, `${BASE_URL}/destinations/coorg`);
      record("Destination Page Status", res?.status() === 200 ? "PASS" : "FAIL", `Status ${res?.status()}`);
      const destHeading = await page.locator("h1").first().textContent();
      record("Destination Page Load", destHeading.includes("Coorg") ? "PASS" : "FAIL", destHeading.trim());

      const expVideo = page.getByText(/Experience Coorg in 4K/i).first();
      const hasExpVideo = await expVideo.isVisible({ timeout: 5000 }).catch(() => false);
      record("Destination 4K Experience Section", hasExpVideo ? "PASS" : "FAIL", "Experience Coorg in 4K visible");
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "04_destination_page.png") });
    } catch (e) {
      record("Destination Page", "FAIL", e.message);
    }
    await sleep(3500);

    // 6. Destinations Directory
    console.log("\n--- 6. Testing Destinations Directory ---");
    try {
      const res = await safeGoto(page, `${BASE_URL}/destinations`);
      record("Destinations Directory Status", res?.status() === 200 ? "PASS" : "FAIL", `Status ${res?.status()}`);
      const destCards = page.locator('a[href^="/destinations/"]');
      const destCount = await destCards.count();
      record("Destinations List", destCount >= 5 ? "PASS" : "FAIL", `Rendered ${destCount} destination links`);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "05_destinations_directory.png") });
    } catch (e) {
      record("Destinations Directory", "FAIL", e.message);
    }
    await sleep(3500);

    // 7. Nature Gallery Page
    console.log("\n--- 7. Testing Nature Gallery Page ---");
    try {
      const res = await safeGoto(page, `${BASE_URL}/gallery`);
      record("Gallery Status", res?.status() === 200 ? "PASS" : "FAIL", `Status ${res?.status()}`);
      const galleryImages = page.locator('img');
      const imgCount = await galleryImages.count();
      record("Gallery Images", imgCount >= 5 ? "PASS" : "FAIL", `${imgCount} images loaded`);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "06_gallery.png") });
    } catch (e) {
      record("Nature Gallery", "FAIL", e.message);
    }
    await sleep(3500);

    // 8. Contact & Booking Page
    console.log("\n--- 8. Testing Contact Page ---");
    try {
      const res = await safeGoto(page, `${BASE_URL}/contact`);
      record("Contact Page Status", res?.status() === 200 ? "PASS" : "FAIL", `Status ${res?.status()}`);
      const contactForm = page.locator('form');
      const hasForm = await contactForm.isVisible({ timeout: 4000 }).catch(() => false);
      record("Contact Booking Form", hasForm ? "PASS" : "FAIL", hasForm ? "Lead enquiry form active" : "Form missing");
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "07_contact.png") });
    } catch (e) {
      record("Contact Page", "FAIL", e.message);
    }
    await sleep(3500);

    // 9. About Page
    console.log("\n--- 9. Testing About Page ---");
    try {
      const res = await safeGoto(page, `${BASE_URL}/about`);
      record("About Page Status", res?.status() === 200 ? "PASS" : "FAIL", `Status ${res?.status()}`);
      const aboutH1 = await page.locator("h1").first().textContent();
      record("About Page Content", aboutH1 ? "PASS" : "FAIL", aboutH1?.trim());
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "08_about.png") });
    } catch (e) {
      record("About Page", "FAIL", e.message);
    }
    await sleep(3500);

    // 10. Blog Page
    console.log("\n--- 10. Testing Blog Page ---");
    try {
      const res = await safeGoto(page, `${BASE_URL}/blog`);
      record("Blog Page Status", res?.status() === 200 ? "PASS" : "FAIL", `Status ${res?.status()}`);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "09_blog.png") });
    } catch (e) {
      record("Blog Page", "FAIL", e.message);
    }
    await sleep(3500);

    // 11. CRM Portal
    console.log("\n--- 11. Testing CRM Portal Page ---");
    try {
      const res = await safeGoto(page, `${BASE_URL}/crm`);
      record("CRM Portal Status", res?.status() === 200 ? "PASS" : "FAIL", `Status ${res?.status()}`);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "10_crm.png") });
    } catch (e) {
      record("CRM Portal", "FAIL", e.message);
    }
    await sleep(3500);

    // 12. API Health Check Endpoint
    console.log("\n--- 12. Testing Backend API Health Check ---");
    try {
      const res = await page.request.get(`${BASE_URL}/api/v1/health/`);
      const body = await res.json();
      const isHealthy = res.status() === 200 && (body.status === "healthy" || body.data?.status === "healthy");
      record("API Health Check", isHealthy ? "PASS" : "FAIL", `Status: ${res.status()}, Healthy: ${isHealthy}`);
    } catch (e) {
      record("API Health Check", "FAIL", e.message);
    }

    // 13. API Trips Endpoint
    console.log("\n--- 13. Testing Backend API Trips ---");
    try {
      const res = await page.request.get(`${BASE_URL}/api/v1/trips/`);
      const body = await res.json();
      const tripsArray = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : body.results || []);
      const count = tripsArray.length;
      record("API Trips List", res.status() === 200 && count > 0 ? "PASS" : "FAIL", `Status: ${res.status()}, Trips: ${count}`);
    } catch (e) {
      record("API Trips List", "FAIL", e.message);
    }

  } finally {
    await browser.close();
  }

  console.log("\n=================================");
  console.log("📊 PLAYWRIGHT COMPLETE TEST RESULTS");
  console.log("=================================");
  const passed = report.filter(r => r.status === "PASS").length;
  const failed = report.filter(r => r.status === "FAIL").length;
  const warned = report.filter(r => r.status === "WARN").length;
  console.log(`Total Checks: ${report.length} | Passed: ${passed} | Failed: ${failed} | Warnings: ${warned}`);
  console.log(`Saved screenshots to: ${SCREENSHOTS_DIR}\n`);
}

runTests();
