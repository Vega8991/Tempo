import { useEffect, useRef } from 'react';
import { BRAND, HERO } from '../content.js';
import { MOTION } from '../motion.config.js';
import { gsap } from '../lib/gsap.js';
import { director } from '../lib/director.js';
import { useTier } from '../lib/TierContext.jsx';
import { pose, windowed, shiftFor } from '../lib/film.js';
import { StickyScene, useFilmShot } from '../components/StickyScene.jsx';
import { MagneticButton } from '../components/MagneticButton.jsx';
import { Still } from '../components/Still.jsx';

/**
 * HERO — el estudio se enciende.
 * Tiempo: línea de luz → silueta → esfera → marca → nombre → claim → CTA.
 * Scroll: una sola timeline gira el reloj y revela caja, perfil, fondo y calibre.
 */
export function Hero() {
  const ref = useRef(null);
  const { film, hydrated } = useTier();

  useFilmShot('hero', ref, (ctx) => {
    const el = ctx.el;
    const L = ctx.layout;
    // encuadre inicial: mismo valor que las variables CSS del póster (--hero-fit-h, --hero-sy…)
    const S0 = shiftFor(
      L,
      { shiftX: 0.16, shiftY: 0.02 },
      { shiftX: 0, shiftY: 0.15 },
      { shiftX: 0, shiftY: 0.2, fitH: 118, fitW: 60 },
    );
    const S = (dx, dy) => shiftFor(L, { shiftX: dx, shiftY: 0 }, { shiftX: 0, shiftY: dy }, { shiftX: 0, shiftY: dy });
    ctx.key(0, { stage: 1, dust: 1 });
    pose(ctx, 0, 'front', { ...S0, dust: 1 });
    pose(ctx, 0.06, 'front', { ...S0, dust: 1 });
    pose(ctx, 0.27, 'caseDetail', { ...S(0.1, 0.12), envRot: 0.55, envTilt: 0.25, dust: 0.5 });
    pose(ctx, 0.5, 'profile', { ...S(0.07, 0.12), envRot: 1.15, envTilt: 0.1 });
    pose(ctx, 0.74, 'caseback', { ...S(0.05, 0.1), envRot: 1.8, envTilt: 0.45 });
    pose(ctx, 1, 'movement', { ...S(0.12, 0.1), dust: 0, stage: 1 });

    // la portada se retira con el primer gesto de scroll
    ctx.tl.fromTo(
      el.querySelector('.hero__copy'),
      { autoAlpha: 1, y: 0 },
      { autoAlpha: 0, y: -28, duration: ctx.dur(0.07), ease: 'power1.in', immediateRender: false },
      ctx.at(0.012),
    );
    ctx.tl.fromTo(
      el.querySelector('.hero__cue-wrap'),
      { autoAlpha: 1 },
      { autoAlpha: 0, duration: ctx.dur(0.03), immediateRender: false },
      ctx.at(0.005),
    );
    // leyendas de cada vista, en el instante exacto del giro
    const views = el.querySelectorAll('.hero__view');
    const centers = [0.27, 0.5, 0.74, 0.98];
    views.forEach((v, i) => {
      const c = centers[i];
      const last = i === views.length - 1;
      windowed(ctx, v, c - 0.09, c - 0.02, last ? null : c + 0.08, last ? null : c + 0.14);
    });
  });

  // La entrada del DOM es CSS (arranca con el primer pintado, ver sections.css). Aquí solo:
  // 1) la luz del 3D se sincroniza con el tiempo transcurrido desde la navegación;
  // 2) si el visitante ya se desplaza, la entrada se acelera (no le hace esperar).
  useEffect(() => {
    if (!hydrated || !film) return undefined;
    const I = MOTION.intro;
    const t = performance.now() / 1000;
    const caseEnd = I.silhouette + 2.0;
    const dialEnd = I.dial + 1.6;
    const clamp01 = (x) => Math.min(1, Math.max(0, x));
    director.intro.case = clamp01((t - I.silhouette) / 2.0);
    director.intro.dial = clamp01((t - I.dial) / 1.6);
    const tl = gsap.timeline();
    tl.to(director.intro, { case: 1, duration: Math.max(0.01, caseEnd - t), ease: MOTION.ease.inOut }, Math.max(0, I.silhouette - t));
    tl.to(director.intro, { dial: 1, duration: Math.max(0.01, dialEnd - t), ease: MOTION.ease.inOut }, Math.max(0, I.dial - t));

    const introAnimations = () =>
      document.getAnimations().filter((a) => typeof a.animationName === 'string' && a.animationName.startsWith('intro-'));
    const hurry = () => {
      if (window.scrollY <= 4) return;
      introAnimations().forEach((a) => {
        a.playbackRate = 6;
      });
      tl.timeScale(6);
      window.removeEventListener('scroll', hurry);
    };
    if (window.scrollY > 4) {
      introAnimations().forEach((a) => a.finish());
      tl.progress(1);
    } else window.addEventListener('scroll', hurry, { passive: true });
    return () => {
      window.removeEventListener('scroll', hurry);
      tl.kill();
      director.intro.case = 1;
      director.intro.dial = 1;
    };
  }, [hydrated, film]);

  return (
    <StickyScene id="origen" sceneRef={ref} length={MOTION.pin.hero} className="hero" labelledBy="hero-title">
      <div className="hero__light" data-intro="light" aria-hidden="true" />
      <figure className="hero__still scene__still" data-intro="poster">
        <Still
          name="watch-front"
          priority
          sizes="(max-width: 599px) 100vw, (max-width: 1400px) 70vw, 1000px"
          alt="Tempo Origen de frente: caja de titanio de 39 mm, esfera negra texturizada con índices aplicados, agujas dauphine y segundero champagne, correa de cuero negro."
        />
      </figure>

      <div className="hero__copy">
        <h1 id="hero-title" className="hero__title">
          <span className="hero__brand" data-intro="brand">
            {BRAND.name}
          </span>
          <span className="hero__name-mask">
            <span className="hero__name" data-intro="title">
              {BRAND.product}
            </span>
          </span>
        </h1>
        <p className="hero__claim lede" data-intro="claim">
          {BRAND.claim[0]} <span className="nowrap">{BRAND.claim[1]}</span>
        </p>
        <div className="hero__ctas" data-intro="cta">
          <MagneticButton href={HERO.ctaPrimary.href} variant="primary">
            {HERO.ctaPrimary.label}
          </MagneticButton>
          <MagneticButton href={HERO.ctaSecondary.href} variant="ghost">
            {HERO.ctaSecondary.label}
          </MagneticButton>
        </div>
      </div>

      <ol className="hero__views" aria-label="El reloj, vista a vista">
        {HERO.views.map((v) => (
          <li key={v.n} className="hero__view film-cap">
            <span className="label num">{v.n}</span>
            <span className="hero__view-title h3">{v.title}</span>
            <span className="body">{v.text}</span>
          </li>
        ))}
      </ol>

      <div className="hero__cue-wrap film-only" aria-hidden="true">
        <div className="hero__cue" data-intro="cue">
          <span className="label label--ivory">Desliza</span>
          <span className="hero__cue-line" />
        </div>
      </div>
    </StickyScene>
  );
}
