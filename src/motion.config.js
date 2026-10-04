// Tokens de movimiento de TEMPO.
// Ningún valor de tiempo, curva, distancia o fuerza se escribe a mano en los componentes:
// todo sale de aquí para que el ritmo sea uno solo y se pueda ajustar en un único sitio.

export const MOTION = {
  duration: {
    micro: 0.2,
    ui: 0.45,
    base: 0.8,
    slow: 1.2,
    cinematic: 1.8,
    veil: 0.35, // corte a negro de la navegación
  },

  ease: {
    out: 'power3.out',
    inOut: 'power2.inOut',
    expo: 'expo.out',
    soft: 'sine.inOut',
    linear: 'none', // todo lo ligado a scroll
    // curvas de cámara: arranque y frenado suaves, como un travelling sobre raíles
    camera: 'power1.inOut',
    // equivalentes para Motion (cubic-bezier)
    css: {
      out: [0.22, 1, 0.36, 1],
      inOut: [0.65, 0, 0.35, 1],
    },
  },

  stagger: { tight: 0.04, base: 0.08, loose: 0.14 },

  reveal: { y: 18, start: 'top 82%', clip: 12 },

  // fracción de la altura del elemento
  parallax: { far: 0.04, mid: 0.08, near: 0.14 },

  // Motion (muelles): rigidez y amortiguación altas = preciso, sin rebote
  spring: {
    ui: { stiffness: 320, damping: 30, mass: 0.6 },
    magnetic: { stiffness: 180, damping: 18, mass: 0.4 },
    cursor: { stiffness: 520, damping: 42, mass: 0.5 },
  },

  // longitud de escenas fijadas, en alturas de viewport (sección completa)
  pin: {
    hero: { desktop: 400, mobile: 300 },
    materials: { desktop: 350, mobile: 280 },
    macro: { desktop: 300, mobile: 240 },
    disassembly: { desktop: 400, mobile: 320 },
    calibre: { desktop: 400, mobile: 320 },
    finished: { desktop: 300, mobile: 240 },
    finale: { desktop: 260, mobile: 200 },
    staticLiteFactor: 0.6,
  },

  // cabezal de la timeline maestra: constante de tiempo de la amortiguación (s)
  film: {
    smoothing: 0.14,
    snapDistance: 1.6, // en viewports: saltos mayores no se interpolan
  },

  tilt: { max: 0 }, // sin inclinación por cursor: el reloj solo obedece a la cámara

  magnetic: { strength: 0.28, radius: 1.4, scaleHover: 1.02, scaleTap: 0.98 },

  cursor: { size: 6, ring: 34 },

  camera: {
    fov: 24, // teleobjetivo de producto
    near: 4,
    far: 2400,
    dpr: { full: 2, lite: 1.5 },
  },

  intro: {
    line: 0.15,
    silhouette: 0.55,
    dial: 1.25,
    brand: 1.75,
    title: 2.0,
    claim: 2.35,
    cta: 2.7,
    nav: 2.9,
  },

  ambient: {
    envRotationPeriod: 28, // s: reflejos muy lentos
    breathPeriod: 14, // s: respiración de luz
    breathAmount: 0.035,
    grainFps: 8,
  },

  mechanics: {
    frequency: 3, // Hz → 21.600 alternancias por hora
    amplitude: 4.36, // rad (≈ 250°) amplitud del volante
    rotorPeriod: 46, // s por vuelta del micro-rotor (ambiental)
  },
};

export const LAYOUT = {
  mobileQuery: '(max-width: 599px)',
  tabletQuery: '(min-width: 600px) and (max-width: 899px)',
  desktopQuery: '(min-width: 900px)',
};
