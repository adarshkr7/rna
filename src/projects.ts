/// <reference types="vite/client" />
import './style.css';
import Lenis from '@studio-freight/lenis';

const lenis = new Lenis({ duration: 1.2, smoothWheel: true });

function raf(time: number): void {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Solid bar once the page is scrolled, matching the home page.
const nav = document.getElementById('main-nav');
if (nav) {
  const onScroll = (): void => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Cards fade up as they arrive. A plain observer rather than ScrollTrigger —
// this page has no pinning or scrubbing to coordinate with.
const observer = new IntersectionObserver(
  (entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      obs.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -12% 0px' }
);

for (const el of document.querySelectorAll('.reveal')) observer.observe(el);
