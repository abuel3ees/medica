/**
 * Medica — Automated Demo Video Recording Script
 *
 * This script uses Playwright to navigate every section of the app,
 * move the mouse smoothly, click interactive elements, and type text
 * while recording a video. The output is a .webm file in public/videos/.
 *
 * Usage:
 *   node scripts/record-demo.mjs
 *
 * Prerequisites:
 *   - App running locally: php artisan serve (port 8000)
 *   - npm run dev (vite dev server)
 *   - Demo accounts seeded (manager@medica.test / password)
 */

import { chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.APP_URL || "http://localhost:8000";
const VIDEO_DIR = path.resolve(__dirname, "../public/videos");

// ─── Timing helpers ────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function smoothMouseMove(page, x, y, steps = 25) {
  const box = await page.evaluate(() => ({
    x: window.scrollX + window.innerWidth / 2,
    y: window.scrollY + window.innerHeight / 2,
  }));
  const startX = box.x;
  const startY = box.y;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // ease-in-out cubic
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    await page.mouse.move(
      startX + (x - startX) * ease,
      startY + (y - startY) * ease
    );
    await sleep(16); // ~60fps
  }
}

async function hoverElement(page, selector, pauseMs = 600) {
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ state: "visible", timeout: 3000 });
    const box = await el.boundingBox();
    if (box) {
      await smoothMouseMove(page, box.x + box.width / 2, box.y + box.height / 2);
      await sleep(pauseMs);
    }
  } catch {
    // Element not found, skip
  }
}

async function clickElement(page, selector, pauseMs = 800) {
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ state: "visible", timeout: 3000 });
    const box = await el.boundingBox();
    if (box) {
      await smoothMouseMove(page, box.x + box.width / 2, box.y + box.height / 2);
      await sleep(200);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await sleep(pauseMs);
    }
  } catch {
    // Element not found, skip
  }
}

async function slowType(page, selector, text, delayMs = 80) {
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ state: "visible", timeout: 3000 });
    await el.click();
    await sleep(200);
    for (const char of text) {
      await page.keyboard.type(char, { delay: delayMs });
    }
    await sleep(400);
  } catch {
    // skip
  }
}

async function scrollDown(page, amount = 300, pauseMs = 500) {
  await page.mouse.wheel(0, amount);
  await sleep(pauseMs);
}

async function scrollToTop(page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(600);
}

