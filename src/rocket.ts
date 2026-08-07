const SVG_NS = 'http://www.w3.org/2000/svg';

const CX = 150;
const R = 44;
const TILT = 0.24; // foreshortening of the horizontal plane — not a lean

const NOSE_END = 140;
const BAY_END = 186;
const BODY_END = 400;
const BOATTAIL_END = 426;
const NOZZLE_END = 480;
const BOATTAIL_R = 32;
const THROAT_R = 19;
const EXIT_R = 40;

const SEAMS = 12;
const BAND_TOP = 292;
const BAND_BOT = 306;

/** Vehicle radius at station y. */
function radiusAt(y: number): number {
  if (y <= NOSE_END) {
    const rho = (R * R + NOSE_END * NOSE_END) / (2 * R);
    return Math.sqrt(Math.max(rho * rho - (NOSE_END - y) * (NOSE_END - y), 0)) + R - rho;
  }
  if (y <= BODY_END) return R;
  if (y <= BOATTAIL_END) {
    const t = (y - BODY_END) / (BOATTAIL_END - BODY_END);
    return R + (BOATTAIL_R - R) * t;
  }
  const t = (y - BOATTAIL_END) / (NOZZLE_END - BOATTAIL_END);
  return THROAT_R + (EXIT_R - THROAT_R) * Math.pow(t, 0.62);
}

function node<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {}
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}

/** Stations sampled along the hull — dense over the curved nose, sparse elsewhere. */
function stations(): number[] {
  const ys: number[] = [];
  for (let i = 0; i <= 18; i++) ys.push((NOSE_END / 18) * i);
  ys.push(BAY_END, 240, 300, 360, BODY_END, BOATTAIL_END);
  return ys;
}

export interface RocketHandle {
  setSpin(radians: number): void;
  /** Sections the scroll timeline flies in before the vehicle starts spinning. */
  parts: {
    nose: SVGGElement;
    body: SVGGElement;
    aft: SVGGElement;
    fins: SVGGElement[];
    surface: SVGGElement;
    labels: SVGGElement[];
  };
}

