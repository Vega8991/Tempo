import { useRef } from 'react';
import { FINISHED } from '../content.js';
import { MOTION } from '../motion.config.js';
import { pose, windowed, shiftFor } from '../lib/film.js';
import { StickyScene, useFilmShot } from '../components/StickyScene.jsx';
import { Still } from '../components/Still.jsx';

/**
 * LA PIEZA TERMINADA — eco del hero. La luz vuelve despacio y el reloj da una vuelta completa:
 * frontal → perfil → fondo → frontal. La misma imagen del principio, ahora con significado.
 */
export function Finished() {
  const ref = useRef(null);
  useFilmShot('finished', ref, (ctx) => {
    const { el, key } = ctx;
    const S = { ...shiftFor(ctx.layout, { shiftX: 0, shiftY: 0.07 }, { shiftX: 0, shiftY: 0.1 }), fitH: 80, fitW: 64 };
    key(ctx.before(0.7), { stage: 0 });
    pose(ctx, 0, 'finFront', { ...S, light: 0.12, stage: 1, alive: 1, envTilt: 0.3, envRot: -0.5 });
    pose(ctx, 0.2, 'finFront', { ...S, light: 1, envTilt: 0.3, envRot: 0 });
    pose(ctx, 0.45, 'finSide', { ...S, envTilt: 0.2, envRot: 0.9 });
    pose(ctx, 0.7, 'finBack', { ...S, envTilt: 0.5, envRot: 1.6 });
    pose(ctx, 0.96, 'finEnd', { ...S, envTilt: 0.3, envRot: 2.2, stage: 1 });
    key(ctx.after(0.6), { stage: 0 });
    windowed(ctx, el.querySelector('.fin__copy'), 0.04, 0.12, 0.3, 0.38);
  });
  return (
    <StickyScene id="pieza" sceneRef={ref} length={MOTION.pin.finished} className="fin" labelledBy="fin-title">
      <div className="fin__copy film-cap">
        <h2 id="fin-title" className="h2 fin__title">
          {FINISHED.title}
        </h2>
        <p className="body fin__text">{FINISHED.text}</p>
      </div>
      <figure className="scene__still">
        <Still name="watch-side" sizes="(max-width: 599px) 100vw, 60vw" alt="Tempo Origen de perfil: corona estriada, flanco microgranallado, bisel pulido y cristal de zafiro." />
      </figure>
    </StickyScene>
  );
}
