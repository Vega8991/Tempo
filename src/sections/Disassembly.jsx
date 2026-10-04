import { useRef } from 'react';
import { DISASSEMBLY } from '../content.js';
import { MOTION } from '../motion.config.js';
import { pose, highlight, windowed, shiftFor } from '../lib/film.js';
import { StickyScene, useFilmShot } from '../components/StickyScene.jsx';
import { ExplodedMovement } from '../components/ExplodedMovement.jsx';
import { Still } from '../components/Still.jsx';

// Ventanas de cada paso (fracción de la escena): esfera, agujas, platina, engranajes, micro-rotor, volante, escape
const STEPS = [
  [0.1, 0.21],
  [0.21, 0.3],
  [0.3, 0.44],
  [0.44, 0.56],
  [0.56, 0.67],
  [0.67, 0.78],
  [0.78, 0.89],
];

/**
 * DESMONTAJE — "Cada segundo empieza aquí."
 * Despiece técnico sobre el eje del reloj, una pieza cada vez, mientras la cámara se eleva.
 * Cuando la platina se separa, el volante pierde energía y se detiene.
 */
export function Disassembly() {
  const ref = useRef(null);

  useFilmShot('disassembly', ref, (ctx) => {
    const { el, key, at } = ctx;
    const L = ctx.layout;
    const S = (dx, dy) => shiftFor(L, { shiftX: dx, shiftY: 0 }, { shiftX: 0, shiftY: dy });
    const mobile = L === 'mobile';
    // entrada: el reloj reaparece montado mientras la última placa macro se funde
    key(ctx.before(0.6), { stage: 0 });
    pose(ctx, 0, 'disStart', { ...S(0.16, 0.14), stage: 1, alive: 1 });
    pose(ctx, STEPS[0][0], 'disStart', { ...S(0.16, 0.14), alive: 1 });
    // la cámara se eleva sobre el reloj a medida que se abre
    pose(ctx, STEPS[1][0], 'disStart', {
      ...S(0.15, 0.12),
      rotX: -0.25,
      rotY: -Math.PI * 2 - 0.5,
      fitH: 84,
      fitW: mobile ? 66 : 74,
      tz: 12,
      envTilt: -0.2,
      envRot: -0.2,
      exDial: 1,
      exCrystal: 1,
    });
    pose(ctx, STEPS[2][0], 'disStart', {
      ...S(0.14, 0.1),
      rotX: -0.65,
      rotY: -Math.PI * 2 - 0.45,
      fitH: 90,
      fitW: mobile ? 66 : 74,
      tz: 14,
      envTilt: -0.5,
      envRot: -0.4,
      exDial: 1,
      exCrystal: 1,
      exHands: 1,
      alive: 1,
    });
    pose(ctx, STEPS[2][1], 'disEnd', {
      ...S(0.12, 0.08),
      exTrain: 0,
      exRotor: 0,
      exBalance: 0,
      exEscape: 0,
      hideCase: 1,
      alive: 0,
    });
    pose(ctx, STEPS[3][1], 'disEnd', { ...S(0.12, 0.08), exRotor: 0, exBalance: 0, exEscape: 0, hideCase: 1, alive: 0 });
    pose(ctx, STEPS[4][1], 'disEnd', { ...S(0.12, 0.08), exBalance: 0, exEscape: 0, hideCase: 1, alive: 0 });
    pose(ctx, STEPS[5][1], 'disEnd', { ...S(0.12, 0.08), exEscape: 0, hideCase: 1, alive: 0 });
    pose(ctx, STEPS[6][1], 'disEnd', { ...S(0.12, 0.08), hideCase: 1, alive: 0 });
    pose(ctx, 1, 'disEnd', { ...S(0.12, 0.08), rotY: -Math.PI * 2 - 0.55, hideCase: 1, alive: 0, stage: 1 }, 'soft');
    // la caja y la correa salen con la platina (no antes)
    key(at(STEPS[2][0]), { exCase: 0, hideCase: 0 });
    key(at(STEPS[2][1]), { exCase: 1, hideCase: 1 });

    windowed(ctx, el.querySelector('.dis__head'), 0, 0.05);
    const steps = el.querySelectorAll('.dis__step');
    steps.forEach((s, i) => {
      const [a, b] = STEPS[i];
      highlight(ctx, s, a, a + 0.03, b, b + 0.03, { idle: 0.55, done: 0.72 });
    });
    windowed(ctx, el.querySelector('.dis__outro'), 0.9, 0.95);
  });

  return (
    <StickyScene id="movimiento" sceneRef={ref} length={MOTION.pin.disassembly} className="dis" labelledBy="dis-title">
      <header className="dis__head">
        <p className="label">{DISASSEMBLY.eyebrow}</p>
        <h2 id="dis-title" className="h2">
          {DISASSEMBLY.title}
        </h2>
      </header>
      <ExplodedMovement steps={DISASSEMBLY.steps} outro={DISASSEMBLY.outro} />
      <figure className="scene__still">
        <Still
          name="watch-exploded"
          sizes="(max-width: 599px) 100vw, 60vw"
          alt="Despiece técnico del Tempo Origen sobre su eje: agujas, esfera, platina, tren de engranajes dorado, escape, volante con espiral azulada, puentes con Côtes de Genève y micro-rotor."
        />
      </figure>
    </StickyScene>
  );
}
