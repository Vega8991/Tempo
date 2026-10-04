/**
 * Índice técnico del despiece: una pieza por paso, en el mismo orden en que se separa en 3D.
 * La pieza activa se ilumina; las anteriores quedan a media luz (lectura acumulada).
 */
export function ExplodedMovement({ steps, outro }) {
  return (
    <div className="dis__index">
      <ol className="dis__steps" aria-label="Orden del despiece">
        {steps.map((s, i) => (
          <li key={s.key} className={`dis__step dis__step--${s.key}`}>
            <span className="dis__n label num">{String(i + 1).padStart(2, '0')}</span>
            <span className="dis__name">{s.title}</span>
            <span className="dis__text">{s.text}</span>
          </li>
        ))}
      </ol>
      <p className="dis__outro label film-cap">{outro}</p>
    </div>
  );
}
