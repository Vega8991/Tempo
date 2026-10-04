import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap.js';
import { director } from '../lib/director.js';
import { useTier, downgradeTier } from '../lib/TierContext.jsx';
import { MOTION } from '../motion.config.js';

// Three.js, R3F y el modelo viven en un chunk aparte que se descarga después del primer pintado.
const Scene3D = lazy(() => import('../three/Scene3D.jsx'));

class WebGLBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Escenario 3D fijo. Su opacidad la decide la timeline (rig.stage): fuera de las escenas 3D
 * vale 0 y el render se detiene. El póster del hero cubre la espera.
 */
export function Stage() {
  const { tier, film, hydrated } = useTier();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const wrap = useRef(null);
  const fade = useRef({ v: 0 });

  useEffect(() => {
    if (!hydrated || !film) return undefined;
    let cancelled = false;
    const go = () => {
      const idle = window.requestIdleCallback || ((f) => window.setTimeout(f, 120));
      idle(() => !cancelled && setLoad(true), { timeout: 1200 });
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', go);
    };
  }, [hydrated, film]);

  useEffect(() => {
    if (!ready) return undefined;
    document.documentElement.classList.add('stage-ready');
    const t = gsap.to(fade.current, { v: 1, duration: MOTION.duration.slow, ease: MOTION.ease.inOut });
    return () => {
      t.kill();
      document.documentElement.classList.remove('stage-ready');
    };
  }, [ready]);

  useEffect(() => {
    if (!film) return undefined;
    let last = -1;
    return director.onFrame(() => {
      const el = wrap.current;
      if (!el) return;
      const o = Math.round(director.rig.stage * fade.current.v * 1000) / 1000;
      if (o === last) return;
      last = o;
      el.style.opacity = String(o);
      el.style.visibility = o < 0.003 ? 'hidden' : 'visible';
    });
  }, [film]);

  return (
    <>
      <div className="backdrop" aria-hidden="true" />
      {film && (
        <div ref={wrap} className="stage" aria-hidden="true">
          {load && (
            <WebGLBoundary onFail={() => downgradeTier('static-lite')}>
              <Suspense fallback={null}>
                <Scene3D tier={tier} onReady={() => setReady(true)} />
              </Suspense>
            </WebGLBoundary>
          )}
        </div>
      )}
    </>
  );
}
