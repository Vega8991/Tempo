import { useRef } from 'react';
import { m, useMotionValue, useSpring } from 'motion/react';
import { MOTION } from '../motion.config.js';
import { useTier } from '../lib/TierContext.jsx';
import { useFinePointer } from '../lib/usePointer.js';

/**
 * Botón magnético: se desplaza hacia el cursor con un muelle amortiguado (Motion).
 * Con puntero táctil: solo feedback de pulsación. Con movimiento reducido: sin desplazamiento.
 * La etiqueta interior se desplaza un poco más que el borde → profundidad mínima.
 */
export function MagneticButton({ href, children, variant = 'primary', className = '', strength = MOTION.magnetic.strength, ...rest }) {
  const { tier } = useTier();
  const fine = useFinePointer();
  const enabled = fine && (tier === 'full' || tier === 'lite');
  const rect = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, MOTION.spring.magnetic);
  const sy = useSpring(y, MOTION.spring.magnetic);
  const lx = useSpring(x, MOTION.spring.ui);
  const ly = useSpring(y, MOTION.spring.ui);

  const onEnter = (e) => {
    rect.current = e.currentTarget.getBoundingClientRect();
  };
  const onMove = (e) => {
    if (!enabled || !rect.current) return;
    const r = rect.current;
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Comp = href ? m.a : m.button;
  return (
    <Comp
      href={href}
      type={href ? undefined : 'button'}
      className={`btn btn--${variant} ${className}`}
      style={enabled ? { x: sx, y: sy } : undefined}
      whileHover={enabled ? { scale: MOTION.magnetic.scaleHover } : undefined}
      whileTap={tier === 'static' ? undefined : { scale: MOTION.magnetic.scaleTap }}
      transition={MOTION.spring.ui}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-cursor="link"
      {...rest}
    >
      <m.span className="btn__label" style={enabled ? { x: lx, y: ly } : undefined}>
        {children}
      </m.span>
    </Comp>
  );
}
