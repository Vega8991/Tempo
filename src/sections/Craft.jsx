import { useRef } from 'react';
import { CRAFT } from '../content.js';
import { useFilmShot } from '../components/StickyScene.jsx';
import { ScrollReveal } from '../components/ScrollReveal.jsx';
import { TextReveal } from '../components/TextReveal.jsx';
import { Still } from '../components/Still.jsx';

/**
 * ARTESANÍA — momento de calma. La tecnología desaparece: sin scrub, sin parallax.
 * Solo aperturas de clip-path una vez y mucho aire.
 */
export function Craft() {
  const ref = useRef(null);
  useFilmShot('craft', ref, (ctx) => {
    ctx.key(ctx.top - ctx.vh * 0.2, { stage: 0 });
    ctx.key(ctx.exit - ctx.vh, { stage: 0 });
  });
  return (
    <section id="artesania" ref={ref} className="craft section" aria-labelledby="craft-title">
      <header className="craft__head">
        <p className="label">{CRAFT.eyebrow}</p>
        <TextReveal as="h2" id="craft-title" className="craft__lines">
          <span className="craft__line">{CRAFT.lines[0]}</span> <span className="craft__line craft__line--2">{CRAFT.lines[1]}</span>
        </TextReveal>
      </header>
      <ul className="craft__plates">
        {CRAFT.plates.map((p, i) => (
          <li key={p.key} className={`craft__item craft__item--${i + 1}`}>
            <ScrollReveal as="figure" className="craft__figure" clip y={0}>
              <Still name={`craft-${p.key}`} alt={p.alt} sizes="(max-width: 599px) 92vw, (max-width: 1200px) 44vw, 520px" className="craft__img" />
              <figcaption className="craft__caption">
                <span className="label num">Fig. {String(i + 1).padStart(2, '0')}</span>
                <span className="h3">{p.title}</span>
                <span className="body">{p.text}</span>
              </figcaption>
            </ScrollReveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
