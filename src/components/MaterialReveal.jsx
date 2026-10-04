/**
 * Leyendas de materiales. En la película aparecen una a una, sincronizadas con la cámara
 * (la coreografía vive en sections/Materials.jsx). Sin película: lista legible.
 */
export function MaterialReveal({ items }) {
  return (
    <ol className="materials__list" aria-label="Materiales">
      {items.map((m, i) => (
        <li key={m.key} className={`material material--${m.key} film-cap`}>
          <span className="label num">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="h3">{m.title}</h3>
          <p className="body">{m.text}</p>
        </li>
      ))}
    </ol>
  );
}
