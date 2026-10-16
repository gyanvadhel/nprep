"use client";
import { useSyncExternalStore } from "react";
import { initialState, stateSchema, type LearningState } from "./learning";

export const STORAGE_KEY = "nprep.learning.v1";
let cached = initialState;
let lastRaw: string | null | undefined;
let warning = "";
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((listener) => listener());
}
function read() {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== lastRaw) {
      lastRaw = raw;
      if (!raw) cached = initialState;
      else {
        const parsed = stateSchema.safeParse(JSON.parse(raw));
        if (parsed.success) cached = parsed.data;
        else
          warning =
            "Saved progress could not be read. Your current session can still be used.";
      }
    }
  } catch {
    warning =
      "Device storage is unavailable. Progress will last for this visit only.";
  }
  return cached;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      read();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
export function updateLearning(
  updater: (state: LearningState) => LearningState,
) {
  const next = updater(read());
  cached = next;
  try {
    const raw = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, raw);
    lastRaw = raw;
  } catch {
    warning =
      "Device storage is unavailable. Progress will last for this visit only.";
  }
  emit();
}
export function useLearning() {
  const state = useSyncExternalStore(subscribe, read, () => initialState);
  const storageWarning = useSyncExternalStore(
    subscribe,
    () => warning,
    () => "",
  );
  return { state, storageWarning, update: updateLearning };
}
