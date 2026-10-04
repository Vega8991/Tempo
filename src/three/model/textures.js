// Texturas procedurales generadas en canvas: 0 KB de descarga.
// Convención: en los mapas combinados R = relieve (bumpMap) y G = rugosidad (roughnessMap).
import * as THREE from 'three';

const TAU = Math.PI * 2;

function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** Ruido de valor periódico (se repite sin costuras) con suavizado smoothstep. */
function valueNoise(w, h, cellsX, cellsY, seed) {
  const rand = rng(seed);
  const grid = new Float32Array(cellsX * cellsY);
  for (let i = 0; i < grid.length; i++) grid[i] = rand();
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const gy = (y / h) * cellsY;
    const y0 = Math.floor(gy);
    const fy = gy - y0;
    const sy = fy * fy * (3 - 2 * fy);
    const r0 = (y0 % cellsY) * cellsX;
    const r1 = ((y0 + 1) % cellsY) * cellsX;
    for (let x = 0; x < w; x++) {
      const gx = (x / w) * cellsX;
      const x0 = Math.floor(gx);
      const fx = gx - x0;
      const sx = fx * fx * (3 - 2 * fx);
      const c0 = x0 % cellsX;
      const c1 = (x0 + 1) % cellsX;
      const a = grid[r0 + c0] + (grid[r0 + c1] - grid[r0 + c0]) * sx;
      const b = grid[r1 + c0] + (grid[r1 + c1] - grid[r1 + c0]) * sx;
      out[y * w + x] = a + (b - a) * sy;
    }
  }
  return out;
}

