// Estudio fotográfico procedural: softboxes y tiras emisivas renderizadas a un PMREM.
// Sustituye a un HDRI descargado (0 KB) y permite controlar exactamente dónde cae cada reflejo.
import * as THREE from 'three';

const PANELS = [
  // [ancho, alto, posición, intensidad, color]
  { w: 300, h: 150, pos: [-140, 260, 170], i: 2.2, c: '#fff6ec', name: 'principal' }, // softbox cenital-izquierda
  { w: 46, h: 420, pos: [-330, 30, 60], i: 3.4, c: '#f4f6ff', name: 'tira-izq' }, // tira vertical: línea de luz en el bisel
  { w: 30, h: 420, pos: [330, 10, -60], i: 2.0, c: '#ffffff', name: 'tira-der' },
  { w: 460, h: 26, pos: [0, 210, -320], i: 2.6, c: '#ffffff', name: 'recorte' }, // contraluz para la silueta
  { w: 420, h: 220, pos: [0, -60, 420], i: 0.12, c: '#ffffff', name: 'relleno' },
  { w: 140, h: 90, pos: [250, -150, -170], i: 3.2, c: '#ffbf7a', name: 'calido' }, // reflejos champagne
  { w: 900, h: 900, pos: [0, -340, 0], i: 0.035, c: '#ffffff', name: 'suelo', floor: true },
];

export function createStudioEnvironment(renderer, { size = 256 } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#000000');
  const geo = new THREE.PlaneGeometry(1, 1);
  const created = [];
  for (const p of PANELS) {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(p.c).multiplyScalar(p.i), side: THREE.DoubleSide });
    mat.toneMapped = false;
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(p.w, p.h, 1);
    m.position.set(...p.pos);
    if (p.floor) m.rotation.x = -Math.PI / 2;
    else m.lookAt(0, 0, 0);
    scene.add(m);
    created.push(mat);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(scene, 0.015, 1, 2000, { size });
  pmrem.dispose();
  geo.dispose();
  created.forEach((m) => m.dispose());
  return rt; // rt.texture es el mapa de entorno
}
