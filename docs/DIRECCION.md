# TEMPO ORIGEN — Dirección de experiencia

Documento previo al código. Todo lo que se implementa en `src/` se deriva de aquí.

---

## 1. Concepto visual

**El tiempo como objeto.** La web es un único plano-secuencia rodado en un estudio negro con una sola pieza sobre la mesa. No hay "página de producto": hay una cámara que se acerca a un reloj, lo abre, entra en él y vuelve a salir. Cuando la cámara sale, el visitante ya sabe lo que hay detrás de cada segundo.

Idea propia de Tempo: **la luz es el narrador**. Cada escena empieza con el estudio apagado y una luz concreta "enciende" lo que se va a explicar: una franja de luz dibuja el bisel, un reflejo recorre el zafiro, una luz cálida aparece cuando entra el oro del micro-rotor. El movimiento nunca decora: o mueve la cámara, o mueve la luz, o mueve una pieza del calibre.

- Paleta: obsidiana `#060607`, grafito `#16171A`/`#2A2B2F`, marfil `#ECE6DA`, titanio `#9C9D9A`, champagne `#C9B48C` (solo acento: segundero, líneas de progreso, foco).
- Tipografía: **Cormorant Garamond** (titulares, cifras; serif editorial de alto contraste) + **Jost** (labels con tracking amplio y texto; geometría de esfera de reloj, no de startup). Licencia OFL, servidas desde el propio dominio en WOFF2.
- Composición: espacio negativo extremo, una sola columna de texto por escena, hairlines de 1 px como en un plano técnico, cifras en serif enorme.
- Prohibido: tarjetas, grids de tienda, glassmorphism, degradados de color, badges, popups.

## 2. Narrativa

| # | Escena | Lo que el visitante entiende |
|---|--------|------------------------------|
| 1 | Hero — el estudio se enciende | Esto es un objeto, no un anuncio |
| 2 | Giro de producto | La caja tiene volumen, corona, fondo… y algo dentro |
| 3 | Materiales | Cada superficie es una decisión |
| 4 | Macro | A esta distancia nada se esconde |
| 5 | Desmontaje | El reloj es un sistema de piezas |
| 6 | Calibre T-01 (4 capítulos) | Energía → transmisión → regulación → precisión |
| 7 | Cifras | Es un instrumento, y sus números lo demuestran |
| 8 | Artesanía | Detrás de la máquina hay manos (pausa, silencio) |
| 9 | La pieza terminada | La misma imagen del inicio, ahora con significado |
| 10 | Edición limitada | Hay 250 y no habrá más |
| 11 | Ficha técnica + precio | Ahora sí: 8.900 € |
| 12 | Final | Fundido a negro: marca, reloj, claim, invitación |

Frase de cierre que debe quedar en la cabeza: *"No estoy comprando un reloj. Estoy comprando una pieza mecánica construida a mano."*

## 3. Estructura de secciones

```
<header>  TEMPO · Origen · El movimiento · Artesanía · Especificaciones · Reservar   (+ línea de progreso)
<main>
  #origen           Hero + giro de producto         sticky 400vh (móvil 300vh)   3D
  #materiales       Materiales                      sticky 350vh (móvil 280vh)   3D
  #detalle          Macro                           sticky 300vh (móvil 240vh)   fotografía (renders macro)
  #movimiento       Desmontaje                      sticky 400vh (móvil 320vh)   3D
  #calibre          Calibre T-01 · 4 capítulos      sticky 400vh (móvil 320vh)   3D
  #precision        Cifras                          flujo normal                 SVG
  #artesania        Artesanía                       flujo normal                 fotografía editorial
  #pieza            La pieza terminada              sticky 300vh (móvil 240vh)   3D
  #edicion          Edición limitada                flujo normal                 SVG
  #especificaciones Ficha técnica                   flujo normal                 HTML
  #reservar         Precio y reserva                flujo normal                 3D (reloj a un lado)
  #final            Final cinematográfico           sticky 260vh (móvil 200vh)   3D
</main>
```

Un único `h1` ("TEMPO Origen"). Cada escena es un `<section>` con `h2` real. Todo dato del canvas existe también en HTML.

## 4. Motion Map

