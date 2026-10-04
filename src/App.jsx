import { useEffect } from 'react';
import { LazyMotion, domAnimation } from 'motion/react';
import { TierProvider, useTier } from './lib/TierContext.jsx';
import { director } from './lib/director.js';
import { MOTION } from './motion.config.js';
import { gsap, ScrollTrigger } from './lib/gsap.js';
import { Stage } from './components/Stage.jsx';
import { Nav } from './components/Nav.jsx';
import { PageTransition } from './components/PageTransition.jsx';
import { CursorInteraction } from './components/CursorInteraction.jsx';
import { Hero } from './sections/Hero.jsx';
import { Materials } from './sections/Materials.jsx';
import { Macro } from './sections/Macro.jsx';
import { Disassembly } from './sections/Disassembly.jsx';
import { Calibre } from './sections/Calibre.jsx';
import { Figures } from './sections/Figures.jsx';
import { Craft } from './sections/Craft.jsx';
import { Finished } from './sections/Finished.jsx';
import { Edition } from './sections/Edition.jsx';
import { Specs } from './sections/Specs.jsx';
import { Reserve } from './sections/Reserve.jsx';
import { Finale } from './sections/Finale.jsx';

function Shell() {
  const { tier, layout, film, hydrated } = useTier();

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.add('app-ready');
    document.documentElement.classList.remove('app-failed');
  }, [hydrated]);

  // la película arranca cuando todas las escenas han registrado su plano (efectos hijos → padre)
  useEffect(() => {
    if (!hydrated) return undefined;
    if (film) director.start({ tier, layout });
    else director.stop();
    return undefined;
  }, [hydrated, film, tier, layout]);

  // niveles sin película: las escenas fluyen como documento con revelados sencillos
  // (STATIC-LITE: recorte + desplazamiento corto · STATIC: solo fundido). El hero no espera: es el LCP.
  useEffect(() => {
    if (!hydrated || film) return undefined;
    const simple = tier === 'static';
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.scene:not(#origen) .scene__frame > :not(.film-only)').forEach((el) => {
        gsap.fromTo(
          el,
          simple ? { opacity: 0 } : { opacity: 0, y: MOTION.reveal.y, clipPath: `inset(${MOTION.reveal.clip}% 0% 0% 0%)` },
          {
            opacity: 1,
            y: 0,
            clipPath: simple ? undefined : 'inset(0% 0% 0% 0%)',
            duration: simple ? MOTION.duration.ui : MOTION.duration.slow,
            ease: MOTION.ease.out,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          },
        );
      });
    });
    return () => ctx.revert();
  }, [hydrated, film, tier]);

  useEffect(() => {
    if (!hydrated) return;
    if (new URLSearchParams(window.location.search).has('qa')) window.__tempo = { director, gsap, ScrollTrigger };
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    // al recargar a mitad de página el navegador restaura el scroll: el cabezal salta, no interpola
    if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
  }, [hydrated]);

  return (
    <>
      <a className="skip-link" href="#especificaciones">
        Saltar a la ficha técnica
      </a>
      <a className="skip-link" href="#reservar">
        Saltar a la reserva
      </a>
      <Stage />
      <Nav />
      <main id="contenido">
        <Hero />
        <Materials />
        <Macro />
        <Disassembly />
        <Calibre />
        <Figures />
        <Craft />
        <Finished />
        <Edition />
        <Specs />
        <Reserve />
        <Finale />
      </main>
      <div className="grain" aria-hidden="true" />
      <PageTransition />
      <CursorInteraction />
    </>
  );
}

export function App() {
  return (
    <TierProvider>
      <LazyMotion features={domAnimation} strict>
        <Shell />
      </LazyMotion>
    </TierProvider>
  );
}
