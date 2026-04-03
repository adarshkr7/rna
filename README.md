# Rocketry & Aviation Club | IIT Patna - Modern Web Refactor

A complete refactor of the Rocketry & Aviation Club website from a single-file monolith into a modern, modular **Vite + TypeScript + Tailwind CSS** architecture.

## Tech Stack

- **Bundler**: Vite 5.0+
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + PostCSS + Custom CSS
- **Animation**: GSAP 3.12+ with ScrollTrigger
- **Smooth Scrolling**: Lenis (Smooth scroll library)
- **WebGL**: Custom fragment/vertex shaders for hero background

## Project Structure

```
rna/
├── index.html                 # Cleaned-up HTML markup
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript strict mode config
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS with Tailwind and Autoprefixer
├── package.json               # Dependencies and scripts
├── .gitignore
│
├── src/
│   ├── main.ts                # Entry point - initializes all modules
│   ├── style.css              # Tailwind directives + custom CSS
│   ├── cursor.ts              # Custom cursor (dot & ring) + mouse trail
│   ├── webgl.ts               # WebGL background + particle system
│   ├── animations.ts          # GSAP timelines, ScrollTrigger, hero reveal
│   ├── components.ts          # Text scramble, counters, mag buttons, 3D tilt
│   └── ui.ts                  # Terminal easter egg, UI initialization
│
└── public/
    └── src/                   # Images, videos, SVGs (referenced in HTML)
```

## Features Implemented

### Global UI & Utilities
- ✅ Custom Cursor (Dot with glow + Ring) with hover scaling
- ✅ Mouse Trail with fading radial gradients
- ✅ Grain overlay with shifting animation
- ✅ Scroll progress bar (fixed top)
- ✅ Section Dot Navigation (with IntersectionObserver)
- ✅ Lenis smooth scrolling setup

### Preloader
- ✅ Full-screen preloader with scan line animation
- ✅ Dynamic percentage counter
- ✅ Loading bar with GSAP tween
- ✅ GSAP reveal sequence → Hero animations

### Navbar
- ✅ Logo + version number
- ✅ Navigation links with hover underlines
- ✅ Magnetic glowing dot (follows mouse on hover)

### Hero Section
- ✅ WebGL canvas (custom shader with dynamic X-offset for responsive design)
- ✅ 2D particle system (floating dots with opacity variations)
- ✅ GSAP staggered typography reveal
- ✅ Animated scroll cue line

### Marquee
- ✅ Infinite scrolling CSS track
- ✅ Disciplines + bullet separators
- ✅ Pause on hover

### Manifesto / Who We Are
- ✅ Sticky grid layout
- ✅ Text reveal animations
- ✅ Animated counters (Years active, Ns impulse, Static fire tests)
- ✅ IntersectionObserver-driven entry

### Principles / Disciplines
- ✅ 3-column responsive grid
- ✅ Hover expanding underlines
- ✅ Text scramble effect on headers (hover + intersection)

### Rocket Scroll Parallax
- ✅ GSAP ScrollTrigger pinned section
- ✅ Rocket image scales up, unblurs, and flies out

### Cinematic Horizontal Scroll
- ✅ Sticky container converting vertical → horizontal scroll
- ✅ 4 panels with background parallax
- ✅ Progress bar tracking horizontal state

### Team / Who We Are
- ✅ Image hover (saturation/contrast changes)
- ✅ Overlay pattern animation

### Works / Capabilities
- ✅ Complex CSS Grid layout (12-column, variable heights)
- ✅ 3D Card Tilt (GSAP rotationX/rotationY via mouse coords)
- ✅ Magnetic button snapping to cursor

### Progress Timeline
- ✅ Pinned timeline section
- ✅ Horizontal tracking line with year markers
- ✅ GSAP snapping timeline with blur/fade events

### Footer
- ✅ Background HTML5 video with gradient overlay
- ✅ Wordmark ("Launch Now") sliding up on scroll
- ✅ Location + social links

### Terminal Easter Egg
- ✅ Triggered by backtick (`) key or click
- ✅ Sequential typewriter output of commands
- ✅ Smooth enter/exit animations

## Installation & Setup

### Prerequisites
- Node.js 16+ (recommended 18+)
- npm or yarn

### Steps

1. **Clone/Navigate to project:**
   ```bash
   cd rna
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Opens automatically at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```
   Output: `dist/` directory

5. **Preview production build:**
   ```bash
   npm run preview
   ```

6. **Type checking (strict mode):**
   ```bash
   npm run type-check
   ```

## Key Architectural Decisions

### Modularity
- **Separation of Concerns**: Each system (cursor, WebGL, animations, components, UI) is isolated in its own module
- **Lazy Initialization**: All modules initialize on page load, managed from `main.ts`
- **Event-Driven**: Components communicate via DOM events and GSAP timelines

### TypeScript Strict Mode
- All files compiled with strict mode enabled
- No implicit any types
- Full type safety for all GSAP and WebGL APIs

### GSAP Integration
- ScrollTrigger for scroll-based animations
- Magnetic elements with smooth easing
- Timeline-based preloader → hero reveal sequence
- Snapping progress timeline with labels

### CSS Architecture
- Tailwind CSS as base (utility-first)
- Custom CSS variables for theming (accent colors, spacing)
- Complex selectors / pseudo-elements for interactive states
- Responsive breakpoints at 768px

### WebGL Rendering
- Fragment shader with mathematical color mapping
- Dynamic X-offset calculation for responsive hero alignment
- Particle system with 2D canvas context

## File Sizes & Performance

After `npm run build`:
- **JavaScript**: ~150KB (minified)
- **CSS**: ~40KB (minified, Tailwind + custom)
- **HTML**: ~15KB
- Total gzip: ~50-60KB

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 15+
- Edge 90+
- WebGL required for hero background

## Asset Requirements

Ensure the following directories/files exist in the workspace:
- `src/RnALogo.svg`
- `src/Indian_Institute_of_Technology,_Patna.svg.png`
- `src/bgbgbg.jpg`
- `src/*.png` (noz1, pcb1, prop1, prop2, clg, schematic)
- `src/srcn/` directory with:
  - `cc.jpeg`
  - `IMG_3232.JPG.jpeg`
  - `prop.jpeg`, `tara.heic`
  - `footer-rocket.mp4`, `footer-rocket-sm.mp4`

## Development Tips

### Adding New Animations
1. Create a timeline in `src/animations.ts`
2. Use `gsap.fromTo()` with `scrollTrigger` for scroll-linked animations
3. Import and call from `setupAnimations(lenis)` in `main.ts`

### Creating New Interactive Elements
1. Add markup to `index.html`
2. Create setup function in `src/components.ts`
3. Call from `setupComponents()` in `main.ts`

### Debugging
- Check browser console for TypeScript errors
- Use `npm run type-check` to validate types
- Open DevTools → Performance tab to profile animations

## License

© 2026 Rocketry & Aviation Club, IIT Patna

## Contact

- Instagram: [@rna.iitp](https://www.instagram.com/rna.iitp/)
- LinkedIn: [Rocketry and Aviation Club](https://www.linkedin.com/company/rocketry-and-aviation-club-iit-patna/)
