"use client";

import { useState, useEffect } from "react";
import {
  collection, onSnapshot, query, where,
  addDoc, updateDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { db, rtdb } from "@/lib/firebase";
import type { ParkingSite, ParkingSlot, Booking } from "@/types";

// ─── Real ESP32 lot config ────────────────────────────────────────────────────
const REAL_LOT_ID = "lot1";
const ESP32_SLOT_MAP: Record<string, string> = {
  slot1: "A1",
};

// ─── Parking Sites ────────────────────────────────────────────────────────────
export function useParkingSites() {
  const [sites, setSites]     = useState<ParkingSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "parkingSites"),
      (snap) => {
        setSites(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ParkingSite)));
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); }
    );
    return () => unsub();
  }, []);

  return { sites, loading, error };
}

// ─── ESP32 live slots (RTDB) — only for lot1 ─────────────────────────────────
export function useRealSlots(parkingId: string | null) {
  const [slots, setSlots]     = useState<ParkingSlot[] | null>(null);
  const [loading, setLoading] = useState(true);
  const isRealLot = parkingId === REAL_LOT_ID;

  useEffect(() => {
    if (!isRealLot) { setSlots(null); setLoading(false); return; }

    const unsub = onValue(
      ref(rtdb, "parking"),
      (snapshot) => {
        const data = snapshot.val();
        if (!data) { setSlots([]); setLoading(false); return; }
        setSlots(
          Object.entries(data).map(([key, val]) => {
            const v = val as { status: string; distance: number };
            const displayId = ESP32_SLOT_MAP[key] ?? key;
            return {
              id: displayId, slotId: displayId,
              parkingId: REAL_LOT_ID,
              occupied: v.status === "OCCUPIED",
              reserved: false,
              distance: v.distance,
              isLive: true,
            };
          })
        );
        setLoading(false);
      },
      (err) => { console.error("RTDB:", err); setLoading(false); }
    );
    return () => unsub();
  }, [isRealLot]);

  return { slots, loading, isRealLot };
}

// ─── Active bookings for a parking lot (ALL users) ───────────────────────────
// This is the key hook that makes reserved slots persist across users.
// Listens in real-time to Firestore bookings for this parkingId with
// status "active". Any booked slot shows as reserved (grey) for everyone.

export function useLotBookings(parkingId: string | null) {
  const [bookedSlotIds, setBookedSlotIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parkingId) { setLoading(false); return; }

    // Listen to ALL active bookings for this lot — not just current user
    const q = query(
      collection(db, "bookings"),
      where("parkingId", "==", parkingId),
      where("status", "==", "active")
    );

    const unsub = onSnapshot(q, (snap) => {
      // Build a set of slotIds that are currently booked
      const booked = new Set<string>(
        snap.docs.map((d) => d.data().slotId as string)
      );
      setBookedSlotIds(booked);
      setLoading(false);
    });

    return () => unsub();
  }, [parkingId]);

  return { bookedSlotIds, loading };
}

// ─── User's own bookings (for history page) ───────────────────────────────────
// NOTE: No orderBy in the Firestore query — combining where() + orderBy()
// on different fields requires a composite index which may not exist.
// We sort client-side instead which works with no index setup needed.
export function useBookings(userId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    // Simple single-field query — no composite index needed
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", userId)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
        // Sort newest first in JS — no Firestore index required
        data.sort((a, b) => {
          const ta = (a.createdAt as { seconds?: number })?.seconds ?? 0;
          const tb = (b.createdAt as { seconds?: number })?.seconds ?? 0;
          return tb - ta;
        });
        setBookings(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useBookings error:", err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [userId]);

  return { bookings, loading, error };
}

// ─── Create Booking ───────────────────────────────────────────────────────────
export async function createBooking(booking: Omit<Booking, "id" | "createdAt">) {
  const docRef = await addDoc(collection(db, "bookings"), {
    ...booking,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── Cancel Booking ───────────────────────────────────────────────────────────
export async function cancelBooking(bookingId: string) {
  await updateDoc(doc(db, "bookings", bookingId), { status: "cancelled" });
}

// ─── Booked slot count for a lot (for map marker display) ─────────────────────
// Returns the count of currently active bookings so the map marker
// subtracts booked slots from its displayed available count.
export function useLotBookedCount(parkingId: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!parkingId) return;
    const q = query(
      collection(db, "bookings"),
      where("parkingId", "==", parkingId),
      where("status", "==", "active")
    );
    const unsub = onSnapshot(q, (snap) => setCount(snap.size));
    return () => unsub();
  }, [parkingId]);

  return count;
}