function fbm(w, h, base, octaves, seed, aspect = 1) {
  const out = new Float32Array(w * h);
  let amp = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const cx = Math.max(1, Math.round(base * 2 ** o * aspect));
    const cy = Math.max(1, Math.round(base * 2 ** o));
    const n = valueNoise(w, h, cx, cy, seed + o * 101);
    for (let i = 0; i < out.length; i++) out[i] += n[i] * amp;
    total += amp;
    amp *= 0.55;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

function toTexture(c, { repeat, color = false, wrap = true, anisotropy = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = anisotropy;
  t.needsUpdate = true;
  return t;
}

/** Mapa combinado (R relieve, G rugosidad) a partir de un campo escalar. */
function bumpRoughCanvas(w, h, field, roughBase, roughVar, bumpGain = 1) {
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const v = field[i];
    img.data[i * 4] = Math.max(0, Math.min(255, (0.5 + (v - 0.5) * bumpGain) * 255));
    img.data[i * 4 + 1] = Math.max(0, Math.min(255, (roughBase + (v - 0.5) * roughVar) * 255));
    img.data[i * 4 + 2] = 0;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Mapa de normales a partir de pendientes (dx, dy) por píxel. */
function normalCanvas(w, h, slopeFn) {
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [dx, dy] = slopeFn(x, y);
      const len = Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

const FONT_SERIF = '"Cormorant Garamond", "Times New Roman", serif';
const FONT_SANS = 'Jost, "Futura", "Helvetica Neue", Arial, sans-serif';

function spacedText(ctx, text, x, y, spacing) {
  // dibuja texto centrado en x con tracking (canvas no tiene letter-spacing fiable en todos los navegadores)
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = x - total / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, cx + widths[i] / 2, y);
    cx += widths[i] + spacing;
  });
}

/* -------------------------------------------------------------------------- */

/** Esfera: negro profundo con grano fino + impresión. Radio de esfera en mm. */
export function dialTextures(size, dialRadius) {
  const pxPerMm = size / (dialRadius * 2);
  // color + impresión
  const cc = canvas(size);
  const ctx = cc.getContext('2d');
  ctx.fillStyle = '#0b0b0c';
  ctx.fillRect(0, 0, size, size);
  // viñeteado muy leve hacia el borde (profundidad del lacado)
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.5);
  g.addColorStop(0, 'rgba(22,22,24,0.55)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // TEMPO bajo las 12
  ctx.fillStyle = '#e9e4d8';
  ctx.font = `400 ${1.55 * pxPerMm}px ${FONT_SERIF}`;
  spacedText(ctx, 'TEMPO', size / 2, size / 2 - 7.4 * pxPerMm, 0.62 * pxPerMm);
  // ORIGEN sobre las 6, champagne
  ctx.fillStyle = '#c9b48c';
  ctx.font = `500 ${0.78 * pxPerMm}px ${FONT_SANS}`;
  spacedText(ctx, 'ORIGEN', size / 2, size / 2 + 7.2 * pxPerMm, 0.46 * pxPerMm);
  ctx.fillStyle = '#8f8b83';
  ctx.font = `400 ${0.52 * pxPerMm}px ${FONT_SANS}`;
  spacedText(ctx, 'AUTOMÁTICO', size / 2, size / 2 + 8.6 * pxPerMm, 0.3 * pxPerMm);

  // relieve + rugosidad: grano fino tipo "grainé"
  const small = Math.min(size, 1024);
  const n = fbm(small, small, 160, 2, 7);
  const br = bumpRoughCanvas(small, small, n, 0.52, 0.12, 1.2);
  const bc = canvas(size);
  const bctx = bc.getContext('2d');
  bctx.imageSmoothingEnabled = true;
  bctx.drawImage(br, 0, 0, size, size);
  // la impresión es más brillante (laca) y ligeramente en relieve
  bctx.globalCompositeOperation = 'source-over';
  bctx.fillStyle = 'rgb(200,70,0)';
  bctx.textAlign = 'center';
  bctx.textBaseline = 'middle';
  bctx.font = `400 ${1.55 * pxPerMm}px ${FONT_SERIF}`;
  spacedText(bctx, 'TEMPO', size / 2, size / 2 - 7.4 * pxPerMm, 0.62 * pxPerMm);
  bctx.font = `500 ${0.78 * pxPerMm}px ${FONT_SANS}`;
  spacedText(bctx, 'ORIGEN', size / 2, size / 2 + 7.2 * pxPerMm, 0.46 * pxPerMm);
  bctx.font = `400 ${0.52 * pxPerMm}px ${FONT_SANS}`;
  spacedText(bctx, 'AUTOMÁTICO', size / 2, size / 2 + 8.6 * pxPerMm, 0.3 * pxPerMm);

  return {
    map: toTexture(cc, { color: true, wrap: false }),
    bumpRough: toTexture(bc, { wrap: false }),
  };
}

/** Rehaut (anillo interior inclinado) con escala de minutos. UV de torno: u = ángulo, v = perfil. */
export function rehautTexture(w = 4096, h = 96) {
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#121213';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#d9d4c8';
  for (let m = 0; m < 60; m++) {
    const x = (m / 60) * w;
    const five = m % 5 === 0;
    const tw = five ? w / 60 / 7 : w / 60 / 14;
    const th = five ? h * 0.62 : h * 0.4;
    ctx.fillRect(x - tw / 2, 0, tw, th); // arriba del canvas = borde interior (v = 1)
  }
  // 300 marcas de 1/5 s — tren de 21.600 a/h en la escala
  ctx.fillStyle = 'rgba(217,212,200,0.45)';
  for (let s = 0; s < 300; s++) {
    if (s % 5 === 0) continue;
    const x = (s / 300) * w;
    ctx.fillRect(x - 0.6, 0, 1.2, h * 0.18);
  }
  return toTexture(c, { color: true, wrap: false });
}

/** Grabado del fondo: texto alrededor del anillo. */
export function casebackEngraving(w = 4096, h = 192) {
  const text = 'TEMPO · ORIGEN · CALIBRE T-01 · TITANIO GRADO 5 · ZAFIRO · UNA DE 250 · ';
  const cc = canvas(w, h);
  const ctx = cc.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  const br = canvas(w, h);
  const bctx = br.getContext('2d');
  bctx.fillStyle = 'rgb(160,110,0)';
  bctx.fillRect(0, 0, w, h);
  const fontPx = h * 0.34;
  for (const [cx, color] of [
    [ctx, '#5c5c5a'],
    [bctx, 'rgb(40,190,0)'],
  ]) {
    cx.font = `500 ${fontPx}px ${FONT_SANS}`;
    cx.textBaseline = 'middle';
    cx.fillStyle = color;
    const chars = [...text];
    const spacing = fontPx * 0.42;
    const widths = chars.map((ch) => cx.measureText(ch).width + spacing);
    const total = widths.reduce((a, b) => a + b, 0);
    const scale = w / total;
    let x = 0;
    chars.forEach((ch, i) => {
      cx.save();
      cx.translate(x, h * 0.5);
      cx.scale(scale, 1);
      cx.fillText(ch, 0, 0);
      cx.restore();
      x += widths[i] * scale;
    });
  }
  return {
    map: toTexture(cc, { color: true, wrap: false }),
    bumpRough: toTexture(br, { wrap: false }),
  };
}

/** Titanio microgranallado: relieve finísimo e isotrópico. Mosaico de 3 mm. */
export function blastedTexture(size = 256) {
  const n = fbm(size, size, 48, 2, 21);
  const rand = rng(5);
  for (let i = 0; i < n.length; i++) n[i] = n[i] * 0.6 + rand() * 0.4;
  return toTexture(bumpRoughCanvas(size, size, n, 0.5, 0.25, 1.4));
}

/** Cepillado: vetas a lo largo de u. */
export function brushedTexture(size = 256) {
  const n = fbm(size, size, 2, 4, 33, 0.02);
  const rand = rng(9);
  const rows = new Float32Array(size);
  for (let y = 0; y < size; y++) rows[y] = rand();
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) n[y * size + x] = n[y * size + x] * 0.4 + rows[y] * 0.6;
  return toTexture(bumpRoughCanvas(size, size, n, 0.5, 0.35, 1));
}