```
HERO        → estudio a oscuras · línea de luz (scaleX) · silueta (luz de recorte) · esfera (relleno)
              → logotipo → claim → CTA (secuencia temporal, nunca simultánea)
            → scroll: rotación de producto ligada a una única timeline
              0 % frontal · 25 % caja/corona · 50 % perfil · 75 % fondo de zafiro · 100 % calibre
PRODUCTO    → cambio de ángulo + distancia de cámara (objetivo largo, 24°) + leyendas HTML sincronizadas
MATERIALES  → la cámara se acerca de forma monótona: cuero → titanio → cepillado/pulido → zafiro → esfera
            → el entorno de luz gira para que un reflejo recorra cada superficie en su momento
MACRO       → corte a "objetivo macro": plano con clip-path que se abre, escala 1.12→1, blur 6px→0 (foco)
DESMONTAJE  → escena fija · despiece técnico sobre el eje del reloj, una pieza cada vez:
              esfera → agujas → platina → engranajes → micro-rotor → volante → escape
            → el volante deja de oscilar cuando el calibre se abre (sin energía)
CALIBRE     → el calibre se vuelve a montar y "despierta" (el volante arranca a 3 Hz reales)
            → visita guiada: Energía (micro-rotor) · Transmisión (tren) · Regulación (volante) · Precisión (escape)
            → foco por capítulo: la pieza activa conserva la luz, el resto baja al 30 %
DATOS       → tipografía enorme + instrumento SVG por cifra (arco de reserva, 120 radiales, 250 marcas, cota técnica)
ARTESANÍA   → el movimiento se reduce: solo aperturas de clip-path una vez, sin scrub, sin parallax
TERMINADO   → la luz vuelve despacio · giro completo frontal → perfil → fondo → frontal
EDICIÓN     → cuatro fondos numerados (Nº 001 · 042 · 127 · 250) con deriva horizontal mínima
CTA         → botón magnético · formulario en línea (estado con Motion, sin popup)
FINAL       → se retiran datos → textos secundarios → decoración · queda marca + reloj + claim + CTA
            → la luz baja al 55 % y el plano se mantiene estable

Transiciones entre escenas
  hero → materiales      el reloj termina de girar (continuidad de rotación, sin corte)
  materiales → macro     la cámara llega a la esfera; corte a macro con enfoque
  macro → desmontaje     fundido de plano macro a negro; el reloj reaparece completo
  desmontaje → calibre   el despiece se recompone sin caja ni esfera
  calibre → datos        macro del escape → fundido a negro → "72 H"
  artesanía → terminado  la luz del estudio se enciende otra vez (eco del hero)
  final                  fundido progresivo por capas
Navegación entre secciones: "corte a negro" (velo 0.35 s) en lugar de desplazamiento suave a través de 20 pantallas.
```

**Móvil (composición propia, no reducida):** reloj arriba, texto abajo; cámara con encuadres más abiertos (el reloj se encuadra por ancho); escenas fijadas un 20–25 % más cortas; sin cursor, sin partículas, sin rotación de entorno ambiental; despiece con menos recorrido; edición limitada como carrusel nativo con `scroll-snap`.

**Movimiento reducido:** sin escenas fijadas, sin cámara, sin rotaciones ni zoom. Cada escena muestra su imagen clave fija (render del mismo modelo) y el texto aparece con un fundido corto. La historia se lee completa de arriba abajo.

## 5. Motion Budget

| Categoría | Presupuesto | Asignación |
|-----------|-------------|------------|
| Gran interacción | 1 | Hero + reloj 3D: una timeline de cámara para toda la página |
| Gran sistema | 1 | Mecanismo: desmontaje + calibre por capítulos |
| Sistemas secundarios | 2–4 | Revelado de materiales · macro con enfoque · instrumentos de datos · transiciones (fundidos de escena + corte de navegación) |
| Microinteracciones | — | Botón magnético, cursor-punto, hover 0.98–1.02, feedback táctil |
| Ambiental | mínimo | Grano (estático en móvil), reflejos lentos (rotación de entorno 28 s), respiración de luz (14 s), polvo en suspensión (solo FULL) |

Descartado a propósito (no supera el motor de decisión): parallax en artesanía, texto que sigue al cursor, contadores numéricos, marquesinas, inclinación 3D por cursor sobre el reloj (competiría con la timeline de cámara: dos motores sobre el mismo transform).

## 6. Motor de decisión (resumen por animación)

