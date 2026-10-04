// Director de la película: UNA timeline maestra cuya unidad de tiempo es el píxel de scroll.
//
// Cada escena registra sus keyframes (cámara, reloj, luz, despiece, foco) y sus leyendas HTML.
// El director agrupa los keyframes por propiedad, construye una pista de tweens por propiedad y
// reproduce la timeline con un cabezal amortiguado desde el ticker de GSAP. El mismo ticker
// avanza el render de WebGL: DOM y 3D se mueven en el mismo frame, sin desfase.
import { gsap, ScrollTrigger } from './gsap.js';
import { createRig } from '../three/rigState.js';
import { MOTION } from '../motion.config.js';

const EASES = {
  camera: MOTION.ease.camera,
  linear: 'none',
  in: 'power2.in',
  out: 'power2.out',
  inOut: 'power2.inOut',
  soft: 'sine.inOut',
  step: 'steps(1)',
};

class Director {
  constructor() {
    this.rig = createRig();
    this.intro = { case: 1, dial: 1 }; // multiplicadores de la entrada del hero (tiempo, no scroll)
    this.shots = new Map();
    this.tl = null;
    this.playhead = 0;
    this.rendered = -1;
    this.frameFns = new Set();
    this.rebuildFns = new Set();
    this.active = false;
    this.context = { layout: 'desktop', tier: 'full' };
    this.snapNext = true;
    this.maxScroll = 1;
    this._raf = 0;
    this.tick = this.tick.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  /** Registra una escena. build(ctx) añade keyframes y tweens. Devuelve la función de baja. */
  register(id, el, build) {
    this.shots.set(id, { el, build });
    this.schedule();
    return () => {
      this.shots.delete(id);
      this.schedule();
    };
  }

  schedule() {
    if (typeof window === 'undefined' || !this.active) return;
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => this.rebuild());
  }

  start(context) {
    this.context = { ...this.context, ...context };
    this.qa = new URLSearchParams(window.location.search).has('qa');
    if (!this.active) {
      this.active = true;
      gsap.ticker.add(this.tick);
      ScrollTrigger.addEventListener('refresh', this.onRefresh);
      // si la altura del documento cambia (imágenes, fuentes, formulario) las posiciones se vuelven a medir
      let lastH = document.documentElement.scrollHeight;
      let timer = 0;
      this.resizeObserver = new ResizeObserver(() => {
        const h = document.documentElement.scrollHeight;
        if (Math.abs(h - lastH) < 2) return;
        lastH = h;
        clearTimeout(timer);
        timer = setTimeout(() => ScrollTrigger.refresh(), 120);
      });
      this.resizeObserver.observe(document.body);
    }
    this.snapNext = true;
    this.schedule();
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    cancelAnimationFrame(this._raf);
    gsap.ticker.remove(this.tick);
    ScrollTrigger.removeEventListener('refresh', this.onRefresh);
    this.resizeObserver?.disconnect();
    if (this.tl) {
      this.tl.revert();
      this.tl.kill();
      this.tl = null;
    }
  }

  onRefresh() {
    if (this.active) this.rebuild();
  }

  rebuild() {
    if (this.tl) {
      this.tl.revert();
      this.tl.kill();
    }
    const tl = gsap.timeline({ paused: true });
    const vh = window.innerHeight;
    const scrollY = window.scrollY;
    this.maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    const tracks = new Map();
    const pushKey = (at, values, ease = 'camera') => {
      for (const [prop, v] of Object.entries(values)) {
        if (typeof v !== 'number') continue;
        if (!tracks.has(prop)) tracks.set(prop, []);
        tracks.get(prop).push({ at, v, ease });
      }
    };

    const measured = [...this.shots.entries()]
      .map(([id, s]) => {
        const r = s.el.getBoundingClientRect();
        return { id, ...s, top: r.top + scrollY, height: s.el.offsetHeight };
      })
      .sort((a, b) => a.top - b.top);

    for (const s of measured) {
      const start = s.top;
      const end = Math.max(s.top + s.height - vh, s.top + 1);
      const len = end - start;
      const ctx = {
        id: s.id,
        el: s.el,
        tl,
        vh,
        top: s.top,
        height: s.height,
        start,
        end,
        len,
        enter: s.top - vh,
        exit: s.top + s.height,
        layout: this.context.layout,
        tier: this.context.tier,
        at: (p) => start + p * len,
        // transiciones entre escenas, en alturas de viewport antes del inicio / después del final
        before: (x) => start - x * vh,
        after: (x) => end + x * vh,
        dur: (p) => Math.max(1, p * len),
        key: pushKey,
      };
      s.build(ctx);
    }

    for (const [prop, keys] of tracks) {
      keys.sort((a, b) => a.at - b.at);
      tl.set(this.rig, { [prop]: keys[0].v }, 0);
      for (let i = 1; i < keys.length; i++) {
        const a = keys[i - 1];
        const b = keys[i];
        const d = b.at - a.at;
        if (d <= 0.5) {
          tl.set(this.rig, { [prop]: b.v }, Math.max(0, b.at));
          continue;
        }
        tl.fromTo(
          this.rig,
          { [prop]: a.v },
          { [prop]: b.v, duration: d, ease: EASES[b.ease] || b.ease, immediateRender: false },
          Math.max(0, a.at),
        );
      }
    }
    tl.set({}, {}, this.maxScroll + vh);
    this.tl = tl;
    // una timeline nueva está en t = 0: GSAP no renderiza si el tiempo no cambia → forzar
    tl.time(this.playhead + 1, true);
    tl.time(this.playhead, true);
    this.rendered = -1;
    this.snapNext = true;
    this.tick(gsap.ticker.time, 16);
    this.rebuildFns.forEach((fn) => fn(this));
  }

  tick(time, deltaMs) {
    const target = window.scrollY;
    const dt = Math.min(0.1, (deltaMs || 16) / 1000);
    const diff = target - this.playhead;
    if (this.snapNext || this.qa || Math.abs(diff) > window.innerHeight * MOTION.film.snapDistance) {
      this.playhead = target;
      this.snapNext = false;
    } else {
      this.playhead += diff * (1 - Math.exp(-dt / MOTION.film.smoothing));
      if (Math.abs(target - this.playhead) < 0.05) this.playhead = target;
    }
    if (this.tl && this.playhead !== this.rendered) {
      this.tl.time(this.playhead, false);
      this.rendered = this.playhead;
    }
    for (const fn of this.frameFns) fn(time, dt);
  }

  /** Suscripción por frame (render 3D, línea de progreso…). */
  onFrame(fn) {
    this.frameFns.add(fn);
    return () => this.frameFns.delete(fn);
  }

  onRebuild(fn) {
    this.rebuildFns.add(fn);
    return () => this.rebuildFns.delete(fn);
  }

  /** Salto sin interpolar (navegación por índice): el siguiente frame coloca el cabezal en el destino. */
  snap() {
    this.snapNext = true;
  }

  get progress() {
    return Math.min(1, Math.max(0, this.playhead / this.maxScroll));
  }
}

export const director = new Director();
