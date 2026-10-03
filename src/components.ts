import { gsap } from 'gsap';
import type Lenis from '@studio-freight/lenis';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!';

function scrambleText(el: HTMLElement): void {
  const orig = el.dataset.text || el.textContent || '';
  let frame = 0;
  const totalFrames = 22;

  const interval = setInterval(() => {
    el.textContent = orig
      .split('')
      .map((ch, i) => {
        if (ch === ' ') return ' ';
        if (frame / totalFrames > i / orig.length) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join('');

    if (frame++ >= totalFrames) {
      el.textContent = orig;
      clearInterval(interval);
    }
  }, 40);
}

export function setupComponents(lenis?: Lenis): void {
  setupTextScramble();
  setupAnimatedCounters();
  setupMagneticElements();
  setup3DTilt();
  setupSectionNav(lenis);
  setupNav(lenis);
}

function setupNav(lenis?: Lenis): void {
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!nav) return;

  // Solid backing once the bar is over content — without it the marquee reads
  // straight through the links.
  const onScroll = (): void => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const closeMenu = (): void => {
    document.body.classList.remove('menu-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open menu');
    lenis?.start();
  };

  // Targets are data attributes rather than `href="#id"`, so navigating the
  // page never writes a fragment into the address bar.
  const goTo = (id: string): void => {
    const target = document.getElementById(id);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else target.scrollIntoView({ behavior: 'smooth' });
  };

  const explore = document.getElementById('explore-btn');
  explore?.addEventListener('click', () => {
    window.location.href = '/projects.html';
  });

  for (const el of document.querySelectorAll<HTMLElement>('[data-target]')) {
    el.addEventListener('click', () => {
      const id = el.dataset.target;
      if (!id) return;
      closeMenu();
      goTo(id);
    });
  }

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      // Keep the page still behind the overlay; `lenis-stopped` also locks
      // native touch scrolling via the stylesheet.
      if (open) lenis?.stop();
      else lenis?.start();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // Highlight whichever section is currently in view.
  const links = Array.from(nav.querySelectorAll<HTMLElement>('.nav-links .nav-link'));
  for (const link of links) {
    const target = document.getElementById(link.dataset.target || '');
    if (!target) continue;

    new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        for (const other of links) other.classList.remove('is-active');
        link.classList.add('is-active');
      },
      { rootMargin: '-45% 0px -45% 0px' }
    ).observe(target);
  }
}

function setupTextScramble(): void {
  document.querySelectorAll('.scramble').forEach((el) => {
    const htmlEl = el as HTMLElement;

    htmlEl.addEventListener('mouseenter', () => {
      scrambleText(htmlEl);
    });

    new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            scrambleText(htmlEl);
          }, 400);
        }
      },
      { threshold: 0.5 }
    ).observe(htmlEl);
  });
}

/** English ordinal suffix, so a count passing 1–3 doesn't read "1th". */
function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
}

function setupAnimatedCounters(): void {
  document.querySelectorAll('.counter').forEach((el) => {
    const htmlEl = el as HTMLElement;
    const target = parseInt(htmlEl.dataset.target || '0', 10);
    const suffix = htmlEl.dataset.suffix || '';
    let done = false;

    new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !done) {
          done = true;
          let start = 0;

          const countUp = (timestamp: number): void => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / 1800, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const n = Math.round(easeProgress * target);
            htmlEl.textContent = n + (suffix === 'th' ? ordinal(n) : suffix);

            if (progress < 1) {
              requestAnimationFrame(countUp);
            }
          };

          requestAnimationFrame(countUp);
        }
      },
      { threshold: 0.5 }
    ).observe(htmlEl);
  });
}

function setupMagneticElements(): void {
  const elements = [
    document.getElementById('explore-btn'),
    document.getElementById('nav-dot-mag'),
  ];

  elements.forEach((el) => {
    if (!el) return;

    el.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1,.4)',
      });
    });
  });
}

function setup3DTilt(): void {
  document.querySelectorAll('.wc').forEach((card) => {
    const htmlCard = card as HTMLElement;

    htmlCard.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = htmlCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const tiltX = -y * 8;
      const tiltY = x * 8;

      gsap.to(htmlCard, {
        rotationX: tiltX,
        rotationY: tiltY,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 800,
      });

      const glare = htmlCard.querySelector('.wc-glare') as HTMLElement;
      if (glare) {
        glare.style.background = `radial-gradient(circle at ${(x + 1) * 50}% ${(y + 1) * 50}%, rgba(240, 180, 106,.12) 0%, transparent 60%)`;
      }
    });

    htmlCard.addEventListener('mouseleave', () => {
      gsap.to(htmlCard, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.7,
        ease: 'elastic.out(1,.4)',
      });
    });
  });
}

function setupSectionNav(lenis?: Lenis): void {
  const snavDots = document.querySelectorAll('.sd');

  snavDots.forEach((dot) => {
    const htmlDot = dot as HTMLElement;
    const dataTarget = htmlDot.dataset.t;

    htmlDot.addEventListener('click', () => {
      const targetEl = document.querySelector<HTMLElement>(dataTarget || '');
      if (!targetEl) return;
      if (lenis) lenis.scrollTo(targetEl, { duration: 1.5 });
      else targetEl.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Intersection observer for section dots
  document.querySelectorAll('[data-s]').forEach((sec, i) => {
    const htmlSec = sec as HTMLElement;
    const sectionIndex = i;

    new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          snavDots.forEach((dot, j) => {
            (dot as HTMLElement).classList.toggle('on', j === sectionIndex);
          });
        }
      },
      { threshold: 0.4 }
    ).observe(htmlSec);
  });
}
