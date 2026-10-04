import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { MOTION } from '../motion.config.js';
import { useTier } from '../lib/TierContext.jsx';

/**
 * Capa con velocidad propia ligada al scroll. Solo transform. Desactivada con movimiento reducido
 * y en móvil (donde el contenedor pasa a carrusel nativo).
 */
export function Parallax({ as: Tag = 'div', axis = 'y', speed = MOTION.parallax.mid, className, children, disableBelow = 600, ...rest }) {
  const ref = useRef(null);
  const { tier, hydrated } = useTier();
  useGSAP(
    () => {
      if (!hydrated || tier === 'static' || tier === 'static-lite') return;
      const mm = gsap.matchMedia();
      mm.add(`(min-width: ${disableBelow}px)`, () => {
        const prop = axis === 'x' ? 'xPercent' : 'yPercent';
        gsap.fromTo(
          ref.current,
          { [prop]: speed * 100 },
          {
            [prop]: -speed * 100,
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [tier, hydrated], revertOnUpdate: true },
  );
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
