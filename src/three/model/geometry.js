// Constructores geométricos del Tempo Origen.
// Unidades: 1 = 1 mm. Eje del reloj = Z (la esfera mira a +Z, el fondo a −Z).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const TAU = Math.PI * 2;

/**
 * Superficie de revolución alrededor del eje Z.
 * points: [[r, h], ...] recorrido con el material a la izquierda (normal a la derecha).
 */
export function latheZ(points, segments = 128) {
  const g = new THREE.LatheGeometry(
    points.map(([r, h]) => new THREE.Vector2(r, h)),
    segments,
  );
  g.rotateX(Math.PI / 2);
  return g;
}

/** Perfil suave muestreando una curva de Catmull-Rom 2D. */
export function smoothProfile(points, samples = 24) {
  const curve = new THREE.SplineCurve(points.map(([r, h]) => new THREE.Vector2(r, h)));
  return curve.getSpacedPoints(samples).map((p) => [p.x, p.y]);
}

/** Matriz que lleva el plano de una Shape (x,y) + extrusión z a ejes arbitrarios. */
export function basis(xAxis, yAxis, zAxis, origin = [0, 0, 0]) {
  const m = new THREE.Matrix4();
  m.makeBasis(new THREE.Vector3(...xAxis), new THREE.Vector3(...yAxis), new THREE.Vector3(...zAxis));
  m.setPosition(...origin);
  return m;
}

export function extrude(shape, depth, bevel = 0, { segments = 2, curveSegments = 24 } = {}) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: segments,
    curveSegments,
  });
  // centra la extrusión en z = 0 … depth (el bisel queda dentro del volumen nominal)
  if (bevel > 0) {
    g.translate(0, 0, bevel);
    g.scale(1, 1, depth / (depth + bevel * 2));
  }
  return g;
}

/** Círculo como Path (para agujeros). */
export function circlePath(cx, cy, r, ccw = true) {
  const p = new THREE.Path();
  p.absarc(cx, cy, r, 0, TAU, !ccw);
  return p;
}

/**
 * Rueda dentada con radios. Perfil de diente cicloidal simplificado (punta redondeada),
 * suficiente para la escala visual de un tren de engranajes de reloj.
 */
