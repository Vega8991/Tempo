import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { MOTION } from '../motion.config.js';
import { useTier } from '../lib/TierContext.jsx';

/**
 * Entrada al llegar al viewport, una sola vez. Con movimiento reducido: solo fundido.
 * El estado oculto se aplica desde JS: sin JavaScript el contenido es visible.
 */
export function ScrollReveal({
  as: Tag = 'div',
  children,
  selector,
  y = MOTION.reveal.y,
  clip = false,
  stagger = MOTION.stagger.base,
  start = MOTION.reveal.start,
  duration = MOTION.duration.slow,
  className,
  ...rest
}) {
  const ref = useRef(null);
  const { tier, hydrated } = useTier();
  useGSAP(
    () => {
      if (!hydrated) return;
      const targets = selector ? gsap.utils.toArray(selector, ref.current) : [ref.current];
      if (!targets.length) return;
      const simple = tier === 'static';
      const from = { autoAlpha: 0, y: simple ? 0 : y };
      const to = {
        autoAlpha: 1,
        y: 0,
        duration: simple ? MOTION.duration.ui : duration,
        ease: MOTION.ease.out,
        stagger,
        scrollTrigger: { trigger: ref.current, start, once: true },
      };
      if (clip && !simple) {
        from.clipPath = `inset(${MOTION.reveal.clip}% 0% 0% 0%)`;
        to.clipPath = 'inset(0% 0% 0% 0%)';
      }
      gsap.fromTo(targets, from, to);
    },
    { scope: ref, dependencies: [tier, hydrated], revertOnUpdate: true },
  );
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
