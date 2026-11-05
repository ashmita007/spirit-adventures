# UI/UX & Frontend Design System Guidelines for Spirit Adventures

Whenever planning, architecting, or designing user interfaces, components, or animations in this project, you MUST automatically apply and reference the following skills:

## 1. Mandatory UI Skill Activations
- **`craft-ui-engineering`**: Strictly eliminate generic "AI-generated" UI patterns (no centered purple-gradient text clichés, no 3 identical cookie-cutter cards). Mandate specular dual-layer borders, atmospheric depth, noise grain, editorial typography, and asymmetric Bento layouts.
- **`inspira-ui`**: Use for immersive nature & adventure visual effects (Aurora background glow, Spotlight trails, Sparkles, Bento Grids, 3D Pin cards, and Lamp effects).
- **`animate-ui`**: Use for fluid micro-interactions (magnetic hover buttons, spring-physics dialogs, layout-morphing tabs using `layoutId`, and staggered list reveals).
- **`lenis-smooth-scroll`**: Use for butter-smooth momentum scrolling, seamless anchor link navigation to trip sections, and modal scroll locking.
- **`trending-ui-design` & `ui-ux-pro-max`**: Ensure high-end typography, clean slate/ocean color palettes, crisp borders (`border-slate-200`), and responsive layouts.

## 2. Core Execution Principles
1. **Never build flat, lifeless, or generic AI templates:** Every interactive element must feature tactile hover and active spring feedback (`active:scale-[0.97]`).
2. **Modal & Drawer First:** For dense management workflows (e.g. Lead details, booking confirmations), use modal drawers instead of cluttered single-page views.
3. **Specular Lighting & Depth:** Apply top-edge highlights (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.15)`) and atmospheric grain.
4. **Hardware Acceleration:** Ensure animations only target `transform` and `opacity` with `will-change: transform`.
