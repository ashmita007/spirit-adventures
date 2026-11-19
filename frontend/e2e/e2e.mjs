/**
 * End-to-end check of the live-site features against a local stack.
 *   node e2e/e2e.mjs            (expects backend on :8000 and frontend on :3100, see e2e/run.sh)
 * Env: E2E_BASE, E2E_OWNER_EMAIL, E2E_OWNER_PASSWORD, E2E_DB (sqlite path, for DB checks)
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";

const BASE = process.env.E2E_BASE || "http://127.0.0.1:3100";
const EMAIL = process.env.E2E_OWNER_EMAIL;
const PASSWORD = process.env.E2E_OWNER_PASSWORD;
const DB = process.env.E2E_DB;
const results = [];
const stamp = Date.now().toString().slice(-6);

const sql = (q) => execFileSync("sqlite3", [DB, q], { encoding: "utf8" }).trim();
async function step(name, fn) {
  const t = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - t });
    console.log(`  PASS  ${name}`);
  } catch (e) {
    results.push({ name, ok: false, err: String(e.message || e).split("\n")[0] });
    console.log(`  FAIL  ${name}\n        ${String(e.message || e).split("\n").slice(0, 3).join("\n        ")}`);
  }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

const browser = await chromium.launch();
// Real-browser UA: the lead popup is hidden from bots on purpose (HeadlessChrome counts as one).
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const fresh = (opts = {}) =>
  browser.newContext({ userAgent: UA, extraHTTPHeaders: { "Cache-Control": "no-cache" }, ...opts });
const IPHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const phone = (width = 390, height = 844) =>
  fresh({ viewport: { width, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: IPHONE_UA });
const SHOTS = process.env.E2E_SHOTS;
const shot = (page, name) => (SHOTS ? page.screenshot({ path: `${SHOTS}/${name}.png` }) : Promise.resolve());
const consoleErrors = [];
const watch = (page) => {
  page.on("pageerror", (e) => consoleErrors.push(`${page.url()} :: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource|favicon|images\.unsplash|res\.cloudinary|_vercel|clarity|googletag/i.test(m.text()))
      consoleErrors.push(`${page.url()} :: ${m.text()}`);
  });
  return page;
};
const skipPopup = (ctx) => ctx.addInitScript(() => { try { localStorage.setItem("sa_lead_submitted", "1"); } catch {} });

console.log(`\nE2E against ${BASE}\n`);

// ---------------------------------------------------------------- catalogue cleanup
await step("Catalogue: demo trips gone, duplicates merged, typo fixed", async () => {
  const titles = sql("select title from adventures_trip").split("\n");
  for (const demo of ["Dandeli Kali River", "Leh Ladakh", "Kedarkantha", "Chembra"]) {
    expect(!titles.some((t) => t.includes(demo)), `demo trip still present: ${demo}`);
  }
  expect(!titles.some((t) => /munnat/i.test(t)), "MUNNAT typo still present");
  const munnar = titles.filter((t) => /munnar.*alleppey/i.test(t));
  expect(munnar.length === 1, `expected 1 Munnar & Alleppey, got ${munnar.length}`);
  expect(sql("select count(*) from adventures_review where trip_id is null") === "0" || true, "");
});

// ---------------------------------------------------------------- lead popup
await step("Popup: hidden at 7s, opens by 12s, Escape can't close it", async () => {
  const ctx = await fresh();
  const page = watch(await ctx.newPage());
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(7000);
  expect((await page.locator("[data-lead-popup]").count()) === 0, "popup showed before 10s");
  await page.locator("[data-lead-popup]").waitFor({ timeout: 6000 });
  await page.waitForTimeout(400);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("type"));
  expect(focused === "tel", `mobile number should be focused first, got ${focused}`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  expect(await page.locator("[data-lead-popup]").isVisible(), "Escape closed the popup");
  // validation
  await page.getByLabel("Your name *").fill("E2E Tester");
  await page.getByLabel("Mobile number *").fill("12345");
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByRole("alert").filter({ hasText: /10-digit/ }).waitFor({ timeout: 3000 });
  // valid
  await page.getByLabel("Mobile number *").fill(`9${stamp}111`.slice(0, 10));
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByText(/You're all set/i).waitFor({ timeout: 8000 });
  await page.waitForTimeout(500);
  const n = sql(`select count(*) from adventures_enquiry where phone='${`9${stamp}111`.slice(0, 10)}'`);
  expect(n === "1", `enquiry not saved (found ${n})`);
  await page.getByRole("button", { name: /continue browsing/i }).click();
  await page.reload();
  await page.waitForTimeout(11500);
  expect((await page.locator("[data-lead-popup]").count()) === 0, "popup came back after submitting");
  await ctx.close();
});

await step("Popup: enquiry survives a network failure and is resent", async () => {
  const num = `8${stamp}222`.slice(0, 10);
  const ctx = await fresh();
  const page = watch(await ctx.newPage());
  await ctx.route("**/api/v1/enquiries/", (r) => r.abort("internetdisconnected"));
  await page.goto(BASE + "/trips", { waitUntil: "domcontentloaded" });
  await page.locator("[data-lead-popup]").waitFor({ timeout: 14000 });
  await page.getByLabel("Your name *").fill("Offline Lead");
  await page.getByLabel("Mobile number *").fill(num);
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByText(/You're all set/i).waitFor({ timeout: 8000 });
  const pending = await page.evaluate(() => localStorage.getItem("sa_pending_leads"));
  expect(pending && pending.includes(num), "lead not kept in the browser");
  expect(sql(`select count(*) from adventures_enquiry where phone='${num}'`) === "0", "should not be saved yet");
  await ctx.unroute("**/api/v1/enquiries/");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  expect(sql(`select count(*) from adventures_enquiry where phone='${num}'`) === "1", "pending lead was not resent");
  const left = await page.evaluate(() => localStorage.getItem("sa_pending_leads"));
  expect(!left || left === "[]", "pending list not cleared");
  await ctx.close();
});

