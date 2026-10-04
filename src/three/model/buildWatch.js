// TEMPO ORIGEN — modelo paramétrico a escala real (mm).
// Construido a partir de las especificaciones: caja 39 mm de titanio grado 5, cristal y fondo de zafiro,
// esfera negra texturizada, índices aplicados, agujas cepilladas/pulidas, correa de cuero con interior coñac,
// calibre automático T-01 con micro-rotor (ver MechanicalMovement.js).
import * as THREE from 'three';
import {
  latheZ,
  smoothProfile,
  basis,
  extrude,
  dauphineHand,
  secondsHandShape,
  sweepStrap,
  mergeGeometries,
  disposeObject,
  TAU,
} from './geometry.js';
import { createMaterials } from './materials.js';
import { buildMovement } from '../MechanicalMovement.js';

export const DIM = {
  caseR: 19.5,
  dialR: 16.45,
  dialZ: 2.1,
  crystalEdgeZ: 4.02,
  crystalRise: 0.5,
  backZ: -5.2,
  windowR: 12.6,
  lugX0: 10.1,
  lugW: 2.5,
  crownZ: -0.65,
  springBar: [21.55, -1.95],
  handZ: { hour: 2.42, minute: 2.72, seconds: 3.06 },
};

const QUALITY = {
  ultra: { lathe: 256, curve: 32, strapSeg: 96, strapSec: 36, bevelSeg: 3 },
  full: { lathe: 192, curve: 24, strapSeg: 72, strapSec: 28, bevelSeg: 2 },
  lite: { lathe: 112, curve: 14, strapSeg: 44, strapSec: 20, bevelSeg: 1 },
};

