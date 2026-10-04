import { useEffect } from 'react';
import { director } from '../lib/director.js';
import { useTier } from '../lib/TierContext.jsx';

/**
 * Escena fijada. En niveles con película (full/lite) la sección mide `length` alturas de viewport
 * y su marco queda fijo (position: sticky). En niveles estáticos y sin JS fluye como documento.
 */
export function StickyScene({
  id,
  length,
  className = '',
  frameClassName = '',
  labelledBy,
  immersive = true,
  sceneRef,
  children,
  ...rest
}) {
  return (
    <section
      id={id}
      ref={sceneRef}
      className={`scene ${className}`}
      style={{ '--len': length.desktop, '--len-m': length.mobile }}
      aria-labelledby={labelledBy}
      data-immersive={immersive ? '' : undefined}
      {...rest}
    >
      <div className={`scene__frame ${frameClassName}`}>{children}</div>
    </section>
  );
}

/**
 * Registra el plano de una escena en la timeline maestra.
 * build(ctx) recibe posiciones en píxeles de scroll y añade keyframes del rig y tweens de DOM.
 */
export function useFilmShot(id, ref, build, deps = []) {
  const { film, layout, tier, hydrated } = useTier();
  useEffect(() => {
    if (!hydrated || !film || !ref.current) return undefined;
    return director.register(id, ref.current, build);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, film, layout, tier, ...deps]);
}
