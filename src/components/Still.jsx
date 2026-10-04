import { STILLS, srcSet, src } from '../stills.js';

/**
 * Imagen fija con AVIF + WebP, srcset por ancho y dimensiones declaradas (sin CLS).
 * `portrait` usa una toma vertical propia por debajo de 600 px (dirección de arte, no recorte).
 */
export function Still({ name, alt, sizes = '100vw', priority = false, className = '', imgClassName = '', decorative = false }) {
  const m = STILLS[name];
  if (!m) return null;
  const p = m.portrait;
  return (
    <picture className={className}>
      {p && <source media="(max-width: 599px) and (orientation: portrait)" type="image/avif" srcSet={srcSet(`${name}-p`, 'avif', p.widths)} sizes={sizes} />}
      {p && <source media="(max-width: 599px) and (orientation: portrait)" type="image/webp" srcSet={srcSet(`${name}-p`, 'webp', p.widths)} sizes={sizes} />}
      <source type="image/avif" srcSet={srcSet(name, 'avif', m.widths)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, 'webp', m.widths)} sizes={sizes} />
      <img
        className={imgClassName}
        src={src(name, m.widths[m.widths.length - 1])}
        width={m.w}
        height={m.h}
        alt={decorative ? '' : alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  );
}