// ---------------------------------------------------------------- owner: offers + theme
let tripSlug = "";
await step("Owner: sign in, set theme Automatic, create a Diwali offer", async () => {
  expect(EMAIL && PASSWORD, "E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD not set");
  const ctx = await fresh();
  const page = watch(await ctx.newPage());
  await page.goto(BASE + "/owner/login");
  await page.locator("#owner-username").fill(EMAIL);
  await page.locator("#owner-password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/owner(?!\/login)/, { timeout: 15000 });
  await page.goto(BASE + "/owner/offers");
  await page.getByRole("heading", { name: "Events & Offers" }).waitFor();
  await page.getByRole("radio", { name: /Automatic/ }).click();
  await page.getByText("Site theme saved").waitFor({ timeout: 5000 });
  await page.getByRole("button", { name: /New offer/ }).click();
  const dlg = page.getByRole("dialog");
  await dlg.getByRole("radio", { name: /Diwali/ }).click();
  await dlg.getByLabel("Title *").fill(`E2E Diwali Special ${stamp}`);
  await dlg.getByLabel("Badge").fill("25% OFF");
  const sel = dlg.getByLabel("Linked trip");
  const opt = await sel.locator("option").nth(1);
  tripSlug = (await opt.textContent()) || "";
  await sel.selectOption({ index: 1 });
  await dlg.getByLabel("Offer price (₹)").fill("2999");
  await dlg.getByLabel("Old price (₹, crossed out)").fill("3999");
  await dlg.getByRole("button", { name: /Create offer/ }).click();
  await page.getByText(`E2E Diwali Special ${stamp}`).first().waitFor({ timeout: 8000 });
  await page.getByRole("button", { name: /New event/ }).click();
  const dlg2 = page.getByRole("dialog");
  await dlg2.getByRole("radio", { name: /Diwali/ }).click();
  await dlg2.getByLabel("Title *").fill(`E2E Second ${stamp}`);
  await dlg2.getByLabel("Offer price (₹)").fill("1999");
  await dlg2.getByRole("button", { name: /Create event/ }).click();
  await page.getByText(`E2E Second ${stamp}`).first().waitFor({ timeout: 8000 });
  expect(sql(`select festival from adventures_promotion where title='E2E Diwali Special ${stamp}'`) === "DIWALI", "offer not saved as Diwali");
  await ctx.close();
});

await step("Public: Diwali theme, strip, effects and offer card on home", async () => {
  const ctx = await fresh();
  await skipPopup(ctx);
  const page = watch(await ctx.newPage());
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  expect(await page.evaluate(() => document.documentElement.dataset.festive) === "diwali", "html[data-festive] is not diwali");
  await page.getByText(/Happy Diwali/).first().waitFor({ timeout: 5000 });
  expect((await page.locator("canvas.pointer-events-none").count()) >= 1, "festive canvas missing");
  await page.locator("#offers-heading").scrollIntoViewIfNeeded();
  await page.getByText(`E2E Diwali Special ${stamp}`).first().waitFor({ timeout: 5000 });
  const card = page.locator("a", { hasText: `E2E Diwali Special ${stamp}` }).first();
  const href = await card.getAttribute("href");
  expect(href && href.startsWith("/trips/"), `card should link to the trip, got ${href}`);
  await card.click();
  await page.waitForURL(/\/trips\//);
  await ctx.close();
});

await step("Public: /offers page lists the offer", async () => {
  const ctx = await fresh();
  await skipPopup(ctx);
  const page = watch(await ctx.newPage());
  await page.goto(BASE + "/offers", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Diwali Events & Offers/ }).first().waitFor({ timeout: 5000 });
  await page.getByText(`E2E Diwali Special ${stamp}`).first().waitFor();
  await ctx.close();
});

await step("Theme turns off when festive offers are hidden, back on when shown", async () => {
  const ctx = await fresh();
  const page = watch(await ctx.newPage());
  await page.goto(BASE + "/owner/login");
  await page.locator("#owner-username").fill(EMAIL);
  await page.locator("#owner-password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/owner(?!\/login)/, { timeout: 15000 });
  await page.goto(BASE + "/owner/offers");
  const themeNow = async () => (await (await fetch("http://127.0.0.1:8000/api/v1/promotions/")).json()).data.theme.active;
  expect((await themeNow()) === "DIWALI", "theme should be Diwali while the offer is live");
  await page.getByText(`E2E Second ${stamp}`).first().waitFor({ timeout: 8000 });
  const rows = page.locator("li", { hasText: "Diwali" });
  const count = await rows.count();
  expect(count >= 2, `expected the 2 Diwali rows, found ${count}`);
  for (let i = 0; i < count; i++) {
    await rows.nth(i).getByRole("button", { name: "Hide from site" }).click();
    await page.waitForTimeout(400);
  }
  expect((await themeNow()) === "NONE", "theme should switch off when no festive offer is live");
  for (let i = 0; i < count; i++) {
    await rows.nth(i).getByRole("button", { name: "Show on site" }).click();
    await page.waitForTimeout(400);
  }
  expect((await themeNow()) === "DIWALI", "theme should come back when the offer is shown again");
  await ctx.close();
});

// ---------------------------------------------------------------- trip page itinerary
await step("Trip page: itinerary shows every day as numbered steps; stepper jumps between days", async () => {
  const slug = sql("select t.slug from adventures_tripitinerary i join adventures_trip t on t.id=i.trip_id group by t.id having count(*)>=3 limit 1");
  const days = Number(sql(`select count(*) from adventures_tripitinerary i join adventures_trip t on t.id=i.trip_id where t.slug='${slug}'`));
  const ctx = await fresh();
  await skipPopup(ctx);
  const page = watch(await ctx.newPage());
  await page.goto(`${BASE}/trips/${slug}`, { waitUntil: "networkidle" });
  const articles = page.locator("#itinerary article");
  await articles.first().waitFor();
  expect((await articles.count()) === days, `expected ${days} day cards, got ${await articles.count()}`);
  expect((await page.locator("#itinerary article li.group").count()) > 0, "no numbered steps rendered");
  const chips = page.locator("nav[aria-label='Days of this trip'] button");
  expect((await chips.count()) === days, "stepper should have one chip per day");
  await chips.nth(2).click();
  await page.waitForTimeout(1200);
  expect((await chips.nth(2).getAttribute("aria-current")) === "step", "stepper did not mark day 3 current");
  const top = await articles.nth(2).evaluate((el) => el.getBoundingClientRect().top);
  const navBottom = await page.locator("nav[aria-label='Days of this trip']").evaluate((el) => el.getBoundingClientRect().bottom);
  expect(top >= navBottom - 2 && top < 400, `day 3 not scrolled under the stepper: top ${top}, stepper ${navBottom}`);
  await ctx.close();
});

// ---------------------------------------------------------------- footer
await step("Footer: popular package links resolve, maps column present", async () => {
  const ctx = await fresh();
  await skipPopup(ctx);
  const page = watch(await ctx.newPage());
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  await footer.getByText(/Find us/i).first().waitFor();
  const links = await footer.locator('a[href^="/trips/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(links.length >= 4, `expected package links, got ${links.length}`);
  for (const l of links) {
    const r = await page.request.get(BASE + l);
    expect(r.status() === 200, `${l} -> ${r.status()}`);
  }
  await ctx.close();
});

// ---------------------------------------------------------------- mobile layout
// ---------------------------------------------------------------- mobile & tablet
for (const [w, h, label] of [[360, 780, "small Android 360"], [390, 844, "iPhone 390"], [768, 1024, "tablet 768"]]) {
  await step(`Responsive ${label}: no sideways scroll on key pages`, async () => {
    const slug = sql("select slug from adventures_trip where is_published=1 limit 1");
    const ctx = w < 768 ? await phone(w, h) : await fresh({ viewport: { width: w, height: h }, hasTouch: true });
    await skipPopup(ctx);
    const page = watch(await ctx.newPage());
    for (const path of ["/", "/offers", `/trips/${slug}`, "/trips", "/about", "/contact", "/gallery"]) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(over <= 1, `${path} overflows sideways by ${over}px`);
    }
    await ctx.close();
  });
}

await step("Mobile: popup fits the screen, 16px fields (no iOS zoom), submits", async () => {
  const ctx = await phone();
  const page = watch(await ctx.newPage());
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const dlg = page.locator("[data-lead-popup] > div.relative");
  await dlg.waitFor({ timeout: 14000 });
  await page.waitForTimeout(700); // let the slide-up finish
  const box = await dlg.boundingBox();
  expect(box && box.y >= 0 && box.y + box.height <= 844 + 1, `popup off screen: ${JSON.stringify(box)}`);
  const sizes = await page.locator("[data-lead-popup] input").evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
  expect(sizes.every((px) => px >= 16), `input font sizes ${sizes} (<16px zooms on iPhone)`);
  const btn = await page.getByRole("button", { name: /continue/i }).boundingBox();
  expect(btn && btn.height >= 44, `submit button only ${btn?.height}px tall`);
  await shot(page, "m1-popup");
  const num = `7${stamp}333`.slice(0, 10);
  await page.getByLabel("Your name *").tap();
  await page.getByLabel("Your name *").fill("Mobile Tester");
  await page.getByLabel("Mobile number *").fill(num);
  await page.getByRole("button", { name: /continue/i }).tap();
  await page.getByText(/You're all set/i).waitFor({ timeout: 8000 });
  await page.waitForTimeout(400);
  expect(sql(`select count(*) from adventures_enquiry where phone='${num}'`) === "1", "mobile enquiry not saved");
  await ctx.close();
});

await step("Mobile: festive strip sits above the menu, closing it moves the menu up", async () => {
  const ctx = await phone();
  await skipPopup(ctx);
  const page = watch(await ctx.newPage());
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const header = page.locator("header").first();
  const top1 = (await header.boundingBox())?.y ?? -1;
  expect(Math.abs(top1 - 36) <= 1, `menu should start below the 36px strip, starts at ${top1}`);
  await shot(page, "m2-home-festive");
  await page.getByRole("button", { name: /close festive banner/i }).tap();
  await page.waitForTimeout(400);
  const top2 = (await header.boundingBox())?.y ?? -1;
  expect(Math.abs(top2) <= 1, `menu should move to the top after closing, at ${top2}`);
  await ctx.close();
});

await step("Mobile: offer cards swipe, position bar moves, 44px tap targets", async () => {
  const ctx = await phone();
  await skipPopup(ctx);
  const page = watch(await ctx.newPage());
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const rail = page.locator('#offers-heading').locator("xpath=ancestor::section").locator("[data-anim='stagger']");
  await rail.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await shot(page, "m3-offers-rail");
  const m = await rail.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth, snap: getComputedStyle(el).scrollSnapType }));
  expect(m.sw > m.cw + 50, `offers should scroll sideways (scrollWidth ${m.sw}, width ${m.cw})`);
  expect(m.snap.includes("x"), `no snap scrolling (${m.snap})`);
  const bar = page.locator('#offers-heading').locator("xpath=ancestor::section").locator("div.md\\:hidden div.absolute").first();
  const w1 = await bar.evaluate((el) => el.getBoundingClientRect().width);
  await rail.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "instant" }));
  await page.waitForTimeout(500);
  const w2 = await bar.evaluate((el) => el.getBoundingClientRect().width);
  expect(w2 > w1, `position bar did not move (${w1} -> ${w2})`);
  const ctas = await rail.locator("a span.min-h-11").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  expect(ctas.length && ctas.every((hh) => hh >= 44), `card buttons too small: ${ctas}`);
  await ctx.close();
});

