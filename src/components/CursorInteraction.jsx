import { useEffect, useState } from 'react';
import { m, useMotionValue, useSpring } from 'motion/react';
import { MOTION } from '../motion.config.js';
import { useTier } from '../lib/TierContext.jsx';
import { useFinePointer } from '../lib/usePointer.js';

/**
 * Cursor discreto: un punto champagne que sigue al puntero con un muelle corto y se abre en anillo
 * sobre elementos interactivos. El cursor del sistema nunca se oculta. Solo nivel FULL con ratón.
 */
export function CursorInteraction() {
  const { tier } = useTier();
  const fine = useFinePointer();
  const enabled = tier === 'full' && fine;
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, MOTION.spring.cursor);
  const sy = useSpring(y, MOTION.spring.cursor);
  const [state, setState] = useState('idle');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = e.target.closest?.('a, button, [data-cursor]');
      const field = e.target.closest?.('input, textarea, select, label');
      setState(field ? 'hidden' : t ? 'link' : 'idle');
    };
    const leave = () => setVisible(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  // solo transform y opacidad: el anillo mide MOTION.cursor.ring y se escala hasta ser un punto
  const scale = state === 'link' ? 1 : MOTION.cursor.size / MOTION.cursor.ring;
  return (
    <m.div className="cursor" aria-hidden="true" style={{ x: sx, y: sy }}>
      <m.span
        className={`cursor__shape cursor__shape--${state}`}
        style={{ width: MOTION.cursor.ring, height: MOTION.cursor.ring }}
        animate={{ scale, opacity: visible && state !== 'hidden' ? 1 : 0 }}
        transition={MOTION.spring.ui}
      />
    </m.div>
  );
}
