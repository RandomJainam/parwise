"use client";

import { useState, useMemo } from "react";
import {
  X, MapPin, Clock, Star, Wifi, Shield, Car, Zap,
  Navigation, ChevronRight, Info, LayoutGrid, Radio
} from "lucide-react";
import { getAvailabilityColor, getAvailabilityLabel, formatCurrency } from "@/lib/utils";
import { useRealSlots, useLotBookings } from "@/hooks/useFirestore";
import { useSlotTick } from "@/hooks/useSlotTick";
import type { ParkingSite, ParkingSlot } from "@/types";
import BookingPanel from "./BookingPanel";

interface Props {
  site: ParkingSite;
  precomputedAvailable: number;
  onClose: () => void;
}

type Tab = "info" | "slots";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "wifi":        <Wifi className="w-3.5 h-3.5" />,
  "security":    <Shield className="w-3.5 h-3.5" />,
  "ev charging": <Zap className="w-3.5 h-3.5" />,
  "cctv":        <Shield className="w-3.5 h-3.5" />,
  "covered":     <Car className="w-3.5 h-3.5" />,
  "24x7":        <Clock className="w-3.5 h-3.5" />,
};

// ── Deterministic fake slot generator ────────────────────────────────────────
function generateFakeSlots(total: number, available: number, parkingId: string): ParkingSlot[] {
  const capped = Math.min(total, 48);
  const rows   = ["A","B","C","D","E","F","G","H"];
  const perRow = Math.ceil(capped / rows.length);
  const slots: ParkingSlot[] = [];

  let seed = parkingId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

  const occupiedCount = Math.min(capped - available, capped);
  const occupiedSet   = new Set<number>();
  while (occupiedSet.size < occupiedCount) occupiedSet.add(Math.floor(rand() * capped));

  let count = 0;
  for (const row of rows) {
    for (let i = 1; i <= perRow && count < capped; i++, count++) {
      slots.push({
        id: `${row}${i}`, slotId: `${row}${i}`,
        parkingId, occupied: occupiedSet.has(count), reserved: false,
      });
    }
  }
  return slots;
}

