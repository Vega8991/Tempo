import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap.js';
import { MOTION } from '../motion.config.js';
import { useTier } from '../lib/TierContext.jsx';

/**
 * Revelado de titulares por líneas con máscara. El texto sigue siendo un encabezado real
 * (SplitText conserva el contenido accesible). Con movimiento reducido: fundido simple.
 */
export function TextReveal({ as: Tag = 'h2', children, className, start = 'top 80%', delay = 0, ...rest }) {
  const ref = useRef(null);
  const { tier, hydrated } = useTier();
  useGSAP(
    () => {
      if (!hydrated) return;
      if (tier === 'static') {
        gsap.fromTo(
          ref.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: MOTION.duration.ui, scrollTrigger: { trigger: ref.current, start, once: true } },
        );
        return;
      }
      SplitText.create(ref.current, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        aria: 'auto',
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: MOTION.duration.slow,
            ease: MOTION.ease.expo,
            stagger: MOTION.stagger.loose,
            delay,
            scrollTrigger: { trigger: ref.current, start, once: true },
          }),
      });
    },
    { scope: ref, dependencies: [tier, hydrated], revertOnUpdate: true },
  );
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
