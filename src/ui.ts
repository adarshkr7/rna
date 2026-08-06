
export function setupUI(): void {
  setupTerminal();
  setupResponsiveFooterVideo();
}

function setupResponsiveFooterVideo(): void {
  const video = document.getElementById('footer-video') as HTMLVideoElement;
  if (!video) return;

  function updateVideoSource(): void {
    const isMobile = window.innerWidth <= 768;
    const src = isMobile ? '/public/src/footer-rocket-sm.mp4' : '/public/src/footer-rocket.mp4';
    const currentSrc = video.querySelector('source')?.src;
    
    if (currentSrc !== src) {
      const source = video.querySelector('source') as HTMLSourceElement;
      if (source) {
        source.src = src;
        video.load();
      }
    }
  }

  // Initial setup
  updateVideoSource();
  
  // Listen for window resize
  window.addEventListener('resize', updateVideoSource);
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