export function buildWatch({ quality = 'full' } = {}) {
  const Q = QUALITY[quality];
  const { M, tex } = createMaterials(quality, DIM.dialR);
  const root = new THREE.Group();
  root.name = 'tempo-origen';

  const G = {
    case: new THREE.Group(),
    strap: new THREE.Group(),
    crystal: new THREE.Group(),
    dial: new THREE.Group(),
    hands: new THREE.Group(),
    movement: null,
  };
  Object.entries(G).forEach(([k, g]) => g && (g.name = k));

  // materiales que pueden desvanecerse (la caja, la correa, la esfera y las agujas salen de escena en el calibre)
  const fadeGroups = { case: [], strap: [], dial: [], hands: [] };
  const fadeable = (key, mat) => {
    mat.transparent = true;
    mat.userData.baseOpacity = mat.opacity;
    if (!fadeGroups[key].includes(mat)) fadeGroups[key].push(mat);
    return mat;
  };

  const mesh = (geo, mat, parent, { cast = false, receive = false, name } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = cast;
    m.receiveShadow = receive;
    if (name) m.name = name;
    parent.add(m);
    return m;
  };

  /* ------------------------------------------------------------------ caja */
  const caseMats = {
    blasted: fadeable('case', M.titaniumBlasted),
    blastedLug: fadeable('case', M.titaniumBlastedLug),
    polished: fadeable('case', M.titaniumPolished),
    brushed: fadeable('case', M.titaniumBrushed),
    caseback: fadeable('case', M.caseback),
    rehaut: fadeable('case', M.rehaut),
  };

  // flanco microgranallado
  mesh(
    latheZ(
      smoothProfile(
        [
          [17.25, -4.3],
          [18.45, -4.02],
          [19.18, -3.42],
          [19.5, -2.45],
          [19.56, -1.0],
          [19.5, 0.5],
          [19.32, 1.42],
          [19.05, 1.85],
        ],
        36,
      ),
      Q.lathe,
    ),
    caseMats.blasted,
    G.case,
    { name: 'caseband' },
  );
  // bisel pulido a mano
  mesh(
    latheZ(
      smoothProfile(
        [
          [19.05, 1.85],
          [18.98, 2.45],
          [18.72, 3.12],
          [18.26, 3.66],
          [17.78, 3.93],
          [17.4, 3.96],
        ],
        28,
      ),
      Q.lathe,
    ),
    caseMats.polished,
    G.case,
    { name: 'bezel' },
  );
  // pared interior del bisel
  mesh(latheZ([[17.4, 3.96], [17.33, 3.55]], Q.lathe), caseMats.polished, G.case);
  // rehaut con escala de minutos
  mesh(latheZ([[17.33, 3.55], [16.45, 2.12]], Q.lathe), caseMats.rehaut, G.case, { name: 'rehaut', receive: true });

  // fondo: escalón pulido, anillo cepillado grabado, bisel interior, zafiro
  mesh(
    latheZ(
      [
        [16.15, -5.2],
        [16.72, -5.08],
        [17.06, -4.78],
        [17.25, -4.3],
      ],
      Q.lathe,
    ),
    caseMats.polished,
    G.case,
  );
  mesh(latheZ([[12.95, -5.2], [16.15, -5.2]], Q.lathe), caseMats.caseback, G.case, { name: 'caseback' });
  mesh(latheZ([[12.6, -4.98], [12.95, -5.2]], Q.lathe), caseMats.polished, G.case);
  const backSapphire = mesh(latheZ([[0, -4.98], [12.6, -4.98]], Q.lathe), M.sapphire, G.case, { name: 'back-sapphire' });
  backSapphire.renderOrder = 10;

  // asas: perfil lateral extruido con chaflán pulido
  const lugShape = new THREE.Shape();
  lugShape.moveTo(13.6, -3.7);
  lugShape.lineTo(13.6, 1.3);
  lugShape.bezierCurveTo(17.6, 1.26, 20.6, 0.62, 22.62, -0.92);
  lugShape.quadraticCurveTo(23.95, -1.85, 23.62, -2.78);
  lugShape.quadraticCurveTo(23.3, -3.38, 22.35, -3.32);
  lugShape.bezierCurveTo(20.6, -3.22, 18.6, -3.02, 17.3, -3.92);
  lugShape.lineTo(13.6, -3.7);
  const lugGeo = extrude(lugShape, DIM.lugW, 0.32, { segments: Q.bevelSeg + 1, curveSegments: Q.curve });
  lugGeo.applyMatrix4(basis([0, 1, 0], [0, 0, 1], [1, 0, 0]));
  const lugMats = [caseMats.blastedLug, caseMats.polished];
  // a las 12: extrusión en +X desde la cara interior; a las 6: la misma pieza girada 180° sobre el eje
  for (const [x, rot] of [
    [DIM.lugX0, 0],
    [-DIM.lugX0 - DIM.lugW, 0],
    [DIM.lugX0 + DIM.lugW, Math.PI],
    [-DIM.lugX0, Math.PI],
  ]) {
    const lug = mesh(lugGeo, lugMats, G.case, { name: 'lug' });
    lug.position.x = x;
    lug.rotation.z = rot;
  }

  // corona estriada a las 3
  const flutes = 26;
  const crownR = 2.85;
  const crownShape = new THREE.Shape();
  const steps = flutes * 10;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * TAU;
    const groove = 0.5 + 0.5 * Math.cos(a * flutes);
    const r = crownR - 0.2 * groove * groove;
    if (i === 0) crownShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else crownShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const crownGeo = extrude(crownShape, 2.3, 0.26, { segments: Q.bevelSeg + 1, curveSegments: 8 });
  crownGeo.applyMatrix4(basis([0, 1, 0], [0, 0, 1], [1, 0, 0], [20.05, 0, DIM.crownZ]));
  mesh(crownGeo, [caseMats.brushed, caseMats.polished], G.case, { name: 'crown' });
  const tube = new THREE.CylinderGeometry(1.22, 1.22, 1.1, 40);
  tube.rotateZ(Math.PI / 2);
  tube.translate(19.55, 0, DIM.crownZ);
  mesh(tube, caseMats.polished, G.case);
  const capGeo = latheZ(
    smoothProfile(
      [
        [0, 0.24],
        [1.1, 0.2],
        [1.95, 0.05],
        [2.15, -0.02],
      ],
      12,
    ),
    64,
  );
  capGeo.rotateY(Math.PI / 2);
  capGeo.translate(22.35, 0, DIM.crownZ);
  mesh(capGeo, caseMats.polished, G.case);

  /* --------------------------------------------------------------- cristal */
  const domePts = [];
  for (let i = 0; i <= 24; i++) {
    const r = 17.4 * (1 - i / 24);
    domePts.push([r, DIM.crystalEdgeZ + DIM.crystalRise * (1 - (r / 17.4) ** 2)]);
  }
  const crystalMat = M.sapphire.clone();
  const crystal = mesh(latheZ(domePts, Q.lathe), crystalMat, G.crystal, { name: 'crystal' });
  crystal.renderOrder = 10;

  /* ----------------------------------------------------------------- esfera */
  const dialMat = fadeable('dial', M.dial);
  const dialGeo = new THREE.CircleGeometry(DIM.dialR, Q.lathe);
  dialGeo.translate(0, 0, DIM.dialZ);
  mesh(dialGeo, dialMat, G.dial, { receive: true, name: 'dial' });
  const dialEdge = new THREE.CylinderGeometry(DIM.dialR, DIM.dialR, 0.4, Q.lathe, 1, true);
  dialEdge.rotateX(Math.PI / 2);
  dialEdge.translate(0, 0, DIM.dialZ - 0.2);
  mesh(dialEdge, dialMat, G.dial);
  const dialBack = new THREE.CircleGeometry(DIM.dialR, 64);
  dialBack.rotateX(Math.PI);
  dialBack.translate(0, 0, DIM.dialZ - 0.4);
  mesh(dialBack, dialMat, G.dial);

  // índices aplicados, facetados y pulidos
  const indexMat = fadeable('dial', M.index);
  const idxGeos = [];
  const baton = (len, w) => {
    const s = new THREE.Shape();
    s.moveTo(0, -w / 2);
    s.lineTo(len, -w / 2);
    s.lineTo(len, w / 2);
    s.lineTo(0, w / 2);
    s.closePath();
    return extrude(s, 0.42, 0.14, { segments: Q.bevelSeg, curveSegments: 1 });
  };
  for (let k = 0; k < 12; k++) {
    const a = Math.PI / 2 - (k * TAU) / 12;
    const parts = k === 0 ? [[0.36], [-0.36]] : [[0]];
    const len = k % 3 === 0 ? 3.6 : 3.0;
    const w = k === 0 ? 0.58 : 0.9;
    for (const [offset] of parts) {
      const g = baton(len, w);
      g.translate(15.55 - len, offset * 1.25, DIM.dialZ);
      g.rotateZ(a);
      idxGeos.push(g);
    }
  }
  const indices = mesh(mergeGeometries(idxGeos), indexMat, G.dial, { cast: true, name: 'indices' });
  idxGeos.forEach((g) => g.dispose());
  indices.geometry.computeVertexNormals();

  /* ----------------------------------------------------------------- agujas */
  const handFacet = fadeable('hands', M.handFacet);
  const handEdge = fadeable('hands', M.handEdge);
  const secMat = fadeable('hands', M.accent);
  const pivot = (z) => {
    const p = new THREE.Group();
    p.position.z = z;
    G.hands.add(p);
    return p;
  };
  const hourPivot = pivot(DIM.handZ.hour);
  const minutePivot = pivot(DIM.handZ.minute);
  const secondsPivot = pivot(DIM.handZ.seconds);
  mesh(dauphineHand({ length: 9.8, width: 1.85, tail: 1.9, hub: 1.3 }), [handFacet, handEdge], hourPivot, {
    cast: true,
    name: 'hour',
  });
  mesh(dauphineHand({ length: 15.1, width: 1.3, tail: 2.2, hub: 1.05, ridge: 0.13 }), [handFacet, handEdge], minutePivot, {
    cast: true,
    name: 'minute',
  });
  const secGeo = extrude(secondsHandShape({}), 0.09, 0);
  mesh(secGeo, secMat, secondsPivot, { cast: true, name: 'seconds' });
  const capG = new THREE.CylinderGeometry(0.52, 0.6, 0.28, 32);
  capG.rotateX(Math.PI / 2);
  capG.translate(0, 0, 0.18);
  mesh(capG, secMat, secondsPivot);

  /* ------------------------------------------------------------------ correa */
  const strapTop = fadeable('strap', M.leather);
  const strapBottom = fadeable('strap', M.cognac);
  const L = 46;
  const R = 27;
  const [y0, z0] = DIM.springBar;
  const th0 = -0.1;
  const cy = y0 + Math.sin(th0) * R;
  const cz = z0 - Math.cos(th0) * R;
  const a0 = Math.atan2(z0 - cz, y0 - cy);
  const strapGeo = sweepStrap({
    length: L,
    segments: Q.strapSeg,
    sectionPoints: Q.strapSec,
    pathFn: (t) => {
      const a = a0 - (t * L) / R;
      return { y: cy + Math.cos(a) * R, z: cz + Math.sin(a) * R, ty: Math.sin(a), tz: -Math.cos(a) };
    },
    widthFn: (t) => {
      const w = 20 - 2.4 * t;
      const tipStart = 0.84;
      if (t <= tipStart) return w;
      const k = (t - tipStart) / (1 - tipStart);
      return w * Math.sqrt(Math.max(0.02, 1 - k * k));
    },
    thickFn: (t) => {
      const th = 3.3 - 0.9 * t;
      return t > 0.9 ? th * (1 - (t - 0.9) * 5.5) : th;
    },
  });
  mesh(strapGeo, [strapTop, strapBottom], G.strap, { name: 'strap-12' });
  const strap6 = mesh(strapGeo, [strapTop, strapBottom], G.strap, { name: 'strap-6' });
  strap6.rotation.z = Math.PI;
  // pasador visible entre asas
  const bar = new THREE.CylinderGeometry(0.55, 0.55, 20.2, 20);
  bar.rotateZ(Math.PI / 2);
  bar.translate(0, y0, z0);
  mesh(bar, caseMats.polished, G.case);
  const bar6 = bar.clone();
  bar6.rotateZ(Math.PI);
  mesh(bar6, caseMats.polished, G.case);

  /* ---------------------------------------------------------------- calibre */
  const movement = buildMovement({ M, quality });
  G.movement = movement.group;

  // orden de montaje en la escena
  root.add(G.case, G.strap, G.crystal, G.dial, G.hands, G.movement);

  // sombras: solo agujas e índices proyectan; esfera y rehaut reciben
  root.traverse((o) => {
    if (o.isMesh) o.frustumCulled = true;
  });

  /* ------------------------------------------------------------ animación */
  const base = {
    crystal: G.crystal.position.clone(),
    hands: G.hands.position.clone(),
    dial: G.dial.position.clone(),
    case: G.case.position.clone(),
    strap: G.strap.position.clone(),
  };

  const setOpacity = (key, k) => {
    for (const m of fadeGroups[key]) m.opacity = m.userData.baseOpacity * k;
    const group = key === 'case' ? G.case : G[key];
    group.visible = k > 0.002;
  };

  // reloj interno: arranca a las 10:09:00 y avanza en tiempo real mientras el volante tiene energía
  let tau = 0;
  let lastTime = null;

  function update(time, rig) {
    const dt = lastTime == null ? 0 : Math.min(0.1, time - lastTime);
    lastTime = time;
    if (rig.alive > 0.02 && !rig.frozen) tau += dt;

    // --- despiece (eje Z del reloj) ---
    const ex = rig.explode;
    G.crystal.position.z = base.crystal.z + ex.crystal * 44;
    crystalMat.opacity = 1 - ex.crystal;
    G.crystal.visible = ex.crystal < 0.999;
    const dialLift = ex.dial * 30;
    G.dial.position.z = dialLift;
    G.hands.position.z = dialLift + ex.hands * 12;
    const caseOut = ex.caseOut;
    G.case.position.z = -caseOut * 60;
    G.case.position.y = 0;
    G.strap.position.copy(G.case.position);
    setOpacity('case', (1 - caseOut) * (1 - rig.hideCase));
    setOpacity('strap', (1 - caseOut) * (1 - rig.hideCase));
    setOpacity('dial', 1 - rig.hideDial);
    setOpacity('hands', 1 - rig.hideDial);
    movement.update(tau, rig);

    // --- agujas ---
    const beats = Math.floor(tau * 6);
    const frac = tau * 6 - beats;
    const tick = beats + Math.min(1, frac / 0.12);
    const seconds = tick / 6;
    const minutes = 9 + seconds / 60;
    const hours = 10 + minutes / 60;
    secondsPivot.rotation.z = Math.PI / 2 - (seconds / 60) * TAU;
    minutePivot.rotation.z = Math.PI / 2 - (minutes / 60) * TAU;
    hourPivot.rotation.z = Math.PI / 2 - (hours / 12) * TAU;
  }

  function dispose() {
    disposeObject(root);
    Object.values(tex).forEach((t) => {
      if (t?.isTexture) t.dispose();
      else if (t) Object.values(t).forEach((x) => x?.isTexture && x.dispose());
    });
  }

  /** Fija el reloj interno (s desde las 10:09:00) — imágenes fijas reproducibles. */
  function setClock(seconds) {
    tau = seconds;
    lastTime = null;
  }

  return { root, groups: G, materials: M, movement, update, dispose, setClock };
}
