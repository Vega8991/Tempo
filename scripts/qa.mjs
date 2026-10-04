// QA automatizado sobre el build (npm run build && npm run preview).
// Uso: node scripts/qa.mjs [baseUrl]   → imprime un informe y lo guarda en qa-output/report.json
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://127.0.0.1:4173/';
const WIDTHS = [375, 390, 768, 1280, 1440, 1920];
const report = { base: BASE, date: new Date().toISOString(), checks: [] };
const add = (name, ok, detail = '') => {
  report.checks.push({ name, ok, detail });
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const url = (q) => `${BASE}?${q}`;

async function overflowAt(width, tier) {
  const page = await browser.newPage({ viewport: { width, height: width < 700 ? 844 : 900 } });
  await page.goto(url(`tier=${tier}&qa`), { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const offenders = new Set();
  let maxOverflow = 0;
  for (let y = 0; y < total; y += 700) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(60);
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const over = document.documentElement.scrollWidth - vw;
      const bad = [];
      document.querySelectorAll('main *, header *').forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || cs.position === 'fixed') return;
        const b = el.getBoundingClientRect();
        if (b.width && b.right > vw + 1 && !el.closest('.edition__rings, .instrument, .macro__plate, .stage, .finale__dial')) bad.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
      });
      return { over, bad: bad.slice(0, 5) };
    });
    maxOverflow = Math.max(maxOverflow, r.over);
    r.bad.forEach((b) => offenders.add(b));
  }
  await page.close();
  return { maxOverflow, offenders: [...offenders].slice(0, 6) };
}

// 1 · desbordamiento horizontal
for (const tier of ['lite', 'static']) {
  for (const w of WIDTHS) {
    const r = await overflowAt(w, tier);
    add(`sin desbordamiento horizontal · ${w}px · ${tier}`, r.maxOverflow <= 0 && r.offenders.length === 0, r.maxOverflow > 0 || r.offenders.length ? `scrollWidth +${r.maxOverflow}px ${r.offenders.join(', ')}` : '');
  }
}

// 2 · movimiento reducido
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({
    tier: document.documentElement.dataset.tier,
    canvas: !!document.querySelector('canvas'),
    sticky: [...document.querySelectorAll('.scene__frame')].some((f) => getComputedStyle(f).position === 'sticky'),
    heroH: document.getElementById('origen').offsetHeight,
    vh: innerHeight,
    grainAnim: getComputedStyle(document.querySelector('.grain')).animationName,
  }));
  add('movimiento reducido → nivel STATIC', r.tier === 'static', `tier=${r.tier}`);
  add('movimiento reducido: sin WebGL', !r.canvas);
  add('movimiento reducido: sin escenas fijadas', !r.sticky && r.heroH < r.vh * 2, `hero ${r.heroH}px`);
  add('movimiento reducido: sin movimiento ambiental (grano)', r.grainAnim === 'none', r.grainAnim);
  // todo el contenido acaba visible al recorrer la página
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 500) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(800);
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('main h2, main h3, main p, main dd')].filter((el) => {
      const cs = getComputedStyle(el);
      return cs.visibility === 'hidden' || Number(cs.opacity) < 0.95;
    }).map((el) => el.textContent.trim().slice(0, 40)),
  );
  add('movimiento reducido: todo el texto visible tras recorrer la página', hidden.length === 0, hidden.slice(0, 4).join(' | '));
  await ctx.close();
}

// 3 · sin JavaScript
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  const r = await page.evaluate(() => ({
    h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
    h2: document.querySelectorAll('main h2').length,
    specs: document.querySelectorAll('.specs__row').length,
    price: document.querySelector('.reserve__price')?.textContent.trim(),
    hidden: [...document.querySelectorAll('main h1, main h2, main h3, main p, main dd, main li')].filter((el) => {
      const cs = getComputedStyle(el);
      return cs.visibility === 'hidden' || Number(cs.opacity) < 0.95 || cs.display === 'none';
    }).length,
    ld: !!document.querySelector('script[type="application/ld+json"]'),
    imgsNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
  }));
  add('sin JS: un único h1 "TEMPO Origen"', r.h1.length === 1 && /TEMPO/.test(r.h1[0]) && /Origen/.test(r.h1[0]), r.h1.join(' / '));
  add('sin JS: todas las secciones con h2', r.h2 >= 11, `${r.h2} h2`);
  add('sin JS: ficha técnica completa en HTML', r.specs >= 15, `${r.specs} filas`);
  add('sin JS: precio en HTML', /8\.900/.test(r.price || ''), r.price);
  add('sin JS: ningún texto oculto', r.hidden === 0, `${r.hidden} ocultos`);
  add('datos estructurados (JSON-LD)', r.ld);
  add('todas las imágenes con alt', r.imgsNoAlt === 0, `${r.imgsNoAlt} sin alt`);
  await ctx.close();
}

