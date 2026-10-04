import { useRef } from 'react';
import { EDITION } from '../content.js';
import { MOTION } from '../motion.config.js';
import { useFilmShot } from '../components/StickyScene.jsx';
import { Parallax } from '../components/Parallax.jsx';
import { TextReveal } from '../components/TextReveal.jsx';
import { ScrollReveal } from '../components/ScrollReveal.jsx';

/** Anillo de fondo grabado con el número de serie (SVG con texto en trayecto). */
function CasebackRing({ number }) {
  const id = `ring-${number}`;
  return (
    <svg className="ring" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
      </defs>
      <circle cx="100" cy="100" r="95" className="ring__outer" />
      <circle cx="100" cy="100" r="64" className="ring__inner" />
      <text className="ring__text">
        <textPath href={`#${id}`} startOffset="0">
          TEMPO · ORIGEN · Nº {number} / 250 · CALIBRE T-01 · TITANIO GRADO 5 ·
        </textPath>
      </text>
    </svg>
  );
}

/** EDICIÓN LIMITADA — 250 piezas. Cuatro fondos numerados con una deriva horizontal mínima. */
export function Edition() {
  const ref = useRef(null);
  useFilmShot('edition', ref, (ctx) => {
    ctx.key(ctx.top - ctx.vh * 0.3, { stage: 0 });
    ctx.key(ctx.exit, { stage: 0 });
  });
  return (
    <section id="edicion" ref={ref} className="edition section" aria-labelledby="edition-title">
      <header className="edition__head">
        <p className="label">{EDITION.eyebrow}</p>
        <TextReveal id="edition-title" className="edition__title">
          {EDITION.title}
        </TextReveal>
        <ScrollReveal as="p" className="lede edition__text">
          {EDITION.text}
        </ScrollReveal>
      </header>
      <Parallax axis="x" speed={MOTION.parallax.far} className="edition__track">
        <ul className="edition__rings" aria-label="Números de la serie" tabIndex={0}>
          {EDITION.numbers.map((n) => (
            <li key={n} className="edition__item">
              <CasebackRing number={n} />
              <span className="edition__num num">
                <span className="edition__no">Nº</span> {n}
              </span>
            </li>
          ))}
        </ul>
      </Parallax>
      <ScrollReveal as="p" className="body edition__note">
        {EDITION.note}
      </ScrollReveal>
    </section>
  );
}