/** Cuero: grano + pespuntes. u = ancho (0..1), v = largo (0..1). */
export function leatherTextures({ width = 20, length = 46, pxPerMm = 22 } = {}) {
  const w = Math.round(width * pxPerMm);
  const h = Math.round(length * pxPerMm);
  const grain = fbm(256, 256, 24, 3, 77);
  const grainC = bumpRoughCanvas(256, 256, grain, 0.62, 0.18, 2.2);

  const cc = canvas(w, h);
  const ctx = cc.getContext('2d');
  ctx.fillStyle = '#121112';
  ctx.fillRect(0, 0, w, h);
  const br = canvas(w, h);
  const bctx = br.getContext('2d');
  // grano en mosaico
  const tile = Math.round(3 * pxPerMm);
  for (let y = 0; y < h; y += tile) for (let x = 0; x < w; x += tile) bctx.drawImage(grainC, x, y, tile, tile);

  // pespunte: dos líneas a 1.4 mm del canto
  const stitchLen = 1.3 * pxPerMm;
  const gap = 0.55 * pxPerMm;
  const thread = 0.42 * pxPerMm;
  for (const ux of [1.5 / width, 1 - 1.5 / width]) {
    const x = ux * w;
    for (let y = gap; y < h - stitchLen; y += stitchLen + gap) {
      // canvas y = 0 es v = 1 (extremo libre); el pespunte recorre toda la pieza
      ctx.fillStyle = '#2b2927';
      ctx.beginPath();
      ctx.ellipse(x, y + stitchLen / 2, thread / 2, stitchLen / 2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#3a3734';
      ctx.beginPath();
      ctx.ellipse(x - thread * 0.12, y + stitchLen * 0.45, thread / 4, stitchLen / 3, 0, 0, TAU);
      ctx.fill();
      bctx.fillStyle = 'rgb(235,90,0)';
      bctx.beginPath();
      bctx.ellipse(x, y + stitchLen / 2, thread / 2, stitchLen / 2, 0, 0, TAU);
      bctx.fill();
      // hendidura del agujero de aguja
      bctx.fillStyle = 'rgb(30,200,0)';
      bctx.fillRect(x - thread * 0.3, y - gap * 0.55, thread * 0.6, gap * 0.5);
    }
  }
  // canto pintado: ligeramente más brillante
  ctx.fillStyle = 'rgba(40,38,37,0.6)';
  ctx.fillRect(0, 0, w * 0.012, h);
  ctx.fillRect(w * 0.988, 0, w * 0.012, h);

  return {
    map: toTexture(cc, { color: true, wrap: false }),
    bumpRough: toTexture(br, { wrap: false }),
  };
}

/** Ante del interior color coñac. */
export function suedeTexture(size = 256) {
  const n = fbm(size, size, 40, 3, 55);
  return toTexture(bumpRoughCanvas(size, size, n, 0.86, 0.12, 1.2));
}

/** Côtes de Genève: franjas paralelas abombadas. Un periodo por mosaico (eje x). */
export function cotesNormal(size = 256) {
  const rand = rng(3);
  const fine = new Float32Array(size);
  for (let y = 0; y < size; y++) fine[y] = rand() - 0.5;
  const c = normalCanvas(size, size, (x, y) => {
    const t = x / size; // 0..1 dentro de la franja
    const slope = (t - 0.5) * 2.4; // perfil parabólico → pendiente lineal
    const edge = Math.abs(t - 0.5) > 0.47 ? Math.sign(t - 0.5) * 1.2 : 0;
    return [slope + edge, fine[y] * 0.06];
  });
  return toTexture(c);
}

/** Perlage: círculos superpuestos de granulado. Mosaico de 2.4 mm. */
export function perlageNormal(size = 256) {
  const spots = [];
  const n = 4;
  const R = (size / n) * 0.62;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) spots.push([(i + (j % 2) * 0.5) * (size / n), j * (size / n)]);
  const c = normalCanvas(size, size, (x, y) => {
    // el último círculo dibujado domina (superposición)
    let best = null;
    for (let k = spots.length - 1; k >= 0; k--) {
      for (const ox of [-size, 0, size]) {
        for (const oy of [-size, 0, size]) {
          const dx = x - (spots[k][0] + ox);
          const dy = y - (spots[k][1] + oy);
          const d = Math.hypot(dx, dy);
          if (d < R) {
            best = [dx, dy, d];
            break;
          }
        }
        if (best) break;
      }
      if (best) break;
    }
    if (!best) return [0, 0];
    const [dx, dy, d] = best;
    // granulado circular: anillos finos concéntricos
    const ring = Math.sin((d / R) * 18) * 0.35;
    return [(dx / (d + 1e-3)) * ring, (dy / (d + 1e-3)) * ring];
  });
  return toTexture(c);
}

