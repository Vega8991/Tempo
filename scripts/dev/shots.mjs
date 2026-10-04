// Capturas de QA: node scripts/dev/shots.mjs <outDir> <url> <WxH> sectionId:fraction ...
// fraction ∈ [0,1] del tramo fijado de la sección (o 'top').
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [outDir, url, size, ...points] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(+(process.env.WAIT || 6000));
let i = 0;
for (const p of points) {
  const [id, f] = p.split(':');
  const y = await page.evaluate(([id, f]) => {
    const el = document.getElementById(id);
    const top = el.getBoundingClientRect().top + window.scrollY;
    const len = Math.max(0, el.offsetHeight - window.innerHeight);
    return f === 'top' ? top : top + Number(f) * len;
  }, [id, f]);
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(+(process.env.SETTLE || 1800));
  const file = path.join(outDir, `${String(i++).padStart(2, '0')}-${id}-${f}.png`);
  await page.screenshot({ path: file });
  console.log(file);
}
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].join('\n'));
await browser.close();
