// Planos con nombre. Cada plano es un conjunto parcial de valores del rig.
// Los usa la timeline maestra (keyframes) y el renderizador de imágenes fijas: una sola fuente de verdad.
import { T01_TARGETS } from './targets.js';

const PI = Math.PI;
const TAU = PI * 2;

/** Montado, sin despiece, sin foco. Se combina con cada plano para dejar el estado explícito. */
export const ASSEMBLED = {
  exCrystal: 0,
  exDial: 0,
  exHands: 0,
  exCase: 0,
  exPlate: 0,
  exTrain: 0,
  exRotor: 0,
  exBalance: 0,
  exEscape: 0,
  hideCase: 0,
  hideDial: 0,
  fRotor: 0,
  fTrain: 0,
  fBalance: 0,
  fEscape: 0,
  dim: 0,
};

export const EXPLODED = {
  exCrystal: 1,
  exDial: 1,
  exHands: 1,
  exCase: 1,
  exPlate: 1,
  exTrain: 1,
  exRotor: 1,
  exBalance: 1,
  exEscape: 1,
};

const CALIBRE = { ...ASSEMBLED, hideCase: 1, hideDial: 1 };

// desplazamientos ópticos por composición: escritorio deja aire para el texto a la izquierda;
// móvil sube el reloj y deja el tercio inferior al texto.
export const SHIFT = {
  heroDesktop: { shiftX: 0.16, shiftY: 0.02 },
  heroMobile: { shiftX: 0, shiftY: 0.14 },
};

