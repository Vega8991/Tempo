// Utilidades de coreografía para las escenas de la timeline maestra.
import { POSES } from '../three/poses.js';

/** Keyframe de un plano con nombre + ajustes (posición p en fracción del tramo fijado). */
export function pose(ctx, p, name, extra = {}, ease = 'camera') {
  ctx.key(ctx.at(p), { ...POSES[name], ...extra }, ease);
}

/** Keyframe en posición absoluta (px de scroll). */
export function poseAt(ctx, px, name, extra = {}, ease = 'camera') {
  ctx.key(px, { ...POSES[name], ...extra }, ease);
}

/**
 * Ventana de aparición de un elemento HTML: entra entre a→b y sale entre c→d (fracciones de la escena).
 * Solo opacity + y. Se usa opacidad (no visibility) a propósito: el texto fuera de su ventana sigue
 * en el árbol de accesibilidad y un lector de pantalla puede leer la historia completa.
 * Si c es null, el elemento se queda.
 */
export function windowed(ctx, el, a, b, c = null, d = null, { y = 16, from = 'bottom' } = {}) {
  if (!el) return;
  const { tl, at, dur } = ctx;
  const dy = from === 'bottom' ? y : -y;
  tl.fromTo(el, { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: dur(b - a), ease: 'power2.out', immediateRender: false }, at(a));
  if (c != null) {
    tl.fromTo(el, { opacity: 1, y: 0 }, { opacity: 0, y: -dy, duration: dur(d - c), ease: 'power2.in', immediateRender: false }, at(c));
  }
}

/** Estado "activo" de un elemento de lista: opacidad baja → plena → media. */
export function highlight(ctx, el, a, b, c, d, { idle = 0.32, done = 0.55 } = {}) {
  if (!el) return;
  const { tl, at, dur } = ctx;
  tl.fromTo(el, { opacity: idle }, { opacity: 1, duration: dur(b - a), ease: 'power1.out', immediateRender: false }, at(a));
  if (c != null) tl.fromTo(el, { opacity: 1 }, { opacity: done, duration: dur(d - c), ease: 'power1.in', immediateRender: false }, at(c));
}

/** Desplazamientos ópticos según composición. */
export function shiftFor(layout, desktop, mobile, tablet = mobile) {
  if (layout === 'mobile') return mobile;
  if (layout === 'tablet') return tablet;
  return desktop;
}
