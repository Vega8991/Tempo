// Solucionador de cámara: coloca reloj y cámara a partir del estado del rig.
import * as THREE from 'three';
import { MOTION } from '../motion.config.js';
export { createRig, rigView, RIG_DEFAULTS } from './rigState.js';

const _target = new THREE.Vector3();
const DEG = Math.PI / 180;

/** Coloca reloj y cámara a partir del rig. width/height en píxeles CSS del lienzo. */
export function applyRig({ rig, watchRoot, camera, width, height, fov = MOTION.camera.fov }) {
  watchRoot.rotation.set(rig.rotX, rig.rotY, rig.rotZ);
  watchRoot.updateMatrixWorld(true);
  _target.set(rig.tx, rig.ty, rig.tz).applyMatrix4(watchRoot.matrixWorld);

  const aspect = width / height;
  const frameH = Math.max(rig.fitH, rig.fitW / aspect);
  const dist = frameH / 2 / Math.tan((fov / 2) * DEG);
  const el = rig.camEl;
  const az = rig.camAz;
  camera.fov = fov;
  camera.aspect = aspect;
  camera.position.set(
    _target.x + dist * Math.cos(el) * Math.sin(az),
    _target.y + dist * Math.sin(el),
    _target.z + dist * Math.cos(el) * Math.cos(az),
  );
  camera.lookAt(_target);
  camera.near = Math.max(1, dist - 140);
  camera.far = dist + 400;
  if (rig.shiftX || rig.shiftY) {
    camera.setViewOffset(width, height, -rig.shiftX * width, rig.shiftY * height, width, height);
  } else if (camera.view) {
    camera.clearViewOffset();
  }
  camera.updateProjectionMatrix();
  return dist;
}
