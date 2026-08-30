# 0003. Vector Path Morphing for Ambient Background Motion

## Context
The Pointify dashboard homepage requires an engaging, modern aesthetic that feels alive without distracting from the core Agile Scrum Poker workflows (Create Room and Join Room). The previous background used basic CSS `border-radius` transitions on generic blobs, which lacked product personality and could not represent distinctive Agile/Poker iconography.

## Decision
1. **SVG Vector Path Interpolation with `flubber`**:
   - Utilize `flubber` path interpolator integrated with Framer Motion (`motion/react` `animate` and `useMotionValue` / `useTransform`).
   - Morph continuously between key Agile & Poker vector shapes:
     - **Playing Card** (Lá bài Scrum)
     - **Point Shield / Badge** (Huy hiệu điểm Story Point)
     - **Discussion Speech Bubble** (Bong bóng thảo luận User Story)
     - **Consensus Star** (Ngôi sao đồng thuận)
     - **Smooth Squircle / Hexagon** (Khối hình học hiện đại)

2. **Luminous Glassmorphism & Aurora Gradients**:
   - Render multi-stop gradient fills (Indigo, Violet, Emerald, Rose, Amber) with soft translucency (15–25% opacity).
   - Apply glowing subtle strokes and multi-layer drop shadows for seamless integration with both Light and Dark modes.

3. **Physics-Driven Magnetic Hover & Staggered Phasing**:
   - Distribute 5 floating shape entities across strategic viewport positions with variable sizes (60px to 140px).
   - Execute independent auto-loop floating paths (drift + rotate) with staggered phase timings.
   - On cursor hover: apply a magnetic scale-up spring animation, brighten the glow aura, and smoothly accelerate/trigger the next shape morph.

4. **Accessibility & Reduced Motion**:
   - Honor `prefers-reduced-motion` media queries by dampening drift and providing smooth static/slow transitions.

## Consequences
- Elevates the visual identity of Pointify with custom Agile-themed vector morphing.
- Maintains 60fps hardware-accelerated rendering and minimal bundle footprint.
- Zero obstruction to the primary Room creation and joining flows.
