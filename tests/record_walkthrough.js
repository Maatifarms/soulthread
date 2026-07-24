const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Launching Chromium...');
  const browser = await chromium.launch({ headless: true });
  
  const videoDir = path.join(__dirname, '../scratch/videos');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  // Set viewport to standard 16:9 HD resolution
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 }
    }
  });
  
  const page = await context.newPage();
  console.log('Navigating to https://soulthread.in...');
  await page.goto('https://soulthread.in', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log('Scrolling down homepage...');
  for (let i = 0; i < 40; i++) {
    await page.evaluate(() => window.scrollBy(0, 35));
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(2000);
  
  console.log('Navigating to Explore page...');
  await page.goto('https://soulthread.in/explore', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log('Scrolling down Explore page...');
  for (let i = 0; i < 30; i++) {
    await page.evaluate(() => window.scrollBy(0, 45));
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(2000);
  
  console.log('Navigating to Login page...');
  await page.goto('https://soulthread.in/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('Closing browser context to finalize video...');
  await context.close();
  await browser.close();
  
  console.log('Locating recorded video file...');
  const files = fs.readdirSync(videoDir);
  const videoFile = files.find(f => f.endsWith('.webm'));
  
  if (videoFile) {
    const srcPath = path.join(videoDir, videoFile);
    const destPath = 'c:/soulthread_walkthrough.webm';
    console.log(`Copying video to destination: ${destPath}`);
    fs.copyFileSync(srcPath, destPath);
    console.log('Video copied successfully to C:/soulthread_walkthrough.webm!');
  } else {
    console.error('No video file was recorded!');
  }
}

main().catch(err => {
  console.error('Error during recording:', err);
});
