import { renderToString } from 'react-dom/server';
import { App } from './App.jsx';
import { BRAND, SPECS } from './content.js';

export function render() {
  return renderToString(<App />);
}

/** Datos estructurados (schema.org/Product) generados desde el mismo contenido que la página. */
export function head(origin = 'https://tempo.example') {
  const props = SPECS.groups.flatMap((g) => g.rows).filter(([k]) => k !== 'Precio');
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${BRAND.name} ${BRAND.product}`,
    brand: { '@type': 'Brand', name: BRAND.name },
    description: BRAND.description,
    sku: 'TEMPO-ORIGEN-T01',
    material: 'Titanio grado 5',
    image: [`${origin}/stills/watch-front-1400.webp`],
    additionalProperty: props.map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
    offers: {
      '@type': 'Offer',
      price: String(BRAND.price),
      priceCurrency: BRAND.currency,
      availability: 'https://schema.org/PreOrder',
      url: `${origin}/#reservar`,
      inventoryLevel: { '@type': 'QuantitativeValue', value: BRAND.units },
    },
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}
