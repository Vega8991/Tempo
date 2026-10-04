import { Still } from './Still.jsx';

/**
 * Placas macro a pantalla completa. Película: apiladas, se abren con clip-path y enfocan
 * (escala + desenfoque ≤ 6 px). Sin película: figuras editoriales en flujo, ya enfocadas.
 */
export function MacroScene({ plates }) {
  return (
    <div className="macro__plates">
      {plates.map((p, i) => (
        <figure key={p.key} className={`macro__plate macro__plate--${p.key}`} style={{ zIndex: i + 1 }}>
          <Still name={`macro-${p.key}`} alt={p.alt} sizes="100vw" imgClassName="macro__img" />
          <figcaption className="macro__caption">
            <span className="label num">{String(i + 1).padStart(2, '0')}</span>
            <span className="h3">{p.title}</span>
            <span className="body">{p.text}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