| Animación | Comunica | Destaca | Input | Tecnología mínima | Coste | Móvil | Reduced motion | Enlace |
|---|---|---|---|---|---|---|---|---|
| Intro de luz | El estudio se enciende | Silueta del reloj | carga | GSAP (tiempo) + intensidad de entorno | bajo | igual, más corta | aparece directo | da paso al giro |
| Giro de producto | Volumen, corona, fondo | Caja | scroll | GSAP timeline → estado leído por R3F | medio (WebGL) | encuadre por ancho | imagen fija | termina en el calibre |
| Leyendas de vistas | Qué estás viendo | Texto HTML | scroll (misma timeline) | GSAP autoAlpha | nulo | abajo | lista estática | — |
| Acercamiento materiales | Cada superficie importa | Una superficie cada vez | scroll | cámara + rotación de entorno | medio | recorrido más corto | 1 imagen | llega a la esfera |
| Enfoque macro | Ajuste de foco | Detalle | scroll | clip-path + scale + blur en `<img>` | bajo (blur ≤ 6 px, 1 capa) | igual, plano vertical | imagen enfocada | fundido a negro |
| Despiece | Cómo está construido | Pieza en curso | scroll | posiciones en eje Z | medio | menos separación | render del despiece | se recompone |
| Capítulos del calibre | Cómo funciona | Pieza del capítulo | scroll | foco por material | medio | encuadres más abiertos | 4 imágenes + texto | macro → negro |
| Volante a 3 Hz | Está vivo | Volante | tiempo real | rotación senoidal | bajo | igual | sin animación | — |
| Micro-rotor ambiental | Energía latente | Rotor | tiempo | rotación lenta | bajo | igual | quieto | — |
| Instrumentos de datos | Precisión | Cifra | entrada en viewport | SVG + GSAP (una vez) | bajo | apilados | estado final | — |
| Aperturas artesanía | Calma | Fotografía | entrada | clip-path una vez | bajo | igual | fundido | — |
| Deriva de edición | Serie numerada | Números | scroll | translateX (Parallax) | bajo | carrusel nativo | sin deriva | — |
| Botón magnético | Invitación | CTA | puntero fino | Motion spring | bajo | `whileTap` 0.98 | sin desplazamiento | — |
| Fundido final | Último plano | Marca + reloj | scroll | GSAP autoAlpha por capas | bajo | igual | estado final | fin |

## 7. Arquitectura técnica

- **React 19 + Vite**, prerenderizado a HTML estático en build (SSR `renderToString` → `dist/index.html`): la página se lee completa sin JavaScript y los buscadores ven todo el contenido.
- **GSAP + ScrollTrigger** gobiernan scroll, scrub, timelines y coreografía de cámara.
  - `src/lib/director.js`: **una única timeline maestra** cuya unidad de tiempo es el píxel de scroll. Cada escena registra sus keyframes (cámara, reloj, luz, despiece) y sus leyendas HTML; el director construye una timeline por propiedad y la reproduce con un cabezal amortiguado en el ticker de GSAP.
  - El mismo ticker avanza el render de React Three Fiber (`frameloop="never"` + `advance`): **un único bucle** para DOM y WebGL, sin desfase de un frame.
- **Motion** solo para estado y gestos: botón magnético, cursor, corte de navegación, formulario de reserva.
- **Three.js / R3F** solo para el sistema visual 3D. GSAP escribe valores numéricos en un objeto `rig`; Three los lee. Ningún transform recibe valores de dos motores.
- **Sin Lenis**: el cabezal amortiguado del director ya suaviza cámara y leyendas; el scroll sigue siendo nativo (teclado, lectores de pantalla, iOS intactos).
- Tokens de movimiento centralizados en `src/motion.config.js`.
- Componentes: `ScrollReveal`, `TextReveal`, `StickyScene`, `Parallax`, `Scene3D`, `MechanicalMovement`, `MacroScene`, `MaterialReveal`, `ExplodedMovement`, `DataDisplay`, `MagneticButton`, `ScrollProgress`, `CursorInteraction`, `PageTransition`.

## 8. Estrategia 3D

No existe un GLB del Tempo Origen. En lugar de inventar una forma incoherente, el reloj se **construye de forma paramétrica y a escala real (1 unidad = 1 mm)** a partir de las especificaciones: caja de 39 mm por revolución de perfiles, asas extruidas con chaflán pulido, corona estriada, cristal y fondo de zafiro, esfera con grano, índices facetados, agujas dauphine de dos facetas, correa por barrido de sección con interior coñac. El calibre T-01 se construye con piezas reales: platina con perlage, puentes con Côtes de Genève (mapa de normales) y anglage (bisel pulido real de la extrusión), tren de engranajes dentado, escape de 15 dientes, áncora, volante con espiral, micro-rotor en oro, rubíes y tornillos azulados.

