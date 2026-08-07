/**
 * Drifting debris for the rocket section — dust motes and tumbling asteroids.
 *
 * Every element animates on transform alone and nothing runs per frame in JS,
 * so the field costs the compositor rather than the main thread. Positions come
 * from a seeded generator so the layout is stable across reloads.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

const DOTS = 46;
const ROCKS = 6;

function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Irregular silhouette — a circle with the radius jittered at each vertex. */
function rockPoints(radius: number, vertices: number, rand: () => number): string {
  const pts: string[] = [];
  for (let i = 0; i < vertices; i++) {
    const angle = (i / vertices) * Math.PI * 2;
    const r = radius * (0.6 + rand() * 0.58);
    pts.push(`${(Math.cos(angle) * r).toFixed(1)},${(Math.sin(angle) * r).toFixed(1)}`);
  }
  return pts.join(' ');
}

export function initSpaceField(mountId: string): void {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const rand = rng(70311);
  const frag = document.createDocumentFragment();

  for (let i = 0; i < DOTS; i++) {
    const dot = document.createElement('div');
    dot.className = 'sf-dot';
    const size = (0.9 + rand() * 2.2).toFixed(2);
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${(2 + rand() * 96).toFixed(2)}%`;
    dot.style.top = `${(2 + rand() * 74).toFixed(2)}%`;
    dot.style.opacity = (0.14 + rand() * 0.62).toFixed(2);
    // Alternating drift means the loop never snaps back to its start.
    dot.style.setProperty('--dx', `${(rand() * 60 - 30).toFixed(1)}px`);
    dot.style.setProperty('--dy', `${(rand() * 50 - 25).toFixed(1)}px`);
    dot.style.animationDuration = `${(9 + rand() * 16).toFixed(1)}s`;
    dot.style.animationDelay = `-${(rand() * 12).toFixed(1)}s`;
    frag.appendChild(dot);
  }

  for (let i = 0; i < ROCKS; i++) {
    const rock = document.createElement('div');
    rock.className = 'sf-rock';
    rock.style.left = `${(4 + rand() * 88).toFixed(2)}%`;
    rock.style.top = `${(4 + rand() * 62).toFixed(2)}%`;
    rock.style.opacity = (0.3 + rand() * 0.45).toFixed(2);
    rock.style.setProperty('--dx', `${(rand() * 90 - 45).toFixed(1)}px`);
    rock.style.setProperty('--dy', `${(rand() * 70 - 35).toFixed(1)}px`);
    rock.style.animationDuration = `${(16 + rand() * 20).toFixed(1)}s`;
    rock.style.animationDelay = `-${(rand() * 14).toFixed(1)}s`;

    const radius = 7 + rand() * 15;
    const box = Math.ceil(radius * 1.25);
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `${-box} ${-box} ${box * 2} ${box * 2}`);
    svg.setAttribute('width', String(box * 2));
    svg.setAttribute('height', String(box * 2));
    svg.style.animationDuration = `${(26 + rand() * 40).toFixed(1)}s`;
    if (rand() < 0.5) svg.style.animationDirection = 'reverse';

    const shell = document.createElementNS(SVG_NS, 'polygon');
    shell.setAttribute('class', 'sf-rock-shell');
    shell.setAttribute('points', rockPoints(radius, 7 + Math.floor(rand() * 4), rand));
    svg.appendChild(shell);

    // A couple of craters so the larger rocks don't read as flat blobs.
    const craters = radius > 13 ? 2 : 1;
    for (let c = 0; c < craters; c++) {
      const crater = document.createElementNS(SVG_NS, 'circle');
      crater.setAttribute('class', 'sf-rock-crater');
      crater.setAttribute('cx', ((rand() - 0.5) * radius).toFixed(1));
      crater.setAttribute('cy', ((rand() - 0.5) * radius).toFixed(1));
      crater.setAttribute('r', (radius * (0.13 + rand() * 0.16)).toFixed(1));
      svg.appendChild(crater);
    }

    rock.appendChild(svg);
    frag.appendChild(rock);
  }

  mount.appendChild(frag);
}