export function gearShape({
  teeth,
  radius,
  toothDepth = radius * 0.07,
  spokes = 4,
  rimWidth = radius * 0.13,
  hubRadius = radius * 0.2,
  spokeWidth = radius * 0.1,
  arbor = radius * 0.06,
}) {
  const shape = new THREE.Shape();
  const rRoot = radius - toothDepth;
  const step = TAU / teeth;
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    // raíz → flanco → punta redondeada → flanco → raíz
    pts.push([rRoot, a]);
    pts.push([rRoot, a + step * 0.18]);
    pts.push([radius - toothDepth * 0.35, a + step * 0.24]);
    pts.push([radius, a + step * 0.36]);
    pts.push([radius, a + step * 0.5]);
    pts.push([radius - toothDepth * 0.35, a + step * 0.62]);
    pts.push([rRoot, a + step * 0.68]);
  }
  pts.forEach(([r, a], i) => {
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();

  if (spokes > 0) {
    const rIn = rRoot - rimWidth;
    const sector = TAU / spokes;
    const halfSpoke = spokeWidth / 2;
    for (let s = 0; s < spokes; s++) {
      const a0 = s * sector + Math.asin(Math.min(0.99, halfSpoke / rIn));
      const a1 = (s + 1) * sector - Math.asin(Math.min(0.99, halfSpoke / rIn));
      const b0 = s * sector + Math.asin(Math.min(0.99, halfSpoke / hubRadius)) ;
      const b1 = (s + 1) * sector - Math.asin(Math.min(0.99, halfSpoke / hubRadius));
      const hole = new THREE.Path();
      hole.moveTo(Math.cos(b0) * hubRadius, Math.sin(b0) * hubRadius);
      hole.lineTo(Math.cos(a0) * rIn, Math.sin(a0) * rIn);
      hole.absarc(0, 0, rIn, a0, a1, false);
      hole.lineTo(Math.cos(b1) * hubRadius, Math.sin(b1) * hubRadius);
      hole.absarc(0, 0, hubRadius, b1, b0, true);
      shape.holes.push(hole);
    }
  }
  if (arbor > 0) shape.holes.push(circlePath(0, 0, arbor, false));
  return shape;
}

/** Piñón (hojas) — pieza pequeña de acero en el eje de cada rueda. */
export function pinionShape({ leaves = 8, radius = 0.6 }) {
  const shape = new THREE.Shape();
  const step = TAU / leaves;
  const rRoot = radius * 0.62;
  for (let i = 0; i < leaves; i++) {
    const a = i * step;
    const pts = [
      [rRoot, a],
      [radius, a + step * 0.15],
      [radius, a + step * 0.45],
      [rRoot, a + step * 0.6],
    ];
    pts.forEach(([r, aa], j) => {
      const x = Math.cos(aa) * r;
      const y = Math.sin(aa) * r;
      if (i === 0 && j === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();
  return shape;
}

/** Rueda de escape de 15 dientes de maza (club teeth). */
export function escapeWheelShape({ teeth = 15, radius = 2.3 }) {
  const shape = new THREE.Shape();
  const step = TAU / teeth;
  const rRoot = radius * 0.62;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts = [
      [rRoot, a],
      [radius * 0.98, a + step * 0.34], // flanco inclinado
      [radius, a + step * 0.42], // maza
      [radius * 0.93, a + step * 0.52],
      [rRoot * 1.02, a + step * 0.62],
    ];
    pts.forEach(([r, aa], j) => {
      const x = Math.cos(aa) * r;
      const y = Math.sin(aa) * r;
      if (i === 0 && j === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();
  // cuatro radios
  const rIn = rRoot * 0.78;
  const hub = radius * 0.2;
  for (let s = 0; s < 4; s++) {
    const a0 = s * (TAU / 4) + 0.3;
    const a1 = (s + 1) * (TAU / 4) - 0.3;
    const hole = new THREE.Path();
    hole.moveTo(Math.cos(a0) * hub * 1.4, Math.sin(a0) * hub * 1.4);
    hole.absarc(0, 0, rIn, a0, a1, false);
    hole.lineTo(Math.cos(a1) * hub * 1.4, Math.sin(a1) * hub * 1.4);
    hole.closePath();
    shape.holes.push(hole);
  }
  return shape;
}

/** Áncora: brazo con dos paletas y horquilla hacia el volante. Pivote en el origen, horquilla hacia −X. */
export function palletForkShape({ reach = 2.6, fork = 3.0 }) {
  const s = new THREE.Shape();
  const w = 0.28;
  s.moveTo(-fork, w * 1.6);
  s.lineTo(-fork + 0.5, w * 1.6);
  s.lineTo(-fork + 0.5, w * 0.6);
  s.lineTo(-0.5, w);
  // brazo de paletas (T)
  s.lineTo(0.2, w);
  s.lineTo(reach * 0.55, reach * 0.62);
  s.lineTo(reach * 0.55 + 0.3, reach * 0.62 - 0.22);
  s.lineTo(0.6, 0);
  s.lineTo(reach * 0.55 + 0.3, -reach * 0.62 + 0.22);
  s.lineTo(reach * 0.55, -reach * 0.62);
  s.lineTo(0.2, -w);
  s.lineTo(-0.5, -w);
  s.lineTo(-fork + 0.5, -w * 0.6);
  s.lineTo(-fork + 0.5, -w * 1.6);
  s.lineTo(-fork, -w * 1.6);
  s.closePath();
  s.holes.push(circlePath(0, 0, 0.18, false));
  return s;
}

/** Sector anular (micro-rotor). Ángulos en radianes. */
export function annularSectorShape(rIn, rOut, a0, a1, hub = 0) {
  const s = new THREE.Shape();
  s.moveTo(Math.cos(a0) * rIn, Math.sin(a0) * rIn);
  s.absarc(0, 0, rOut, a0, a1, false);
  s.absarc(0, 0, rIn, a1, a0, true);
  s.closePath();
  if (hub > 0) {
    // puente fino al buje
    const web = new THREE.Shape();
    web.absarc(0, 0, hub, 0, TAU, false);
    return [s, web];
  }
  return [s];
}

/** Polígono con esquinas redondeadas (puentes). pts en sentido antihorario. */
export function roundedPolygon(pts, radius = 0.8) {
  const s = new THREE.Shape();
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = new THREE.Vector2(...pts[(i - 1 + n) % n]);
    const p1 = new THREE.Vector2(...pts[i]);
    const p2 = new THREE.Vector2(...pts[(i + 1) % n]);
    const d0 = p0.clone().sub(p1);
    const d2 = p2.clone().sub(p1);
    const r = Math.min(radius, d0.length() * 0.45, d2.length() * 0.45);
    const a = p1.clone().add(d0.normalize().multiplyScalar(r));
    const b = p1.clone().add(d2.normalize().multiplyScalar(r));
    if (i === 0) s.moveTo(a.x, a.y);
    else s.lineTo(a.x, a.y);
    s.quadraticCurveTo(p1.x, p1.y, b.x, b.y);
  }
  s.closePath();
  return s;
}

/** Recorta un punto al disco de radio R (para que los puentes no sobresalgan de la platina). */
export function clampToDisk(pts, R) {
  return pts.map(([x, y]) => {
    const d = Math.hypot(x, y);
    return d > R ? [(x / d) * R, (y / d) * R] : [x, y];
  });
}

/**
 * Aguja dauphine de dos facetas: arista central elevada que capta la luz por un lado u otro.
 * Grupos: 0 = facetas superiores (cepilladas), 1 = cantos, fondo y buje (pulidos).
 */
export function dauphineHand({ length, width, tail = 1.6, ridge = 0.16, thickness = 0.14, hub = 1.15 }) {
  const shoulder = length * 0.16;
  const th = thickness;
  const top = thickness + ridge;
  // contorno en sentido antihorario visto desde +Z
  const outline = [
    [-tail, 0],
    [-tail * 0.55, -width * 0.38],
    [shoulder, -width / 2],
    [length, 0],
    [shoulder, width / 2],
    [-tail * 0.55, width * 0.38],
  ];
  const positions = [];
  const uvs = [];
  const tri = (a, b, c) => {
    for (const v of [a, b, c]) {
      positions.push(v[0], v[1], v[2]);
      uvs.push((v[0] + tail) / (length + tail), v[1] / width + 0.5);
    }
  };
  const rs = [-tail, 0, top];
  const tip = [length, 0, th * 0.7];
  const lb = [outline[5][0], outline[5][1], th];
  const ls = [outline[4][0], outline[4][1], th];
  const rb = [outline[1][0], outline[1][1], th];
  const rsh = [outline[2][0], outline[2][1], th];
  const ridgeMid = [shoulder, 0, top * 0.92];
  // faceta y > 0
  tri(rs, ridgeMid, lb);
  tri(lb, ridgeMid, ls);
  tri(ls, ridgeMid, tip);
  // faceta y < 0
  tri(rs, rb, ridgeMid);
  tri(rb, rsh, ridgeMid);
  tri(rsh, tip, ridgeMid);
  const facetCount = positions.length / 3;

  // cantos
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];
    const za = i === 3 ? th * 0.7 : i === 0 ? top : th;
    const nb = (i + 1) % outline.length;
    const zb = nb === 3 ? th * 0.7 : nb === 0 ? top : th;
    tri([a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], zb]);
    tri([a[0], a[1], 0], [b[0], b[1], zb], [a[0], a[1], za]);
  }
  // fondo (mirando a −Z)
  for (let i = 1; i < outline.length - 1; i++) {
    const a = outline[0];
    const b = outline[i + 1];
    const c = outline[i];
    tri([a[0], a[1], 0], [b[0], b[1], 0], [c[0], c[1], 0]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.computeVertexNormals(); // no indexada → normales planas por triángulo

  const hubG = new THREE.CylinderGeometry(hub, hub, top * 0.9, 40, 1).toNonIndexed();
  hubG.rotateX(Math.PI / 2);
  hubG.translate(0, 0, (top * 0.9) / 2);
  const merged = mergeGeometries([g, hubG], false);
  merged.clearGroups();
  merged.addGroup(0, facetCount, 0);
  merged.addGroup(facetCount, merged.attributes.position.count - facetCount, 1);
  return merged;
}

/** Aguja de segundos: aguja fina con contrapeso circular. Extrusión plana. */
export function secondsHandShape({ length = 15.8, tail = 4.6, width = 0.2, counter = 0.85 }) {
  const s = new THREE.Shape();
  s.moveTo(-tail + counter, width * 0.9);
  s.lineTo(-0.5, width * 1.2);
  s.lineTo(0, width * 1.25);
  s.lineTo(length, width * 0.45);
  s.lineTo(length, -width * 0.45);
  s.lineTo(0, -width * 1.25);
  s.lineTo(-0.5, -width * 1.2);
  s.lineTo(-tail + counter, -width * 0.9);
  s.absarc(-tail, 0, counter, -Math.asin(0.9 * width / counter), Math.asin(0.9 * width / counter), true);
  s.closePath();
  return s;
}

/**
 * Barrido de una sección a lo largo de un camino 2D en el plano (Y,Z) del reloj.
 * Usado para la correa. Devuelve geometría con dos grupos: 0 = cara superior + cantos, 1 = interior.
 * pathFn(t) → { y, z, ty, tz } posición y tangente; widthFn(t), thickFn(t) en mm.
 */
export function sweepStrap({ pathFn, widthFn, thickFn, segments = 64, sectionPoints = 28, length }) {
  const positions = [];
  const uvs = [];
  const indicesTop = [];
  const indicesBottom = [];
  const cols = sectionPoints;
  // sección: rectángulo redondeado parametrizado (0..1) en sentido horario empezando arriba-izquierda
  const section = (u, w, t) => {
    // 4 tramos: arriba (0–0.4), canto derecho (0.4–0.5), abajo (0.5–0.9), canto izquierdo (0.9–1)
    const r = Math.min(t * 0.5, w * 0.2);
    if (u < 0.4) {
      const k = u / 0.4;
      const x = -w / 2 + r + k * (w - 2 * r);
      const crown = Math.cos((k - 0.5) * Math.PI) * t * 0.08; // ligero abombado del acolchado
      return [x, t / 2 + crown, 0];
    }
    if (u < 0.5) {
      const k = (u - 0.4) / 0.1;
      const a = Math.PI / 2 - k * Math.PI;
      return [w / 2 - r + Math.cos(a) * r, Math.sin(a) * (t / 2), 0];
    }
    if (u < 0.9) {
      const k = (u - 0.5) / 0.4;
      const x = w / 2 - r - k * (w - 2 * r);
      return [x, -t / 2, 1];
    }
    const k = (u - 0.9) / 0.1;
    const a = -Math.PI / 2 - k * Math.PI;
    return [-w / 2 + r + Math.cos(a) * r, Math.sin(a) * (t / 2), 0];
  };

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const { y, z, ty, tz } = pathFn(t);
    // normal del camino (perpendicular a la tangente, hacia "arriba" de la correa)
    const len = Math.hypot(ty, tz);
    const ny = -tz / len;
    const nz = ty / len;
    const w = widthFn(t);
    const th = thickFn(t);
    for (let j = 0; j <= cols; j++) {
      const u = j / cols;
      const [sx, sy] = section(u % 1, w, th);
      positions.push(sx, y + ny * sy, z + nz * sy);
      uvs.push(u < 0.5 ? (sx / w + 0.5) : (sx / w + 0.5), t);
    }
  }
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j;
      const b = a + cols + 1;
      const u = (j + 0.5) / cols;
      const target = u >= 0.5 && u < 0.9 ? indicesBottom : indicesTop;
      target.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex([...indicesTop, ...indicesBottom]);
  g.addGroup(0, indicesTop.length, 0);
  g.addGroup(indicesTop.length, indicesBottom.length, 1);
  g.computeVertexNormals();
  g.userData.length = length;
  return g;
}

/** Espiral de Arquímedes como tubo (espiral del volante). */
export function hairspringGeometry({ turns = 13, r0 = 0.75, r1 = 3.3, tube = 0.028, segments = 900 }) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = t * turns * TAU;
    const r = r0 + (r1 - r0) * t;
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, segments, tube, 4, false);
}

export function disposeObject(root) {
  const seen = new Set();
  root.traverse((o) => {
    if (o.geometry && !seen.has(o.geometry)) {
      seen.add(o.geometry);
      o.geometry.dispose();
    }
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      if (seen.has(m)) continue;
      seen.add(m);
      for (const key of Object.keys(m)) {
        const v = m[key];
        if (v && v.isTexture && !seen.has(v)) {
          seen.add(v);
          v.dispose();
        }
      }
      m.dispose();
    }
  });
}

export { mergeGeometries, TAU };
