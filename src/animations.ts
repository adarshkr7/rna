import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { initRocket } from './rocket';
import { initSpaceField } from './spacefield';

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
  initSpaceField('rocket-field');
  const rocket = initRocket('scrolling-rocket');
  const rocketDeg = document.getElementById('rs-deg');

  // Rocket scroll animation. The pinned range runs in two phases: the vehicle
  // flies together from separate sections while sitting on the planet, then
  // launches — the rocket climbing and the planet falling by the same distance.
  const ASSEMBLE_END = 0.45;
  const LAUNCH_VH = 105;

  // Park the horizon just under the nozzle so the vehicle stands on the planet.
  // Measured rather than set as a percentage: the SVG is letterboxed inside its
  // mount, and whether it fits by width or height flips with the viewport, so a
  // fixed percentage seats correctly on one screen and floats on another.
  function seatEarth(): void {
    const bell = document.querySelector('.rkt-bell');
    const earth = document.getElementById('rocket-earth');
    const mount = document.getElementById('scrolling-rocket');
    const section = document.getElementById('rocket-scroll');
    if (!bell || !earth || !mount || !section) return;

    const mountRect = mount.getBoundingClientRect();
    // Offset of the nozzle inside its mount is fixed, so this stays correct
    // even once the launch tween has translated the mount.
    const nozzleInMount = bell.getBoundingClientRect().bottom - mountRect.top;
    const restTop = section.clientHeight / 2 - mountRect.height / 2;
    earth.style.top = `${(restTop + nozzleInMount - 14).toFixed(1)}px`;
  }

  // Centre both through GSAP rather than CSS. GSAP folds a CSS `translate`
  // shorthand into its own transform and drops a component — that is what left
  // the rocket sitting half its height below where the styles put it.
  gsap.set('#scrolling-rocket', { xPercent: -50, yPercent: -50 });
  gsap.set('#rocket-earth', { xPercent: -50 });

  seatEarth();
  let seatTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(seatTimer);
    seatTimer = window.setTimeout(seatEarth, 150);
  });

  const rocketTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#rocket-scroll',
      start: 'top top',
      end: '+=5600',
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
      onUpdate({ progress }) {
        if (!rocket) return;
        // Held at zero while it builds, so the parts land on a still vehicle.
        const t = Math.max(0, (progress - ASSEMBLE_END) / (1 - ASSEMBLE_END));
        const spin = t * Math.PI * 4;
        rocket.setSpin(spin);
        if (rocketDeg) {
          const deg = ((spin * 180) / Math.PI) % 360;
          rocketDeg.textContent = `${deg.toFixed(1).padStart(5, '0')}°`;
        }
      },
    },
  });

  // Timeline runs on a 0–10 scale; assembly occupies the first 4.5 units to
  // match ASSEMBLE_END above.
  rocketTl.fromTo('#scrolling-rocket', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' }, 0);

  if (rocket) {
    const { nose, body, aft, fins, surface, labels } = rocket.parts;
    const land = 'power2.out';

    rocketTl
      .fromTo(body, { x: -320, opacity: 0 }, { x: 0, opacity: 1, duration: 1.5, ease: land }, 0.15)
      .fromTo(nose, { y: -360, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: land }, 0.7)
      .fromTo(aft, { y: 340, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: land }, 1.25)
      .fromTo(fins, { x: 320, opacity: 0 }, { x: 0, opacity: 1, duration: 1.4, ease: land }, 1.8)
      .fromTo(surface, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'none' }, 2.7)
      // Callouts name each section as it arrives, then clear before launch.
      .fromTo(
        labels,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, stagger: 0.45, ease: 'none' },
        0.9
      )
      .to(labels, { opacity: 0, duration: 0.45, ease: 'none' }, 4.0);
  }

  // Phase two — launch. Both targets ride one tween with a function-based value
  // so they share a single timing source: separate tweens drifted out of step
  // and the planet fell slower than the rocket climbed.
  rocketTl
    .fromTo(
      ['#scrolling-rocket', '#rocket-earth'],
      // Explicit zero start: left to infer it, GSAP recorded a non-zero offset
      // for the planet and it fell at roughly half the rocket's rate.
      { y: 0 },
      {
        y: (i: number) => (i === 0 ? `-${LAUNCH_VH}vh` : `${LAUNCH_VH}vh`),
        duration: 4.5,
        ease: 'none',
      },
      4.5
    )
    // Debris falls at a fraction of the planet's rate — parallax reads as depth.
    .fromTo(
      '#rocket-field',
      { y: 0 },
      { y: `${LAUNCH_VH * 0.28}vh`, duration: 4.5, ease: 'none' },
      4.5
    )
    .to(
      '#scrolling-rocket',
      { opacity: 0.45, filter: 'blur(3px)', duration: 1.0, ease: 'power2.in' },
      9.0
    );

  setupTimeline();

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



/**
 * Timeline: the spine fills as the log scrolls past, and each entry lights up
 * its node once it reaches the reading line.
 */
function setupTimeline(): void {
  const track = document.querySelector<HTMLElement>('.tl');
  const spine = document.querySelector<HTMLElement>('.tl-spine');
  const fill = document.querySelector('.tl-spine-fill');
  const rows = Array.from(document.querySelectorAll<HTMLElement>('.tl-row'));
  if (!track || !spine || !fill || rows.length === 0) return;

  const nodes = rows.map((r) => r.querySelector<HTMLElement>('.tl-node')).filter(Boolean) as HTMLElement[];
  const lastRow = rows[rows.length - 1];

  /** Run the rail between the first and last node rather than the full block,
   *  so it terminates on the final milestone instead of trailing past it. */
  function fitSpine(): void {
    if (nodes.length < 2) return;
    const top = track!.getBoundingClientRect().top;
    const centre = (n: HTMLElement): number => {
      const r = n.getBoundingClientRect();
      return r.top + r.height / 2 - top;
    };
    const from = centre(nodes[0]);
    spine!.style.top = `${from.toFixed(1)}px`;
    spine!.style.bottom = 'auto';
    spine!.style.height = `${(centre(nodes[nodes.length - 1]) - from).toFixed(1)}px`;
  }

  fitSpine();

  gsap.fromTo(
    fill,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: track,
        start: 'top 72%',
        // Completes as the final entry reaches the same reading line the first
        // one started at, so the fill lands exactly on the last node.
        endTrigger: lastRow,
        end: 'top 72%',
        scrub: 0.6,
      },
    }
  );

  let fitTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(fitTimer);
    fitTimer = window.setTimeout(() => {
      fitSpine();
      ScrollTrigger.refresh();
    }, 150);
  });

  for (const row of rows) {
    new IntersectionObserver(
      (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        row.classList.add('is-live');
        observer.disconnect();
      },
      { rootMargin: '0px 0px -28% 0px' }
    ).observe(row);
  }
}