// 4 · teclado, foco y navegación (nivel completo)
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url('tier=full&qa'), { waitUntil: 'load' });
  await page.waitForTimeout(5000);
  const stops = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    stops.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          label: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 28),
          outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0,
          onScreen: r.bottom > 0 && r.top < innerHeight && r.width > 0,
        };
      }),
    );
  }
  add('teclado: recorrido de foco', stops.length === 12, stops.map((s) => s.label).join(' → '));
  add('teclado: foco visible en cada parada', stops.every((s) => s.outline), stops.filter((s) => !s.outline).map((s) => s.label).join(', '));
  add('teclado: el elemento enfocado está en pantalla', stops.every((s) => s.onScreen), stops.filter((s) => !s.onScreen).map((s) => s.label).join(', '));
  // activar "Ver el movimiento" con Enter
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.focus('a[href="#movimiento"].btn');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const nav = await page.evaluate(() => ({
    y: window.scrollY,
    top: document.getElementById('movimiento').getBoundingClientRect().top + window.scrollY,
    focus: document.activeElement?.id,
  }));
  add('navegación interna: salta a #movimiento y mueve el foco', Math.abs(nav.y - nav.top) < 4 && nav.focus === 'dis-title', JSON.stringify(nav));
  // un h1, canvas aria-hidden
  const a11y = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    canvasHidden: [...document.querySelectorAll('canvas')].every((c) => c.closest('[aria-hidden="true"]') || c.getAttribute('aria-hidden') === 'true'),
    langEs: document.documentElement.lang,
  }));
  add('un único h1', a11y.h1 === 1);
  add('canvas con aria-hidden (la información existe en HTML)', a11y.canvasHidden);
  add('idioma declarado', a11y.langEs === 'es');
  await page.close();
}

// 5 · WebGL se detiene fuera de las escenas 3D · ScrollTrigger se limpia · motores separados
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(url('tier=full&qa'), { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__tempoGL, null, { timeout: 60000 });
  await page.waitForTimeout(3000);
  const frames = async (id) => {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 200);
    }, id);
    await page.waitForTimeout(2500);
    const a = await page.evaluate(() => window.__tempoGL.info.render.frame);
    await page.waitForTimeout(2500);
    const b = await page.evaluate(() => window.__tempoGL.info.render.frame);
    return b - a;
  };
  const inHero = await frames('origen');
  const inFigures = await frames('precision');
  const inCraft = await frames('artesania');
  add('WebGL renderiza en escenas 3D', inHero > 0, `${inHero} frames en 2,5 s`);
  add('WebGL detenido fuera de escenas 3D (cifras, artesanía)', inFigures === 0 && inCraft === 0, `${inFigures} / ${inCraft} frames`);
  const info = await page.evaluate(() => {
    const gl = window.__tempoGL;
    return { calls: gl.info.render.calls, triangles: gl.info.render.triangles, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures, programs: gl.info.programs?.length };
  });
  add('coste WebGL (último frame)', true, JSON.stringify(info));
  const engines = await page.evaluate(() => {
    const { gsap } = window.__tempo;
    const motionEls = document.querySelectorAll('.btn, .btn__label, .cursor, .cursor__shape, .menu li, .reserve__form-wrap');
    return [...motionEls].filter((el) => gsap.getTweensOf(el).length > 0).map((el) => el.className);
  });
  add('ningún transform controlado por GSAP y Motion a la vez', engines.length === 0, engines.join(', '));
  // ScrollTrigger se limpia: al pasar a movimiento reducido en caliente desaparecen película y lienzo
  const before = await page.evaluate(() => window.__tempo.ScrollTrigger.getAll().length);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(2000);
  const after = await page.evaluate(() => ({
    triggers: window.__tempo.ScrollTrigger.getAll().length,
    canvas: !!document.querySelector('canvas'),
    tier: document.documentElement.dataset.tier,
    filmActive: window.__tempo.director.active,
  }));
  add('cambio en caliente a movimiento reducido: limpia película y WebGL', after.tier === 'static' && !after.canvas && !after.filmActive, `triggers ${before}→${after.triggers}, canvas=${after.canvas}`);
  await page.close();
}

await browser.close();
fs.mkdirSync('qa-output', { recursive: true });
fs.writeFileSync('qa-output/report.json', JSON.stringify(report, null, 2));
const failed = report.checks.filter((c) => !c.ok).length;
console.log(`\n${report.checks.length - failed}/${report.checks.length} comprobaciones superadas`);
