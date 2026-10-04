// Registro único de GSAP y plugins. Todo el proyecto importa desde aquí.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // la barra de direcciones de iOS no debe recalcular escenas
  ScrollTrigger.config({ ignoreMobileResize: true });
  // QA en navegadores sin GPU (render por software): el tiempo no se estira con los frames lentos
  const qa = new URLSearchParams(window.location.search).has('qa');
  gsap.ticker.lagSmoothing(qa ? 0 : 500, 33);
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
