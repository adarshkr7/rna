const SVG_NS = 'http://www.w3.org/2000/svg';

const MOBILE = window.innerWidth < 768;
const TILT = -17;

// Desktop frames the hole right-of-centre and lets the disk bleed off both
// edges. A phone is too narrow for that, so the composition is anchored to the
// right edge instead — the horizon sits exactly on it, leaving the left half of
// the hole filling the right side of the screen with the disk sweeping across.
const W = MOBILE ? 620 : 1000;
const H = MOBILE ? 900 : 620;
const CX = MOBILE ? W : 655;
// Sits high on mobile: the disk sweeps down as it runs left, so centring it
// would drag the bright band straight through the headline.
const CY = MOBILE ? H * 0.35 : 300;
const HORIZON = MOBILE ? 165 : 150;

const DISK_IN = HORIZON * 1.15;
const DISK_OUT = MOBILE ? 430 : 440;
const DISK_STRANDS = MOBILE ? 11 : 17;
/** How many of the inner disk strands are redrawn across the sphere's face.
 *  Each one is a second full-size stroked path per frame, so keep it small. */
const DISK_INFRONT = MOBILE ? 4 : 6;

const HALO_IN = HORIZON * 1.035;
const HALO_OUT = HORIZON * 1.45;
const HALO_STRANDS = MOBILE ? 7 : 10;

/** Deterministic pseudo-random so the render is stable across reloads. */
function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function stars(count: number): string {
  const rand = rng(20140726);
  let out = '';
  for (let i = 0; i < count; i++) {
    out +=
      `<circle cx="${(rand() * W).toFixed(1)}" cy="${(rand() * H).toFixed(1)}"` +
      ` r="${(0.3 + rand() * 1.1).toFixed(2)}" fill="#fff" opacity="${(0.15 + rand() * 0.6).toFixed(2)}"/>`;
  }
  return out;
}

/**
 * Concentric strands standing in for the disk's turbulent bands. Inner strands
 * orbit faster than outer ones, which is what sells the material as falling in.
 * Flat stroke colours (not gradients) keep the per-frame repaint cheap.
 */
function strands(
  count: number,
  inner: number,
  outer: number,
  flatten: (t: number) => number,
  seed: number,
  baseDuration: number
): string[] {
  const rand = rng(seed);
  const ramp = ['#fffaf0', '#fff1d8', '#ffe0b6', '#f3cd9a', '#e0aa72', '#bd7f4e', '#94582f', '#6d3d22'];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const rx = inner + (outer - inner) * t;
    const ry = rx * flatten(t);
    const shade = Math.min(ramp.length - 1, Math.floor(t * (ramp.length - 1) + rand() * 1.4));
    const width = (0.8 + rand() * 2.7).toFixed(2);
    const opacity = (0.34 + rand() * 0.62).toFixed(2);
    // Long strokes with short breaks read as streaming filaments; short dashes
    // would read as tick marks.
    const c = 2 * Math.PI * rx;
    const dash = c * (0.06 + rand() * 0.24);
    const gap = c * (0.012 + rand() * 0.05);
    const period = (baseDuration * (0.55 + t * 1.5) * (0.85 + rand() * 0.3)).toFixed(2);
    out.push(
      `<ellipse class="bh-strand" cx="${CX}" cy="${CY}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"` +
        ` stroke="${ramp[shade]}" stroke-width="${width}" opacity="${opacity}"` +
        ` stroke-dasharray="${dash.toFixed(1)} ${gap.toFixed(1)}"` +
        ` style="--dash:-${(dash + gap).toFixed(1)};animation-duration:${period}s"/>`
    );
  }
  return out;
}

