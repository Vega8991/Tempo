import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap.js';
import { MOTION } from '../motion.config.js';
import { director } from '../lib/director.js';
import { useTier } from '../lib/TierContext.jsx';

/**
 * Navegación interna como "corte a negro": el velo cubre la pantalla, el scroll salta al destino
 * sin atravesar veinte pantallas de animación, y el velo se retira. El foco pasa al encabezado
 * de la sección (accesibilidad). Con movimiento reducido: salto directo.
 */
export function PageTransition() {
  const veil = useRef(null);
  const { tier, hydrated } = useTier();

  useEffect(() => {
    if (!hydrated) return undefined;
    let busy = false;
    const onClick = async (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      if (busy) return;
      busy = true;
      const instant = tier === 'static';
      document.dispatchEvent(new CustomEvent('tempo:navigate', { detail: { id } }));
      if (!instant && veil.current) {
        await gsap.to(veil.current, { opacity: 1, duration: MOTION.duration.veil, ease: MOTION.ease.inOut });
      }
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'instant' });
      director.snap();
      history.pushState(null, '', `#${id}`);
      const open = a.dataset.open || null;
      if (!open) {
        const focusable = target.querySelector('h1, h2, [data-focus]') || target;
        if (!focusable.hasAttribute('tabindex')) focusable.setAttribute('tabindex', '-1');
        focusable.focus({ preventScroll: true });
      }
      // el destino ya está en pantalla: la sección puede reaccionar (p. ej. abrir el formulario)
      document.dispatchEvent(new CustomEvent('tempo:navigated', { detail: { id, open } }));
      if (!instant && veil.current) {
        await gsap.to(veil.current, { opacity: 0, duration: MOTION.duration.base, ease: MOTION.ease.out, delay: 0.08 });
      }
      busy = false;
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [tier, hydrated]);

  return <div ref={veil} className="veil" aria-hidden="true" />;
}
