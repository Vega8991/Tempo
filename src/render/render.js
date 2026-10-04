// Renderizador de planos fijos (solo desarrollo). Lo usa scripts/render-stills.mjs vía Playwright.
// Acumula N muestras con desplazamiento subpíxel (antialias) y apertura (profundidad de campo real).
import * as THREE from 'three';
import { createStage } from '../three/stage.js';
import { createRig } from '../three/rig.js';
import { POSES, STILL_SHOTS } from '../three/poses.js';
import { loadBrandFonts } from '../lib/fonts.js';

const params = new URLSearchParams(location.search);
const quality = params.get('q') || 'ultra';

const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(24, 1, 1, 2000);

let stage = null;
async function ensureStage() {
  if (stage) return stage;
  await loadBrandFonts();
  stage = createStage({ renderer, scene, camera, quality, shadows: true, dust: false });
  return stage;
}

const right = new THREE.Vector3();
const up = new THREE.Vector3();
const target = new THREE.Vector3();

function halton(i, b) {
  let f = 1;
  let r = 0;
  while (i > 0) {
    f /= b;
    r += f * (i % b);
    i = Math.floor(i / b);
  }
  return r;
}

window.__renderShot = async ({
  pose = 'front',
  rig: overrides = {},
  w = 1200,
  h = 1200,
  samples = 16,
  aperture = 0,
  clock = 30.5,
  alpha = true,
  background = '#060607',
  time = 4.2,
}) => {
  const s = await ensureStage();
  renderer.setSize(w, h, false);
  renderer.domElement.style.width = `${Math.min(w, 900)}px`;
  const rig = createRig({ ...POSES[pose], ...overrides, frozen: true });
  s.watch.setClock(clock);

  const acc = document.createElement('canvas');
  acc.width = w;
  acc.height = h;
  const ctx = acc.getContext('2d');
  if (!alpha) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
  }
  const frames = document.createElement('canvas');
  frames.width = w;
  frames.height = h;
  const fctx = frames.getContext('2d');

  for (let i = 0; i < samples; i++) {
    s.frame(time, rig, w, h, { ambient: 0 });
    // desplazamiento subpíxel
    const jx = samples > 1 ? halton(i + 1, 2) - 0.5 : 0;
    const jy = samples > 1 ? halton(i + 1, 3) - 0.5 : 0;
    const ox = -rig.shiftX * w + jx;
    const oy = rig.shiftY * h + jy;
    camera.setViewOffset(w, h, ox, oy, w, h);
    // apertura: la cámara se mueve sobre un disco y sigue mirando al plano de foco
    if (aperture > 0) {
      const a = halton(i + 1, 5) * Math.PI * 2;
      const r = Math.sqrt(halton(i + 1, 7)) * aperture;
      camera.getWorldDirection(target);
      const dist = camera.position.distanceTo(new THREE.Vector3(rig.tx, rig.ty, rig.tz).applyMatrix4(s.watch.root.matrixWorld));
      target.multiplyScalar(dist).add(camera.position);
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      up.setFromMatrixColumn(camera.matrixWorld, 1);
      camera.position.addScaledVector(right, Math.cos(a) * r).addScaledVector(up, Math.sin(a) * r);
      camera.lookAt(target);
    }
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    fctx.clearRect(0, 0, w, h);
    if (!alpha) {
      fctx.fillStyle = background;
      fctx.fillRect(0, 0, w, h);
    }
    fctx.drawImage(renderer.domElement, 0, 0);
    ctx.globalAlpha = 1 / (i + 1);
    ctx.globalCompositeOperation = alpha && i === 0 ? 'copy' : 'source-over';
    ctx.drawImage(frames, 0, 0);
  }
  ctx.globalAlpha = 1;
  return acc.toDataURL('image/png');
};

/** Renderiza un plano de STILL_SHOTS por nombre. portrait = variante vertical. */
window.__renderStill = async (name, { portrait = false, samplesScale = 1 } = {}) => {
  const spec = STILL_SHOTS[name];
  if (!spec) throw new Error(`plano desconocido: ${name}`);
  const p = portrait && spec.portrait ? spec.portrait : {};
  const url = await window.__renderShot({
    pose: spec.pose,
    rig: { ...(spec.rig || {}), ...(p.rig || {}) },
    w: p.w || spec.w,
    h: p.h || spec.h,
    samples: Math.max(1, Math.round((spec.samples || 12) * samplesScale)),
    aperture: spec.aperture || 0,
    alpha: !!spec.alpha,
    background: spec.bg || '#060607',
  });
  if (spec.overlay !== 'og') return url;
  // tarjeta Open Graph: misma tipografía que la web
  const img = new Image();
  img.src = url;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = spec.w;
  c.height = spec.h;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const g = ctx.createLinearGradient(0, 0, spec.w * 0.6, 0);
  g.addColorStop(0, 'rgba(6,6,7,0.85)');
  g.addColorStop(1, 'rgba(6,6,7,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, spec.w, spec.h);
  ctx.fillStyle = '#ece6da';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '400 26px "Cormorant Garamond"';
  ctx.letterSpacing = '14px';
  ctx.fillText('TEMPO', 84, 228);
  ctx.font = '300 112px "Cormorant Garamond"';
  ctx.letterSpacing = '4px';
  ctx.fillText('ORIGEN', 78, 336);
  ctx.font = 'italic 300 34px "Cormorant Garamond"';
  ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(236,230,218,0.78)';
  ctx.fillText('El tiempo no se mide. Se construye.', 84, 398);
  ctx.font = '500 15px Jost';
  ctx.letterSpacing = '5px';
  ctx.fillStyle = '#c9b48c';
  ctx.fillText('250 UNIDADES NUMERADAS', 84, 470);
  return c.toDataURL('image/png');
};

window.__ready = true;
