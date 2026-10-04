// Detección del nivel de movimiento. Se inyecta en <head> (antes de pintar) para que el layout
// de cada nivel esté decidido desde el primer frame (sin CLS). Sin imports: se serializa tal cual.
export function detectTier() {
  var d = document.documentElement;
  var t = 'full';
  try {
    var q = new URLSearchParams(location.search).get('tier');
    var valid = { full: 1, lite: 1, 'static-lite': 1, static: 1 };
    if (q && valid[q]) t = q;
    else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) t = 'static';
    else {
      var n = navigator;
      var c = n.connection || {};
      var mem = n.deviceMemory || 8;
      var cores = n.hardwareConcurrency || 8;
      var gl = typeof window.WebGL2RenderingContext !== 'undefined' || typeof window.WebGLRenderingContext !== 'undefined';
      var coarse = window.matchMedia('(pointer: coarse)').matches;
      if (c.saveData || !gl || cores <= 2 || mem <= 2) t = 'static-lite';
      else if (coarse || cores < 6 || mem < 8 || window.innerWidth < 900) t = 'lite';
    }
  } catch (e) {
    t = 'static';
  }
  d.setAttribute('data-tier', t);
  d.classList.remove('no-js');
  d.classList.add('js');
  // red de seguridad: si la aplicación no arranca, todo el contenido queda visible en modo estático
  window.setTimeout(function () {
    if (!d.classList.contains('app-ready')) {
      d.setAttribute('data-tier', 'static');
      d.classList.add('app-failed');
    }
  }, 8000);
  return t;
}
