import { useRef } from 'react';
import { MACRO } from '../content.js';
import { MOTION } from '../motion.config.js';
import { StickyScene, useFilmShot } from '../components/StickyScene.jsx';
import { MacroScene } from '../components/MacroScene.jsx';

/**
 * MACRO — corte a objetivo macro. El 3D se apaga mientras la primera placa enfoca:
 * esfera 3D en primer plano → fotografía macro de aguja e índice (misma materia, otra óptica).
 */
export function Macro() {
  const ref = useRef(null);

  useFilmShot('macro', ref, (ctx) => {
    const { tl, at, dur, el, tier } = ctx;
    // el escenario 3D se funde mientras la placa enfoca (fundido cruzado, no cortina)
    ctx.key(ctx.before(0.35), { stage: 1 });
    ctx.key(ctx.at(0.06), { stage: 0 });
    ctx.key(ctx.at(1), { stage: 0 });

    const lite = tier === 'lite';
    const blur = lite ? 0 : 6;
    const plates = el.querySelectorAll('.macro__plate');
    const slots = [
      [0.0, 0.16, 0.36],
      [0.32, 0.48, 0.68],
      [0.64, 0.8, 1.0],
    ];
    plates.forEach((plate, i) => {
      const [a, b] = slots[i];
      const img = plate.querySelector('img');
      const cap = plate.querySelector('figcaption');
      if (i === 0) {
        tl.fromTo(plate, { opacity: 0 }, { opacity: 1, duration: at(0.07) - ctx.before(0.35), ease: 'power1.out', immediateRender: false }, ctx.before(0.35));
      } else {
        // la placa siguiente se abre desde abajo sobre la anterior
        tl.fromTo(
          plate,
          { opacity: 1, clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: dur(b - a), ease: 'power2.inOut', immediateRender: false },
          at(a),
        );
      }
      // ajuste de foco: escala y desenfoque bajan juntos (desenfoque máximo 6 px)
      tl.fromTo(
        img,
        { scale: 1.12, filter: `blur(${blur}px)` },
        { scale: 1, filter: 'blur(0px)', duration: dur(b - a + 0.04), ease: 'power2.out', immediateRender: false },
        at(a),
      );
      tl.fromTo(cap, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: dur(0.06), ease: 'power2.out', immediateRender: false }, at(b - 0.04));
      if (i < plates.length - 1) {
        tl.fromTo(cap, { opacity: 1 }, { opacity: 0, duration: dur(0.04), immediateRender: false }, at(slots[i + 1][0] - 0.02));
      }
    });
    const head = el.querySelector('.macro__head');
    tl.fromTo(head, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: dur(0.06), immediateRender: false }, at(0.06));
    tl.fromTo(head, { opacity: 1 }, { opacity: 0, duration: dur(0.06), immediateRender: false }, at(0.3));
    // salida: la última placa se funde a negro antes del despiece
    tl.fromTo(plates[plates.length - 1], { opacity: 1 }, { opacity: 0, duration: dur(0.1), ease: 'power1.in', immediateRender: false }, at(0.94));
  });

  return (
    <StickyScene id="detalle" sceneRef={ref} length={MOTION.pin.macro} className="macro" labelledBy="macro-title">
      <header className="macro__head film-cap">
        <p className="label">{MACRO.eyebrow}</p>
        <h2 id="macro-title" className="h2">
          {MACRO.title}
        </h2>
      </header>
      <MacroScene plates={MACRO.plates} />
    </StickyScene>
  );
}
