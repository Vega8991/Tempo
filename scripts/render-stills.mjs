// Renderiza las imágenes fijas a partir del modelo 3D procedural y las publica en AVIF + WebP.
// Uso: npm run stills [-- --only watch-front,macro-hands] [--quick]
// Requiere Chromium de Playwright (WebGL por software si no hay GPU: es lento pero determinista).
import { createServer } from 'vite';
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { STILLS } from '../src/stills.js';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'stills');
const rawDir = path.join(root, '.stills-raw');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(rawDir, { recursive: true });

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const quick = args.includes('--quick');
const names = [...Object.keys(STILLS), 'og'].filter((n) => !only || only.includes(n));

const server = await createServer({ root, logLevel: 'error', server: { port: 5179, host: '127.0.0.1' } });
await server.listen();
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('[render]', e.message));
await page.goto('http://127.0.0.1:5179/render.html?q=ultra');
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });

const encode = async (png, name, widths) => {
  for (const w of widths) {
    const base = sharp(png).resize({ width: w });
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(path.join(outDir, `${name}-${w}.avif`));
    await base.clone().webp({ quality: 80, alphaQuality: 90, effort: 5 }).toFile(path.join(outDir, `${name}-${w}.webp`));
  }
};

for (const name of names) {
  const variants = name !== 'og' && STILLS[name].portrait ? [false, true] : [false];
  for (const portrait of variants) {
    const t0 = Date.now();
    const url = await page.evaluate(([n, p, s]) => window.__renderStill(n, { portrait: p, samplesScale: s }), [name, portrait, quick ? 0.25 : 1]);
    const png = Buffer.from(url.split(',')[1], 'base64');
    const id = portrait ? `${name}-p` : name;
    fs.writeFileSync(path.join(rawDir, `${id}.png`), png);
    if (name === 'og') {
      await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(root, 'public', 'og-tempo-origen.jpg'));
    } else {
      await encode(png, id, portrait ? STILLS[name].portrait.widths : STILLS[name].widths);
    }
    console.log(`${id.padEnd(24)} ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
}

await browser.close();
await server.close();
