import { useRef } from 'react';
import { SPECS } from '../content.js';
import { useFilmShot } from '../components/StickyScene.jsx';
import { ScrollReveal } from '../components/ScrollReveal.jsx';
import { TextReveal } from '../components/TextReveal.jsx';

/** FICHA TÉCNICA — todas las especificaciones en HTML real (también para buscadores). */
export function Specs() {
  const ref = useRef(null);
  useFilmShot('specs', ref, (ctx) => {
    ctx.key(ctx.top - ctx.vh * 0.3, { stage: 0 });
    ctx.key(ctx.exit - ctx.vh * 0.6, { stage: 0 });
  });
  return (
    <section id="especificaciones" ref={ref} className="specs section" aria-labelledby="specs-title">
      <header className="section__head">
        <p className="label">{SPECS.eyebrow}</p>
        <TextReveal id="specs-title" className="h2">
          {SPECS.title}
        </TextReveal>
      </header>
      <ScrollReveal className="specs__groups" selector=".specs__group" stagger={0.08}>
        {SPECS.groups.map((g) => (
          <div key={g.title} className="specs__group">
            <h3 className="label">{g.title}</h3>
            <dl>
              {g.rows.map(([k, v]) => (
                <div key={k} className="specs__row">
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </ScrollReveal>
    </section>
  );
}