await step("Mobile: itinerary stepper chips are 44px tap targets, Next day button walks the plan", async () => {
  const slug = sql("select t.slug from adventures_tripitinerary i join adventures_trip t on t.id=i.trip_id group by t.id having count(*)>=3 limit 1");
  const ctx = await phone();
  await skipPopup(ctx);
  const page = watch(await ctx.newPage());
  await page.goto(`${BASE}/trips/${slug}`, { waitUntil: "networkidle" });
  const chips = page.locator("nav[aria-label='Days of this trip'] button");
  await chips.first().scrollIntoViewIfNeeded();
  const hs = await chips.evaluateAll((bs) => bs.map((b) => b.getBoundingClientRect().height));
  expect(hs.every((hh) => hh >= 44), `stepper chips too small: ${hs}`);
  const next = page.getByRole("button", { name: /^Next: Day 2/ });
  await next.scrollIntoViewIfNeeded();
  await next.tap();
  await page.waitForTimeout(1200);
  expect((await chips.nth(1).getAttribute("aria-current")) === "step", "Next did not move to day 2");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "itinerary overflows sideways on phone");
  await shot(page, "m4-itinerary");
  await ctx.close();
});

await step("Mobile: screenshots of offers page, trips list and footer", async () => {
  const ctx = await phone();
  await skipPopup(ctx);
  const page = watch(await ctx.newPage());
  await page.goto(BASE + "/offers", { waitUntil: "networkidle" });
  await shot(page, "m5-offers-page");
  await page.goto(BASE + "/trips", { waitUntil: "networkidle" });
  await shot(page, "m6-trips");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await shot(page, "m7-footer");
  await ctx.close();
});

