// Prerenderizado: inserta el HTML completo de la página en dist/index.html.
// Resultado: la página se lee entera sin JavaScript y los buscadores ven todo el contenido.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const ssrEntry = path.join(root, 'dist-ssr', 'entry-server.js');
const { render, head } = await import(pathToFileURL(ssrEntry).href);

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const assets = fs.readdirSync(path.join(dist, 'assets'));
const font = (prefix) => assets.find((f) => f.startsWith(prefix) && f.endsWith('.woff2'));
const preloads = ['cormorant-garamond-latin-300-normal', 'jost-latin-500-normal']
  .map(font)
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`)
  .join('\n    ');

html = html.replace('<!--app-head-->', `${preloads}\n    ${head()}`).replace('<!--app-html-->', render());
fs.writeFileSync(path.join(dist, 'index.html'), html);
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`prerender: ${(html.length / 1024).toFixed(1)} KB de HTML`);
