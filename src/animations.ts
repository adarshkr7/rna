import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { initRocket } from './rocket';

gsap.registerPlugin(ScrollTrigger);

export function setupPreloader(): void {
  const txt = document.getElementById('preloader-pct') as HTMLElement;
  const bar = document.getElementById('preloader-bar') as HTMLElement;
  const el = document.getElementById('preloader') as HTMLElement;

  interface ProgressObject {
    v: number;
  }

  const p: ProgressObject = { v: 0 };

  gsap.to(p, {
    v: 100,
    duration: 2.4,
    ease: 'power2.inOut',
    onUpdate() {
      const n = Math.round(p.v);
      txt.textContent = n + '%';
      bar.style.width = n + '%';
    },
    onComplete() {
      gsap.to(el, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1,
        ease: 'power4.inOut',
        onComplete() {
          el.style.display = 'none';
          heroIn();
        },
      });
    },
  });
}

function heroIn(): void {
  const tl = gsap.timeline();

  tl.to('#main-nav', { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0);
  tl.to('.hero-eyebrow', { opacity: 1, duration: 1, ease: 'power3.out' }, 0.1);
  tl.to(
    '.hero-word',
    { y: 0, opacity: 1, duration: 1.4, ease: 'power4.out', stagger: 0.08 },
    0.2
  );
  tl.to('.hero-bar', { opacity: 1, duration: 1, ease: 'power2.out' }, 1);

  setTimeout(() => {
    const snav = document.getElementById('snav');
    if (snav) snav.classList.add('show');
  }, 2200);
}

export function setupAnimations(lenis: Lenis): void {
  const rocket = initRocket('scrolling-rocket');
  const rocketDeg = document.getElementById('rs-deg');

  // Rocket scroll animation — scroll position drives the model's rotation
  gsap.timeline({
    scrollTrigger: {
      trigger: '#rocket-scroll',
      start: 'top top',
      end: '+=4000',
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
      onUpdate({ progress }) {
        if (!rocket) return;
        const spin = progress * Math.PI * 4;
        rocket.setSpin(spin);
        if (rocketDeg) {
          const deg = ((spin * 180) / Math.PI) % 360;
          rocketDeg.textContent = `${deg.toFixed(1).padStart(5, '0')}°`;
        }
      },
    },
  })
    .fromTo(
      '#scrolling-rocket',
      { y: '110vh', scale: 0.4, opacity: 0, filter: 'blur(8px)' },
      { y: '0%', scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }
    )
    .to('#scrolling-rocket', { scale: 1.5, duration: 2, ease: 'none' })
    .to('#scrolling-rocket', {
      y: '-140vh',
      opacity: 0.5,
      filter: 'blur(4px)',
      duration: 1.2,
      ease: 'power2.in',
    });

  // Reveal up animations
  gsap.utils.toArray('.reveal-up').forEach((el: any) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.3,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
      },
    });
  });

  // Works grid stagger
  gsap.utils.toArray('.wc').forEach((el: any, i: number) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.1,
        ease: 'power4.out',
        delay: i * 0.06,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
        },
      }
    );
  });

  // Principles stagger
  gsap.utils.toArray('.p-item').forEach((el: any, i: number) => {
    gsap.fromTo(
      el,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
      }
    );
  });

  // Footer wordmark animation
  gsap.to('.footer-wordmark-text', {
    y: 0,
    duration: 1.4,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: 'footer',
      start: 'top 70%',
    },
  });

  // Cinematic horizontal scroll
  setupCinematicScroll();

  // Progress timeline
  setupProgressTimeline();
}

function setupCinematicScroll(): void {
  const track = document.getElementById('cin-track') as HTMLElement;
  const section = document.getElementById('cinematic') as HTMLElement;
  const bar = document.getElementById('cin-bar') as HTMLElement;

  if (!track) return;

  const panels = track.querySelectorAll('.cin-panel');
  const total = (panels.length - 1) * window.innerWidth;

  section.style.height = panels.length * 100 + 'vh';

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: '#cin-sticky',
      scrub: 1,
      onUpdate(self) {
        if (bar) bar.style.width = self.progress * 100 + '%';

        panels.forEach((p, i) => {
          const bg = p.querySelector('.cin-bg') as HTMLElement;
          if (bg) {
            const offset = (self.progress * total) / window.innerWidth - i;
            const clampedOffset = Math.min(Math.max(offset * 15, -15), 15);
            bg.style.transform = `translateX(${clampedOffset}px) scale(1.08)`;
          }
        });
      },
    },
  }).to(track, { x: -total, ease: 'none', duration: 1 });
}

function setupProgressTimeline(): void {
  const items = document.querySelectorAll('.tl-item');
  
  // Reveal items as user scrolls
  items.forEach((item: any) => {
    gsap.from(item, {
      opacity: 0,
      x: -30,
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        end: 'top 60%',
        scrub: 0.5,
      },
    });
  });
}


