import { createContext, useContext, useEffect, useState } from 'react';
import { LAYOUT } from '../motion.config.js';

// Nivel de movimiento + composición. En el servidor (prerender) todo es 'static' y 'desktop':
// el HTML resultante es la versión completa sin JavaScript.
const TierContext = createContext({ tier: 'static', layout: 'desktop', film: false, hydrated: false });

export const FILM_TIERS = new Set(['full', 'lite']);

function readLayout() {
  if (typeof window === 'undefined') return 'desktop';
  if (window.matchMedia(LAYOUT.mobileQuery).matches) return 'mobile';
  if (window.matchMedia(LAYOUT.tabletQuery).matches) return 'tablet';
  return 'desktop';
}

export function TierProvider({ children }) {
  const [state, setState] = useState({ tier: 'static', layout: 'desktop', film: false, hydrated: false });

  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const tier = root.dataset.tier || 'static';
      setState({ tier, layout: readLayout(), film: FILM_TIERS.has(tier), hydrated: true });
    };
    update();
    const mqs = [LAYOUT.mobileQuery, LAYOUT.tabletQuery, '(prefers-reduced-motion: reduce)'].map((q) => window.matchMedia(q));
    const onChange = (e) => {
      // movimiento reducido activado en caliente → nivel estático
      if (e.media.includes('reduced-motion') && e.matches) root.dataset.tier = 'static';
      update();
    };
    mqs.forEach((m) => m.addEventListener('change', onChange));
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ['data-tier'] });
    return () => {
      mqs.forEach((m) => m.removeEventListener('change', onChange));
      obs.disconnect();
    };
  }, []);

  return <TierContext.Provider value={state}>{children}</TierContext.Provider>;
}

export const useTier = () => useContext(TierContext);

/** Rebaja el nivel en tiempo de ejecución (p. ej. si WebGL falla). */
export function downgradeTier(to = 'static-lite') {
  document.documentElement.dataset.tier = to;
}
