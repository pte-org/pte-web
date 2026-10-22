"use client";

import { useEffect, useId, useRef, type ReactElement } from "react";

const DOT_SPACING = 22;
const DOT_RADIUS = 1.1;
const DOT_ALPHA = 0.16;
/** Pixels around the cursor where dots react. */
const CURSOR_RADIUS = 150;
/** How far a dot right under the cursor is pushed outwards (px). */
const BULGE = 12;
const GLOW_RADIUS = 190;
const GLOW_ALPHA = 0.12;
/** Fraction of the remaining distance covered per frame by the eased cursor and strength. */
const EASE = 0.14;
const MAX_PIXEL_RATIO = 2;

const readBrandColor = (): string =>
  getComputedStyle(document.documentElement).getPropertyValue("--brand").trim();

/**
 * Canvas dot grid: dots near the pointer swell, brighten and bulge outwards, with a soft glow;
 * everything eases back when the pointer leaves. Deliberately ignores `prefers-reduced-motion`
 * (product decision for the sign-in page); it only animates while the pointer moves.
 */
const InteractiveDotGrid = (): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    let color = readBrandColor();
    let width = 0;
    let height = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, target: 0 };
    let frame = 0;

    const draw = (): void => {
      context.clearRect(0, 0, width, height);
      if (!color) return;
      context.fillStyle = color;
      const { x: px, y: py, strength } = pointer;

      if (strength > 0.01) {
        const glow = context.createRadialGradient(px, py, 0, px, py, GLOW_RADIUS);
        glow.addColorStop(0, color);
        glow.addColorStop(1, "transparent");
        context.globalAlpha = GLOW_ALPHA * strength;
        context.fillStyle = glow;
        context.fillRect(px - GLOW_RADIUS, py - GLOW_RADIUS, GLOW_RADIUS * 2, GLOW_RADIUS * 2);
        context.fillStyle = color;
      }

      // Unaffected dots share one path; dots inside the cursor radius are drawn one by one.
      context.globalAlpha = DOT_ALPHA;
      context.beginPath();
      for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
        for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
          const dx = x - px;
          const dy = y - py;
          const distance = Math.hypot(dx, dy);
          if (strength <= 0.01 || distance >= CURSOR_RADIUS) {
            context.moveTo(x + DOT_RADIUS, y);
            context.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          }
        }
      }
      context.fill();

      if (strength > 0.01) {
        const minX = Math.max(0, px - CURSOR_RADIUS);
        const maxX = Math.min(width, px + CURSOR_RADIUS);
        const minY = Math.max(0, py - CURSOR_RADIUS);
        const maxY = Math.min(height, py + CURSOR_RADIUS);
        const startX = DOT_SPACING / 2 + Math.floor(minX / DOT_SPACING) * DOT_SPACING;
        const startY = DOT_SPACING / 2 + Math.floor(minY / DOT_SPACING) * DOT_SPACING;
        for (let y = startY; y <= maxY; y += DOT_SPACING) {
          for (let x = startX; x <= maxX; x += DOT_SPACING) {
            const dx = x - px;
            const dy = y - py;
            const distance = Math.hypot(dx, dy);
            if (distance >= CURSOR_RADIUS) continue;
            const falloff = 1 - distance / CURSOR_RADIUS;
            const influence = falloff * falloff * (3 - 2 * falloff) * strength;
            const push = distance > 0 ? (BULGE * influence) / distance : 0;
            context.globalAlpha = DOT_ALPHA + 0.55 * influence;
            context.beginPath();
            context.arc(
              x + dx * push,
              y + dy * push,
              DOT_RADIUS * (1 + 1.4 * influence),
              0,
              Math.PI * 2,
            );
            context.fill();
          }
        }
      }
      context.globalAlpha = 1;
    };

    const step = (): void => {
      pointer.x += (pointer.tx - pointer.x) * EASE;
      pointer.y += (pointer.ty - pointer.y) * EASE;
      pointer.strength += (pointer.target - pointer.strength) * EASE;
      draw();
      const moving =
        Math.abs(pointer.tx - pointer.x) > 0.3 ||
        Math.abs(pointer.ty - pointer.y) > 0.3 ||
        Math.abs(pointer.target - pointer.strength) > 0.005;
      frame = moving ? window.requestAnimationFrame(step) : 0;
    };

    const wake = (): void => {
      if (!frame) frame = window.requestAnimationFrame(step);
    };

    const resize = (): void => {
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };

    const onPointerMove = (event: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = event.clientX - rect.left;
      pointer.ty = event.clientY - rect.top;
      if (pointer.target === 0) {
        // Enter at the pointer rather than easing in from the last exit point.
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.target = 1;
      wake();
    };

    const onPointerLeave = (): void => {
      pointer.target = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    // Re-read the brand colour when the theme toggles.
    const themeObserver = new MutationObserver(() => {
      color = readBrandColor();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
};

/**
 * Sign-in page background: tinted glows, slowly drifting light ribbons, an interactive dot grid
 * and a fine grain overlay. Purely decorative and hidden from assistive technology.
 */
export const AuthBackdrop = (): ReactElement => {
  // useId output may contain characters that break `url(#…)` references.
  const grainId = `auth-grain-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base: cool tint top-left fading to a grey bottom-right, so light ribbons have depth to sit on. */}
      <div className="absolute inset-0 bg-[linear-gradient(155deg,var(--brand-tint)_0%,var(--surface-page)_42%,var(--shell-border)_100%)]" />
      {/* Colour aura: three large blurred blobs that wander slowly behind everything. */}
      <div className="absolute -left-[12%] -top-[18%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,var(--brand-soft),transparent_68%)] opacity-35 blur-3xl animate-pte-aura-a" />
      <div className="absolute -bottom-[22%] -right-[10%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,var(--action-gradient-start),transparent_68%)] opacity-25 blur-3xl animate-pte-aura-b" />
      <div className="absolute bottom-[5%] left-[18%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,var(--brand-tint),transparent_70%)] opacity-90 blur-3xl animate-pte-aura-c" />
      {/* Silk folds: a darker shadow band with a white highlight just above it, twice over. */}
      <div className="absolute -left-[30%] top-[26%] h-[15rem] w-[160%] -rotate-[20deg] rounded-[50%] bg-[linear-gradient(90deg,transparent_5%,var(--shell-border)_45%,transparent_95%)] opacity-90 blur-2xl animate-pte-silk-b" />
      <div className="absolute -left-[25%] top-[16%] h-[9rem] w-[150%] -rotate-[20deg] rounded-[50%] bg-[linear-gradient(90deg,transparent_5%,var(--surface-card)_50%,transparent_95%)] blur-2xl animate-pte-silk-a" />
      <div className="absolute -right-[35%] bottom-[10%] h-[14rem] w-[140%] -rotate-[17deg] rounded-[50%] bg-[linear-gradient(90deg,transparent_5%,var(--shell-border)_50%,transparent_95%)] opacity-80 blur-2xl animate-pte-silk-c" />
      <div className="absolute -right-[30%] bottom-[22%] h-[8rem] w-[130%] -rotate-[17deg] rounded-[50%] bg-[linear-gradient(90deg,transparent_5%,var(--surface-card)_55%,transparent_95%)] blur-2xl animate-pte-silk-b" />
      {/* Brand light streak across the lower left. */}
      <div className="absolute -left-[15%] bottom-[-4%] h-[11rem] w-[85%] -rotate-[30deg] rounded-[50%] bg-[linear-gradient(90deg,transparent,var(--brand-soft)_50%,transparent)] opacity-35 blur-3xl animate-pte-silk-a" />
      <InteractiveDotGrid />
      <svg className="absolute inset-0 h-full w-full opacity-[0.06] mix-blend-multiply">
        <filter id={grainId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>
    </div>
  );
};
