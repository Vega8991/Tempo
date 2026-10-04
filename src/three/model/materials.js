// Materiales PBR del Tempo Origen. Un único lugar para color, rugosidad y metalicidad.
import * as THREE from 'three';
import {
  dialTextures,
  rehautTexture,
  casebackEngraving,
  blastedTexture,
  brushedTexture,
  leatherTextures,
  suedeTexture,
  cotesNormal,
  perlageNormal,
  rotorTextures,
} from './textures.js';

export const PALETTE = {
  titanium: '#a3a49f',
  titaniumPolished: '#c4c2bc',
  whiteGold: '#dedbd3',
  champagne: '#c9b48c',
  gold: '#d6b878',
  rotorGold: '#d1b27c',
  ruthenium: '#74757a',
  plate: '#3c3e42',
  steel: '#b0b3b7',
  blued: '#1f3f9e',
  ruby: '#8d0d1f',
  glucydur: '#c99c63',
  cognac: '#8a4a22',
};

/**
 * @param {'ultra'|'full'|'lite'} quality
 */
export function createMaterials(quality = 'full', dialRadius = 16.45) {
  const physical = quality !== 'lite';
  const tex = {
    dial: dialTextures(quality === 'ultra' ? 4096 : quality === 'full' ? 2048 : 1024, dialRadius),
    rehaut: rehautTexture(quality === 'lite' ? 2048 : 4096, quality === 'lite' ? 48 : 96),
    engraving: casebackEngraving(quality === 'lite' ? 2048 : 4096, quality === 'lite' ? 96 : 192),
    blasted: blastedTexture(256),
    brushed: brushedTexture(256),
    leather: leatherTextures({ pxPerMm: quality === 'ultra' ? 40 : quality === 'full' ? 24 : 14 }),
    suede: suedeTexture(256),
    cotes: cotesNormal(256),
    perlage: perlageNormal(quality === 'lite' ? 128 : 256),
    rotor: rotorTextures(quality === 'lite' ? 512 : 1024),
  };

  // repeticiones en mm (UV de extrusión = coordenadas en mm)
  tex.cotes.repeat.set(1 / 2.1, 1 / 2.1);
  tex.cotes.rotation = 0.62;
  tex.perlage.repeat.set(1 / 2.4, 1 / 2.4);

  const blastedCase = tex.blasted.clone();
  blastedCase.repeat.set(140, 8);
  blastedCase.needsUpdate = true;
  const blastedLug = tex.blasted.clone();
  blastedLug.repeat.set(1, 1);
  blastedLug.needsUpdate = true;

  const brushedRing = tex.brushed.clone();
  brushedRing.repeat.set(1, 6);
  brushedRing.needsUpdate = true;
  const brushedHand = tex.brushed.clone();
  brushedHand.repeat.set(1, 3);
  brushedHand.needsUpdate = true;

  const M = {};
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const phys = (o) => (physical ? new THREE.MeshPhysicalMaterial(o) : new THREE.MeshStandardMaterial(stripPhysical(o)));

  // --- caja -----------------------------------------------------------------
  M.titaniumBlasted = std({
    color: PALETTE.titanium,
    metalness: 1,
    roughness: 0.84,
    roughnessMap: blastedCase,
    bumpMap: blastedCase,
    bumpScale: 0.05,
  });
  M.titaniumBlastedLug = M.titaniumBlasted.clone();
  M.titaniumBlastedLug.roughnessMap = blastedLug;
  M.titaniumBlastedLug.bumpMap = blastedLug;

  M.titaniumPolished = std({ color: PALETTE.titaniumPolished, metalness: 1, roughness: 0.055 });

  M.titaniumBrushed = phys({
    color: PALETTE.titaniumPolished,
    metalness: 1,
    roughness: 0.42,
    roughnessMap: brushedRing,
    anisotropy: 0.85,
    anisotropyRotation: 0,
  });

  M.caseback = phys({
    color: '#b9b7b1',
    metalness: 1,
    roughness: 0.62,
    map: tex.engraving.map,
    roughnessMap: tex.engraving.bumpRough,
    bumpMap: tex.engraving.bumpRough,
    bumpScale: 1.4,
    anisotropy: 0.7,
  });

  // cristal de zafiro AR: solo reflejos (aditivo) → barato y fotográfico
  M.sapphire = new THREE.MeshPhysicalMaterial({
    color: '#000000',
    metalness: 0,
    roughness: 0.03,
    specularIntensity: 1,
    specularColor: new THREE.Color('#e2e4f2'),
    ior: 1.77,
    envMapIntensity: 0.2,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // --- esfera -----------------------------------------------------------------
  M.dial = std({
    map: tex.dial.map,
    roughnessMap: tex.dial.bumpRough,
    bumpMap: tex.dial.bumpRough,
    bumpScale: 0.06,
    metalness: 0.0,
    roughness: 1,
    envMapIntensity: 0.9,
  });
  M.rehaut = std({ map: tex.rehaut, metalness: 0.1, roughness: 0.55 });
  M.index = std({ color: PALETTE.whiteGold, metalness: 1, roughness: 0.045 });
  M.handFacet = phys({
    color: PALETTE.whiteGold,
    metalness: 1,
    roughness: 0.3,
    roughnessMap: brushedHand,
    anisotropy: 0.9,
    anisotropyRotation: 0,
  });
  M.handEdge = std({ color: PALETTE.whiteGold, metalness: 1, roughness: 0.05 });
  M.secondsHand = std({ color: '#cfcbc2', metalness: 1, roughness: 0.18 });
  M.accent = std({ color: PALETTE.champagne, metalness: 1, roughness: 0.22 });

  // --- correa -----------------------------------------------------------------
  M.leather = std({
    map: tex.leather.map,
    roughnessMap: tex.leather.bumpRough,
    bumpMap: tex.leather.bumpRough,
    bumpScale: 0.5,
    metalness: 0,
    roughness: 1.25,
  });
  tex.suede.repeat.set(4, 8);
  M.cognac = std({
    color: PALETTE.cognac,
    roughnessMap: tex.suede,
    bumpMap: tex.suede,
    bumpScale: 0.8,
    metalness: 0,
    roughness: 1,
  });

  // --- calibre T-01 -------------------------------------------------------------
  M.plate = std({
    color: PALETTE.plate,
    metalness: 1,
    roughness: 0.42,
    normalMap: tex.perlage,
    normalScale: new THREE.Vector2(0.22, 0.22),
  });
  M.bridge = std({
    color: PALETTE.ruthenium,
    metalness: 1,
    roughness: 0.42,
    normalMap: tex.cotes,
    normalScale: new THREE.Vector2(0.22, 0.22),
  });
  M.anglage = std({ color: '#ddd8ce', metalness: 1, roughness: 0.05 });
  M.gold = std({ color: PALETTE.gold, metalness: 1, roughness: 0.2 });
  M.goldPolished = std({ color: PALETTE.gold, metalness: 1, roughness: 0.07 });
  M.rotor = std({
    color: PALETTE.rotorGold,
    map: tex.rotor.map,
    metalness: 1,
    roughness: 0.24,
    normalMap: tex.rotor.normal,
    normalScale: new THREE.Vector2(0.35, 0.35),
  });
  M.steel = std({ color: PALETTE.steel, metalness: 1, roughness: 0.1 });
  M.steelDark = std({ color: '#8a8d93', metalness: 1, roughness: 0.3 });
  M.blued = std({ color: PALETTE.blued, metalness: 1, roughness: 0.16 });
  M.ruby = phys({
    color: PALETTE.ruby,
    metalness: 0,
    roughness: 0.04,
    ior: 1.77,
    specularIntensity: 1,
    envMapIntensity: 1.8,
    emissive: '#2a0006',
  });
  M.glucydur = std({ color: PALETTE.glucydur, metalness: 1, roughness: 0.16 });

  M.dust = new THREE.PointsMaterial({
    color: '#d9cbb0',
    size: 0.35,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return { M, tex };
}

function stripPhysical(o) {
  const { anisotropy, anisotropyRotation, specularIntensity, specularColor, ior, ...rest } = o;
  return rest;
}

/** Clona materiales para un grupo de foco y guarda el color base para atenuar. */
export function focusClone(mat) {
  const m = mat.clone();
  m.userData.baseColor = m.color.clone();
  m.userData.baseEnv = m.envMapIntensity ?? 1;
  m.userData.baseEmissive = m.emissive ? m.emissive.clone() : null;
  return m;
}

export function setFocus(mat, k) {
  if (!mat.userData.baseColor) return;
  mat.color.copy(mat.userData.baseColor).multiplyScalar(k);
  if (mat.userData.baseEmissive) mat.emissive.copy(mat.userData.baseEmissive).multiplyScalar(k);
}

export function makeFadeable(mat) {
  const m = mat.clone();
  m.transparent = true;
  m.userData.fade = true;
  return m;
}
