const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    permissions: ["geolocation"],
    geolocation: { latitude: -6.2088, longitude: 106.8456 }, // Jakarta
  });

  const page = await context.newPage();
  await page.goto("http://localhost:3000");

  // Wait to allow initial load and location fetch
  await page.waitForTimeout(1500);

  // Scroll down to the progress bar section
  await page.evaluate(() => {
    window.scrollBy(0, 500);
  });

  await page.waitForTimeout(500);

  // Take screenshot of header boxes
  await page.screenshot({
    path: "./playwright-screenshots/mobile_header_boxes.png",
  });

  await browser.close();
})();
