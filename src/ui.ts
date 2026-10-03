
export function setupUI(): void {
  setupTerminal();
  setupResponsiveFooterVideo();
}

function setupResponsiveFooterVideo(): void {
  const video = document.getElementById('footer-video') as HTMLVideoElement | null;
  if (!video) return;

  // A media query rather than a resize listener: mobile browsers fire resize
  // whenever the address bar shows or hides, and every reload restarts the clip.
  const mobile = window.matchMedia('(max-width: 768px)');
  let near = false;

  function load(): void {
    const src = mobile.matches ? '/images/footer-rocket-sm.mp4' : '/images/footer-rocket.mp4';
    // Compare the attribute — `.src` resolves to an absolute URL and never matches.
    if (!video || video.getAttribute('src') === src) return;
    video.src = src;
    video.play().catch(() => {
      // Autoplay refused (e.g. data saver); the footer reads fine without it.
    });
  }

  // Several megabytes of video — don't compete with the hero for bandwidth.
  new IntersectionObserver(
    (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      near = true;
      observer.disconnect();
      load();
    },
    { rootMargin: '0px 0px 100% 0px' }
  ).observe(video);

  mobile.addEventListener('change', () => {
    if (near) load();
  });
}

function setupTerminal(): void {
  const terminal = document.getElementById('terminal') as HTMLElement;
  const termText = document.getElementById('term-text') as HTMLElement;
  const trigger = document.getElementById('term-trigger') as HTMLElement;

  if (!terminal) return;

  const lines = [
    'status --check',
    '> systems nominal',
    '> propellant: KNDX ready',
    '> avionics: online',
    '> launch window: open',
    'echo "Taara is watching"',
    '> 🚀 T-minus counting...',
  ];

  let isOpen = false;

  function typeLines(lineIdx: number = 0, charIdx: number = 0): void {
    if (!isOpen || lineIdx >= lines.length) return;

    const line = lines[lineIdx];

    if (charIdx <= line.length) {
      const previousLines = lines
        .slice(0, lineIdx)
        .map((l) => l)
        .join('\n');
      const currentLine = line.slice(0, charIdx);
      const prefix = lineIdx > 0 ? '\n' : '';

      termText.textContent = previousLines + prefix + currentLine;
      setTimeout(() => typeLines(lineIdx, charIdx + 1), charIdx === line.length ? 700 : 35);
    } else {
      typeLines(lineIdx + 1, 0);
    }
  }

  function toggleTerminal(): void {
    isOpen = !isOpen;
    terminal.classList.toggle('show', isOpen);

    if (isOpen) {
      termText.textContent = '';
      typeLines();
    }
  }

  // Backtick key listener
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === '`') {
      toggleTerminal();
    }
  });

  // Click trigger
  if (trigger) {
    trigger.addEventListener('click', toggleTerminal);
  }
}
