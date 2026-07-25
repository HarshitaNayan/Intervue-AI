import { useRef } from 'react';

// Cursor-tracked 3D tilt — direct DOM style writes (no React state) so it
// stays smooth at 60fps. Applied to the interview stage, the candidate
// panel, and the landing hero mockup: the few surfaces meant to feel like
// physical objects in the room rather than flat UI.
//
// base{X,Y} let a surface sit permanently tilted in 3D space (like a
// screen viewed at an angle) with the mouse-tracked delta layered on
// top of that resting angle, instead of snapping to flat on hover.
export function useTilt(strength = 7, base = { x: 0, y: 0 }) {
  const ref = useRef(null);

  function onMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = base.x + -py * strength;
    const ry = base.y + px * strength;
    el.style.transform = `perspective(1400px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
  }

  function onMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(1400px) rotateX(${base.x}deg) rotateY(${base.y}deg)`;
  }

  return { ref, onMouseMove, onMouseLeave };
}
