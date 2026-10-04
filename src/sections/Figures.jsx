import { useRef } from 'react';
import { FIGURES } from '../content.js';
import { useFilmShot } from '../components/StickyScene.jsx';
import { DataDisplay } from '../components/DataDisplay.jsx';
import { TextReveal } from '../components/TextReveal.jsx';

/** CIFRAS — cuatro números que se comportan como instrumentos. El 3D descansa. */
export function Figures() {
  const ref = useRef(null);
  useFilmShot('figures', ref, (ctx) => {
    ctx.key(ctx.top - ctx.vh * 0.2, { stage: 0 });
    ctx.key(ctx.exit, { stage: 0 });
  });
  return (
    <section id="precision" ref={ref} className="figures section" aria-labelledby="figures-title">
      <header className="section__head">
        <p className="label">{FIGURES.eyebrow}</p>
        <TextReveal id="figures-title" className="h2">
          {FIGURES.title}
        </TextReveal>
      </header>
      <ul className="figures__grid">
        {FIGURES.items.map((f) => (
          <li key={f.key}>
            <DataDisplay kind={f.key} value={f.value} unit={f.unit} label={f.label} />
          </li>
        ))}
      </ul>
    </section>
  );
}
