import { useRef } from 'react';
import { MATERIALS } from '../content.js';
import { MOTION } from '../motion.config.js';
import { pose, windowed, shiftFor } from '../lib/film.js';
import { StickyScene, useFilmShot } from '../components/StickyScene.jsx';
import { MaterialReveal } from '../components/MaterialReveal.jsx';
import { Still } from '../components/Still.jsx';

/**
 * MATERIALES — la cámara se acerca de forma monótona y cada superficie aparece en su instante:
 * cuero → titanio → cepillado/pulido → zafiro → esfera. El entorno de luz gira para que un
 * reflejo recorra el bisel y el cristal justo cuando se nombran.
 */
export function Materials() {
  const ref = useRef(null);

  useFilmShot('materials', ref, (ctx) => {
    const el = ctx.el;
    const L = ctx.layout;
    const S = (dx, dy) => shiftFor(L, { shiftX: dx, shiftY: 0 }, { shiftX: 0, shiftY: dy });
    ctx.key(ctx.at(0), { stage: 1 });
    pose(ctx, 0, 'matIntro', { ...S(0.12, 0.12), envTilt: 0.25, envRot: 0.3 });
    pose(ctx, 0.08, 'matIntro', { ...S(0.12, 0.12), envTilt: 0.25, envRot: 0.4 });
    pose(ctx, 0.2, 'matLeather', { ...S(0.14, 0.14), envTilt: 0.3, envRot: 0.6 });
    pose(ctx, 0.4, 'matTitanium', { ...S(0.14, 0.14), envTilt: 0.15, envRot: -0.35 });
    // pulido: el estudio gira y una línea de luz recorre el bisel
    pose(ctx, 0.52, 'matPolish', { ...S(0.12, 0.14), envTilt: 0.2, envRot: -0.4 });
    pose(ctx, 0.62, 'matPolish', { ...S(0.12, 0.14), envTilt: 0.2, envRot: 0.55 }, 'soft');
    // zafiro: el reflejo cruza el cristal y desaparece (antirreflejos)
    pose(ctx, 0.72, 'matSapphire', { ...S(0.1, 0.14), envTilt: -0.35, envRot: 0.2 });
    pose(ctx, 0.82, 'matSapphire', { ...S(0.1, 0.14), envTilt: 0.35, envRot: -0.25 }, 'soft');
    pose(ctx, 1, 'matDial', { ...S(0.08, 0.12), stage: 1 });

    windowed(ctx, el.querySelector('.materials__head'), 0, 0.04, 0.12, 0.17);
    const items = el.querySelectorAll('.material');
    const centers = [0.2, 0.4, 0.57, 0.77, 0.97];
    items.forEach((it, i) => {
      const c = centers[i];
      const last = i === items.length - 1;
      windowed(ctx, it, c - 0.07, c - 0.01, last ? null : c + 0.08, last ? null : c + 0.13);
    });
  });

  return (
    <StickyScene id="materiales" sceneRef={ref} length={MOTION.pin.materials} className="materials" labelledBy="materials-title">
      <header className="materials__head film-cap">
        <p className="label">Materiales</p>
        <h2 id="materials-title" className="h2">
          {MATERIALS.title}
        </h2>
        <p className="lede">{MATERIALS.subtitle}</p>
      </header>
      <MaterialReveal items={MATERIALS.items} />
      <figure className="scene__still">
        <Still
          name="watch-materials"
          sizes="(max-width: 599px) 100vw, 60vw"
          alt="Tempo Origen en tres cuartos: flanco de titanio microgranallado, bisel pulido, cristal de zafiro y correa de cuero negro."
        />
      </figure>
    </StickyScene>
  );
}
