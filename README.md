# TEMPO — Origen

Landing cinematográfica para **TEMPO Origen**, un reloj mecánico automático de edición limitada (marca, producto, especificaciones y precio ficticios).

> *El tiempo no se mide. Se construye.*

La dirección de experiencia (concepto, narrativa, Motion Map, Motion Budget, motor de decisión y estrategias 3D, responsive, movimiento reducido y rendimiento) está en [`docs/DIRECCION.md`](docs/DIRECCION.md). Las comprobaciones finales y las métricas medidas están en [`docs/QA.md`](docs/QA.md), y lo que habría que aportar para el resultado máximo en [`docs/ASSETS.md`](docs/ASSETS.md).

## Puesta en marcha

```bash
npm install
npm run dev          # desarrollo en http://127.0.0.1:5173
npm run build        # build + prerenderizado del HTML completo (dist/)
npm run preview      # sirve dist/ en http://127.0.0.1:4173
```

Herramientas:

```bash
npm run stills       # renderiza las imágenes fijas desde el modelo 3D → public/stills (AVIF + WebP)
npm run qa           # comprobaciones automáticas sobre el build servido (overflow, teclado, no-JS…)
npm run vitals       # LCP / CLS / INP reales con PerformanceObserver (perfiles escritorio y móvil)
```

Parámetros de URL útiles: `?tier=full|lite|static-lite|static` fuerza un nivel de movimiento; `?qa` desactiva el suavizado del cabezal y la compensación de lag de GSAP (para capturas en navegadores sin GPU).

## Arquitectura

```
src/
  motion.config.js        tokens de movimiento (duraciones, curvas, muelles, longitudes de escena, cámara)
  content.js              todos los textos y especificaciones (HTML, SEO y JSON-LD leen de aquí)
  stills.js               manifiesto de imágenes fijas
  lib/
    director.js           timeline maestra en píxeles de scroll + cabezal amortiguado + bucle único
    film.js               utilidades de coreografía (planos, ventanas de leyendas, foco)
    tierDetect.js         nivel FULL / LITE / STATIC-LITE / STATIC, ejecutado en <head> antes de pintar
    TierContext.jsx       nivel + composición (móvil / tablet / escritorio) para React
  components/             ScrollReveal, TextReveal, StickyScene, Parallax, MagneticButton,
                          ScrollProgress, CursorInteraction, PageTransition, MacroScene,
                          MaterialReveal, ExplodedMovement, DataDisplay, Stage, Still, Nav
  sections/               Hero, Materials, Macro, Disassembly, Calibre, Figures, Craft,
                          Finished, Edition, Specs, Reserve, Finale
  three/
    Scene3D.jsx           lienzo R3F (frameloop "never": lo avanza el ticker de GSAP)
    stage.js              escena común (vivo + imágenes fijas): luz, cámara, polvo
    studio.js             estudio procedural (softboxes → PMREM), sin HDRI descargado
    rig.js / rigState.js  estado numérico que escribe GSAP y lee Three
    poses.js              planos con nombre (cámara, reloj, luz, despiece)
    MechanicalMovement.js calibre T-01: platina, puentes, tren, escape, volante, micro-rotor
    model/                caja, correa, esfera, agujas, materiales y texturas procedurales
  render/render.js        renderizador offline de imágenes fijas (acumulación + profundidad de campo)
scripts/                  prerender, stills, qa, vitals
```

### Reglas de motores

- **GSAP + ScrollTrigger**: scroll, scrub, timelines, coreografía de cámara, revelados y la transición de navegación.
- **Motion**: microinteracciones y estado (botón magnético, cursor, menú, formulario).
- **Three.js / R3F**: solo el sistema visual 3D. GSAP escribe números en `rig`; Three los lee.
- Ningún elemento recibe `transform` de dos motores (lo verifica `npm run qa`).

### Niveles

| Nivel | Se elige si… | Experiencia |
|---|---|---|
| FULL | puntero fino, ≥ 6 núcleos, ≥ 8 GB | 3D completo, DPR ≤ 2, sombras, polvo, cursor |
| LITE | táctil, equipo medio o < 900 px | 3D con DPR ≤ 1,5, geometría y texturas reducidas, sin sombras ni partículas |
| STATIC-LITE | `saveData`, ≤ 2 núcleos o ≤ 2 GB, sin WebGL, pérdida de contexto | imágenes fijas renderizadas + revelados |
| STATIC | `prefers-reduced-motion: reduce` | documento con imágenes fijas y fundidos cortos |

Sin JavaScript se sirve el HTML prerenderizado completo, equivalente a STATIC.
