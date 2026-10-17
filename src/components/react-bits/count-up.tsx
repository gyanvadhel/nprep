"use client";

// Adapted from React Bits CountUp's Motion-powered numeric interpolation.
// Source and license: THIRD_PARTY_NOTICES.md, licenses/react-bits-LICENSE.md.
// Keeps the final value available to assistive technology throughout the animation.
import { useEffect, useRef } from "react";
import { animate } from "motion/react";

export function CountUp({ to }: { to: number }) {
  const node = useRef<HTMLSpanElement>(null);
  const value = useRef(to);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const display = (next: number) => {
      value.current = next;
      if (node.current) node.current.textContent = String(Math.round(next));
    };
    const animation = animate(value.current, to, {
      duration: media.matches ? 0 : 0.6,
      ease: "easeOut",
      onUpdate: display,
    });
    const changed = () => {
      if (media.matches) {
        animation.stop();
        display(to);
      }
    };
    media.addEventListener("change", changed);
    return () => {
      animation.stop();
      media.removeEventListener("change", changed);
    };
  }, [to]);
  return (
    <span className="count-up">
      <span ref={node} aria-hidden="true">
        {to}
      </span>
      <span className="sr-only">{to}</span>
    </span>
  );
}
