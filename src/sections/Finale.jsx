import { useRef } from 'react';
import { BRAND, FINALE, FOOTER } from '../content.js';
import { MOTION } from '../motion.config.js';
import { pose, shiftFor } from '../lib/film.js';
import { StickyScene, useFilmShot } from '../components/StickyScene.jsx';
import { MagneticButton } from '../components/MagneticButton.jsx';
import { Still } from '../components/Still.jsx';

/**
 * FINAL — último plano. Todo se retira por capas: datos → textos secundarios → decoración.
 * Quedan la marca, el reloj ligeramente iluminado, el claim y la invitación. El plano se sostiene.
 */
export function Finale() {
  const ref = useRef(null);
  useFilmShot('finale', ref, (ctx) => {
    const { el, tl, at, dur } = ctx;
    const mobile = ctx.layout === 'mobile';
    const S = shiftFor(ctx.layout, { shiftX: 0, shiftY: 0 }, { shiftX: 0, shiftY: 0.02 });
    const far = mobile ? { fitH: 150, fitW: 74 } : { fitH: 104, fitW: 80 };
    const near = mobile ? { fitH: 140, fitW: 70 } : { fitH: 94, fitW: 74 };
    pose(ctx, 0, 'finale', { ...S, ...far, stage: 1, light: 1, dust: 0.6 });
    pose(ctx, 0.62, 'finale', { ...S, ...far, light: 0.9, dust: 0.8 });
    pose(ctx, 0.86, 'finale', { ...S, ...near, light: 0.55, envTilt: 0.35, envRot: -0.3, dust: 1, stage: 1 });
    pose(ctx, 1, 'finale', { ...S, ...near, light: 0.55, envTilt: 0.35, envRot: -0.3, dust: 1, stage: 1 });

    const layer = (sel, a, b) =>
      tl.fromTo(el.querySelectorAll(sel), { opacity: 1, y: 0 }, { opacity: 0, y: -10, duration: dur(b - a), ease: 'power1.in', stagger: dur(0.02), immediateRender: false }, at(a));
    layer('.finale__data', 0.08, 0.22);
    layer('.finale__secondary p', 0.26, 0.4);
    layer('.finale__deco', 0.44, 0.6);
  });

  return (
    <StickyScene id="final" sceneRef={ref} length={MOTION.pin.finale} className="finale" labelledBy="finale-title">
      <div className="finale__deco" aria-hidden="true">
        <span className="finale__corner finale__corner--tl" />
        <span className="finale__corner finale__corner--tr" />
        <span className="finale__corner finale__corner--bl" />
        <span className="finale__corner finale__corner--br" />
        <svg className="finale__dial" viewBox="0 0 400 400">
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const r0 = i % 5 === 0 ? 182 : 188;
            return (
              <line
                key={i}
                x1={200 + Math.cos(a) * r0}
                y1={200 + Math.sin(a) * r0}
                x2={200 + Math.cos(a) * 196}
                y2={200 + Math.sin(a) * 196}
              />
            );
          })}
        </svg>
      </div>

      <ul className="finale__data num" aria-label="Datos">
        {FINALE.data.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>

      <div className="finale__secondary">
        {FINALE.secondary.map((t) => (
          <p key={t} className="label label--ivory">
            {t}
          </p>
        ))}
      </div>

      <figure className="scene__still finale__still">
        <Still name="watch-front" sizes="(max-width: 599px) 100vw, 50vw" alt="Tempo Origen de frente, ligeramente iluminado sobre fondo negro." />
      </figure>

      <div className="finale__core">
        <h2 id="finale-title" className="finale__brand">
          <span className="finale__brand-name">{BRAND.name}</span>
          <span className="finale__brand-product">{BRAND.product}</span>
        </h2>
        <p className="finale__claim lede">
          {BRAND.claim[0]} <span className="nowrap">{BRAND.claim[1]}</span>
        </p>
        <div className="finale__cta">
          <MagneticButton href="#reservar" data-open="reserve" variant="primary">
            {FINALE.cta}
          </MagneticButton>
        </div>
      </div>

      <footer className="finale__footer" role="contentinfo">
        <p>{FOOTER.note}</p>
        <p className="num">
          © {BRAND.year} {BRAND.name}
        </p>
      </footer>
    </StickyScene>
  );
}
