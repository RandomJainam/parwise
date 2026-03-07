"use client";

// ─── Global 15-minute tick ─────────────────────────────────────────────────────
// Shared across ParkingMap and ParkingBottomSheet so they stay in sync.
// The tick is a timestamp snapped to the nearest 15-minute boundary,
// so all users on any device get the SAME random seed at the same time.
// e.g. 10:00, 10:15, 10:30 etc.

import { useState, useEffect } from "react";

function get15MinTick(): number {
  const now = Date.now();
  // Snap to nearest 15-min boundary (900_000 ms)
  return Math.floor(now / 900_000);
}

export function useSlotTick() {
  const [tick, setTick] = useState(get15MinTick);

  useEffect(() => {
    // Check every 30 seconds if we've crossed a 15-min boundary
    const t = setInterval(() => {
      const newTick = get15MinTick();
      setTick(prev => prev !== newTick ? newTick : prev);
    }, 30_000);
    return () => clearInterval(t);
  }, []);

  return tick;
}
