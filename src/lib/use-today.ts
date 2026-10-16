"use client";
import { useSyncExternalStore } from "react";
import { dayKey } from "./learning";
function subscribe(callback: () => void) {
  const timer = window.setInterval(callback, 60000);
  window.addEventListener("focus", callback);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", callback);
  };
}
// The server snapshot is intentionally date-neutral so a static build remains
// safe to hydrate on a different day. The client refreshes at least once a minute.
export function useToday() {
  return useSyncExternalStore(subscribe, dayKey, () => "");
}
