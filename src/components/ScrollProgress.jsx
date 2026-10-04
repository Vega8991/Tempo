import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap.js';
import { director } from '../lib/director.js';
import { useTier } from '../lib/TierContext.jsx';

/** Línea de progreso de 1 px. En niveles con película sigue al mismo cabezal que la cámara. */
export function ScrollProgress({ className = '' }) {
  const bar = useRef(null);
  const { film, hydrated } = useTier();
  useEffect(() => {
    if (!hydrated || !bar.current) return undefined;
    const set = gsap.quickSetter(bar.current, 'scaleX');
    let last = -1;
    const update = () => {
      const p = film
        ? director.progress
        : window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (Math.abs(p - last) > 0.0005) {
        set(p);
        last = p;
      }
    };
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [film, hydrated]);
  return (
    <div className={`progress ${className}`} aria-hidden="true">
      <span ref={bar} className="progress__bar" />
    </div>
  );
}
