# Recursos reales para el resultado máximo

La versión actual funciona sin un solo recurso externo: el reloj, el calibre, las texturas, el estudio de luz y todas las imágenes fijas se generan desde código (modelo paramétrico a escala 1:1 en milímetros). Es coherente y medible, pero no sustituye a un modelo y una fotografía reales. Para llegar al resultado máximo habría que aportar lo siguiente.

## 1. Modelo GLB del Tempo Origen

- **Formato**: glTF 2.0 binario (`.glb`), unidades en **milímetros**, eje del reloj = **+Z** (esfera hacia +Z), origen en el centro del calibre.
- **Peso objetivo**: < 2 MB con Meshopt o Draco; texturas KTX2 (Basis UASTC para normales, ETC1S para color).
- **Nodos con nombre** (la coreografía actúa sobre estos grupos; el resto puede tener cualquier jerarquía interna):

| Nodo | Contenido | Uso en la coreografía |
|---|---|---|
| `case` | carrura, bisel, asas, corona, fondo, cristal trasero | giro de producto, salida en el despiece |
| `strap` | correa 12 h y 6 h | se retira con la caja |
| `crystal` | cristal de zafiro | primera pieza que se levanta |
| `dial` | esfera + índices | paso "Esfera" |
| `hands` › `hour`, `minute`, `seconds` | agujas con pivote en el origen, apuntando a +X | hora real, paso "Agujas" |
| `movement` › `plate` | platina | paso "Platina" |
| `movement` › `train` › `barrel`, `center`, `third`, `fourth` | tren de engranajes | paso "Engranajes", capítulo Transmisión |
| `movement` › `escape` › `escape_wheel`, `pallet_fork` | escape | paso "Escape", capítulo Precisión |
| `movement` › `balance` › `balance_wheel`, `hairspring` | volante y espiral | oscilación a 3 Hz, capítulo Regulación |
| `movement` › `bridges` | puentes, rubíes, tornillos, trinquete | contexto en los capítulos |
| `movement` › `rotor` › `rotor_weight` | micro-rotor con pivote en su eje | rotación ambiental, capítulo Energía |

- **Materiales**: PBR metal/rugosidad. Nombrar los materiales por acabado (`titanium_blasted`, `titanium_polished`, `titanium_brushed`, `sapphire`, `dial`, `leather`, `cognac`, `gold`, `rhodium_cotes`, `anglage`, `blued_steel`, `ruby`) para poder ajustar intensidades por escena.
- **Anisotropía** en superficies cepilladas (`KHR_materials_anisotropy`) y **Côtes de Genève** como mapa de normales en los puentes.

El punto de sustitución es `src/three/stage.js` (`buildWatch`): el resto de la página (timeline, planos, imágenes fijas) no cambia si el GLB respeta la tabla anterior.

## 2. Texturas PBR

- Microgranallado de titanio (normal + rugosidad, 2K, mosaico).
- Cepillado lineal y circular (rugosidad + dirección de anisotropía).
- Esfera "grainé" negra (normal + rugosidad, 4K, no mosaico) con la impresión en vector aparte.
- Cuero negro con pespunte y ante coñac (color, normal, rugosidad, 2K).
- Côtes de Genève, perlage y Côtes circulares del rotor (normal 1K, mosaico).

## 3. HDRI

Un HDRI de estudio propio (2K, `.hdr` → PMREM) fotografiado con el mismo esquema de luz que las fotografías: dos tiras verticales, un softbox cenital, contraluz y un reflector cálido. El estudio procedural de `src/three/studio.js` reproduce ese esquema y sirve de referencia de posiciones.

## 4. Renders del reloj

Secuencias renderizadas en un motor offline (Cycles, Redshift o V-Ray) a partir del GLB para:
- Póster del hero (frontal, 2800 px, fondo transparente) — sustituye a `public/stills/watch-front-*`.
- Vistas para los niveles sin WebGL (mismos nombres que `src/stills.js`).
- Opcional: secuencia de 90–120 fotogramas del giro del hero (AVIF, 1600 px escritorio / 800 px móvil) como alternativa al 3D en LITE.

## 5. Fotografías macro

Tres planos macro (aguja sobre índice, corona estriada, frontera pulido/microgranallado), 6000 px, horizontal y vertical, apilado de enfoque. Sustituyen a `macro-*`.

## 6. Fotografías de artesanía

Fotografía editorial de manos trabajando: anglage con lima y bruñidor, Côtes de Genève en la máquina, azulado de tornillos sobre la placa, cepillado de la caja, montaje bajo la lupa, corte y pespunte de la correa. Formato 4:5, luz natural lateral, fondo grafito. Sustituyen a `craft-*` (hoy son renders de los acabados, no de las manos).

## 7. Logotipo

SVG del logotipo TEMPO (wordmark + monograma) con versión de una tinta. Hoy el logotipo es tipográfico (Cormorant Garamond con tracking amplio).

## 8. Tipografías y licencias

- **Cormorant Garamond** y **Jost**: licencia SIL Open Font License 1.1, alojadas en el propio dominio (`src/assets/fonts`, licencias incluidas).
- Si la marca adopta una serif propia o comercial (p. ej. una didona de alto contraste), se necesita licencia web con WOFF2 y subconjunto latino.

## 9. Sonido (opcional)

Tictac real grabado a 21.600 a/h (6 golpes por segundo) con micrófono de contacto, < 30 KB en Opus, desactivado por defecto y activable por el usuario. No se ha implementado: ningún efecto sonoro debe reproducirse sin acción explícita.

## 10. Textos definitivos

- Revisión de los textos de la página (`src/content.js`) por la marca.
- Política de reserva real (plazo, señal, asignación del número de serie).
- Aviso legal, privacidad y endpoint del formulario (hoy el formulario no envía datos: es un concepto).
- Dominio definitivo para `canonical`, Open Graph y datos estructurados (hoy `tempo.example`).