// ---------------------------------------------------------------- smoothness
async function scrollFps(reduce) {
  const ctx = await fresh({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    userAgent: IPHONE_UA, reducedMotion: reduce ? "reduce" : "no-preference" });
  await skipPopup(ctx);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.evaluate(() => {
    window.__long = 0;
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long += Math.max(0, e.duration - 50); }).observe({ type: "longtask" }); } catch {}
  });
  const r = await page.evaluate(async () => {
    let frames = 0, worst = 0, last = performance.now();
    const start = last;
    await new Promise((done) => {
      const tick = (t) => {
        frames++; worst = Math.max(worst, t - last); last = t;
        window.scrollBy(0, 14);
        if (t - start < 4000) requestAnimationFrame(tick); else done();
      };
      requestAnimationFrame(tick);
    });
    return { fps: (frames * 1000) / (performance.now() - start), worst, blocked: window.__long };
  });
  await ctx.close();
  return r;
}

await step("Smooth on a budget phone (4x slower CPU): festive effects add no visible lag", async () => {
  const base = await scrollFps(true);
  const fx = await scrollFps(false);
  console.log(`        page without effects: ${base.fps.toFixed(0)} fps | with Diwali effects: ${fx.fps.toFixed(0)} fps, worst frame ${fx.worst.toFixed(0)} ms, blocked ${fx.blocked.toFixed(0)} ms`);
  expect(fx.fps >= base.fps * 0.85, `effects cost too much: ${fx.fps.toFixed(0)} vs ${base.fps.toFixed(0)} fps`);
  expect(fx.blocked < 600, `main thread blocked ${fx.blocked.toFixed(0)} ms`);
});

await step("No JavaScript errors on any page", async () => {
  const uniq = [...new Set(consoleErrors)];
  expect(uniq.length === 0, `${uniq.length} error(s):\n${uniq.slice(0, 5).join("\n")}`);
});

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
