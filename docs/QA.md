# QA — comprobaciones y métricas medidas

Todo lo que aparece aquí se ha medido sobre el build de producción (`npm run build && npm run preview`) con los scripts del repositorio:

- `npm run qa` → `scripts/qa.mjs` (informe en `qa-output/report.json`)
- `npm run vitals` → `scripts/measure-vitals.mjs` (informe en `qa-output/vitals.json`)

**Entorno de medición**: contenedor Linux sin GPU, 4 núcleos, Chromium 141 de Playwright en modo headless. WebGL se ejecuta por software (SwiftShader): cada frame 3D se calcula en la CPU (≈ 2 fps a 1440 × 900 en FULL). Las cifras que dependen del lienzo 3D son, por tanto, mucho peores que en cualquier dispositivo con GPU; se indican por separado y no se presentan como representativas.

## 1. Lista de comprobación final

| Comprobación | Resultado | Cómo se verifica |
|---|---|---|
| Sin desbordamiento horizontal | **OK** en 375, 390, 768, 1280, 1440 y 1920 px, niveles LITE y STATIC | recorrido completo de la página midiendo `scrollWidth` y cada elemento que sobresale |
| Movimiento reducido | **OK**: nivel STATIC, sin WebGL, sin escenas fijadas, sin grano animado, todo el texto visible | `reducedMotion: 'reduce'` + recorrido |
| Cambio en caliente a movimiento reducido | **OK**: se desmonta la película y el lienzo, ScrollTrigger 13 → 6 (solo revelados simples) | `emulateMedia` con la página abierta |
| Móvil con composición propia | **OK**: reloj arriba / texto abajo, encuadres por ancho, escenas un 20–25 % más cortas, carrusel nativo en edición, sin cursor | capturas 390 × 844 |
| 3D con respaldo | **OK**: póster renderizado durante la carga; si el chunk 3D falla o se pierde el contexto → STATIC-LITE con imágenes fijas | chunk bloqueado / retrasado en Playwright |
| Recursos pesados en diferido | **OK**: Three.js + R3F + modelo en chunk aparte cargado tras `load` + `requestIdleCallback`; imágenes `loading="lazy"` salvo el póster | inspección de red y del build |
| ScrollTrigger se limpia | **OK**: `useGSAP` con `scope`/`revertOnUpdate`; el director revierte su timeline al reconstruirse y al parar | cambio de nivel en caliente |
| WebGL se pausa fuera de las escenas 3D | **OK**: 0 frames en Cifras y Artesanía; render detenido si `rig.stage` = 0 o la pestaña está oculta | contador `renderer.info.render.frame` |
| Ningún transform con dos motores | **OK**: ningún elemento animado por Motion recibe tweens de GSAP | `gsap.getTweensOf` sobre botones, cursor, menú y formulario |
| Contenido importante en HTML | **OK**: un `h1`, 11 `h2`, ficha técnica completa (15 filas), precio, JSON-LD `Product` | página con JavaScript desactivado |
| Teclado | **OK**: enlaces de salto → logotipo → navegación → CTA; la navegación interna mueve el foco al encabezado de la sección | recorrido con `Tab` |
| Foco visible | **OK** en cada parada (contorno champagne de 1 px con separación) | estilo calculado en cada parada |
| Alt descriptivos | **OK**: 0 imágenes sin `alt` | página sin JS |
| Canvas | **OK**: `aria-hidden="true"`; los textos superpuestos usan opacidad (no `visibility`) para seguir siendo legibles por lectores de pantalla | inspección |
| Contraste ≥ 4,5:1 | **OK** en texto: marfil 16:1, marfil 72 % ≈ 7:1, champagne ≈ 9,9:1; pasos inactivos del despiece al 55 % ≈ 5,2:1 | cálculo de luminancia relativa |
| Animaciones sin propósito | Ninguna detectada: cada una figura en el motor de decisión de `docs/DIRECCION.md` | revisión |

Resultado del último `npm run qa`: **36/36 comprobaciones superadas**.

## 2. Web Vitals medidas

Mediana de 3 ejecuciones por perfil. LCP y CLS se leen antes de cualquier interacción; INP se separa en interacciones con el escenario 3D detenido y con el reloj 3D en pantalla (la zona se asigna por la marca de tiempo del evento).

| Perfil | LCP | CLS | INP sin WebGL activo | INP con el reloj 3D en pantalla* |
|---|---|---|---|---|
| Escritorio 1440 × 900 · movimiento reducido (STATIC) | **328 ms** (póster) | **0,023** | **16 ms** | 24 ms (sin 3D) |
| Escritorio 1440 × 900 · nivel automático (LITE en este equipo de 4 núcleos) | **316 ms** | **0** | **16 ms** | 1992 ms* |
| Escritorio 1440 × 900 · FULL | **308 ms** | **0** | **48 ms** | 2744 ms* |
| Móvil 390 × 844 · CPU × 4 · red 150 ms / 1,6 Mbps | **912 ms** | **0** | **160 ms** | 1672 ms* |

\* Con WebGL por software cada frame tarda 300–600 ms; el INP mide la espera hasta el siguiente frame pintado, así que en este entorno queda dominado por el render en CPU. No es representativo de un dispositivo con GPU y no se debe citar como métrica del producto. Para obtener la cifra real hay que repetir `npm run vitals` en un equipo con GPU (o en un móvil real con depuración remota).

