"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useChapterMotion(unit: string) {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            defaults: { ease: "power2.out", clearProps: "transform,opacity" },
          })
          .from(".unit-banner", { y: 12, opacity: 0.6, duration: 0.45 })
          .from(
            ".chapter-art",
            { y: 9, rotation: -3, transformOrigin: "center", duration: 0.6 },
            0.1,
          );
        gsap.utils.toArray<HTMLElement>(".lesson-entry").forEach((entry) => {
          gsap.from(entry, {
            y: 16,
            opacity: 0.65,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "transform,opacity",
            scrollTrigger: { trigger: entry, start: "top 96%", once: true },
          });
        });
      });
      return () => media.revert();
    },
    { scope, dependencies: [unit], revertOnUpdate: true },
  );
  return scope;
}
