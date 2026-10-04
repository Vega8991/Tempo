// Calibre TEMPO T-01 — automático, micro-rotor, 21.600 a/h, 72 h de reserva.
// Construido en coordenadas "vista desde el fondo" (xb, yb) dentro de un grupo espejado en X:
// así el diseño se lee tal y como se ve a través del fondo de zafiro.
import * as THREE from 'three';
import {
  extrude,
  gearShape,
  pinionShape,
  escapeWheelShape,
  palletForkShape,
  annularSectorShape,
  roundedPolygon,
  clampToDisk,
  hairspringGeometry,
  circlePath,
  TAU,
} from './model/geometry.js';
import { focusClone, setFocus } from './model/materials.js';
import { MOTION } from '../motion.config.js';

export const T01 = {
  plateR: 15.6,
  barrel: { p: [1.2, 9.0], r: 5.0 },
  center: { p: [0, 0], r: 3.8, teeth: 54 },
  third: { p: [7.4, 4.2], r: 3.6, teeth: 50 },
  fourth: { p: [10.0, -2.6], r: 3.4, teeth: 48 },
  escape: { p: [6.4, -7.4], r: 2.3 },
  pallet: { p: [4.0, -8.5] },
  balance: { p: [0.6, -9.4], r: 4.8 },
  rotor: { p: [-7.6, -1.2], r: 6.35 },
};

export { T01_TARGETS } from './targets.js';

/** Banda con extremos redondeados a lo largo de una polilínea (puentes esqueletados). */
function bandShape(points, width) {
  const h = width / 2;
  const P = points.map((p) => new THREE.Vector2(...p));
  const dirs = [];
  for (let i = 0; i < P.length - 1; i++) dirs.push(P[i + 1].clone().sub(P[i]).normalize());
  const nrm = (d) => new THREE.Vector2(-d.y, d.x);
  const left = [];
  const right = [];
  for (let i = 0; i < P.length; i++) {
    let n;
    let scale = 1;
    if (i === 0) n = nrm(dirs[0]);
    else if (i === P.length - 1) n = nrm(dirs[dirs.length - 1]);
    else {
      const n0 = nrm(dirs[i - 1]);
      const n1 = nrm(dirs[i]);
      n = n0.clone().add(n1).normalize();
      scale = 1 / Math.max(0.5, n.dot(n0));
    }
    left.push(P[i].clone().add(n.clone().multiplyScalar(h * scale)));
    right.push(P[i].clone().add(n.clone().multiplyScalar(-h * scale)));
  }
  const s = new THREE.Shape();
  s.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) s.lineTo(left[i].x, left[i].y);
  const dEnd = dirs[dirs.length - 1];
  const aEnd = Math.atan2(dEnd.y, dEnd.x);
  const E = P[P.length - 1];
  s.absarc(E.x, E.y, h, aEnd + Math.PI / 2, aEnd - Math.PI / 2, true);
  for (let i = right.length - 1; i >= 0; i--) s.lineTo(right[i].x, right[i].y);
  const d0 = dirs[0];
  const a0 = Math.atan2(d0.y, d0.x);
  s.absarc(P[0].x, P[0].y, h, a0 - Math.PI / 2, a0 - (3 * Math.PI) / 2, true);
  return s;
}

/**
 * @param {{ M: Record<string, THREE.Material>, quality: 'ultra'|'full'|'lite' }} opts
 */