export function initBlackHole(): void {
  const mount = document.getElementById('blackhole');
  if (!mount) return;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  // xMax pins the viewBox's right edge to the container's, so the horizon
  // stays exactly half off-screen no matter how the crop falls.
  svg.setAttribute('preserveAspectRatio', MOBILE ? 'xMaxYMid slice' : 'xMidYMid slice');
  svg.setAttribute('class', 'bh-svg');
  svg.setAttribute('aria-hidden', 'true');

  const diskParts = strands(DISK_STRANDS, DISK_IN, DISK_OUT, (t) => 0.075 + t * 0.03, 91773, 5.5);
  const disk = diskParts.join('');
  const diskInFront = diskParts.slice(0, DISK_INFRONT).join('');
  const halo = strands(HALO_STRANDS, HALO_IN, HALO_OUT, () => 1, 33517, 7).join('');

  // The sphere occludes everything behind it, so the bulk of the disk is drawn
  // with the whole horizon punched out. The near edge — the part that passes in
  // front of the sphere — is then drawn back over the top, clipped to the lower
  // half of the horizon so it reads as crossing the shadow.
  const behindClip =
    `M -${W} -${H} H ${W * 2} V ${H * 2} H -${W} Z ` +
    `M ${CX - HORIZON} ${CY} A ${HORIZON} ${HORIZON} 0 0 1 ${CX + HORIZON} ${CY} ` +
    `A ${HORIZON} ${HORIZON} 0 0 1 ${CX - HORIZON} ${CY} Z`;
  const inFrontClip =
    `M ${CX - HORIZON * 1.02} ${CY} ` +
    `A ${HORIZON * 1.02} ${HORIZON * 1.02} 0 0 0 ${CX + HORIZON * 1.02} ${CY} Z`;

  svg.innerHTML = `
    <defs>
      <radialGradient id="bh-haze">
        <stop offset="0%"   stop-color="#3d1c11" stop-opacity=".9"/>
        <stop offset="48%"  stop-color="#280f09" stop-opacity=".55"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="bh-diskglow">
        <stop offset="0%"   stop-color="#ffd9a4" stop-opacity=".55"/>
        <stop offset="42%"  stop-color="#e8a463" stop-opacity=".3"/>
        <stop offset="100%" stop-color="#8a4a22" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="bh-haloglow">
        <stop offset="55%"  stop-color="#ffcf95" stop-opacity="0"/>
        <stop offset="76%"  stop-color="#ffdcae" stop-opacity=".42"/>
        <stop offset="88%"  stop-color="#e5a267" stop-opacity=".26"/>
        <stop offset="100%" stop-color="#8a4a22" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="bh-spot">
        <stop offset="0%"   stop-color="#ffffff" stop-opacity=".85"/>
        <stop offset="22%"  stop-color="#fff4de" stop-opacity=".5"/>
        <stop offset="48%"  stop-color="#ffd9a4" stop-opacity=".22"/>
        <stop offset="74%"  stop-color="#ffb86a" stop-opacity=".07"/>
        <stop offset="100%" stop-color="#ffb86a" stop-opacity="0"/>
      </radialGradient>
      <!-- Feathers the shadow's edge so the horizon dissolves into the disk
           instead of cutting it with a hard circle. -->
      <radialGradient id="bh-shadow">
        <stop offset="0%"  stop-color="#000000" stop-opacity="1"/>
        <stop offset="82%" stop-color="#000000" stop-opacity="1"/>
        <stop offset="90%" stop-color="#000000" stop-opacity=".7"/>
        <stop offset="96%" stop-color="#000000" stop-opacity=".28"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="bh-rimglow">
        <stop offset="84%"  stop-color="#ffe4ba" stop-opacity="0"/>
        <stop offset="93%"  stop-color="#fff1d8" stop-opacity=".3"/>
        <stop offset="100%" stop-color="#ffd9a4" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="bh-behind" clip-rule="evenodd">
        <path d="${behindClip}" clip-rule="evenodd"/>
      </clipPath>
      <clipPath id="bh-infront">
        <path d="${inFrontClip}"/>
      </clipPath>
    </defs>

    <rect x="0" y="0" width="${W}" height="${H}" fill="#000"/>
    <ellipse cx="${CX}" cy="${CY}" rx="${W * 0.62}" ry="${H * 0.72}" fill="url(#bh-haze)"/>
    <g class="bh-stars">${stars(110)}</g>

    <g transform="rotate(${TILT} ${CX} ${CY})">
      <circle class="bh-horizon" cx="${CX}" cy="${CY}" r="${HORIZON * 0.87}"/>

      <g clip-path="url(#bh-behind)">
        <ellipse cx="${CX}" cy="${CY}" rx="${DISK_OUT}" ry="${DISK_OUT * 0.14}" fill="url(#bh-diskglow)"/>
        <circle cx="${CX}" cy="${CY}" r="${HALO_OUT + 34}" fill="url(#bh-haloglow)"/>
        ${halo}
        ${disk}
      </g>

      <circle cx="${CX}" cy="${CY}" r="${HORIZON * 1.1}" fill="url(#bh-shadow)"/>
      <circle class="bh-rim" cx="${CX}" cy="${CY}" r="${HORIZON * 1.14}"/>

      <g clip-path="url(#bh-infront)">
        <ellipse cx="${CX}" cy="${CY}" rx="${DISK_OUT}" ry="${DISK_OUT * 0.14}" fill="url(#bh-diskglow)"/>
        ${diskInFront}
      </g>

      <!-- Doppler beaming: kept flat to the disk plane so it reads as a
           highlight on the disk rather than an oval sitting on the shadow. -->
      <ellipse class="bh-hotspot" cx="${CX - HORIZON - 2}" cy="${CY}" rx="54" ry="12" fill="url(#bh-spot)"/>
      <ellipse class="bh-hotspot-core" cx="${CX - HORIZON - 2}" cy="${CY}" rx="6" ry="2"/>
    </g>`;

  mount.appendChild(svg);
}
