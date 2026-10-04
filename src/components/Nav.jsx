import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { NAV, BRAND } from '../content.js';
import { MOTION } from '../motion.config.js';
import { useTier } from '../lib/TierContext.jsx';
import { ScrollProgress } from './ScrollProgress.jsx';

/**
 * Navegación mínima. Arranca discreta; durante las escenas inmersivas solo quedan el logotipo
 * y la línea de progreso. Con el foco dentro, los enlaces vuelven a mostrarse.
 */
export function Nav() {
  const { hydrated, film } = useTier();
  const [immersive, setImmersive] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef(null);
  const dialog = useRef(null);

  useEffect(() => {
    if (!hydrated || !film) {
      setImmersive(false);
      return undefined;
    }
    const sections = [...document.querySelectorAll('main > section')];
    const state = new Map();
    let atTop = window.scrollY < 40;
    const compute = () => {
      let imm = false;
      state.forEach((v, el) => {
        if (v && el.hasAttribute('data-immersive')) imm = true;
      });
      setImmersive(imm && !atTop);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => state.set(e.target, e.isIntersecting));
        compute();
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    const onScroll = () => {
      const t = window.scrollY < 40;
      if (t !== atTop) {
        atTop = t;
        compute();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [hydrated, film]);

  // menú móvil: Escape cierra, el foco vuelve al botón, foco atrapado dentro
  useEffect(() => {
    if (!open) return undefined;
    const el = dialog.current;
    const first = el?.querySelector('a, button');
    first?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      }
      if (e.key === 'Tab' && el) {
        const items = [...el.querySelectorAll('a, button')];
        const i = items.indexOf(document.activeElement);
        if (e.shiftKey && i === 0) {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (!e.shiftKey && i === items.length - 1) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    const onNav = () => setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('tempo:navigate', onNav);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('tempo:navigate', onNav);
    };
  }, [open]);

  return (
    <header className={`nav ${immersive ? 'is-immersive' : ''}`} data-intro="nav">
      <a className="nav__logo" href="#origen" aria-label={`${BRAND.name} — inicio`}>
        {BRAND.name}
      </a>
      <nav className="nav__links" aria-label="Principal">
        <ul>
          {NAV.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className={item.id === 'reservar' ? 'nav__cta' : undefined}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <button
        ref={menuBtn}
        type="button"
        className="nav__menu"
        aria-expanded={open}
        aria-controls="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Cerrar' : 'Menú'}
      </button>
      <ScrollProgress />
      <AnimatePresence>
        {open && (
          <m.div
            ref={dialog}
            id="menu"
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.duration.ui, ease: MOTION.ease.css.out }}
          >
            <ul>
              {NAV.map((item, i) => (
                <m.li
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * MOTION.stagger.base, duration: MOTION.duration.ui, ease: MOTION.ease.css.out }}
                >
                  <a href={`#${item.id}`}>{item.label}</a>
                </m.li>
              ))}
            </ul>
            <button type="button" className="menu__close" onClick={() => setOpen(false)}>
              Cerrar
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