Notas honestas sobre LCP:
- El elemento LCP en los niveles 3D es el nombre "Origen" del `h1`. Chrome lo registra en su primer pintado (≈ 300 ms) aunque la entrada cinematográfica lo descubre, por diseño, entre 2,0 y 3,8 s. La experiencia visual completa del hero (línea de luz → silueta → esfera → marca → nombre → claim → CTA) dura ≈ 3,9 s y es una decisión de dirección del brief, no un retraso técnico.
- La entrada es CSS: empieza con el primer pintado y no depende de que JavaScript cargue. En móvil con red lenta, el póster y el título aparecen sin esperar a los 162 KB de JavaScript.
- CLS 0,023 en STATIC: un desplazamiento del panel de reserva al recorrer la página, por debajo del umbral de 0,1. El formulario de reserva entra y sale de la maquetación en el mismo frame del clic para que su expansión cuente como respuesta a la interacción.

## 3. Peso

| Recurso | Tamaño | Cuándo |
|---|---|---|
| HTML prerenderizado | 16,6 KB gzip (80 KB) | inicial |
| CSS | 7,4 KB gzip | inicial |
| JavaScript principal (React, GSAP + ScrollTrigger + SplitText, Motion, escenas) | 162 KB gzip | inicial (módulo diferido) |
| Fuentes WOFF2 (6 archivos, latín) | 94 KB en total; 32 KB precargados | inicial / bajo demanda |
| Póster del hero (AVIF) | 14,6 KB (700 px) / 33,7 KB (1400 px) | inicial, `fetchpriority="high"` |
| Chunk 3D (Three.js, R3F, modelo, texturas procedurales) | 254 KB gzip | tras `load`, solo FULL/LITE |
| Placas macro (AVIF) | 36 KB (1920 px) · 48 KB (2400 px) | diferido |
| Placas de artesanía (AVIF) | 134 KB (6 × 1000 px) | diferido |
| Imágenes fijas de los niveles sin WebGL | 282 KB (700 px) · 666 KB (1400 px) | solo STATIC / STATIC-LITE, diferido |
| Modelo 3D / HDRI / texturas descargadas | **0 KB** (todo procedural) | — |

Total aproximado de la experiencia FULL completa (de principio a fin): ≈ 700 KB transferidos.

Coste WebGL del último frame en FULL: 113 llamadas de dibujo, ≈ 125 000 triángulos, 74 geometrías, 18 texturas, 15 programas. DPR ≤ 2 (FULL) / ≤ 1,5 (LITE) con bajada adaptativa si el frame supera 33 ms.

## 4. Revisión como director creativo

| Pregunta | Respuesta |
|---|---|
| ¿El reloj es siempre el protagonista? | Sí en las siete escenas 3D. Cifras, Artesanía y Edición son silencios deliberados sin reloj completo (en Artesanía, los acabados del propio reloj). |
| ¿Las animaciones tienen propósito? | Cada una mueve la cámara, la luz o una pieza para explicar algo; se descartaron parallax en artesanía, contadores numéricos, marquesinas e inclinación por cursor. |
| ¿Algún efecto de plantilla? | Los candidatos (aparición por líneas, botón magnético, cursor-punto) se mantienen sobrios: un recorrido corto, sin rebote. El cursor solo existe en FULL con ratón. |
| ¿Transmite lujo? | Paleta casi negra, marfil y un único acento champagne; tipografía editorial; mucho espacio negativo; ningún banner ni badge. |
| ¿La mecánica se entiende? | Sí: despiece en el orden del brief con índice sincronizado y cuatro capítulos que encienden la pieza de la que hablan. El volante se detiene cuando el calibre se abre y arranca cuando se recompone. |
| ¿Momentos de silencio? | Macro (fotografía fija), Cifras, Artesanía y Edición. La alternancia 3D / 2D marca el ritmo. |
| ¿Una sola película? | La cámara no corta entre hero, materiales, despiece y calibre; las salidas del escenario son fundidos ligados al scroll; la navegación usa un corte a negro. |
| ¿El producto parece tangible? | Escala 1:1, materiales PBR con anisotropía, chaflanes reales, sombras de agujas sobre la esfera. Es un modelo paramétrico: le falta la micro-imperfección de un escaneado o un GLB modelado a mano. |
| ¿La luz parece fotografía? | En las tomas guiadas sí (tiras que dibujan el bisel, contraluz, reflejo cálido). Un HDRI fotografiado subiría el realismo. |
| ¿Detalle metálico suficiente? | Correcto a distancia de producto; en macro extremo se nota la textura procedural. Ver `docs/ASSETS.md`. |
| ¿Tipografía de alta relojería? | Cormorant Garamond con tracking amplio + Jost en versalitas; cifras en serif enorme. |
| ¿La compra aparece pronto? | No: el precio aparece por primera vez en la penúltima sección, después de la ficha técnica. |
| ¿El final tiene impacto? | Se retiran datos, textos y decoración por capas; quedan marca, reloj con la luz al 55 %, claim e invitación, y el plano se sostiene. |

## 5. Limitaciones conocidas

- Sin GPU en el entorno de pruebas: el INP con el 3D en pantalla y la fluidez real del 3D deben validarse en dispositivos reales.
- El modelo y las fotografías son renders del modelo paramétrico; las placas de artesanía muestran los acabados, no las manos que los hacen.
- El formulario de reserva no envía datos (concepto).
