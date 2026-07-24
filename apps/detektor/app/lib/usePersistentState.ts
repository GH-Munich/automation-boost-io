"use client";

import { useEffect, useState } from "react";

/**
 * Wie useState, hält den Wert aber zusätzlich in localStorage — für
 * „Zwischenspeichern jederzeit" (CLAUDE.md §9). SSR-sicher: der Startwert wird
 * serverseitig gerendert, das Laden aus dem Speicher passiert erst nach dem
 * Mount (kein Hydration-Mismatch).
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setState(JSON.parse(raw) as T);
    } catch {
      /* Speicher nicht verfügbar (privater Modus o. Ä.) — dann ohne Persistenz. */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* Schreiben fehlgeschlagen — ohne Persistenz weiterarbeiten. */
    }
  }, [key, state, hydrated]);

  return [state, setState];
}
