export function initWebGL(): void {
  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  const glContext = canvas.getContext('webgl');

  if (!glContext) {
    console.warn('WebGL not supported');
    return;
  }

  const gl: WebGLRenderingContext = glContext;

  // Vertex shader — full-screen quad
  const vertexShader = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0., 1.);
    }
  `;

  // ─────────────────────────────────────────────────────────────────────────
  // Fragment shader: Electric Nebula
  //
  // Visual concept:
  //   Layer A – Domain-warped FBM ("nebula body"): organic cloud-like volume
  //   Layer B – Aurora curtains: 5 undulating horizontal bands of light
  //   Layer C – Plasma filaments: iterative sinusoidal plasma field
  //
  // No circular singularity → distinctly unlike any vortex/black-hole icon.
  // Color ramp: deep-space indigo → electric blue → ice cyan → near-white core
  // ─────────────────────────────────────────────────────────────────────────
  const fragmentShader = `
    precision mediump float;
    uniform float t;
    uniform vec2  r;
    uniform float u_offset_x;

    /* ── Noise primitives ─────────────────────────────────────── */
    vec2 h2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)),
               dot(p, vec2(269.5, 183.3)));
      return -1. + 2. * fract(sin(p) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3. - 2. * f);
      return mix(
        mix(dot(h2(i),              f),
            dot(h2(i + vec2(1.,0.)), f - vec2(1.,0.)), u.x),
        mix(dot(h2(i + vec2(0.,1.)), f - vec2(0.,1.)),
            dot(h2(i + vec2(1.,1.)), f - vec2(1.,1.)), u.x),
        u.y);
    }

    /* 5-octave FBM with rotation to avoid axis-aligned artefacts */
    float fbm(vec2 p) {
      float v = 0., a = 0.52;
      mat2  rot = mat2( .866,.5,-.5,.866); /* 30° */
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p  = rot * p * 2.05 + vec2(3.7, 8.1);
        a *= 0.48;
      }
      return v;
    }

    void main() {
      vec2 sc  = gl_FragCoord.xy - vec2(u_offset_x, 0.);
      vec2 uv  = (sc * 2. - r) / r.y;
      float sp = t * 0.13;

      /* ── Layer A: Domain-warped nebula volume ──────────────── */
      /* Two rounds of warping give deep, billowing cloud shapes */
      vec2 q = vec2(fbm(uv + vec2(0.,       sp       )),
                    fbm(uv + vec2(6.3, 1.7 + sp       )));

      vec2 w = vec2(fbm(uv + 3.8 * q + vec2(1.9, 9.1 + sp * .4)),
                    fbm(uv + 3.8 * q + vec2(8.5, 2.7 + sp * .6)));

      float nebula = fbm(uv + 3.5 * w);           /* –0.5 … +0.7 ish */
      nebula = nebula * .5 + .5;                   /* remap to 0–1   */

      /* ── Layer B: Aurora curtains ─────────────────────────── */
      /* 5 horizontal ribbons, each independently warped & pulsed */
      float aurora = 0.;
      for (int i = 0; i < 5; i++) {
        float fi  = float(i);
        float wave = uv.y
                   + .28 * noise(vec2(uv.x * 1.8 + sp * .25, fi * 2.6))
                   + .12 * sin(uv.x * 3.1 + fi * 1.4 + sp * .55);
        float band = exp(-abs(wave + .35 * sin(fi * .9 + sp * .3)) * 7.5);
        aurora += band * (.55 + .45 * sin(fi * 2.2 + sp * .5));
      }
      aurora = clamp(aurora * .55, 0., 1.);

      /* ── Layer C: Plasma filaments ────────────────────────── */
      /* Iterative domain-distortion: produces flowing electric tendrils */
      vec2  pf = uv * 1.2;
      float plasma = 0.;
      for (int i = 1; i <= 7; i++) {
        float fi = float(i);
        pf += .55 * sin(vec2(pf.y * fi * 1.15 + t * .8,
                             pf.x * fi * .95  + t * 1.0)) / fi;
        plasma += sin(pf.x * 1.3 + pf.y * .9 + t * .25) / fi;
      }
      plasma = clamp(plasma * .5 + .5, 0., 1.);

      /* ── Combine layers ────────────────────────────────────── */
      float combined = nebula  * .30
                     + aurora  * .50
                     + plasma  * .20;

      /* Subtle diagonal energy stripe — breaks horizontal symmetry */
      float stripe = .06 * sin(uv.x * 2.5 - uv.y * 1.2 + t * .4);
      combined = clamp(combined + stripe, 0., 1.);

      /* ── Color ramp: Pillars of Creation palette ───────────── */
      /*  c0  void / deep-space navy                               */
      /*  c1  dark rust-brown (dense dust pillar base)             */
      /*  c2  warm copper-brown (mid pillar body)                  */
      /*  c3  dusty teal (gas-cloud transition)                    */
      /*  c4  vivid cyan-teal (ionised gas edge glow)              */
      /*  c5  hot yellow-white (star core / blown highlight)       */
      vec3 c0 = vec3(.008, .010, .028);
      vec3 c1 = vec3(.140, .042, .018);
      vec3 c2 = vec3(.340, .130, .040);
      vec3 c3 = vec3(.060, .340, .380);
      vec3 c4 = vec3(.140, .720, .660);
      vec3 c5 = vec3(.960, .940, .760);

      float lum = clamp(combined * 1.45, 0., 1.);
      vec3  col;
      if      (lum < .18) col = mix(c0, c1, lum / .18);
      else if (lum < .36) col = mix(c1, c2, (lum - .18) / .18);
      else if (lum < .58) col = mix(c2, c3, (lum - .36) / .22);
      else if (lum < .78) col = mix(c3, c4, (lum - .58) / .20);
      else                col = mix(c4, c5, (lum - .78) / .22);

      /* Smooth-step contrast curve */
      col = col * col * (3. - 2. * col);

      /* Warm up highlights slightly — pulls bright areas toward gold */
      col.r = min(col.r + lum * .06, 1.);
      col.g = min(col.g + lum * .03, 1.);

      /* ── Vignette ──────────────────────────────────────────── */
      vec2  uvN = gl_FragCoord.xy / r;
      float vig = smoothstep(0., .60, 1. - length((uvN - .5) * vec2(1.15, 1.)));
      col *= vig * .40 + .60;

      gl_FragColor = vec4(col, 1.);
    }
  `;

  /* ── Shader compilation helper ─────────────────────────────── */
  function compileShader(type: number, source: string): WebGLShader {
    const shader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  /* ── Build program ─────────────────────────────────────────── */
  const program = gl.createProgram() as WebGLProgram;
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER,   vertexShader));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShader));
  gl.linkProgram(program);
  gl.useProgram(program);

  /* ── Uniform / attribute locations ────────────────────────── */
  const positionLoc   = gl.getAttribLocation (program, 'a_position');
  const timeLoc       = gl.getUniformLocation(program, 't');
  const resolutionLoc = gl.getUniformLocation(program, 'r');
  const offsetLoc     = gl.getUniformLocation(program, 'u_offset_x');

  /* ── Full-screen triangle-pair buffer ──────────────────────── */
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1,  1, -1, -1,  1,
                      -1,  1,  1, -1,  1,  1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  /* ── Resize ────────────────────────────────────────────────── */
  function resize(): void {
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    canvas.width  = rect.width;
    canvas.height = rect.height;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── Render loop ───────────────────────────────────────────── */
  const t0 = performance.now();

  function render(): void {
    const time = (performance.now() - t0) / 1000;

    gl.uniform1f(timeLoc,       time);
    gl.uniform2f(resolutionLoc, canvas.width, canvas.height);

    const offset_x =
      window.innerWidth < 768
        ? canvas.width * 0.5    // mobile: centred
        : canvas.width * 0.25;  // desktop: right-panel aligned

    gl.uniform1f(offsetLoc, offset_x);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  render();
}

// ═══════════════════════════════════════════════════════════════════════════
// Particle system — enhanced cosmic-dust layer
//
// Changes vs original:
//  • Three tiers: "stars" (large, bright, twinkle), "sparks" (cyan, quick),
//    and standard dust — each with distinct motion & appearance
//  • Soft radial glow via shadow blur instead of a plain arc
//  • Subtle parallax: each tier moves at a different drift speed
// ═══════════════════════════════════════════════════════════════════════════
export function initParticles(): void {
  const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const context = canvas.getContext('2d');
  if (!context) return;
  const ctx: CanvasRenderingContext2D = context;

  type Tier = 'dust' | 'spark' | 'star';

  interface Particle {
    x: number; y: number;
    s: number;            // radius
    vx: number; vy: number;
    o: number;            // base opacity
    tier: Tier;
    phase: number;        // for twinkle oscillation
    reset(): void;
    update(dt: number): void;
    draw(): void;
  }

  let particles: Particle[] = [];

  class ParticleImpl implements Particle {
    x = 0; y = 0; s = 0; vx = 0; vy = 0; o = 0;
    tier: Tier = 'dust';
    phase = 0;

    reset(): void {
      const roll = Math.random();
      if (roll < 0.04) {
        // ── Star tier ──────────────────────────────────────────
        this.tier = 'star';
        this.s    = Math.random() * 1.6 + 1.2;
        this.vx   = (Math.random() - 0.5) * 0.12;
        this.vy   = (Math.random() - 0.5) * 0.12 - 0.03;
        this.o    = Math.random() * 0.5  + 0.45;
      } else if (roll < 0.18) {
        // ── Spark tier (cyan electric motes) ───────────────────
        this.tier = 'spark';
        this.s    = Math.random() * 0.9 + 0.5;
        this.vx   = (Math.random() - 0.5) * 0.40;
        this.vy   = (Math.random() - 0.5) * 0.40 - 0.12;
        this.o    = Math.random() * 0.45 + 0.15;
      } else {
        // ── Dust tier (default) ─────────────────────────────────
        this.tier = 'dust';
        this.s    = Math.random() * 1.0 + 0.3;
        this.vx   = (Math.random() - 0.5) * 0.22;
        this.vy   = (Math.random() - 0.5) * 0.22 - 0.06;
        this.o    = Math.random() * 0.28 + 0.06;
      }
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.phase = Math.random() * Math.PI * 2;
    }

    constructor() { this.reset(); }

    update(dt: number): void {
      this.x += this.vx;
      this.y += this.vy;
      this.phase += dt * (this.tier === 'star' ? 1.8 : 0.9);

      if (this.x >  canvas.width  + 2) this.x = -2;
      if (this.x < -2)                 this.x = canvas.width  + 2;
      if (this.y < -2)                 this.y = canvas.height + 2;
      if (this.y >  canvas.height + 2) this.y = -2;
    }

    draw(): void {
      let alpha = this.o;
      let color: string;

      if (this.tier === 'star') {
        // Twinkle: warm orange-white like Hubble stellar cores
        alpha = this.o * (.6 + .4 * Math.sin(this.phase));
        color = `rgba(255,240,180,${alpha.toFixed(3)})`;
        ctx.shadowBlur  = this.s * 6;
        ctx.shadowColor = `rgba(255,160,60,${(alpha * .9).toFixed(3)})`;
      } else if (this.tier === 'spark') {
        // Cyan-teal — ionised gas motes
        color = `rgba(80,210,200,${alpha.toFixed(3)})`;
        ctx.shadowBlur  = this.s * 3;
        ctx.shadowColor = `rgba(30,180,170,${(alpha * .6).toFixed(3)})`;
      } else {
        // Neutral dust — faint warm white
        color = `rgba(240,230,210,${alpha.toFixed(3)})`;
        ctx.shadowBlur  = 0;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadow so non-glowing particles are unaffected
      ctx.shadowBlur = 0;
    }
  }

  function spawn(): void {
    particles = [];
    // Stars are sparse; sparks medium; dust dense
    const area  = canvas.width * canvas.height;
    const count = Math.floor(area / 7500);
    for (let i = 0; i < count; i++) particles.push(new ParticleImpl());
  }

  function resize(): void {
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    canvas.width  = rect.width;
    canvas.height = rect.height;
    spawn();
  }

  let last = performance.now();

  function animate(): void {
    const now = performance.now();
    const dt  = (now - last) / 1000;
    last = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.update(dt);
      p.draw();
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();
}