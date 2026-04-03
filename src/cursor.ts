export function initCursor(): void {
  const dot = document.querySelector('.cursor-dot') as HTMLElement;
  const ring = document.querySelector('.cursor-ring') as HTMLElement;

  let mx = 0;
  let my = 0;
  let rx = 0;
  let ry = 0;

  // Track mouse position
  window.addEventListener('mousemove', (e: MouseEvent) => {
    mx = e.clientX;
    my = e.clientY;

    if (dot) {
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    }
  });

  // Cursor click state
  window.addEventListener('mousedown', () => {
    document.body.classList.add('cursor-click');
  });

  window.addEventListener('mouseup', () => {
    document.body.classList.remove('cursor-click');
  });

  // Smooth ring following
  function updateRing(): void {
    if (ring) {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
    }
    requestAnimationFrame(updateRing);
  }

  updateRing();

  // Hover state on interactive elements
  const interactiveElements = document.querySelectorAll(
    'a, button, .wc, .cin-panel'
  );

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hovered');
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovered');
    });
  });
}

export function initMouseTrail(): void {
  const canvas = document.getElementById('mouse-trail') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  interface TrailPoint {
    x: number;
    y: number;
    r: number;
    life: number;
  }

  const points: TrailPoint[] = [];
  let mx = 0;
  let my = 0;

  window.addEventListener('mousemove', (e: MouseEvent) => {
    mx = e.clientX;
    my = e.clientY;
    points.push({ x: mx, y: my, r: 3, life: 1 });
  });

  function draw(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i];
      p.life -= 0.05;
      p.r *= 0.94;

      if (p.life <= 0) {
        points.splice(i, 1);
        continue;
      }

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      g.addColorStop(0, `rgba(77,232,160,${p.life * 0.4})`);
      g.addColorStop(1, 'rgba(77,232,160,0)');

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  draw();
}