- Iluminación: **estudio procedural** (softboxes y tiras emisivas renderizadas a PMREM) → reflejos tipo fotografía sin descargar un HDRI. Luz principal con sombras suaves solo para agujas e índices sobre la esfera.
- Cámara: 24° (teleobjetivo de producto), encuadre definido por "superficie que debe verse" en mm → el mismo keyframe funciona en 16:9 y en vertical.
- Mecánica real: volante a 21.600 a/h (3 Hz), escape que avanza 12° por alternancia, segundero que salta 6 veces por segundo, minutero e horario en tiempo real desde las 10:09.
- Sustitución por un modelo real: el único punto de entrada es `src/three/stage.js` (`buildWatch`); la convención de nodos que debe respetar un GLB para que la coreografía no cambie está en `docs/ASSETS.md`.
- Renders fijos: el mismo modelo se renderiza fuera de línea (Playwright + acumulación de 16–32 muestras con profundidad de campo) para póster del hero, niveles sin WebGL y planos macro/artesanía.

## 9. Estrategia responsive

| | Escritorio (≥ 900 px) | Tablet (600–899) | Móvil (< 600) |
|---|---|---|---|
| Reloj | lado derecho del hero, cámara completa | centrado | arriba, encuadre por ancho |
| Texto | columna izquierda | inferior | inferior, bloque compacto |
| Escenas fijadas | longitud completa | ×0.85 | ×0.75 |
| Cursor | punto + magnético | no | no |
| WebGL | DPR ≤ 2, sombras, partículas | DPR ≤ 1.5 | DPR ≤ 1.5, sin sombras ni partículas |
| Edición limitada | fila con deriva | fila | carrusel `scroll-snap` |

Anchos verificados: 375, 390, 768, 1280, 1440, 1920. Sin desbordamiento horizontal (`overflow-x: clip` en `body` como red de seguridad, pero cada sección se mide en QA).

## 10. Reduced motion y rendimiento

**Niveles automáticos** (`src/lib/tier.js`, calculados en `<head>` antes de pintar para evitar CLS):

| Nivel | Criterio | Experiencia |
|---|---|---|
| FULL | puntero fino, ≥ 6 núcleos y ≥ 8 GB | todo |
| LITE | táctil o equipo medio | 3D con DPR 1.5, sin sombras ni partículas, geometría reducida |
| STATIC-LITE | `saveData`, ≤ 2 núcleos, ≤ 2 GB o sin WebGL | sin 3D: renders fijos con fundidos ligados al scroll en escenas cortas |
| STATIC | `prefers-reduced-motion: reduce` | sin escenas fijadas: imágenes clave + fundidos |

`?tier=full|lite|static-lite|static` fuerza un nivel para pruebas.

**Rendimiento**
- Solo `transform` y `opacity` en DOM (blur únicamente en una imagen macro y nunca > 6 px).
- Three.js, R3F y el modelo en un chunk diferido que se descarga tras el primer pintado; texturas generadas en canvas (0 KB de descarga).
- Póster AVIF/WebP del hero con `fetchpriority="high"` como candidato LCP; el canvas aparece encima cuando su primer frame está listo.
- La entrada del hero es **CSS** (empieza con el primer pintado, sin esperar a que JavaScript hidrate). El 3D, al llegar, sincroniza su luz con el tiempo transcurrido; si el visitante ya se desplaza, la entrada se acelera (Web Animations API).
- **DPR adaptativo**: si la media de frame supera 33 ms, la resolución del lienzo baja por pasos de 0,25 (mínimo 1 en FULL, 0,75 en LITE) y vuelve a subir cuando sobra margen.
- WebGL: DPR ≤ 2 / ≤ 1.5, render detenido cuando el escenario está oculto (secciones sin 3D) o la pestaña no es visible; geometrías, materiales y texturas liberados al desmontar.
- Imágenes de escenas fuera del primer pliegue con `loading="lazy"`; en niveles con 3D no se descargan.
- `content-visibility: auto` en secciones de flujo largo.