// ── Slot grid display ─────────────────────────────────────────────────────────
function SlotGridDisplay({
  slots, selectedSlot, onSelect, isLive,
}: {
  slots: ParkingSlot[];
  selectedSlot: string | null;
  onSelect: (id: string) => void;
  isLive: boolean;
}) {
  const rows: Record<string, ParkingSlot[]> = {};
  slots.forEach(s => {
    const r = s.slotId.charAt(0);
    if (!rows[r]) rows[r] = [];
    rows[r].push(s);
  });

  const free     = slots.filter(s => !s.occupied && !s.reserved).length;
  const occupied = slots.filter(s => s.occupied).length;
  const reserved = slots.filter(s => s.reserved).length;

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block"/>{free} Free</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block"/>{occupied} Occupied</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-300 inline-block"/>{reserved} Booked</span>
        </div>
        {isLive
          ? <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><Radio className="w-3 h-3 animate-pulse"/> LIVE</span>
          : <span className="text-xs text-gray-300 italic">Simulated</span>
        }
      </div>

      {/* Grid */}
      {Object.entries(rows).sort(([a],[b]) => a.localeCompare(b)).map(([row, rowSlots]) => (
        <div key={row} className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-300 w-4 flex-shrink-0">{row}</span>
          <div className="flex gap-1.5 flex-wrap">
            {rowSlots
              .sort((a,b) => a.slotId.localeCompare(b.slotId, undefined, { numeric: true }))
              .map(slot => {
                const isAvail    = !slot.occupied && !slot.reserved;
                const isSelected = selectedSlot === slot.slotId;
                return (
                  <button
                    key={slot.slotId}
                    disabled={!isAvail}
                    onClick={() => isAvail && onSelect(isSelected ? "" : slot.slotId)}
                    title={slot.reserved ? "Already booked" : slot.occupied ? "Occupied" : "Available"}
                    className={[
                      "w-12 h-10 rounded-lg text-xs font-bold border-2 transition-all relative",
                      slot.occupied                    ? "bg-red-50 border-red-300 text-red-300 cursor-not-allowed" : "",
                      slot.reserved && !slot.occupied  ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed" : "",
                      isAvail && !isSelected           ? "bg-green-50 border-green-400 text-green-700 hover:scale-105 cursor-pointer" : "",
                      isSelected                       ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-lg" : "",
                    ].join(" ")}
                  >
                    {slot.slotId}
                    {/* Live dot for ESP32 slots */}
                    {(slot as ParkingSlot & { isLive?: boolean }).isLive && (
                      <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${slot.occupied ? "bg-red-500" : "bg-green-500"}`}/>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      {selectedSlot && (
        <div className="text-center text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl py-2.5">
          ✓ Slot <strong>{selectedSlot}</strong> selected
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ParkingBottomSheet({ site, precomputedAvailable, onClose }: Props) {
  const [tab, setTab]                   = useState<Tab>("info");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingMode, setBookingMode]   = useState<"now" | "later" | null>(null);

  // 1. Shared 15-min tick — same value for all users at same wall-clock time
  const tick = useSlotTick();

  // 2. Real ESP32 data (only lot1)
  const { slots: realSlots, loading: realLoading, isRealLot } = useRealSlots(site.id);

  // 3. ALL active bookings for this lot — real-time, ALL users
  const { bookedSlotIds } = useLotBookings(site.id);

  // 4. Build final slot list — 3 layers:
  //    A) Fake base regenerates every 15 min (tick-seeded, same for all users)
  //    B) ESP32 live data overrides A1 for lot1
  //    C) Firestore bookings ALWAYS WIN — survive every 15-min refresh
  const displaySlots: ParkingSlot[] = useMemo(() => {
    // Seed includes tick so pattern changes every 15 min for everyone simultaneously
    const base = generateFakeSlots(site.totalSlots, precomputedAvailable, site.id + String(tick));

    return base.map(fs => {
      // Layer B: real ESP32 sensor data for lot1/A1
      const live = isRealLot && realSlots
        ? realSlots.find(rs => rs.slotId === fs.slotId)
        : undefined;
      const slot = live ? { ...live } : { ...fs };

      // Layer C: Firestore booking — always overrides random, persists across users
      if (bookedSlotIds.has(slot.slotId)) {
        slot.reserved = true;
        slot.occupied = false;
      }
      return slot;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site.id, site.totalSlots, precomputedAvailable, tick, isRealLot, realSlots, bookedSlotIds]);

  // 4. Available count — subtract both occupied and reserved
  const availableCount = displaySlots.filter(s => !s.occupied && !s.reserved).length;
  const availColor = getAvailabilityColor(availableCount, site.totalSlots);
  const availLabel = getAvailabilityLabel(availableCount, site.totalSlots);
  const amenities  = site.amenities ?? ["Security"];

  if (bookingMode) {
    return (
      <BookingPanel
        site={site}
        slots={displaySlots}
        selectedSlot={selectedSlot}
        mode={bookingMode}
        isLive={isRealLot}
        onClose={() => { setBookingMode(null); setSelectedSlot(null); }}
        onFullClose={onClose}
      />
    );
  }

  return (
    <>
      <div className="absolute inset-0 bg-black/25 z-[999]" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 z-[1000] slide-up">
        <div className="bg-white rounded-t-3xl shadow-2xl" style={{ maxHeight: "88vh", overflowY: "auto" }}>

          <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10 rounded-t-3xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 z-20">
            <X className="w-4 h-4 text-gray-600" />
          </button>

          <div className="px-5 pt-1 pb-8">

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md relative">
                <span className="text-white font-black text-2xl">P</span>
                {isRealLot && (
                  <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Radio className="w-2.5 h-2.5"/> Live
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-10">
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{site.name}</h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"/>
                  <span className="text-xs text-gray-500 truncate">{site.address}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-3 h-3 ${i<=4?"fill-yellow-400 text-yellow-400":"text-gray-200"}`}/>
                    ))}
                    <span className="text-xs text-gray-400 ml-1">4.2</span>
                  </div>
                  <span className="text-gray-200">•</span>
                  <span className="text-xs text-gray-400">Open 24/7</span>
                </div>
              </div>
            </div>

            {/* Availability banner */}
            <div className="rounded-2xl p-4 mb-4 flex items-center justify-between"
              style={{ background: `${availColor}12`, border: `1.5px solid ${availColor}30` }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold" style={{ color: availColor }}>{availLabel}</p>
                  {isRealLot && (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                      <Radio className="w-2.5 h-2.5 animate-pulse"/> Live
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black" style={{ color: availColor }}>
                    {realLoading && isRealLot ? "…" : availableCount}
                  </span>
                  <span className="text-sm text-gray-400 font-medium">/ {site.totalSlots} free</span>
                </div>
              </div>
              <div className="w-16 h-16 relative">
                <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#f1f5f9" strokeWidth="5"/>
                  <circle cx="28" cy="28" r="22" fill="none" stroke={availColor} strokeWidth="5"
                    strokeDasharray={`${(availableCount/site.totalSlots)*138} 138`} strokeLinecap="round"/>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: availColor }}>
                  {Math.round((availableCount/site.totalSlots)*100)}%
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                [formatCurrency(site.hourlyRate), "per hour"],
                [site.totalSlots, "total slots"],
                ["~5 min", "walk in"],
              ].map(([val, label]) => (
                <div key={String(label)} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
              <button onClick={() => setTab("info")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab==="info"?"bg-white text-blue-600 shadow-sm":"text-gray-500"}`}>
                <Info className="w-4 h-4"/> Details
              </button>
              <button onClick={() => setTab("slots")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab==="slots"?"bg-white text-blue-600 shadow-sm":"text-gray-500"}`}>
                <LayoutGrid className="w-4 h-4"/> Slots
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background:`${availColor}20`, color:availColor }}>
                  {availableCount}
                </span>
              </button>
            </div>

            {/* Info tab */}
            {tab === "info" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Amenities</p>
                  <div className="flex gap-2 flex-wrap">
                    {amenities.map(a => (
                      <span key={a} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 rounded-full px-3 py-1.5 font-medium">
                        {AMENITY_ICONS[a.toLowerCase()] ?? <Car className="w-3.5 h-3.5"/>} {a}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${site.latitude},${site.longitude}`)}
                  className="w-full flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 hover:bg-gray-100 transition-colors">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-blue-600"/>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-800">Get Directions</p>
                    <p className="text-xs text-gray-400">Open in Google Maps</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300"/>
                </button>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Hours</p>
                  {[["Mon–Fri","6:00 AM – 11:00 PM"],["Saturday","6:00 AM – 11:00 PM"],["Sunday","7:00 AM – 10:00 PM"]].map(([d,h])=>(
                    <div key={d} className="flex justify-between text-sm">
                      <span className="text-gray-500">{d}</span>
                      <span className="font-semibold text-gray-800">{h}</span>
                    </div>
                  ))}
                </div>
                {/* ESP32 live panel */}
                {isRealLot && realSlots && realSlots.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Radio className="w-4 h-4 text-green-600 animate-pulse"/>
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Live ESP32 Sensor</p>
                    </div>
                    {realSlots.map(s => (
                      <div key={s.slotId} className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Slot {s.slotId}</span>
                        <div className="flex items-center gap-2">
                          {(s as ParkingSlot & {distance?:number}).distance != null && (
                            <span className="text-xs text-gray-400">{((s as ParkingSlot & {distance?:number}).distance??0).toFixed(1)} cm</span>
                          )}
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.occupied?"bg-red-100 text-red-600":"bg-green-100 text-green-600"}`}>
                            {s.occupied?"OCCUPIED":"FREE"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Slots tab */}
            {tab === "slots" && (
              <SlotGridDisplay
                slots={displaySlots}
                selectedSlot={selectedSlot}
                onSelect={setSelectedSlot}
                isLive={isRealLot}
              />
            )}

            {/* Book buttons */}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setBookingMode("now")}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md">
                🚗  Park Now
              </button>
              <button onClick={() => setBookingMode("later")}
                className="flex-1 border-2 border-blue-600 text-blue-600 py-4 rounded-2xl font-bold text-sm hover:bg-blue-50 active:scale-95 transition-all">
                🗓  Book Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
