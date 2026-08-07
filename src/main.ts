/// <reference types="vite/client" />
import './style.css';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initBlackHole } from './blackhole';
import { setupAnimations, setupPreloader } from './animations';
import { setupComponents } from './components';
import { setupUI } from './ui';

gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  duration: 1.5,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
});

// Lenis RAF loop
function raf(time: number): void {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Scroll progress bar
const progBar = document.getElementById('scroll-prog') as HTMLElement;
window.addEventListener(
  'scroll',
  () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollHeight) * 100;
    progBar.style.width = scrolled + '%';
  },
  { passive: true }
);

// Initialize all modules
initBlackHole();
setupPreloader();
setupAnimations(lenis);
setupComponents(lenis);
setupUI();

export { lenis, gsap };
