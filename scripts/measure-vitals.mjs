// Medición real de LCP, CLS e INP con PerformanceObserver sobre el build servido (npm run preview).
// Perfiles: escritorio (sin limitación) y móvil (CPU ×4, red tipo "4G lento": 150 ms RTT, 1,6 Mbps).
// Nota: en contenedores sin GPU WebGL se ejecuta por software (SwiftShader): las cifras de WebGL son
// pesimistas respecto a un dispositivo real. LCP y CLS no dependen del lienzo 3D.
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://127.0.0.1:4173/';
const RUNS = Number(process.env.RUNS || 3);
// espera tras cada salto de scroll antes de interactuar (el render por software necesita vaciar su cola)
const SETTLE = Number(process.env.SETTLE || 6000);

const observe = () => {
  window.__v = { lcp: 0, lcpEl: '', cls: 0, inp: 0, interactions: [], shifts: [], zones: [[0, 'carga']] };
  // la zona se asigna por la marca de tiempo del evento (los callbacks del observador llegan tarde)
  window.__zoneAt = (t) => window.__v.zones.filter(([z]) => z <= t).pop()[1];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__v.lcp = e.startTime;
      const el = e.element;
      window.__v.lcpEl = el ? `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''}` : '';
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  let session = 0;
  let start = 0;
  let last = 0;
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      if (e.startTime - last > 1000 || e.startTime - start > 5000) {
        session = 0;
        start = e.startTime;
      }
      session += e.value;
      last = e.startTime;
      window.__v.cls = Math.max(window.__v.cls, session);
      const src = (e.sources || []).map((x) => (x.node && x.node.className ? String(x.node.className).split(' ')[0] : x.node?.nodeName || '?')).join('+');
      window.__v.shifts.push(`${Math.round(e.startTime)}ms ${e.value.toFixed(3)} ${src}`);
    }
  }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (!e.interactionId) continue;
      window.__v.inp = Math.max(window.__v.inp, e.duration);
      window.__v.interactions.push({ zone: window.__zoneAt(e.startTime), name: e.name, d: Math.round(e.duration) });
    }
  }).observe({ type: 'event', durationThreshold: 16, buffered: true });
};

async function run(profile) {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext(profile.context);
  await ctx.addInitScript(observe);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  if (profile.cpu) await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
  if (profile.net) {
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, ...profile.net });
  }
  await page.goto(BASE + (profile.query || ''), { waitUntil: 'load' });
  await page.waitForTimeout(6000);
  // LCP se lee ANTES de cualquier desplazamiento o interacción (la observación termina con la primera interacción)
  const load = await page.evaluate(() => ({ lcp: window.__v.lcp, lcpEl: window.__v.lcpEl, cls: window.__v.cls }));

  // zona A: escenario 3D detenido (ficha técnica) → coste real de los manejadores
  await page.evaluate(() => {
    window.__v.zones.push([performance.now(), 'sin-webgl']);
    document.getElementById('especificaciones').scrollIntoView();
  });
  await page.waitForTimeout(SETTLE);
  if (profile.menu) {
    await page.click('.nav__menu');
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
  }
  // solo clics dentro de la ficha: un Tab llevaría el foco (y el scroll) a la reserva, con el 3D activo
  for (let i = 0; i < 3; i++) {
    await page.click('.specs__group dd');
    await page.waitForTimeout(500);
  }

  // zona B: reserva, con el reloj 3D visible (si el nivel lo tiene)
  await page.evaluate(() => {
    window.__v.zones.push([performance.now(), 'con-escenario']);
    document.getElementById('reservar').scrollIntoView();
  });
  await page.waitForTimeout(SETTLE);
  await page.click('.reserve__ctas .btn--primary');
  await page.waitForTimeout(900);
  await page.keyboard.type('Ana', { delay: 80 });
  await page.waitForTimeout(400);
  await page.click('.reserve__form .btn--ghost');
  await page.waitForTimeout(900);
  const v = await page.evaluate(() => window.__v);
  await browser.close();
  const inpZone = (z) => Math.max(0, ...v.interactions.filter((i) => i.zone === z).map((i) => i.d));
  return { ...v, lcp: load.lcp, lcpEl: load.lcpEl, clsLoad: load.cls, inpNoGL: inpZone('sin-webgl'), inpStage: inpZone('con-escenario') };
}

const profiles = [
  { name: 'Escritorio 1440×900 · movimiento reducido (STATIC)', context: { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, net: { latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 } },
  { name: 'Escritorio 1440×900 · nivel automático', context: { viewport: { width: 1440, height: 900 } }, net: { latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 } },
  { name: 'Escritorio 1440×900 · FULL', query: '?tier=full', context: { viewport: { width: 1440, height: 900 } }, net: { latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 } },
  {
    name: 'Móvil 390×844 · CPU ×4 · 4G lento',
    context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36' },
    cpu: 4,
    net: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
    menu: true,
  },
];

const results = [];
for (const p of profiles) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await run(p));
  const med = (k) => runs.map((r) => r[k]).sort((a, b) => a - b)[Math.floor(runs.length / 2)];
  const r = {
    profile: p.name,
    lcp: Math.round(med('lcp')),
    lcpElement: runs[0].lcpEl,
    cls: Number(med('cls').toFixed(3)),
    inpNoGL: Math.round(med('inpNoGL')),
    inpStage: Math.round(med('inpStage')),
    shifts: runs[0].shifts,
    runs,
  };
  results.push(r);
  console.log(`${p.name}\n  LCP ${r.lcp} ms (${r.lcpElement}) · CLS ${r.cls} · INP ${r.inpNoGL} ms sin WebGL activo / ${r.inpStage} ms con escenario  [mediana de ${RUNS}]`);
  if (r.shifts.length) console.log('  desplazamientos:', r.shifts.slice(0, 6).join(' | '));
}
fs.mkdirSync('qa-output', { recursive: true });
fs.writeFileSync('qa-output/vitals.json', JSON.stringify(results, null, 2));
