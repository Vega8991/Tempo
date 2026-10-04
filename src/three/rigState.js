// Estado compartido de la escena 3D (sin dependencias de Three). GSAP escribe números aquí; Three.js solo los lee.
// Ningún transform de Three recibe valores de dos motores distintos.

export const RIG_DEFAULTS = {
  // orientación del reloj (rad)
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  // cámara: objetivo en coordenadas locales del reloj (mm) + superficie mínima visible (mm)
  tx: 0,
  ty: 0,
  tz: 0,
  fitH: 66,
  fitW: 60,
  camAz: 0,
  camEl: 0,
  shiftX: 0, // desplazamiento óptico (fracción del ancho); positivo = a la derecha
  shiftY: 0, // positivo = hacia arriba
  // luz
  light: 1,
  envRot: 0,
  envTilt: 0,
  key: 1,
  // despiece (0 = montado, 1 = separado)
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
  // mecánica
  alive: 1,
  rotorSpin: 0,
  trainSpin: 0,
  // foco por capítulo
  fRotor: 0,
  fTrain: 0,
  fBalance: 0,
  fEscape: 0,
  dim: 0,
  // escenario
  stage: 1,
  dust: 0,
};

export function createRig(overrides = {}) {
  return { ...RIG_DEFAULTS, frozen: false, ...overrides };
}

/** Vista con nombres para el modelo: agrupa claves planas en objetos (reutiliza memoria). */
const _view = { explode: {}, focus: {} };
export function rigView(rig) {
  const e = _view.explode;
  e.crystal = rig.exCrystal;
  e.dial = rig.exDial;
  e.hands = rig.exHands;
  e.caseOut = rig.exCase;
  e.plate = rig.exPlate;
  e.train = rig.exTrain;
  e.rotor = rig.exRotor;
  e.balance = rig.exBalance;
  e.escape = rig.exEscape;
  const f = _view.focus;
  f.rotor = rig.fRotor;
  f.train = rig.fTrain;
  f.balance = rig.fBalance;
  f.escape = rig.fEscape;
  _view.dim = rig.dim;
  _view.hideCase = rig.hideCase;
  _view.hideDial = rig.hideDial;
  _view.alive = rig.alive;
  _view.frozen = rig.frozen;
  _view.rotorSpin = rig.rotorSpin;
  _view.trainSpin = rig.trainSpin;
  return _view;
}

