// Manifiesto de imágenes fijas renderizadas a partir del mismo modelo 3D (scripts/render-stills.mjs).
// Se usan como póster del hero (LCP), en los niveles sin WebGL y en las escenas de fotografía.
export const STILL_BASE = '/stills';

export const STILLS = {
  // vistas del reloj, fondo transparente
  'watch-front': { w: 1400, h: 1400, widths: [700, 1400] },
  'watch-case': { w: 1400, h: 1400, widths: [700, 1400] },
  'watch-profile': { w: 1400, h: 1400, widths: [700, 1400] },
  'watch-back': { w: 1400, h: 1400, widths: [700, 1400] },
  'watch-movement': { w: 1400, h: 1400, widths: [700, 1400] },
  'watch-materials': { w: 1400, h: 1400, widths: [700, 1400] },
  'watch-exploded': { w: 1400, h: 1400, widths: [700, 1400] },
  'watch-calibre': { w: 1400, h: 1400, widths: [700, 1400] },
  'calibre-energy': { w: 1400, h: 1400, widths: [700, 1400] },
  'calibre-transmission': { w: 1400, h: 1400, widths: [700, 1400] },
  'calibre-regulation': { w: 1400, h: 1400, widths: [700, 1400] },
  'calibre-precision': { w: 1400, h: 1400, widths: [700, 1400] },
  'watch-side': { w: 1400, h: 1400, widths: [700, 1400] },
  'watch-reserve': { w: 1400, h: 1400, widths: [700, 1400] },
  // macro: horizontal + vertical (dirección de arte propia en móvil)
  'macro-hands': { w: 2400, h: 1500, widths: [1280, 1920, 2400], portrait: { w: 1200, h: 1800, widths: [600, 1200] } },
  'macro-crown': { w: 2400, h: 1500, widths: [1280, 1920, 2400], portrait: { w: 1200, h: 1800, widths: [600, 1200] } },
  'macro-surface': { w: 2400, h: 1500, widths: [1280, 1920, 2400], portrait: { w: 1200, h: 1800, widths: [600, 1200] } },
  // artesanía: placas editoriales 4:5
  'craft-anglage': { w: 1000, h: 1250, widths: [500, 1000] },
  'craft-cotes': { w: 1000, h: 1250, widths: [500, 1000] },
  'craft-screws': { w: 1000, h: 1250, widths: [500, 1000] },
  'craft-finish': { w: 1000, h: 1250, widths: [500, 1000] },
  'craft-assembly': { w: 1000, h: 1250, widths: [500, 1000] },
  'craft-strap': { w: 1000, h: 1250, widths: [500, 1000] },
};

export const srcSet = (name, fmt, widths) => widths.map((w) => `${STILL_BASE}/${name}-${w}.${fmt} ${w}w`).join(', ');
export const src = (name, w, fmt = 'webp') => `${STILL_BASE}/${name}-${w}.${fmt}`;