// ─── Main recording flow ───────────────────────────────────
async function main() {
  console.log("🎬 Starting Medica demo recording...");
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Video dir: ${VIDEO_DIR}\n`);

  const browser = await chromium.launch({
    headless: false, // Show the browser so you can see it
    args: ["--window-size=1440,900"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  try {
    // ══════════════════════════════════════════════════════════
    // 1. LANDING PAGE
    // ══════════════════════════════════════════════════════════
    console.log("📄 Landing page...");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await sleep(2000);

    // Hover hero elements
    await hoverElement(page, "h1");
    await sleep(500);
    await hoverElement(page, 'a:has-text("Start free")');

    // Scroll through features
    await scrollDown(page, 400);
    await sleep(800);
    await scrollDown(page, 400);
    await sleep(800);

    // Scroll to demo video section
    await scrollDown(page, 500);
    await sleep(1000);

    // Scroll through CTA / how it works
    await scrollDown(page, 500);
    await sleep(800);
    await scrollDown(page, 500);
    await sleep(800);

    // Back to top
    await scrollToTop(page);
    await sleep(800);

    // ══════════════════════════════════════════════════════════
    // 2. LOGIN
    // ══════════════════════════════════════════════════════════
    console.log("🔐 Logging in as manager...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await sleep(1000);

    // Type credentials slowly
    await slowType(page, 'input[type="email"], input[name="email"]', "manager@medica.test", 60);
    await slowType(page, 'input[type="password"], input[name="password"]', "password", 60);
    await sleep(500);

    // Click login
    await clickElement(page, 'button[type="submit"]', 2000);
    await page.waitForURL("**/dashboard", { timeout: 10000 }).catch(() => {});
    await sleep(2000);

    // ══════════════════════════════════════════════════════════
    // 3. DASHBOARD
    // ══════════════════════════════════════════════════════════
    console.log("📊 Dashboard...");
    await sleep(1500);

    // Hover stat cards
    await hoverElement(page, '[class*="stat"], [class*="card"]');
    await sleep(400);

    // Scroll to see charts
    await scrollDown(page, 300);
    await sleep(1000);
    await scrollDown(page, 300);
    await sleep(1000);
    await scrollToTop(page);
    await sleep(500);

    // ══════════════════════════════════════════════════════════
    // 4. VISITS PAGE
    // ══════════════════════════════════════════════════════════
    console.log("📋 Visits list...");
    await page.goto(`${BASE_URL}/visits`, { waitUntil: "networkidle" });
    await sleep(2000);

    // Hover a few visit rows
    await hoverElement(page, "table tbody tr, [class*='visit']");
    await sleep(400);
    await scrollDown(page, 300);
    await sleep(800);
    await scrollToTop(page);

    // ══════════════════════════════════════════════════════════
    // 5. LOG A VISIT (visit/create)
    // ══════════════════════════════════════════════════════════
    console.log("✏️  Visit form...");
    await page.goto(`${BASE_URL}/visits/create`, { waitUntil: "networkidle" });
    await sleep(2000);

    // Click doctor selector
    await clickElement(page, '[class*="select-trigger"], [class*="combobox"]', 800);
    await sleep(500);
    // Try to select first option
    await clickElement(page, '[class*="select-item"], [role="option"]', 800);

    // Scroll through form
    await scrollDown(page, 300);
    await sleep(800);

    // Hover the time goal buttons
    await hoverElement(page, 'button:has-text("Met Goal")');
    await sleep(300);
    await hoverElement(page, 'button:has-text("Exceeded")');
    await sleep(300);

    // Scroll more
    await scrollDown(page, 300);
    await sleep(800);

    // Show the efficiency preview
    await hoverElement(page, '[class*="efficiency"], [class*="preview"]');
    await sleep(1500);

    await scrollToTop(page);
    await sleep(500);

    // ══════════════════════════════════════════════════════════
    // 6. DOCTORS PAGE
    // ══════════════════════════════════════════════════════════
    console.log("👨‍⚕️ Doctors...");
    await page.goto(`${BASE_URL}/doctors`, { waitUntil: "networkidle" });
    await sleep(2000);

    // Hover doctor cards/list
    await hoverElement(page, '[class*="doctor"], table tbody tr');
    await sleep(600);

    // Click on first doctor for detail
    await clickElement(page, '[class*="doctor-card"], table tbody tr, [class*="cursor-pointer"]', 1500);
    await sleep(1000);

    // Scroll doctor detail
    await scrollDown(page, 300);
    await sleep(800);
    await scrollDown(page, 300);
    await sleep(800);
    await scrollToTop(page);
    await sleep(500);

    // ══════════════════════════════════════════════════════════
    // 7. OBJECTIVES PAGE
    // ══════════════════════════════════════════════════════════
    console.log("🎯 Objectives...");
    await page.goto(`${BASE_URL}/objectives`, { waitUntil: "networkidle" });
    await sleep(2000);

    await hoverElement(page, "table tbody tr, [class*='objective']");
    await sleep(600);
    await scrollDown(page, 300);
    await sleep(600);
    await scrollToTop(page);

    // ══════════════════════════════════════════════════════════
    // 8. MEDICATIONS PAGE
    // ══════════════════════════════════════════════════════════
    console.log("💊 Medications...");
    await page.goto(`${BASE_URL}/medications`, { waitUntil: "networkidle" });
    await sleep(2000);

    await hoverElement(page, '[class*="medication"], table tbody tr');
    await sleep(600);
    await scrollDown(page, 300);
    await sleep(800);
    await scrollToTop(page);

    // ══════════════════════════════════════════════════════════
    // 9. AI COACH
    // ══════════════════════════════════════════════════════════
    console.log("🤖 AI Coach...");
    await page.goto(`${BASE_URL}/ai-coach`, { waitUntil: "networkidle" });
    await sleep(2000);

    // Type a question
    await slowType(
      page,
      'textarea, input[placeholder*="Ask"], [class*="chat-input"]',
      "What should I focus on this week?",
      50
    );
    await sleep(1000);

    // Don't actually submit (to avoid waiting for AI) — just show the typing
    await sleep(1500);

    // ══════════════════════════════════════════════════════════
    // 10. NOTIFICATIONS
    // ══════════════════════════════════════════════════════════
    console.log("🔔 Notifications...");
    await page.goto(`${BASE_URL}/notifications`, { waitUntil: "networkidle" });
    await sleep(2000);

    await hoverElement(page, '[class*="notification"]');
    await sleep(600);
    await scrollDown(page, 300);
    await sleep(600);
    await scrollToTop(page);

    // ══════════════════════════════════════════════════════════
    // 11. QUARTERLY LOGS
    // ══════════════════════════════════════════════════════════
    console.log("📅 Quarterly Logs...");
    await page.goto(`${BASE_URL}/quarterly-logs`, { waitUntil: "networkidle" });
    await sleep(2000);

    await hoverElement(page, '[class*="log"], table tbody tr');
    await sleep(600);
    await scrollDown(page, 300);
    await sleep(800);
    await scrollToTop(page);

    // ══════════════════════════════════════════════════════════
    // 12. HELP PAGE
    // ══════════════════════════════════════════════════════════
    console.log("❓ Help...");
    await page.goto(`${BASE_URL}/help`, { waitUntil: "networkidle" });
    await sleep(2000);

    await scrollDown(page, 400);
    await sleep(800);
    await scrollDown(page, 400);
    await sleep(800);
    await scrollToTop(page);

    // ══════════════════════════════════════════════════════════
    // 13. SETTINGS
    // ══════════════════════════════════════════════════════════
    console.log("⚙️  Settings...");
    await page.goto(`${BASE_URL}/settings/profile`, { waitUntil: "networkidle" });
    await sleep(2000);
    await scrollDown(page, 300);
    await sleep(800);
    await scrollToTop(page);

    // ══════════════════════════════════════════════════════════
    // 14. ADMIN / DEV CONSOLE
    // ══════════════════════════════════════════════════════════
    console.log("🛠️  Admin console...");
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
    await sleep(2000);

    // Click through some tabs
    const adminTabs = ["Users", "Flags", "Branding", "Database", "Themes", "Permissions", "System"];
    for (const tabLabel of adminTabs) {
      await clickElement(page, `button:has-text("${tabLabel}")`, 1200);
      await scrollDown(page, 200);
      await sleep(600);
      await scrollToTop(page);
    }

    // ══════════════════════════════════════════════════════════
    // 15. BACK TO DASHBOARD (closing shot)
    // ══════════════════════════════════════════════════════════
    console.log("🏠 Back to dashboard...");
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    await sleep(3000);

    // ══════════════════════════════════════════════════════════
    // DONE
    // ══════════════════════════════════════════════════════════
    console.log("\n✅ Recording complete! Saving video...");
  } catch (err) {
    console.error("❌ Error during recording:", err.message);
  }

  // Close — this triggers video save
  await page.close();
  await context.close();
  await browser.close();

  console.log(`\n🎬 Video saved to: ${VIDEO_DIR}/`);
  console.log("   The file will be named something like: <hash>.webm");
  console.log("   Rename it to medica-demo.webm then convert to mp4:\n");
  console.log("   ffmpeg -i public/videos/<hash>.webm -c:v libx264 -preset slow -crf 22 public/videos/medica-demo.mp4\n");
}

main().catch(console.error);