export const POSES = {
  // --- HERO ---
  front: { ...ASSEMBLED, rotX: 0.05, rotY: -0.16, rotZ: 0, tx: 0, ty: 0, tz: 0, fitH: 68, fitW: 60, camEl: 0.02, light: 1, envTilt: 0.3, envRot: 0 },
  caseDetail: { ...ASSEMBLED, rotX: 0.26, rotY: -0.92, rotZ: 0.06, tx: 12.5, ty: -2.5, tz: -0.5, fitH: 40, fitW: 44, camEl: 0.04 },
  profile: { ...ASSEMBLED, rotX: 0.1, rotY: -1.36, rotZ: 0, tx: 0, ty: 0, tz: -0.5, fitH: 54, fitW: 44, camEl: 0.02 },
  caseback: { ...ASSEMBLED, rotX: -0.16, rotY: -2.72, rotZ: 0, tx: 0, ty: 0, tz: -3, fitH: 58, fitW: 54, camEl: 0.0 },
  movement: { ...ASSEMBLED, rotX: -0.04, rotY: -PI, rotZ: 0.0, tx: 0, ty: 0, tz: -4.5, fitH: 36, fitW: 36, camEl: 0.0, envTilt: 0.15, envRot: 0.35, light: 0.95 },

  // --- MATERIALES (la cámara se acerca de forma monótona) ---
  matIntro: { ...ASSEMBLED, rotX: 0.22, rotY: -TAU - 0.42, rotZ: -0.05, tx: 0, ty: -2, tz: 0, fitH: 56, fitW: 50, camEl: 0.05 },
  matLeather: { ...ASSEMBLED, rotX: 0.35, rotY: -TAU - 1.25, rotZ: 0.0, tx: 0, ty: -30, tz: -9, fitH: 34, fitW: 40, camEl: 0.0 },
  matTitanium: { ...ASSEMBLED, rotX: 0.32, rotY: -TAU - 0.78, rotZ: 0.12, tx: 15.5, ty: -8, tz: -1, fitH: 30, fitW: 34, camEl: 0.04 },
  matPolish: { ...ASSEMBLED, rotX: 0.5, rotY: -TAU - 0.42, rotZ: 0.0, tx: -9, ty: 14, tz: 3.2, fitH: 22, fitW: 26, camEl: 0.08 },
  matSapphire: { ...ASSEMBLED, rotX: 0.62, rotY: -TAU - 0.2, rotZ: 0.0, tx: -3, ty: 4, tz: 4.2, fitH: 20, fitW: 24, camEl: 0.1 },
  matDial: { ...ASSEMBLED, rotX: 0.06, rotY: -TAU - 0.06, rotZ: 0.0, tx: 3.5, ty: -6.5, tz: 2.3, fitH: 13, fitW: 16, camEl: 0.0, envTilt: -0.35, envRot: 0 },

  // --- DESMONTAJE ---
  disStart: { ...ASSEMBLED, rotX: 0.3, rotY: -TAU - 0.45, rotZ: 0.0, tx: 0, ty: 0, tz: 0, fitH: 70, fitW: 64, camEl: 0.04, envTilt: 0.2, envRot: 0, light: 1.1 },
  disEnd: { ...EXPLODED, hideCase: 0, hideDial: 0, rotX: -1.1, rotY: -TAU - 0.4, rotZ: 0, tx: 0, ty: 0, tz: 4, fitH: 96, fitW: 60, camEl: 0, envTilt: -0.7, envRot: -0.5, light: 1.25 },

  // --- CALIBRE ---
  calibre: { ...CALIBRE, rotX: -0.06, rotY: -3 * PI, rotZ: 0, tx: 0, ty: 0, tz: -2, fitH: 40, fitW: 40, camEl: 0, envTilt: 0.6, envRot: 0.8, light: 1.15 },
  chRotor: {
    ...CALIBRE,
    envTilt: 0.6,
    envRot: 0.8,
    light: 1.2,
    rotX: -0.3,
    rotY: -3 * PI + 0.25,
    rotZ: 0,
    tx: T01_TARGETS.rotor[0],
    ty: T01_TARGETS.rotor[1],
    tz: T01_TARGETS.rotor[2],
    fitH: 22,
    fitW: 24,
    fRotor: 1,
    dim: 1,
  },
  chTrain: {
    ...CALIBRE,
    envTilt: 0.6,
    envRot: 0.8,
    light: 1.2,
    rotX: -0.18,
    rotY: -3 * PI - 0.28,
    rotZ: 0,
    tx: T01_TARGETS.train[0],
    ty: T01_TARGETS.train[1],
    tz: T01_TARGETS.train[2],
    fitH: 22,
    fitW: 25,
    fTrain: 1,
    dim: 1,
  },
  chBalance: {
    ...CALIBRE,
    envTilt: 0.6,
    envRot: 0.8,
    light: 1.2,
    rotX: 0.32,
    rotY: -3 * PI - 0.1,
    rotZ: 0,
    tx: T01_TARGETS.balance[0],
    ty: T01_TARGETS.balance[1],
    tz: T01_TARGETS.balance[2],
    fitH: 14,
    fitW: 16,
    fBalance: 1,
    dim: 1,
  },
  chEscape: {
    ...CALIBRE,
    envTilt: 0.6,
    envRot: 0.8,
    light: 1.2,
    rotX: 0.42,
    rotY: -3 * PI - 0.3,
    rotZ: 0,
    tx: T01_TARGETS.escape[0],
    ty: T01_TARGETS.escape[1],
    tz: T01_TARGETS.escape[2],
    fitH: 8,
    fitW: 9,
    fEscape: 1,
    dim: 1,
  },

  // --- PIEZA TERMINADA (giro completo) ---
  finFront: { ...ASSEMBLED, rotX: 0.05, rotY: -4 * PI - 0.16, rotZ: 0, tx: 0, ty: 0, tz: 0, fitH: 64, fitW: 58, camEl: 0.03 },
  finSide: { ...ASSEMBLED, rotX: 0.12, rotY: -4 * PI - PI / 2 - 0.1, rotZ: 0, tx: 0, ty: 0, tz: -0.5, fitH: 60, fitW: 52, camEl: 0.12 },
  finBack: { ...ASSEMBLED, rotX: -0.12, rotY: -5 * PI + 0.1, rotZ: 0, tx: 0, ty: 0, tz: -3, fitH: 60, fitW: 56, camEl: 0.06 },
  finEnd: { ...ASSEMBLED, rotX: 0.05, rotY: -6 * PI - 0.16, rotZ: 0, tx: 0, ty: 0, tz: 0, fitH: 64, fitW: 58, camEl: 0.03 },

  // --- RESERVA y FINAL ---
  reserve: { ...ASSEMBLED, rotX: 0.2, rotY: -0.5, rotZ: 0.0, tx: 0, ty: 0, tz: 0, fitH: 70, fitW: 62, camEl: 0.04 },
  finale: { ...ASSEMBLED, rotX: 0.08, rotY: -0.22, rotZ: 0, tx: 0, ty: 0, tz: 0, fitH: 74, fitW: 62, camEl: 0.03 },
};

/**
 * Planos para imágenes fijas (scripts/render-stills.mjs). Cada uno parte de un plano con nombre
 * y añade ajustes: encuadre, apertura (profundidad de campo real por acumulación) y fondo.
 * Tamaños y anchos publicados: src/stills.js.
 */