/** Micro-rotor: Côtes circulares + grabado. Lado = extent mm centrado en el pivote. */
export function rotorTextures(size = 1024, extent = 14) {
  const pxPerMm = size / extent;
  const normal = normalCanvas(size, size, (x, y) => {
    const dx = x - size / 2;
    const dy = y - size / 2;
    const d = Math.hypot(dx, dy) / pxPerMm;
    const s = Math.sin(d * TAU / 1.1) * 0.9;
    return [(dx / (Math.hypot(dx, dy) + 1e-3)) * s, (dy / (Math.hypot(dx, dy) + 1e-3)) * -s];
  });
  const cc = canvas(size);
  const ctx = cc.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = '#6d5a3a';
  ctx.font = `500 ${0.62 * pxPerMm}px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = 'TEMPO  ·  T-01';
  const r = 4.7 * pxPerMm;
  const chars = [...label];
  const span = 1.5;
  chars.forEach((ch, i) => {
    const a = -Math.PI / 2 - span / 2 + (i / (chars.length - 1)) * span;
    ctx.save();
    ctx.rotate(a + Math.PI / 2);
    ctx.translate(0, -r);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.restore();
  return {
    normal: toTexture(normal, { wrap: false }),
    map: toTexture(cc, { color: true, wrap: false }),
  };
}

/** Ruido de grano de película para la capa CSS (devuelve dataURL). */
export function grainDataURL(size = 160) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const rand = rng(11);
  for (let i = 0; i < size * size; i++) {
    const v = rand() * 255;
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}
