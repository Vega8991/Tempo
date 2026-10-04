// Carga de las tipografías de marca. En la web las declara CSS (@font-face);
// el lienzo 3D necesita que estén listas antes de imprimir la esfera, el rotor y el fondo.
import cormorant300 from '../assets/fonts/cormorant-garamond-latin-300-normal.woff2?url';
import cormorant400 from '../assets/fonts/cormorant-garamond-latin-400-normal.woff2?url';
import cormorant300i from '../assets/fonts/cormorant-garamond-latin-300-italic.woff2?url';
import jost400 from '../assets/fonts/jost-latin-400-normal.woff2?url';
import jost500 from '../assets/fonts/jost-latin-500-normal.woff2?url';

const FACES = [
  ['Cormorant Garamond', cormorant300, '300'],
  ['Cormorant Garamond', cormorant400, '400'],
  ['Cormorant Garamond', cormorant300i, '300', 'italic'],
  ['Jost', jost400, '400'],
  ['Jost', jost500, '500'],
];

let pending = null;

export function loadBrandFonts() {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  if (pending) return pending;
  pending = Promise.all(
    FACES.map(async ([family, url, weight, style = 'normal']) => {
      const spec = `${style} ${weight} 32px "${family}"`;
      try {
        const loaded = await document.fonts.load(spec);
        if (loaded.length) return;
        const face = new FontFace(family, `url(${url}) format("woff2")`, { weight, style, display: 'swap' });
        document.fonts.add(await face.load());
      } catch {
        /* sin la fuente la esfera usa la de respaldo: no bloquea */
      }
    }),
  );
  return pending;
}
