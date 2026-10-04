import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { BRAND, RESERVE } from '../content.js';
import { MOTION } from '../motion.config.js';
import { pose, shiftFor } from '../lib/film.js';
import { useTier } from '../lib/TierContext.jsx';
import { useFilmShot } from '../components/StickyScene.jsx';
import { MagneticButton } from '../components/MagneticButton.jsx';
import { Still } from '../components/Still.jsx';

/** Formulario en línea (no popup). Concepto: no envía datos a ningún servidor. */
function ReserveForm({ mode, onClose }) {
  const id = useId();
  const [sent, setSent] = useState(false);
  const first = useRef(null);
  const copy = RESERVE.form[mode];
  useEffect(() => {
    first.current?.focus({ preventScroll: true });
  }, []);
  const onSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    setSent(true);
  };
  return (
    <m.div
      className="reserve__form-wrap"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      // el bloque entra y sale de la maquetación en el mismo frame del clic (sin desplazamientos tardíos: CLS)
      exit={{ opacity: 0, transition: { duration: 0 } }}
      transition={{ duration: MOTION.duration.ui, ease: MOTION.ease.css.out }}
    >
      {sent ? (
        <div className="reserve__done" role="status" aria-live="polite">
          <p className="h3">{RESERVE.form.done}</p>
          <p className="body">{RESERVE.form.doneNote}</p>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            <span className="btn__label">{RESERVE.form.close}</span>
          </button>
        </div>
      ) : (
        <form className="reserve__form" onSubmit={onSubmit} noValidate aria-labelledby={`${id}-t`}>
          <p id={`${id}-t`} className="label">
            {copy.title}
          </p>
          <label className="field">
            <span className="field__label">{RESERVE.form.name}</span>
            <input ref={first} name="name" type="text" autoComplete="name" required />
          </label>
          <label className="field">
            <span className="field__label">{RESERVE.form.email}</span>
            <input name="email" type="email" autoComplete="email" inputMode="email" required />
          </label>
          {mode === 'info' && (
            <label className="field">
              <span className="field__label">{RESERVE.form.message}</span>
              <textarea name="message" rows={3} />
            </label>
          )}
          <label className="check">
            <input type="checkbox" name="consent" required />
            <span>{RESERVE.form.consent}</span>
          </label>
          <div className="reserve__form-actions">
            <button type="submit" className="btn btn--primary">
              <span className="btn__label">{copy.submit}</span>
            </button>
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              <span className="btn__label">{RESERVE.form.close}</span>
            </button>
          </div>
        </form>
      )}
    </m.div>
  );
}

/**
 * PRECIO Y RESERVA — el precio aparece solo cuando el producto ya se conoce.
 * La conversión es una invitación: un botón, un enlace, un formulario en línea.
 */
export function Reserve() {
  const ref = useRef(null);
  const [mode, setMode] = useState(null);
  const ctas = useRef(null);
  const { hydrated } = useTier();

  useFilmShot('reserve', ref, (ctx) => {
    const L = ctx.layout;
    if (L === 'mobile') {
      // móvil: el reloj ocupa la parte alta y sube con el contenido
      ctx.key(ctx.top - ctx.vh * 0.5, { stage: 0 });
      pose(ctx, 0, 'reserve', { shiftX: 0, shiftY: 0.24, stage: 1, light: 1 });
      ctx.key(ctx.top + ctx.vh * 0.9, { shiftY: 0.95, stage: 1 });
    } else {
      ctx.key(ctx.top - ctx.vh * 0.45, { stage: 0 });
      const S = shiftFor(L, { shiftX: -0.22, shiftY: 0 }, { shiftX: 0, shiftY: 0.2 }, { shiftX: -0.2, shiftY: 0 });
      pose(ctx, 0, 'reserve', { ...S, stage: 1, light: 1 });
      ctx.key(ctx.top + ctx.height - ctx.vh, { ...S, stage: 1 });
    }
  });

  // "Reservar Origen" desde el final abre el formulario
  useEffect(() => {
    if (!hydrated) return undefined;
    const onNav = (e) => {
      if (e.detail?.id === 'reservar' && e.detail?.open) setMode('reserve');
    };
    document.addEventListener('tempo:navigated', onNav);
    return () => document.removeEventListener('tempo:navigated', onNav);
  }, [hydrated]);

  const close = () => {
    setMode(null);
    requestAnimationFrame(() => ctas.current?.querySelector('button')?.focus());
  };

  return (
    <section id="reservar" ref={ref} className="reserve section" aria-labelledby="reserve-title">
      <div className="reserve__visual" aria-hidden="true" />
      <div className="reserve__panel">
        <p className="label">{RESERVE.eyebrow}</p>
        <h2 id="reserve-title" className="reserve__title">
          <span className="sr-only">{BRAND.name} </span>
          {RESERVE.title}
        </h2>
        <p className="reserve__price num">
          <span className="sr-only">Precio: </span>
          {BRAND.priceLabel}
        </p>
        <p className="reserve__units">{RESERVE.units}</p>
        <div ref={ctas} className="reserve__ctas">
          <MagneticButton variant="primary" aria-expanded={mode === 'reserve'} onClick={() => setMode('reserve')}>
            {RESERVE.ctaPrimary}
          </MagneticButton>
          <MagneticButton variant="ghost" aria-expanded={mode === 'info'} onClick={() => setMode('info')}>
            {RESERVE.ctaSecondary}
          </MagneticButton>
        </div>
        <AnimatePresence mode="wait">{mode && <ReserveForm key={mode} mode={mode} onClose={close} />}</AnimatePresence>
        <p className="reserve__note body">{RESERVE.note}</p>
      </div>
      <figure className="scene__still reserve__still">
        <Still name="watch-reserve" sizes="(max-width: 599px) 100vw, 50vw" alt="Tempo Origen en tres cuartos sobre fondo negro." />
      </figure>
    </section>
  );
}
