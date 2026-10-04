import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { MOTION } from '../motion.config.js';
import { useTier } from '../lib/TierContext.jsx';

const TAU = Math.PI * 2;

/** 72 H — indicador de reserva de marcha: arco de 300° con marcas cada 12 h. */
function ReserveGauge() {
  const r = 92;
  const a0 = -150;
  const a1 = 150;
  const pt = (deg, rr = r) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [100 + Math.cos(a) * rr, 100 + Math.sin(a) * rr];
  };
  const [sx, sy] = pt(a0);
  const [ex, ey] = pt(a1);
  const arc = `M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`;
  const ticks = [0, 12, 24, 36, 48, 60, 72].map((h) => {
    const d = a0 + (h / 72) * (a1 - a0);
    const [x1, y1] = pt(d, r - 5);
    const [x2, y2] = pt(d, r + 5);
    const [tx, ty] = pt(d, r - 15);
    return { h, x1, y1, x2, y2, tx, ty };
  });
  return (
    <svg className="instrument instrument--reserve" viewBox="0 0 200 200" aria-hidden="true">
      <path d={arc} className="ins-track" />
      <path d={arc} className="ins-arc" pathLength="1" />
      {ticks.map((t) => (
        <g key={t.h} className="ins-tick">
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          <text x={t.tx} y={t.ty}>
            {t.h}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** 21.600 — 120 radiales finísimas: una por cada 3 alternancias de un segundo de escala. */
function BeatRays() {
  const n = 120;
  const rays = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU;
    const long = i % 10 === 0;
    const r0 = long ? 80 : 84;
    const r1 = 94;
    return [100 + Math.cos(a) * r0, 100 + Math.sin(a) * r0, 100 + Math.cos(a) * r1, 100 + Math.sin(a) * r1, long];
  });
  return (
    <svg className="instrument instrument--rays" viewBox="0 0 200 200" aria-hidden="true">
      {rays.map(([x1, y1, x2, y2, long], i) => (
        <line key={i} className={`ins-ray${long ? ' is-long' : ''}`} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </svg>
  );
}

/** 250 — escala de 250 marcas con cuatro números de serie. */
function SerialScale() {
  const n = 250;
  const marked = { 1: '001', 42: '042', 127: '127', 250: '250' };
  return (
    <svg className="instrument instrument--serial" viewBox="0 0 500 44" preserveAspectRatio="none" aria-hidden="true">
      <g className="ins-serial">
        {Array.from({ length: n }, (_, i) => {
          const k = i + 1;
          const x = 2 + (i / (n - 1)) * 496;
          const m = marked[k];
          return <line key={k} x1={x} x2={x} y1={m ? 14 : k % 10 === 0 ? 26 : 31} y2={40} className={m ? 'is-marked' : ''} />;
        })}
      </g>
      {Object.entries(marked).map(([k, label]) => {
        const x = 2 + ((Number(k) - 1) / (n - 1)) * 496;
        return (
          <text key={k} x={x} y={9} className="ins-serial-label" textAnchor={k === '1' ? 'start' : k === '250' ? 'end' : 'middle'}>
            Nº {label}
          </text>
        );
      })}
    </svg>
  );
}

/** 39 MM — cota técnica: líneas de extensión, línea de cota con flechas y valor. */
function DimensionLine() {
  return (
    <svg className="instrument instrument--dimension" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
      <line className="ins-ext ins-ext--l" x1="1" y1="4" x2="1" y2="56" />
      <line className="ins-ext ins-ext--r" x1="399" y1="4" x2="399" y2="56" />
      <g className="ins-dim">
        <line x1="1" y1="30" x2="399" y2="30" />
        <path d="M1 30 l10 -4 v8 z M399 30 l-10 -4 v8 z" />
      </g>
      <text className="ins-dim-label" x="200" y="22" textAnchor="middle">
        Ø 39,0
      </text>
    </svg>
  );
}

const INSTRUMENTS = {
  reserve: ReserveGauge,
  beat: BeatRays,
  units: SerialScale,
  diameter: DimensionLine,
};

/**
 * Cifra de instrumento: número enorme + un gesto gráfico que explica qué mide.
 * Se activa una vez al entrar en el viewport. Con movimiento reducido: estado final directo.
 */
export function DataDisplay({ kind, value, unit, label }) {
  const ref = useRef(null);
  const { tier, hydrated } = useTier();
  const Instrument = INSTRUMENTS[kind];

  useGSAP(
    () => {
      if (!hydrated || tier === 'static') return;
      const root = ref.current;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 72%', once: true },
        defaults: { ease: MOTION.ease.out },
      });
      tl.fromTo(root.querySelector('.figure__value'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: MOTION.duration.slow });
      tl.fromTo(root.querySelector('.figure__label'), { autoAlpha: 0 }, { autoAlpha: 1, duration: MOTION.duration.base }, 0.3);
      if (kind === 'reserve') {
        tl.fromTo(root.querySelector('.ins-arc'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: MOTION.duration.cinematic * 1.2, ease: MOTION.ease.inOut }, 0.2);
        tl.fromTo(root.querySelectorAll('.ins-tick'), { autoAlpha: 0 }, { autoAlpha: 1, duration: MOTION.duration.ui, stagger: 0.12 }, 0.3);
      }
      if (kind === 'beat') {
        // seis latidos por segundo: las radiales aparecen al ritmo del volante (1/6 s por grupo de 10)
        tl.fromTo(root.querySelectorAll('.ins-ray'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, stagger: { each: 1 / 60 } }, 0.2);
      }
      if (kind === 'units') {
        tl.fromTo(root.querySelector('.ins-serial'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: MOTION.duration.cinematic, ease: MOTION.ease.inOut }, 0.2);
        tl.fromTo(root.querySelectorAll('.ins-serial-label'), { autoAlpha: 0 }, { autoAlpha: 1, duration: MOTION.duration.ui, stagger: 0.25 }, 0.8);
      }
      if (kind === 'diameter') {
        tl.fromTo(root.querySelectorAll('.ins-ext'), { scaleY: 0 }, { scaleY: 1, duration: MOTION.duration.base, transformOrigin: '50% 50%' }, 0.2);
        tl.fromTo(root.querySelector('.ins-dim'), { scaleX: 0 }, { scaleX: 1, duration: MOTION.duration.slow, ease: MOTION.ease.inOut, transformOrigin: '50% 50%' }, 0.45);
        tl.fromTo(root.querySelector('.ins-dim-label'), { autoAlpha: 0 }, { autoAlpha: 1, duration: MOTION.duration.ui }, 1.0);
      }
    },
    { scope: ref, dependencies: [tier, hydrated], revertOnUpdate: true },
  );

  return (
    <div ref={ref} className={`figure figure--${kind}`}>
      <div className="figure__stage">
        {Instrument && <Instrument />}
        <p className="figure__value num">
          <span className="figure__number">{value}</span>
          {unit && <span className="figure__unit">{unit}</span>}
        </p>
      </div>
      <p className="figure__label label label--ivory">{label}</p>
    </div>
  );
}
