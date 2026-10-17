"use client";

// Adapted from David Haz's React Bits SpotlightCard (pointer-position lighting).
// Source and license: THIRD_PARTY_NOTICES.md, licenses/react-bits-LICENSE.md.
// NPrep variant: local pointer events, no idle loop, no touch/reduced-motion effects.
import { useRef, type HTMLAttributes, type PointerEvent } from "react";

export function SpotlightCard({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const root = useRef<HTMLDivElement>(null);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const node = root.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }
  return (
    <div
      {...props}
      ref={root}
      className={"nprep-spotlight " + className}
      onPointerMove={move}
    >
      {children}
      <span className="nprep-spotlight-glow" aria-hidden="true" />
    </div>
  );
}
