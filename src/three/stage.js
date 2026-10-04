// Montaje común de la escena: lo usan el lienzo en vivo (R3F) y el renderizador de imágenes fijas.
// Así el póster, los niveles sin WebGL y la experiencia 3D comparten luz, materiales y cámara.
import * as THREE from 'three';
import { buildWatch } from './model/buildWatch.js';
import { createStudioEnvironment } from './studio.js';
import { applyRig, rigView } from './rig.js';
import { MOTION } from '../motion.config.js';

export const RENDER = {
  toneMapping: THREE.AgXToneMapping,
  exposure: 1.3,
  keyIntensity: 1.6,
  keyColor: '#fff3e2',
};

export function configureRenderer(gl, { shadows = true } = {}) {
  gl.toneMapping = RENDER.toneMapping;
  gl.toneMappingExposure = RENDER.exposure;
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.shadowMap.enabled = shadows;
  gl.shadowMap.type = THREE.PCFShadowMap;
  gl.setClearColor(0x000000, 0);
}

/**
 * @param {{ renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera,
 *           quality: 'ultra'|'full'|'lite', shadows?: boolean, dust?: boolean }} opts
 */
export function createStage({ renderer, scene, camera, quality = 'full', shadows = true, dust = false }) {
  configureRenderer(renderer, { shadows });
  const envRT = createStudioEnvironment(renderer, { size: quality === 'lite' ? 128 : 256 });
  scene.environment = envRT.texture;
  scene.background = null;

  const key = new THREE.DirectionalLight(RENDER.keyColor, RENDER.keyIntensity);
  key.position.set(-80, 120, 150);
  key.target.position.set(0, 0, 0);
  key.castShadow = shadows;
  if (shadows) {
    key.shadow.mapSize.set(quality === 'ultra' ? 2048 : 1024, quality === 'ultra' ? 2048 : 1024);
    const c = key.shadow.camera;
    c.left = -26;
    c.right = 26;
    c.top = 26;
    c.bottom = -26;
    c.near = 120;
    c.far = 300;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 3;
  }
  scene.add(key, key.target);

  const watch = buildWatch({ quality });
  scene.add(watch.root);

  // polvo en suspensión (solo nivel FULL): casi imperceptible, dentro del haz de luz
  let dustPoints = null;
  const dustCount = 90;
  let dustBase = null;
  if (dust) {
    const pos = new Float32Array(dustCount * 3);
    dustBase = new Float32Array(dustCount * 4);
    for (let i = 0; i < dustCount; i++) {
      dustBase[i * 4] = (Math.random() - 0.5) * 150;
      dustBase[i * 4 + 1] = (Math.random() - 0.5) * 100;
      dustBase[i * 4 + 2] = -40 + Math.random() * 90;
      dustBase[i * 4 + 3] = Math.random() * 100;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    dustPoints = new THREE.Points(g, watch.materials.dust);
    dustPoints.frustumCulled = false;
    scene.add(dustPoints);
  }

  const breath = MOTION.ambient;

  /**
   * Avanza la escena a partir del rig. time en segundos.
   * ambient: 0..1 (0 con movimiento reducido) — respiración de luz y reflejos lentos.
   */
  function frame(time, rig, width, height, { ambient = 1, intro = { case: 1, dial: 1 } } = {}) {
    const b = 1 + Math.sin((time / breath.breathPeriod) * Math.PI * 2) * breath.breathAmount * ambient;
    const light = rig.light * b;
    scene.environmentIntensity = light * intro.case;
    // reflejos muy lentos: el estudio oscila ±7° en 28 s
    const drift = Math.sin((time / breath.envRotationPeriod) * Math.PI * 2) * 0.12 * ambient;
    scene.environmentRotation.set(rig.envTilt, rig.envRot + drift, 0);
    key.intensity = RENDER.keyIntensity * rig.key * light * intro.dial;
    watch.materials.dial.envMapIntensity = 0.9 * intro.dial;
    watch.update(time, rigView(rig));
    applyRig({ rig, watchRoot: watch.root, camera, width, height, fov: MOTION.camera.fov });

    if (dustPoints) {
      const p = dustPoints.geometry.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        const ph = dustBase[i * 4 + 3];
        p[i * 3] = dustBase[i * 4] + Math.sin(time * 0.07 + ph) * 6;
        p[i * 3 + 1] = dustBase[i * 4 + 1] + ((time * 1.6 + ph * 3) % 100) - 50;
        p[i * 3 + 2] = dustBase[i * 4 + 2] + Math.cos(time * 0.05 + ph) * 4;
      }
      dustPoints.geometry.attributes.position.needsUpdate = true;
      watch.materials.dust.opacity = 0.32 * rig.dust * ambient;
      dustPoints.visible = rig.dust * ambient > 0.01;
    }
  }

  function dispose() {
    watch.dispose();
    envRT.dispose();
    scene.environment = null;
    scene.remove(watch.root, key, key.target);
    key.dispose?.();
    if (dustPoints) {
      dustPoints.geometry.dispose();
      scene.remove(dustPoints);
    }
  }

  return { watch, key, frame, dispose };
}
