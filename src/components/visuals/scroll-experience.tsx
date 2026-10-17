"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
let activeScroll: Lenis | null = null;

export function resetPageScroll() {
  if (activeScroll) activeScroll.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo({ top: 0, behavior: "instant" });
}

export function ScrollExperience() {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      "(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const lenis = new Lenis({
          lerp: 0.14,
          smoothWheel: true,
          syncTouch: false,
          autoRaf: false,
          anchors: true,
          prevent: (node) => Boolean(node.closest("[data-lenis-prevent]")),
        });
        activeScroll = lenis;
        // Use real elapsed time so ticker lag handling cannot delay native input.
        const frame = () => lenis.raf(performance.now());
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(frame);
        const syncLock = () => {
          if (
            document.body.hasAttribute("data-scroll-locked") ||
            document.hidden
          )
            lenis.stop();
          else lenis.start();
        };
        const observer = new MutationObserver(syncLock);
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ["data-scroll-locked"],
        });
        document.addEventListener("visibilitychange", syncLock);
        syncLock();
        return () => {
          observer.disconnect();
          document.removeEventListener("visibilitychange", syncLock);
          gsap.ticker.remove(frame);
          lenis.off("scroll", ScrollTrigger.update);
          lenis.destroy();
          if (activeScroll === lenis) activeScroll = null;
        };
      },
    );
    return () => media.revert();
  }, []);
  return null;
}