const W = { w: 1400, h: 1400, alpha: true, samples: 12 };
const CALIBRE_LIGHT = { envTilt: 0.6, envRot: 0.8, light: 1.2 };
export const STILL_SHOTS = {
  'watch-front': { ...W, pose: 'front', samples: 16 },
  'watch-case': { ...W, pose: 'caseDetail', rig: { tx: 6, ty: -1, fitH: 52, fitW: 52 } },
  'watch-profile': { ...W, pose: 'profile' },
  'watch-back': { ...W, pose: 'caseback' },
  'watch-movement': { ...W, pose: 'movement' },
  'watch-materials': { ...W, pose: 'matIntro', rig: { envTilt: 0.25, envRot: 0.3, fitH: 62, fitW: 62 } },
  'watch-exploded': { ...W, pose: 'disEnd', rig: { fitH: 100, fitW: 100 } },
  'watch-calibre': { ...W, pose: 'calibre' },
  'calibre-energy': { ...W, pose: 'chRotor', rig: { dim: 0.6 } },
  'calibre-transmission': { ...W, pose: 'chTrain', rig: { dim: 0.6 } },
  'calibre-regulation': { ...W, pose: 'chBalance', rig: { dim: 0.6 } },
  'calibre-precision': { ...W, pose: 'chEscape', rig: { dim: 0.6, fitH: 9, fitW: 9 } },
  'watch-side': { ...W, pose: 'finSide' },
  'watch-reserve': { ...W, pose: 'reserve' },

  // macro: fondo opaco, objetivo macro con apertura amplia
  'macro-hands': {
    pose: 'front',
    w: 2400,
    h: 1500,
    samples: 32,
    aperture: 0.9,
    bg: '#060607',
    rig: { rotX: 0.45, rotY: -0.35, rotZ: 0, tx: 11.2, ty: 6.5, tz: 2.6, fitH: 8, fitW: 12.8, envTilt: -0.3, envRot: 0.2 },
    portrait: { w: 1200, h: 1800, rig: { fitH: 13, fitW: 8.6 } },
  },
  'macro-crown': {
    pose: 'front',
    w: 2400,
    h: 1500,
    samples: 32,
    aperture: 0.9,
    bg: '#060607',
    rig: { rotX: 0.22, rotY: -0.5, rotZ: 0.05, tx: 21.2, ty: 0, tz: -0.65, fitH: 9, fitW: 14.4, envTilt: 0.25, envRot: 0.9 },
    portrait: { w: 1200, h: 1800, rig: { fitH: 15, fitW: 10 } },
  },
  'macro-surface': {
    pose: 'front',
    w: 2400,
    h: 1500,
    samples: 32,
    aperture: 0.7,
    bg: '#060607',
    rig: { rotX: 0.55, rotY: 0.55, rotZ: 0, tx: -13.3, ty: 13.3, tz: 1.6, fitH: 8, fitW: 12.8, envTilt: 0.1, envRot: 0.7 },
    portrait: { w: 1200, h: 1800, rig: { fitH: 12, fitW: 8 } },
  },

  // artesanía: placas 4:5 sobre grafito cálido
  'craft-anglage': { pose: 'calibre', w: 1000, h: 1250, samples: 24, aperture: 0.35, bg: '#0d0c0b', rig: { ...CALIBRE_LIGHT, rotX: 0.6, rotY: -3 * Math.PI + 0.35, tx: 4.6, ty: -11.0, tz: -2.9, fitH: 7, fitW: 5.6 } },
  'craft-cotes': { pose: 'calibre', w: 1000, h: 1250, samples: 24, aperture: 0.3, bg: '#0d0c0b', rig: { ...CALIBRE_LIGHT, rotX: 0.18, rotY: -3 * Math.PI - 0.12, tx: -7.0, ty: 1.2, tz: -2.6, fitH: 15, fitW: 12 } },
  'craft-screws': { pose: 'calibre', w: 1000, h: 1250, samples: 24, aperture: 0.35, bg: '#0d0c0b', rig: { ...CALIBRE_LIGHT, rotX: 0.45, rotY: -3 * Math.PI - 0.25, tx: -12.2, ty: 3.6, tz: -2.8, fitH: 6.5, fitW: 5.2 } },
  'craft-finish': { pose: 'front', w: 1000, h: 1250, samples: 24, aperture: 0.45, bg: '#0d0c0b', rig: { rotX: 0.42, rotY: -0.95, rotZ: 0, tx: 11.4, ty: 19.5, tz: 0.4, fitH: 14, fitW: 11.2, envTilt: 0.3, envRot: 0.6 } },
  'craft-assembly': { pose: 'calibre', w: 1000, h: 1250, samples: 16, aperture: 0, bg: '#0d0c0b', rig: { ...CALIBRE_LIGHT, fitH: 42, fitW: 34 } },
  'craft-strap': { pose: 'matLeather', w: 1000, h: 1250, samples: 24, aperture: 0.5, bg: '#0d0c0b', rig: { envTilt: 0.45, envRot: 1.1, light: 1.7, fitH: 22, fitW: 17.6 } },

  // Open Graph
  og: { pose: 'front', w: 1200, h: 630, samples: 16, bg: '#060607', rig: { shiftX: 0.2, fitH: 70, fitW: 60 }, overlay: 'og' },
};
