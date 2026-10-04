import { useRef } from 'react';
import { CALIBRE } from '../content.js';
import { MOTION } from '../motion.config.js';
import { pose, windowed, highlight, shiftFor } from '../lib/film.js';
import { StickyScene, useFilmShot } from '../components/StickyScene.jsx';
import { Still } from '../components/Still.jsx';

// capítulo: [entra, plano fijo, sale]
const CH = [
  [0.14, 0.2, 0.34],
  [0.35, 0.41, 0.55],
  [0.56, 0.62, 0.76],
  [0.77, 0.83, 1.0],
];
const STILL_FOR = ['calibre-energy', 'calibre-transmission', 'calibre-regulation', 'calibre-precision'];

/**
 * CALIBRE T-01 — visita guiada por capítulos.
 * Las piezas se recomponen sin caja ni esfera, el volante arranca (3 Hz reales) y la cámara
 * recorre Energía → Transmisión → Regulación → Precisión. La pieza del capítulo conserva la luz.
 */
export function Calibre() {
  const ref = useRef(null);

  useFilmShot('calibre', ref, (ctx) => {
    const { el, key, at } = ctx;
    const L = ctx.layout;
    const S = (dx, dy) => shiftFor(L, { shiftX: dx, shiftY: 0 }, { shiftX: 0, shiftY: dy });
    // recomposición: el despiece se cierra y la esfera/agujas se retiran mientras la cámara gira al fondo
    pose(ctx, 0, 'calibre', { ...S(0.16, 0.13), alive: 0, rotorSpin: 0, trainSpin: 0, stage: 1 });
    pose(ctx, 0.1, 'calibre', { ...S(0.16, 0.13), alive: 1, rotorSpin: 0, trainSpin: 0 });
    // 01 energía: el micro-rotor gira con el scroll
    pose(ctx, CH[0][1], 'chRotor', { ...S(0.2, 0.14), alive: 1, rotorSpin: 0, trainSpin: 0 });
    pose(ctx, CH[0][2] - 0.02, 'chRotor', { ...S(0.2, 0.14), alive: 1, rotorSpin: Math.PI * 1.4, trainSpin: 0 }, 'linear');
    // 02 transmisión: el tren gira en sus relaciones
    pose(ctx, CH[1][1], 'chTrain', { ...S(0.2, 0.14), alive: 1, rotorSpin: Math.PI * 1.4, trainSpin: 0 });
    pose(ctx, CH[1][2] - 0.02, 'chTrain', { ...S(0.2, 0.14), alive: 1, rotorSpin: Math.PI * 1.4, trainSpin: 1.6 }, 'linear');
    // 03 regulación: el volante en primer plano, a su velocidad real
    pose(ctx, CH[2][1], 'chBalance', { ...S(0.2, 0.14), alive: 1, rotorSpin: Math.PI * 1.4, trainSpin: 1.6 });
    pose(ctx, CH[2][2] - 0.02, 'chBalance', { ...S(0.2, 0.14), alive: 1, rotorSpin: Math.PI * 1.4, trainSpin: 1.6, fitH: 12.5, fitW: 14 }, 'linear');
    // 04 precisión: acercamiento al escape
    pose(ctx, CH[3][1], 'chEscape', { ...S(0.2, 0.14), alive: 1, rotorSpin: Math.PI * 1.4, trainSpin: 1.6 });
    pose(ctx, 1, 'chEscape', { ...S(0.2, 0.14), alive: 1, rotorSpin: Math.PI * 1.4, trainSpin: 1.6, fitH: 6.6, fitW: 7.4, stage: 1 }, 'linear');
    // salida: fundido a negro antes de las cifras
    key(ctx.after(0.55), { stage: 0, light: 0.6 });

    windowed(ctx, el.querySelector('.cal__head'), 0.02, 0.07, 0.12, 0.15);
    const chapters = el.querySelectorAll('.cal__chapter');
    chapters.forEach((c, i) => {
      const [a, , d] = CH[i];
      const last = i === chapters.length - 1;
      windowed(ctx, c, a, a + 0.04, last ? null : d - 0.03, last ? null : d);
    });
    const marks = el.querySelectorAll('.cal__mark');
    marks.forEach((m, i) => {
      const [a, , d] = CH[i];
      highlight(ctx, m, a, a + 0.03, d - 0.02, d, { idle: 0.35, done: 0.35 });
    });
    const rail = el.querySelector('.cal__rail-fill');
    if (rail) {
      ctx.tl.fromTo(rail, { scaleY: 0 }, { scaleY: 1, duration: ctx.dur(1 - CH[0][0]), ease: 'none', immediateRender: false }, at(CH[0][0]));
    }
  });

  return (
    <StickyScene id="calibre" sceneRef={ref} length={MOTION.pin.calibre} className="cal" labelledBy="cal-title">
      <header className="cal__head film-cap">
        <p className="label">{CALIBRE.eyebrow}</p>
        <h2 id="cal-title" className="h2">
          {CALIBRE.title}
        </h2>
        <p className="body">{CALIBRE.intro}</p>
      </header>

      <div className="cal__index film-only" aria-hidden="true">
        <span className="cal__rail">
          <span className="cal__rail-fill" />
        </span>
        {CALIBRE.chapters.map((c) => (
          <span key={c.n} className="cal__mark label num">
            {c.n}
          </span>
        ))}
      </div>

      <div className="cal__chapters">
        {CALIBRE.chapters.map((c, i) => (
          <article key={c.key} className={`cal__chapter cal__chapter--${c.key} film-cap`} aria-labelledby={`cal-ch-${c.key}`}>
            <p className="label num">Capítulo {c.n}</p>
            <h3 id={`cal-ch-${c.key}`} className="cal__ch-title">
              {c.title}
            </h3>
            <p className="body">{c.text}</p>
            <figure className="scene__still cal__still">
              <Still name={STILL_FOR[i]} sizes="(max-width: 599px) 100vw, 40vw" alt={c.alt} />
            </figure>
          </article>
        ))}
      </div>
    </StickyScene>
  );
}