export function buildMovement({ M, quality = 'full' }) {
  const lite = quality === 'lite';
  const bevel = (v) => (lite ? 0 : v);
  const curve = lite ? 10 : quality === 'ultra' ? 28 : 18;

  const group = new THREE.Group();
  group.name = 'calibre-T01';
  group.scale.x = -1; // espejo: diseño en vista desde el fondo

  const sub = (name) => {
    const g = new THREE.Group();
    g.name = name;
    group.add(g);
    return g;
  };
  const parts = {
    plate: sub('platina'),
    train: sub('engranajes'),
    escape: sub('escape'),
    balance: sub('volante'),
    bridges: sub('puentes'),
    rotor: sub('micro-rotor'),
  };

  // materiales por grupo de foco (para iluminar un capítulo y atenuar el resto)
  const mats = {
    plate: { plate: focusClone(M.plate), edge: focusClone(M.anglage), gold: focusClone(M.gold) },
    bridges: {
      top: focusClone(M.bridge),
      edge: focusClone(M.anglage),
      ruby: focusClone(M.ruby),
      chaton: focusClone(M.goldPolished),
      blued: focusClone(M.blued),
      dark: focusClone(M.steelDark),
      steel: focusClone(M.steel),
    },
    train: { gold: focusClone(M.gold), goldEdge: focusClone(M.goldPolished), pinion: focusClone(M.steelDark), steel: focusClone(M.steel) },
    escape: { steel: focusClone(M.steel), ruby: focusClone(M.ruby) },
    balance: { rim: focusClone(M.glucydur), spring: focusClone(M.blued), steel: focusClone(M.steel), ruby: focusClone(M.ruby) },
    rotor: { gold: focusClone(M.rotor), edge: focusClone(M.goldPolished), steel: focusClone(M.steel), blued: focusClone(M.blued) },
  };

  const add = (parent, geo, mat, { z = 0, p = [0, 0], cast = false } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], z);
    m.castShadow = cast;
    parent.add(m);
    return m;
  };
  const extrudeAt = (shape, z0, z1, b = 0) => {
    const g = extrude(shape, z1 - z0, b, { segments: lite ? 1 : 2, curveSegments: curve });
    g.translate(0, 0, z0);
    return g;
  };
  const cylinder = (r, z0, z1, seg = 32) => {
    const g = new THREE.CylinderGeometry(r, r, z1 - z0, seg);
    g.rotateX(Math.PI / 2);
    g.translate(0, 0, (z0 + z1) / 2);
    return g;
  };

  /* ------------------------------------------------------------- platina */
  const plateShape = new THREE.Shape();
  plateShape.absarc(0, 0, T01.plateR, 0, TAU, false);
  add(parts.plate, extrudeAt(plateShape, -0.6, 1.2, bevel(0.24)), [mats.plate.plate, mats.plate.edge]);
  // rodaje de minutería en el lado esfera: rueda de horas y piñón de cañón
  add(parts.plate, cylinder(2.5, 1.2, 1.42, 48), mats.plate.gold);
  add(parts.plate, cylinder(0.95, 1.2, 1.95, 24), mats.plate.gold);

  /* ------------------------------------------------- tren de engranajes */
  const wheel = (def, z0, z1, { spokes = 5, mat = mats.train.gold } = {}) => {
    const g = new THREE.Group();
    g.position.set(def.p[0], def.p[1], 0);
    const shape = gearShape({ teeth: def.teeth, radius: def.r, spokes });
    const mesh = new THREE.Mesh(extrudeAt(shape, z0, z1, bevel(0.035)), [mat, mats.train.goldEdge]);
    g.add(mesh);
    // piñón + eje
    const pin = new THREE.Mesh(extrudeAt(pinionShape({ leaves: 8, radius: 0.62 }), z0 - 0.5, z0 - 0.02), mats.train.pinion);
    g.add(pin);
    g.add(new THREE.Mesh(cylinder(0.16, -2.6, -0.6, 12), mats.train.steel));
    parts.train.add(g);
    return g;
  };
  const barrel = new THREE.Group();
  barrel.position.set(...T01.barrel.p, 0);
  barrel.add(
    new THREE.Mesh(
      extrudeAt(gearShape({ teeth: 84, radius: T01.barrel.r, spokes: 0, arbor: 0.5 }), -1.38, -0.66, bevel(0.04)),
      [mats.train.gold, mats.train.goldEdge],
    ),
  );
  parts.train.add(barrel);
  const centerW = wheel(T01.center, -0.95, -0.7, { spokes: 4 });
  const thirdW = wheel(T01.third, -1.3, -1.05);
  const fourthW = wheel(T01.fourth, -0.95, -0.7);

  /* ----------------------------------------------------------- escape */
  const escapeG = new THREE.Group();
  parts.escape.add(escapeG);
  const escWheel = new THREE.Group();
  escWheel.position.set(...T01.escape.p, 0);
  escWheel.add(new THREE.Mesh(extrudeAt(escapeWheelShape({ radius: T01.escape.r }), -1.3, -1.1), mats.escape.steel));
  escWheel.add(new THREE.Mesh(extrudeAt(pinionShape({ leaves: 7, radius: 0.48 }), -1.75, -1.3), mats.escape.steel));
  escWheel.add(new THREE.Mesh(cylinder(0.13, -2.0, -0.6, 10), mats.escape.steel));
  escapeG.add(escWheel);

  const fork = new THREE.Group();
  fork.position.set(...T01.pallet.p, 0);
  const toEscape = Math.atan2(T01.escape.p[1] - T01.pallet.p[1], T01.escape.p[0] - T01.pallet.p[0]);
  const forkAngle = toEscape;
  fork.rotation.z = forkAngle;
  fork.add(new THREE.Mesh(extrudeAt(palletForkShape({ reach: 2.6, fork: 2.9 }), -1.46, -1.34), mats.escape.steel));
  for (const s of [1, -1]) {
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.62, 0.2), mats.escape.ruby);
    stone.position.set(2.6 * 0.55 + 0.12, s * (2.6 * 0.62 - 0.1), -1.4);
    stone.rotation.z = s * 0.5;
    fork.add(stone);
  }
  fork.add(new THREE.Mesh(cylinder(0.12, -2.0, -0.6, 10), mats.escape.steel));
  escapeG.add(fork);

  /* ---------------------------------------------------------- volante */
  const balanceG = new THREE.Group();
  balanceG.position.set(...T01.balance.p, 0);
  parts.balance.add(balanceG);
  const wheelG = new THREE.Group();
  balanceG.add(wheelG);
  const rimShape = new THREE.Shape();
  rimShape.absarc(0, 0, T01.balance.r, 0, TAU, false);
  rimShape.holes.push(circlePath(0, 0, T01.balance.r - 0.48, false));
  wheelG.add(new THREE.Mesh(extrudeAt(rimShape, -1.95, -1.5, bevel(0.05)), [mats.balance.rim, mats.balance.rim]));
  const arm = new THREE.Shape();
  arm.moveTo(-(T01.balance.r - 0.3), -0.24);
  arm.lineTo(T01.balance.r - 0.3, -0.24);
  arm.lineTo(T01.balance.r - 0.3, 0.24);
  arm.lineTo(-(T01.balance.r - 0.3), 0.24);
  arm.closePath();
  wheelG.add(new THREE.Mesh(extrudeAt(arm, -1.86, -1.58), mats.balance.rim));
  // masas de inercia
  const massGeo = cylinder(0.36, -2.0, -1.45, 16);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4;
    const m = new THREE.Mesh(massGeo, mats.balance.rim);
    m.position.set(Math.cos(a) * (T01.balance.r - 0.62), Math.sin(a) * (T01.balance.r - 0.62), 0);
    wheelG.add(m);
  }
  wheelG.add(new THREE.Mesh(cylinder(0.16, -2.55, -0.6, 12), mats.balance.steel));
  wheelG.add(new THREE.Mesh(cylinder(0.85, -1.42, -1.3, 32), mats.balance.steel)); // doble plato
  const impulse = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.3), mats.balance.ruby);
  impulse.position.set(0.68, 0, -1.25);
  wheelG.add(impulse);
  const spring = new THREE.Mesh(hairspringGeometry({ segments: lite ? 420 : 900 }), mats.balance.spring);
  spring.position.z = -2.12;
  balanceG.add(spring);
  balanceG.add(new THREE.Mesh(cylinder(0.42, -2.25, -2.0, 20), mats.balance.steel)); // virola

  /* ---------------------------------------------------------- puentes */
  const B = mats.bridges;
  const bridgeMats = [B.top, B.edge];
  const barrelBridge = roundedPolygon(
    clampToDisk(
      [
        [-4.6, 7.2],
        [-1.8, 4.6],
        [3.4, 4.2],
        [6.6, 6.2],
        [7.2, 9.4],
        [5.6, 12.6],
        [1.8, 14.3],
        [-2.8, 13.6],
        [-5.2, 10.8],
      ],
      15.2,
    ),
    1.4,
  );
  add(parts.bridges, extrudeAt(barrelBridge, -2.6, -1.4, bevel(0.14)), bridgeMats);
  const trainA = bandShape(
    [
      [13.3, 3.6],
      [7.4, 4.2],
      [0, 0],
    ],
    2.8,
  );
  add(parts.bridges, extrudeAt(trainA, -2.6, -1.4, bevel(0.14)), bridgeMats);
  const trainB = bandShape(
    [
      [12.7, -5.4],
      [10.0, -2.6],
      [10.8, 3.8],
    ],
    2.4,
  );
  add(parts.bridges, extrudeAt(trainB, -2.5, -1.3, bevel(0.13)), bridgeMats);
  const cock = bandShape(
    [
      [-8.8, -10.8],
      [-4.2, -11.2],
      [0.6, -9.4],
    ],
    3.0,
  );
  add(parts.bridges, extrudeAt(cock, -2.95, -2.25, bevel(0.12)), bridgeMats);
  const palletBridge = bandShape(
    [
      [2.0, -11.6],
      [4.0, -8.5],
    ],
    1.6,
  );
  add(parts.bridges, extrudeAt(palletBridge, -2.05, -1.6, bevel(0.14)), bridgeMats);
  const escBridge = bandShape(
    [
      [9.4, -10.2],
      [6.4, -7.4],
    ],
    1.5,
  );
  add(parts.bridges, extrudeAt(escBridge, -2.05, -1.6, bevel(0.14)), bridgeMats);

  // trinquete + rueda de corona sobre el puente de barrilete
  const ratchet = new THREE.Group();
  ratchet.position.set(...T01.barrel.p, 0);
  ratchet.add(
    new THREE.Mesh(
      extrudeAt(gearShape({ teeth: 60, radius: 4.2, spokes: 0, arbor: 0 }), -2.98, -2.62, bevel(0.05)),
      [B.dark, B.steel],
    ),
  );
  ratchet.add(new THREE.Mesh(cylinder(1.05, -3.18, -2.98, 40), B.blued));
  parts.bridges.add(ratchet);
  const crownWheel = new THREE.Group();
  crownWheel.position.set(-4.4, 11.6, 0);
  crownWheel.add(
    new THREE.Mesh(extrudeAt(gearShape({ teeth: 30, radius: 1.9, spokes: 0, arbor: 0 }), -2.92, -2.62, bevel(0.04)), [B.dark, B.steel]),
  );
  crownWheel.add(new THREE.Mesh(cylinder(0.55, -3.06, -2.92, 24), B.blued));
  parts.bridges.add(crownWheel);

  // rubíes en chatones dorados (instanciados)
  const jewelPos = [
    [...T01.center.p, -2.62],
    [...T01.third.p, -2.62],
    [...T01.fourth.p, -2.52],
    [...T01.escape.p, -2.07],
    [...T01.pallet.p, -2.07],
    [...T01.balance.p, -2.97],
  ];
  const chatonGeo = cylinder(0.82, -0.04, 0.06, 32);
  const jewelGeo = cylinder(0.46, -0.08, 0.02, 24);
  const chatons = new THREE.InstancedMesh(chatonGeo, B.chaton, jewelPos.length);
  const jewels = new THREE.InstancedMesh(jewelGeo, B.ruby, jewelPos.length);
  const tmp = new THREE.Object3D();
  jewelPos.forEach(([x, y, z], i) => {
    tmp.position.set(x, y, z);
    tmp.updateMatrix();
    chatons.setMatrixAt(i, tmp.matrix);
    jewels.setMatrixAt(i, tmp.matrix);
  });
  parts.bridges.add(chatons, jewels);

  // tornillos azulados (instanciados): cabeza + ranura
  const screwPos = [
    [-3.4, 6.6, -2.62, 0.3],
    [4.9, 12.0, -2.62, 1.2],
    [-3.2, 12.6, -2.62, 2.2],
    [12.4, 3.6, -2.62, 0.7],
    [12.0, -4.7, -2.52, 1.7],
    [-8.0, -10.9, -2.97, 0.4],
    [-3.4, -11.3, -2.97, 2.6],
    [2.4, -11.0, -2.07, 1.1],
    [8.8, -9.7, -2.07, 0.2],
  ];
  const headGeo = cylinder(0.62, -0.28, 0, 28);
  const slotGeo = new THREE.BoxGeometry(1.3, 0.16, 0.12);
  slotGeo.translate(0, 0, -0.3);
  const heads = new THREE.InstancedMesh(headGeo, B.blued, screwPos.length);
  const slots = new THREE.InstancedMesh(slotGeo, B.dark, screwPos.length);
  screwPos.forEach(([x, y, z, rot], i) => {
    tmp.position.set(x, y, z);
    tmp.rotation.set(0, 0, rot);
    tmp.updateMatrix();
    heads.setMatrixAt(i, tmp.matrix);
    slots.setMatrixAt(i, tmp.matrix);
  });
  parts.bridges.add(heads, slots);

  /* ---------------------------------------------------------- micro-rotor */
  const rotorPivot = new THREE.Group();
  rotorPivot.position.set(...T01.rotor.p, 0);
  parts.rotor.add(rotorPivot);
  const rotorSpin = new THREE.Group();
  rotorPivot.add(rotorSpin);
  const R = mats.rotor;
  const [sector] = annularSectorShape(1.35, T01.rotor.r - 0.9, -1.75, 1.75);
  rotorSpin.add(new THREE.Mesh(extrudeAt(sector, -3.62, -3.1, bevel(0.08)), [R.gold, R.edge]));
  const [rim] = annularSectorShape(T01.rotor.r - 1.0, T01.rotor.r, -1.85, 1.85);
  rotorSpin.add(new THREE.Mesh(extrudeAt(rim, -3.8, -2.98, bevel(0.12)), [R.gold, R.edge]));
  rotorSpin.add(new THREE.Mesh(cylinder(1.4, -3.75, -1.4, 40), R.steel));
  const capRing = new THREE.Shape();
  capRing.absarc(0, 0, 1.25, 0, TAU, false);
  capRing.holes.push(circlePath(0, 0, 0.5, false));
  rotorPivot.add(new THREE.Mesh(extrudeAt(capRing, -3.95, -3.75, bevel(0.05)), [R.steel, R.edge]));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + 0.5;
    const sc = new THREE.Mesh(cylinder(0.26, -4.05, -3.85, 16), R.blued);
    sc.position.set(Math.cos(a) * 0.86, Math.sin(a) * 0.86, 0);
    rotorPivot.add(sc);
  }

  group.traverse((o) => {
    if (o.isMesh) o.castShadow = false;
  });

  /* -------------------------------------------------------- dinámica */
  const focusMaterials = {
    rotor: Object.values(mats.rotor),
    train: Object.values(mats.train),
    balance: Object.values(mats.balance),
    escape: Object.values(mats.escape),
    bridges: Object.values(mats.bridges),
    plate: Object.values(mats.plate),
  };
  const balanceDir = new THREE.Vector2(...T01.balance.p).normalize();
  const escapeDir = new THREE.Vector2(...T01.escape.p).normalize();
  const trainWheels = [
    [barrel, 7.2, -1 / 27],
    [centerW, 5.8, 1 / 9],
    [thirdW, 4.4, -1 / 3],
    [fourthW, 3.0, 1],
  ];
  const { frequency, amplitude, rotorPeriod } = MOTION.mechanics;
  let lastFocusKey = '';

  function update(tau, rig) {
    const ex = rig.explode;
    // despiece: la platina avanza, los puentes retroceden y el tren queda a la vista
    // ranuras a lo largo del eje (mm): platina +18 · tren +5 · escape −8 · volante −16 · puentes −28 · rotor −41
    parts.plate.position.z = ex.plate * 18;
    parts.bridges.position.z = -ex.plate * 26;
    parts.rotor.position.z = -ex.plate * 26 - ex.rotor * 12;
    trainWheels.forEach(([w, lift]) => {
      w.position.z = ex.train * (4 + lift * 0.35);
    });
    parts.balance.position.set(balanceDir.x * ex.balance * 1.5, balanceDir.y * ex.balance * 1.5, -ex.balance * 14);
    parts.escape.position.set(escapeDir.x * ex.escape * 1.2, escapeDir.y * ex.escape * 1.2, -ex.escape * 6.5);

    // --- mecánica en tiempo real ---
    const alive = rig.alive;
    const beatsF = tau * frequency * 2; // 6 alternancias por segundo
    const beats = Math.floor(beatsF);
    const frac = beatsF - beats;
    const step = beats + Math.min(1, frac / 0.16);
    wheelG.rotation.z = amplitude * alive * Math.sin(TAU * frequency * tau);
    spring.rotation.z = wheelG.rotation.z * 0.18;
    const breath = 1 + 0.03 * alive * Math.sin(TAU * frequency * tau);
    spring.scale.set(breath, breath, 1);

    escWheel.rotation.z = -step * (TAU / 30) - rig.trainSpin * 3;
    const side = beats % 2 === 0 ? 1 : -1;
    const k = Math.min(1, frac / 0.1);
    fork.rotation.z = forkAngle + 0.11 * (side * k - side * (1 - k));
    fourthW.rotation.z = -step * (TAU / 360) + rig.trainSpin;
    thirdW.rotation.z = (step * (TAU / 360)) / 7.5 - rig.trainSpin / 3;
    centerW.rotation.z = -(step * (TAU / 360)) / 60 + rig.trainSpin / 9;
    barrel.rotation.z = (step * (TAU / 360)) / 480 - rig.trainSpin / 27;
    // durante el despiece las ruedas giran levemente: transmiten mientras se separan
    trainWheels.forEach(([w, , ratio]) => {
      w.rotation.z += ex.train * 0.6 * ratio;
    });

    const rotorAngle = (tau / rotorPeriod) * TAU + rig.rotorSpin + ex.rotor * 2.2;
    rotorSpin.rotation.z = rotorAngle;
    ratchet.rotation.z = -rotorAngle / 14;
    crownWheel.rotation.z = (rotorAngle / 14) * (4.2 / 1.9);

    // --- foco por capítulo ---
    const f = rig.focus;
    const key = `${f.rotor.toFixed(3)}${f.train.toFixed(3)}${f.balance.toFixed(3)}${f.escape.toFixed(3)}${rig.dim.toFixed(3)}`;
    if (key !== lastFocusKey) {
      lastFocusKey = key;
      const dim = rig.dim;
      const lv = (x) => 1 - dim * (1 - x) * 0.72;
      const ctx = Math.max(f.rotor, f.train, f.balance, f.escape);
      const levels = {
        rotor: lv(f.rotor),
        train: lv(f.train),
        balance: lv(f.balance),
        escape: lv(f.escape),
        bridges: lv(ctx * 0.35),
        plate: lv(ctx * 0.25),
      };
      for (const [g, list] of Object.entries(focusMaterials)) list.forEach((m) => setFocus(m, levels[g]));
    }
  }

  return { group, parts, update };
}
