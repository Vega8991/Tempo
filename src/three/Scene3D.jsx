import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { createStage } from './stage.js';
import { director } from '../lib/director.js';
import { downgradeTier } from '../lib/TierContext.jsx';
import { loadBrandFonts } from '../lib/fonts.js';
import { MOTION } from '../motion.config.js';

/**
 * Lienzo WebGL del Tempo Origen. frameloop="never": el render lo avanza el ticker de GSAP
 * a través del director, en el mismo frame que el DOM. aria-hidden: todo su contenido existe en HTML.
 */
export default function Scene3D({ tier, onReady }) {
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    loadBrandFonts().then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);
  const full = tier === 'full';
  return (
    <Canvas
      frameloop="never"
      dpr={[1, full ? MOTION.camera.dpr.full : MOTION.camera.dpr.lite]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
      shadows={full ? 'percentage' : false}
      camera={{ fov: MOTION.camera.fov, near: MOTION.camera.near, far: MOTION.camera.far, position: [0, 0, 300] }}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute('aria-hidden', 'true');
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          // al desmontar a propósito (p. ej. paso a movimiento reducido) R3F libera el contexto:
          // solo es un fallo si seguimos en un nivel con 3D
          const t = document.documentElement.dataset.tier;
          if (t === 'full' || t === 'lite') downgradeTier('static-lite');
        });
      }}
    >
      {fontsReady && <StageContents tier={tier} onReady={onReady} />}
    </Canvas>
  );
}

function StageContents({ tier, onReady }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const advance = useThree((s) => s.advance);
  const setDpr = useThree((s) => s.setDpr);
  const stageRef = useRef(null);
  const time = useRef(0);

  useFrame((state) => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.frame(time.current, director.rig, state.size.width, state.size.height, { ambient: 1, intro: director.intro });
  });

  useEffect(() => {
    const full = tier === 'full';
    const stage = createStage({ renderer: gl, scene, camera, quality: full ? 'full' : 'lite', shadows: full, dust: full });
    stageRef.current = stage;
    // gancho de QA (?qa): permite comprobar que el render se detiene fuera de las escenas 3D
    if (new URLSearchParams(window.location.search).has('qa')) window.__tempoGL = gl;
    let alive = true;
    let compiled = false;
    let announced = false;
    const el = gl.domElement;
    stage.frame(0, director.rig, el.clientWidth || window.innerWidth, el.clientHeight || window.innerHeight, { intro: director.intro });
    // compila todos los shaders antes del primer frame visible: sin tirón al aparecer
    Promise.resolve(gl.compileAsync ? gl.compileAsync(scene, camera) : null)
      .catch(() => null)
      .then(() => {
        compiled = true;
      });
    // resolución adaptativa: si los frames se alargan, el DPR baja por pasos (y sube si sobra margen)
    const maxDpr = Math.min(window.devicePixelRatio || 1, full ? MOTION.camera.dpr.full : MOTION.camera.dpr.lite);
    const minDpr = full ? 1 : 0.75;
    let dpr = maxDpr;
    let last = 0;
    let acc = 0;
    let n = 0;
    const adapt = (t) => {
      const dt = last ? t - last : 0;
      last = t;
      if (!dt || dt > 0.5) return; // pausas (pestaña oculta, escenario apagado) no cuentan
      acc += dt;
      n += 1;
      if (n < 40) return;
      const avg = acc / n;
      acc = 0;
      n = 0;
      const next = avg > 1 / 30 ? Math.max(minDpr, dpr - 0.25) : avg < 1 / 55 ? Math.min(maxDpr, dpr + 0.25) : dpr;
      if (next !== dpr) {
        dpr = next;
        setDpr(dpr);
      }
    };

    const off = director.onFrame((t) => {
      if (!alive || !compiled) return;
      if (announced && director.rig.stage < 0.003) {
        last = 0; // escenario oculto: render detenido
        return;
      }
      time.current = t;
      advance(t * 1000);
      adapt(t);
      if (!announced) {
        announced = true;
        onReady();
      }
    });
    return () => {
      alive = false;
      off();
      stage.dispose();
      stageRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera, tier]);

  return null;
}
