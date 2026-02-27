const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const dir = "./playwright-screenshots";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:3000");

  // Wait to allow initial load
  await page.waitForTimeout(1000);

  // Scroll down to the progress bar section
  await page.evaluate(() => {
    window.scrollBy(0, 500);
  });

  await page.waitForTimeout(500);

  await page.screenshot({ path: `${dir}/mobile_screenshot.png` });
  await browser.close();
})();