export function initRocket(mountId: string): RocketHandle | null {
  const mount = document.getElementById(mountId);
  if (!mount) return null;

  const svg = node('svg', {
    viewBox: '-28 -46 356 616',
    class: 'rkt-svg',
    'aria-hidden': 'true',
  });

  const defs = node('defs');
  defs.innerHTML = `
    <linearGradient id="rkt-hull" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#f0b46a" stop-opacity=".05"/>
      <stop offset="35%"  stop-color="#ffffff" stop-opacity=".10"/>
      <stop offset="62%"  stop-color="#ffffff" stop-opacity=".03"/>
      <stop offset="100%" stop-color="#f0b46a" stop-opacity=".07"/>
    </linearGradient>
    <linearGradient id="rkt-fin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#f0b46a" stop-opacity=".18"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity=".03"/>
    </linearGradient>`;
  svg.appendChild(defs);

  const root = node('g');
  svg.appendChild(root);

  const finsBack = node('g', { class: 'rkt-fins' });
  const finsFront = node('g', { class: 'rkt-fins' });
  const surface = node('g', { class: 'rkt-surface' });

  // The hull is split into sections rather than drawn as one silhouette, so the
  // vehicle can fly together from separate pieces before it starts spinning.
  const nose = node('g');
  const body = node('g');
  const aft = node('g');

  root.append(finsBack, nose, body, aft, surface, finsFront);

  // ── Static hull silhouette ────────────────────────────────────────────────
  const ys = stations();

  /** Silhouette polygon for one station range, so sections can fly separately. */
  function hullSegment(from: number, to: number): SVGPolygonElement {
    const seg = ys.filter((y) => y >= from && y <= to);
    if (seg[0] !== from) seg.unshift(from);
    if (seg[seg.length - 1] !== to) seg.push(to);
    const right = seg.map((y) => `${CX + radiusAt(y)},${y}`);
    const left = [...seg].reverse().map((y) => `${CX - radiusAt(y)},${y}`);
    return node('polygon', { class: 'rkt-hull', points: [...right, ...left].join(' ') });
  }

  nose.appendChild(hullSegment(0, NOSE_END));
  body.appendChild(hullSegment(NOSE_END, BODY_END));
  aft.appendChild(hullSegment(BODY_END, BOATTAIL_END));

  // Boattail → nozzle bell
  const bellYs = [BOATTAIL_END, 440, 455, 468, NOZZLE_END];
  const bellR = [BOATTAIL_END, 440, 455, 468, NOZZLE_END].map(radiusAt);
  aft.appendChild(
    node('polygon', {
      class: 'rkt-bell',
      points: [
        ...bellYs.map((y, i) => `${CX + bellR[i]},${y}`),
        ...[...bellYs].reverse().map((y, i) => `${CX - bellR[bellYs.length - 1 - i]},${y}`),
      ].join(' '),
    })
  );
  // Avionics bay + payload band
  body.appendChild(
    node('rect', { class: 'rkt-bay', x: CX - R, y: NOSE_END, width: R * 2, height: BAY_END - NOSE_END })
  );
  body.appendChild(
    node('rect', {
      class: 'rkt-band',
      x: CX - R - 2,
      y: BAND_TOP,
      width: (R + 2) * 2,
      height: BAND_BOT - BAND_TOP,
    })
  );

  // Station hoops — circles of the hull seen edge-on
  const hoopStations: Array<[number, string]> = [
    [NOSE_END, 'is-accent'],
    [BAY_END, ''],
    [240, 'is-faint'],
    [BAND_TOP, 'is-accent'],
    [BAND_BOT, 'is-accent'],
    [360, 'is-faint'],
    [BODY_END, ''],
    [BOATTAIL_END, 'is-accent'],
    [NOZZLE_END, 'is-accent'],
  ];
  for (const [y, cls] of hoopStations) {
    const r = y === BAND_TOP || y === BAND_BOT ? R + 2 : radiusAt(y);
    const section = y <= NOSE_END ? nose : y >= BOATTAIL_END ? aft : body;
    section.appendChild(
      node('ellipse', { class: `rkt-hoop ${cls}`, cx: CX, cy: y, rx: r, ry: r * TILT })
    );
  }

  // ── Rotating surface features ─────────────────────────────────────────────
  const seamYs = ys.filter((y) => y <= BOATTAIL_END);
  const seamLines = Array.from({ length: SEAMS }, (_, i) => {
    const line = node('polyline', { class: i % 3 === 0 ? 'rkt-seam is-major' : 'rkt-seam' });
    line.dataset.az = String((Math.PI * 2 * i) / SEAMS);
    surface.appendChild(line);
    return line;
  });

  const raceway = node('polygon', { class: 'rkt-raceway' });
  surface.appendChild(raceway);

  const ports = Array.from({ length: 3 }, (_, i) => {
    const port = node('ellipse', { class: 'rkt-port', ry: 4 });
    port.dataset.az = String(-0.5 + i * 0.5);
    surface.appendChild(port);
    return port;
  });

  const decal = node('text', { class: 'rkt-decal', y: 258, 'text-anchor': 'middle' });
  decal.textContent = 'RNA · IITP';
  surface.appendChild(decal);

  // ── Fins (four, projected from their azimuth) ─────────────────────────────
  const finProfile: Array<[number, number]> = [
    [R - 2, 322],
    [96, 380],
    [96, 400],
    [R - 2, BODY_END],
  ];
  const finShapes = Array.from({ length: 4 }, (_, i) => {
    const fin = node('polygon', { fill: 'url(#rkt-fin)' });
    fin.dataset.az = String((Math.PI / 2) * i + Math.PI / 4);
    return fin;
  });

  // ── Part callouts (shown while the vehicle assembles) ─────────────────────
  // [station, label, side, radius the leader starts from]
  const labelDefs: Array<[number, string, number, number]> = [
    [70, 'Nose', 1, radiusAt(70)],
    [163, 'Avionics', -1, R],
    [300, 'Core', 1, R + 2],
    [385, 'Fins', -1, 96],
    [455, 'Nozzle', 1, radiusAt(455)],
  ];
  const labelGroup = node('g');
  const labels = labelDefs.map(([y, text, side, startR]) => {
    const g = node('g', { class: 'rkt-label' });
    const from = CX + side * (startR + 9);
    g.append(
      node('circle', { class: 'rkt-label-dot', cx: from, cy: y, r: 1.8 }),
      node('line', { class: 'rkt-label-line', x1: from, y1: y, x2: CX + side * 110, y2: y })
    );
    const caption = node('text', {
      class: 'rkt-label-text',
      x: CX + side * 116,
      y: y + 3.5,
      'text-anchor': side > 0 ? 'start' : 'end',
    });
    caption.textContent = text;
    g.appendChild(caption);
    labelGroup.appendChild(g);
    return g;
  });
  root.appendChild(labelGroup);

  // ── Projection ────────────────────────────────────────────────────────────
  function render(spin: number): void {
    for (const line of seamLines) {
      const az = Number(line.dataset.az) + spin;
      const sin = Math.sin(az);
      const cos = Math.cos(az);
      line.setAttribute(
        'points',
        seamYs.map((y) => {
          const r = radiusAt(y);
          return `${CX + r * sin},${y - r * cos * TILT}`;
        }).join(' ')
      );
      line.setAttribute('stroke-opacity', (0.16 + 0.34 * Math.max(cos, 0)).toFixed(3));
    }

    const raceAz = 0.9 + spin;
    const edges = seamYs.filter((y) => y >= NOSE_END);
    const near = edges.map((y) => {
      const r = radiusAt(y);
      return `${CX + r * Math.sin(raceAz - 0.075)},${y - r * Math.cos(raceAz) * TILT}`;
    });
    const far = [...edges].reverse().map((y) => {
      const r = radiusAt(y);
      return `${CX + r * Math.sin(raceAz + 0.075)},${y - r * Math.cos(raceAz) * TILT}`;
    });
    raceway.setAttribute('points', [...near, ...far].join(' '));
    raceway.setAttribute('opacity', Math.max(Math.cos(raceAz), 0).toFixed(3));

    ports.forEach((port, i) => {
      const az = Number(port.dataset.az) + spin;
      const cos = Math.cos(az);
      const y = 152 + i * 11;
      port.setAttribute('cx', String(CX + R * Math.sin(az)));
      port.setAttribute('cy', String(y - R * cos * TILT));
      port.setAttribute('rx', (5 * Math.max(cos, 0)).toFixed(2));
      port.setAttribute('opacity', Math.max(cos, 0).toFixed(3));
    });

    const decalCos = Math.cos(spin);
    decal.setAttribute('x', String(CX + R * 0.55 * Math.sin(spin)));
    decal.setAttribute('opacity', Math.max(decalCos, 0).toFixed(3));

    for (const fin of finShapes) {
      const az = Number(fin.dataset.az) + spin;
      const sin = Math.sin(az);
      const cos = Math.cos(az);
      fin.setAttribute(
        'points',
        finProfile.map(([rho, y]) => `${CX + rho * sin},${y - rho * cos * TILT}`).join(' ')
      );
      const target = cos > 0 ? finsFront : finsBack;
      if (fin.parentNode !== target) target.appendChild(fin);
      fin.setAttribute('opacity', (0.35 + 0.65 * Math.abs(sin)).toFixed(3));
    }
  }

  mount.appendChild(svg);
  render(0);

  return {
    setSpin: render,
    parts: {
      nose,
      body,
      aft,
      fins: [finsBack, finsFront],
      surface,
      labels,
    },
  };
}
